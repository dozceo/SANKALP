"use client";

import { useCallback, useRef, useEffect, useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import type { ForceGraphMethods, NodeObject, LinkObject } from 'react-force-graph-2d';
import { generatePersonalGraph } from '@/lib/generatePersonalGraph';
import { lightenColor } from '@/lib/color-utils';
import type { GraphNode, StudentNode } from '@/data/docsData';
import { Maximize2, Minimize2, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

// Dynamically import ForceGraph2D with SSR disabled
const ForceGraph2D = dynamic(
    () => import('react-force-graph-2d'),
    { ssr: false }
);

interface PersonalKnowledgeGraphProps {
    student: StudentNode;
    height?: number;
}

type ExtendedNodeObject = NodeObject & GraphNode & {
    _cachedLightColor?: string;
    _cachedBaseColor?: string;
};
type ExtendedLinkObject = LinkObject & { source: ExtendedNodeObject; target: ExtendedNodeObject };

export function PersonalKnowledgeGraph({ student, height = 400 }: PersonalKnowledgeGraphProps) {
    const graphRef = useRef<ForceGraphMethods<ExtendedNodeObject>>();
    const containerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: 800, height });
    const [isExpanded, setIsExpanded] = useState(false);
    const [hoveredNode, setHoveredNode] = useState<string | null>(null);

    // Generate graph data for this student
    const graphData = useMemo(() => generatePersonalGraph(student), [student]);

    // Update dimensions
    useEffect(() => {
        const updateDimensions = () => {
            if (containerRef.current) {
                const rect = containerRef.current.getBoundingClientRect();
                setDimensions({
                    width: rect.width,
                    height: isExpanded ? 600 : height
                });
            }
        };

        updateDimensions();
        window.addEventListener('resize', updateDimensions);
        return () => window.removeEventListener('resize', updateDimensions);
    }, [isExpanded, height]);

    const handleZoom = (factor: number) => {
        if (graphRef.current) {
            graphRef.current.zoom(graphRef.current.zoom() * factor, 300);
        }
    };

    const handleReset = () => {
        if (graphRef.current) {
            graphRef.current.centerAt(0, 0, 500);
            graphRef.current.zoom(1, 500);
        }
    };

    const nodeColor = useCallback((node: ExtendedNodeObject) => {
        // Use custom color if specified
        if (node.color) {
            return node.color;
        }

        // Hovered node
        if (node.id === hoveredNode) {
            return '#c4b5fd';
        }

        // Fallback
        return '#6d28d9';
    }, [hoveredNode]);

    const nodeCanvasObject = useCallback((node: ExtendedNodeObject, ctx: CanvasRenderingContext2D, globalScale: number) => {
        const label = node.name;
        const baseSize = node.val || 8;
        const isCenter = node.id === student.id;
        const isHovered = node.id === hoveredNode;
        const nodeSize = (isCenter || isHovered ? baseSize * 1.3 : baseSize) / globalScale;

        if (node.x === undefined || node.y === undefined) return;

        // Optimization: Use pre-calculated colors
        let baseColor: string;
        let lightColor: string;

        if (isHovered) {
            baseColor = '#c4b5fd';
            lightColor = '#e9d5ff';
        } else {
            baseColor = node.color || '#6d28d9';
            // Use pre-calculated light color if available, otherwise calculate once
            lightColor = node.lightColor || lightenColor(baseColor, 20);
        }

        // Glow effect for center/hovered nodes
        if (isCenter || isHovered) {
            const gradient = ctx.createRadialGradient(
                node.x, node.y, 0,
                node.x, node.y, nodeSize * 3
            );
            // Use baseColor for glow, but transparent
            gradient.addColorStop(0, `${baseColor}66`); // Hex opacity
            gradient.addColorStop(1, `${baseColor}00`);
            ctx.beginPath();
            ctx.arc(node.x, node.y, nodeSize * 3, 0, 2 * Math.PI);
            ctx.fillStyle = gradient;
            ctx.fill();
        }

        // Node circle with gradient
        const nodeGradient = ctx.createRadialGradient(
            node.x - nodeSize * 0.3, node.y - nodeSize * 0.3, 0,
            node.x, node.y, nodeSize
        );

        nodeGradient.addColorStop(0, lightColor);
        nodeGradient.addColorStop(1, baseColor);

        ctx.beginPath();
        ctx.arc(node.x, node.y, nodeSize, 0, 2 * Math.PI);
        ctx.fillStyle = nodeGradient;
        ctx.fill();

        // Border for center node
        if (isCenter) {
            ctx.strokeStyle = '#e9d5ff';
            ctx.lineWidth = 2.5 / globalScale;
            ctx.stroke();
        }

        // Label
        const showLabel = globalScale > 0.6 || isCenter || isHovered;
        if (showLabel) {
            const fontSize = Math.max(10 / globalScale, 8);
            ctx.font = `${isCenter ? 'bold ' : ''}${fontSize}px Inter, system-ui, sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'top';

            // Text shadow for better readability
            ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
            ctx.fillText(label, node.x + 0.5, node.y + nodeSize + 3.5);

            ctx.fillStyle = isCenter ? '#f5f3ff' : isHovered ? '#e9d5ff' : '#d1d5db';
            ctx.fillText(label, node.x, node.y + nodeSize + 3);
        }
    }, [student.id, hoveredNode]); // Removed nodeColor dependency

    const linkCanvasObject = useCallback((link: ExtendedLinkObject, ctx: CanvasRenderingContext2D, globalScale: number) => {
        const start = link.source;
        const end = link.target;

        if (!start || !end || start.x === undefined || start.y === undefined || end.x === undefined || end.y === undefined) return;

        const isFromCenter = start.id === student.id || end.id === student.id;

        // Calculate curved path
        const dx = end.x - start.x;
        const dy = end.y - start.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Control point for curve
        const curvature = 0.15;
        const midX = (start.x + end.x) / 2;
        const midY = (start.y + end.y) / 2;
        const nx = -dy / distance;
        const ny = dx / distance;
        const curveOffset = distance * curvature;
        const cpX = midX + nx * curveOffset;
        const cpY = midY + ny * curveOffset;

        // Draw curved link
        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.quadraticCurveTo(cpX, cpY, end.x, end.y);

        const alpha = isFromCenter ? 0.5 : 0.2;
        const color = start.color || '#9333EA';
        ctx.strokeStyle = `${color}${Math.floor(alpha * 255).toString(16).padStart(2, '0')}`;
        ctx.lineWidth = isFromCenter ? 1.5 / globalScale : 0.8 / globalScale;
        ctx.stroke();
    }, [student.id]);

    const handleNodeHover = useCallback((node: ExtendedNodeObject | null) => {
        if (node && typeof node.id === 'string') {
            setHoveredNode(node.id);
            document.body.style.cursor = 'pointer';
        } else {
            setHoveredNode(null);
            document.body.style.cursor = 'default';
        }
    }, []);

    return (
        <div className="relative" ref={containerRef}>
            {/* Controls */}
            <div className="absolute top-2 right-2 z-10 flex items-center gap-1">
                <button
                    onClick={() => handleZoom(1.5)}
                    className="p-1.5 bg-secondary/80 hover:bg-secondary rounded text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background"
                    title="Zoom in"
                    aria-label="Zoom in"
                >
                    <ZoomIn className="w-4 h-4" aria-hidden="true" />
                </button>
                <button
                    onClick={() => handleZoom(0.67)}
                    className="p-1.5 bg-secondary/80 hover:bg-secondary rounded text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background"
                    title="Zoom out"
                    aria-label="Zoom out"
                >
                    <ZoomOut className="w-4 h-4" aria-hidden="true" />
                </button>
                <button
                    onClick={handleReset}
                    className="p-1.5 bg-secondary/80 hover:bg-secondary rounded text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background"
                    title="Reset view"
                    aria-label="Reset view"
                >
                    <RotateCcw className="w-4 h-4" aria-hidden="true" />
                </button>
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="p-1.5 bg-secondary/80 hover:bg-secondary rounded text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background"
                    title={isExpanded ? 'Collapse' : 'Expand'}
                    aria-label={isExpanded ? 'Collapse graph' : 'Expand graph'}
                >
                    {isExpanded ? <Minimize2 className="w-4 h-4" aria-hidden="true" /> : <Maximize2 className="w-4 h-4" aria-hidden="true" />}
                </button>
            </div>

            {/* Title */}
            <div className="absolute top-2 left-3 z-10 flex items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    My Knowledge Network
                </span>
                <span className="text-[10px] text-muted-foreground/60">
                    {graphData.nodes.length} nodes
                </span>
            </div>

            {/* Graph */}
            <ForceGraph2D
                ref={graphRef as React.MutableRefObject<ForceGraphMethods<ExtendedNodeObject> | undefined>}
                graphData={graphData}
                width={dimensions.width}
                height={dimensions.height}
                backgroundColor="transparent"
                nodeRelSize={6}
                nodeCanvasObject={nodeCanvasObject}
                linkCanvasObject={linkCanvasObject}
                onNodeHover={handleNodeHover}
                cooldownTicks={100}
                d3AlphaDecay={0.02}
                d3VelocityDecay={0.3}
                enableZoomInteraction={true}
                enablePanInteraction={true}
                warmupTicks={50}
                nodeCanvasObjectMode={() => 'replace'}
                linkCanvasObjectMode={() => 'replace'}
            />
        </div>
    );
}

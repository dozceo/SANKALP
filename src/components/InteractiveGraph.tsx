'use client';

import { useCallback, useRef, useEffect, useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import type { ForceGraphMethods, NodeObject, LinkObject } from 'react-force-graph-2d';
import { docsTree, studentsData, flatDocs } from '@/data/studentsDataStatic';
import { generateEnhancedGraphData } from '@/lib/generateEnhancedGraph';
import { lightenColor } from '@/lib/color-utils';
import type { GraphNode, DocNode, StudentNode, GraphData } from '@/data/docsData';
import { Maximize2, Minimize2, ZoomIn, ZoomOut, RotateCcw, Globe, Target, X } from 'lucide-react';

// Dynamically import ForceGraph2D with SSR disabled
const ForceGraph2D = dynamic(
  () => import('react-force-graph-2d'),
  { ssr: false }
);

interface InteractiveGraphProps {
  onNodeClick?: (nodeId: string) => void;
  highlightedNode?: string;
  graphData?: GraphData;
}

type ExtendedNodeObject = NodeObject & GraphNode & { __lightColor?: string };
type ExtendedLinkObject = LinkObject & { source: ExtendedNodeObject; target: ExtendedNodeObject };

// Static colors to avoid reallocation
const TYPE_COLORS: Record<string, string> = {
  student: '#9333EA',    // Purple
  subject: '#3B82F6',    // Blue
  chapter: '#06B6D4',    // Cyan
  topic: '#6B7280',      // Gray
  weakness: '#EF4444',   // Red
  strength: '#10B981',   // Green
  skill: '#F59E0B',      // Amber
};

export function InteractiveGraph({ onNodeClick, highlightedNode, graphData: externalGraphData }: InteractiveGraphProps) {
  const graphRef = useRef<ForceGraphMethods<ExtendedNodeObject>>();
  const modalGraphRef = useRef<ForceGraphMethods<ExtendedNodeObject>>();
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 300, height: 250 });
  const [isExpanded, setIsExpanded] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [isGlobalView, setIsGlobalView] = useState(false);
  const [connectedNodes, setConnectedNodes] = useState<Set<string>>(new Set());

  const fullGraphData = useMemo(() => generateEnhancedGraphData(studentsData), []);

  // Optimization: Pre-calculate adjacency map for O(1) connection lookups
  const adjacencyMap = useMemo(() => {
    const map = new Map<string, Set<string>>();
    fullGraphData.links.forEach(l => {
      // Handle both string and object cases (force-graph mutates links)
      const source = l.source as unknown;
      const target = l.target as unknown;
      const sourceId = typeof source === 'object' && source && 'id' in source ? (source as { id: string }).id : String(source);
      const targetId = typeof target === 'object' && target && 'id' in target ? (target as { id: string }).id : String(target);

      if (!map.has(sourceId)) map.set(sourceId, new Set());
      if (!map.has(targetId)) map.set(targetId, new Set());

      map.get(sourceId)!.add(targetId);
      map.get(targetId)!.add(sourceId);
    });
    return map;
  }, [fullGraphData]);

  // Optimization: Pre-calculate node map for O(1) lookups
  const nodeMap = useMemo(() => {
    const map = new Map<string, ExtendedNodeObject>();
    fullGraphData.nodes.forEach(n => map.set(n.id, n as ExtendedNodeObject));
    return map;
  }, [fullGraphData]);

  // Generate local graph data (only nodes connected to highlighted node)
  const localGraphData = useMemo(() => {
    if (!highlightedNode || isGlobalView) return fullGraphData;

    // Find all connected node IDs using optimized adjacency map
    const connected = new Set<string>([highlightedNode]);

    // Add direct connections (O(1) lookup vs previous O(N) traversal)
    const neighbors = adjacencyMap.get(highlightedNode);
    if (neighbors) {
      neighbors.forEach(id => connected.add(id));
    }

    setConnectedNodes(connected);

    // Filter nodes and links
    // Optimization: Use nodeMap for O(1) lookup instead of O(N) filter
    const filteredNodes: ExtendedNodeObject[] = [];
    connected.forEach(id => {
      const node = nodeMap.get(id);
      if (node) filteredNodes.push(node);
    });

    const filteredLinks = fullGraphData.links.filter(l => {
      const source = l.source as unknown;
      const target = l.target as unknown;
      const sourceId = source && typeof source === 'object' && 'id' in source ? (source as { id: string }).id : source as string;
      const targetId = target && typeof target === 'object' && 'id' in target ? (target as { id: string }).id : target as string;
      return sourceId && targetId && connected.has(sourceId) && connected.has(targetId);
    });

    return { nodes: filteredNodes, links: filteredLinks };
  }, [highlightedNode, isGlobalView, fullGraphData, adjacencyMap, nodeMap]);

  // Use external data if provided, otherwise fallback to local/generated data
  const graphData = externalGraphData || (isGlobalView ? fullGraphData : localGraphData);

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDimensions({
          width: rect.width,
          height: isExpanded ? 400 : 220
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, [isExpanded]);

  // Center on highlighted node when it changes
  useEffect(() => {
    if (highlightedNode && graphRef.current) {
      // Note: x and y are added by the force graph at runtime, not on our GraphNode type
      setTimeout(() => {
        graphRef.current?.centerAt(0, 0, 500);
      }, 100);
    }
  }, [highlightedNode]);

  const handleNodeClick = useCallback((node: ExtendedNodeObject, ref: React.MutableRefObject<ForceGraphMethods<ExtendedNodeObject> | undefined>) => {
    if (onNodeClick && typeof node.id === 'string') {
      onNodeClick(node.id);
    }
    // Center on node with smooth animation
    if (ref.current && node.x !== undefined && node.y !== undefined) {
      ref.current.centerAt(node.x, node.y, 500);
      ref.current.zoom(2.5, 500);
    }
  }, [onNodeClick]);

  const handleZoom = (factor: number, ref: React.MutableRefObject<ForceGraphMethods<ExtendedNodeObject> | undefined>) => {
    if (ref.current) {
      ref.current.zoom(ref.current.zoom() * factor, 300);
    }
  };

  const handleReset = (ref: React.MutableRefObject<ForceGraphMethods<ExtendedNodeObject> | undefined>) => {
    if (ref.current) {
      ref.current.centerAt(0, 0, 500);
      ref.current.zoom(1, 500);
    }
  };

  const nodeColor = useCallback((node: ExtendedNodeObject) => {
    // Use custom color if specified
    if (node.color) {
      return node.color;
    }

    // Highlighted node
    if (node.id === highlightedNode) {
      return '#a78bfa'; // Active node - lighter purple
    }

    // Hovered node
    if (node.id === hoveredNode) {
      return '#c4b5fd'; // Hovered node - even lighter
    }

    // Optimization: Use static TYPE_COLORS map
    return TYPE_COLORS[node.type] || '#6d28d9'; // Fallback
  }, [highlightedNode, hoveredNode]);

  const nodeCanvasObject = useCallback((node: ExtendedNodeObject, ctx: CanvasRenderingContext2D, globalScale: number) => {
    const label = node.name;
    const baseSize = node.val || 8;
    const isHighlighted = node.id === highlightedNode;
    const isHovered = node.id === hoveredNode;
    const nodeSize = (isHighlighted || isHovered ? baseSize * 1.3 : baseSize) / globalScale;

    if (node.x === undefined || node.y === undefined) return;

    // Glow effect for highlighted/hovered nodes
    if (isHighlighted || isHovered) {
      const gradient = ctx.createRadialGradient(
        node.x, node.y, 0,
        node.x, node.y, nodeSize * 3
      );
      gradient.addColorStop(0, 'rgba(139, 92, 246, 0.4)');
      gradient.addColorStop(1, 'rgba(139, 92, 246, 0)');
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
    const baseColor = nodeColor(node);

    // Optimization: Cache lightenColor result on node object to avoid re-calculation per frame
    let lightColor: string;
    if (isHighlighted || isHovered) {
      lightColor = lightenColor(baseColor, 20);
    } else {
      if (!node.__lightColor) {
        node.__lightColor = lightenColor(baseColor, 20);
      }
      lightColor = node.__lightColor;
    }

    nodeGradient.addColorStop(0, lightColor);
    nodeGradient.addColorStop(1, baseColor);

    ctx.beginPath();
    ctx.arc(node.x, node.y, nodeSize, 0, 2 * Math.PI);
    ctx.fillStyle = nodeGradient;
    ctx.fill();

    // Border for highlighted node
    if (isHighlighted) {
      ctx.strokeStyle = '#e9d5ff';
      ctx.lineWidth = 2 / globalScale;
      ctx.stroke();
    }

    // Label with better visibility
    const showLabel = globalScale > 0.6 || isHighlighted || isHovered;
    if (showLabel) {
      const fontSize = Math.max(10 / globalScale, 8);
      ctx.font = `${isHighlighted ? 'bold ' : ''}${fontSize}px Inter, system-ui, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';

      // Text shadow for better readability
      ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
      ctx.fillText(label, node.x + 0.5, node.y + nodeSize + 3.5);

      ctx.fillStyle = isHighlighted ? '#f5f3ff' : isHovered ? '#e9d5ff' : '#a1a1aa';
      ctx.fillText(label, node.x, node.y + nodeSize + 3);
    }
  }, [highlightedNode, hoveredNode, nodeColor]);

  const linkCanvasObject = useCallback((link: ExtendedLinkObject, ctx: CanvasRenderingContext2D, globalScale: number) => {
    const start = link.source;
    const end = link.target;

    if (!start || !end || start.x === undefined || start.y === undefined || end.x === undefined || end.y === undefined) return;

    const isConnectedToHighlighted =
      (start.id === highlightedNode || end.id === highlightedNode) ||
      (start.id === hoveredNode || end.id === hoveredNode);

    // Calculate curved path
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Control point for curve (perpendicular offset)
    const curvature = 0.2;
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

    const alpha = isConnectedToHighlighted ? 0.6 : 0.15;
    ctx.strokeStyle = `rgba(139, 92, 246, ${alpha})`;
    ctx.lineWidth = isConnectedToHighlighted ? 1.5 / globalScale : 0.8 / globalScale;
    ctx.stroke();

    // Animated particles on highlighted links
    if (isConnectedToHighlighted) {
      const particleProgress = (Date.now() % 2000) / 2000;
      const t = particleProgress;
      const particleX = (1 - t) * (1 - t) * start.x + 2 * (1 - t) * t * cpX + t * t * end.x;
      const particleY = (1 - t) * (1 - t) * start.y + 2 * (1 - t) * t * cpY + t * t * end.y;

      ctx.beginPath();
      ctx.arc(particleX, particleY, 2 / globalScale, 0, 2 * Math.PI);
      ctx.fillStyle = 'rgba(196, 181, 253, 0.8)';
      ctx.fill();
    }
  }, [highlightedNode, hoveredNode]);

  const handleNodeHover = useCallback((node: ExtendedNodeObject | null) => {
    if (node && typeof node.id === 'string') {
      setHoveredNode(node.id);
      document.body.style.cursor = 'pointer';
    } else {
      setHoveredNode(null);
      document.body.style.cursor = 'default';
    }
  }, []);

  const GraphControls = ({ graphRefProp, showToggle = true }: { graphRefProp: React.MutableRefObject<ForceGraphMethods<ExtendedNodeObject> | undefined>, showToggle?: boolean }) => (
    <div className="absolute top-2 right-2 z-10 flex items-center gap-1">
      {showToggle && (
        <button
          onClick={() => setIsGlobalView(!isGlobalView)}
          className={`p-1.5 rounded transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background ${isGlobalView
            ? 'bg-primary/30 text-primary'
            : 'bg-secondary/80 hover:bg-secondary text-muted-foreground hover:text-foreground'
            }`}
          title={isGlobalView ? 'Show local graph' : 'Show global graph'}
          aria-label={isGlobalView ? 'Show local graph' : 'Show global graph'}
        >
          {isGlobalView ? <Globe className="w-4 h-4" aria-hidden="true" /> : <Target className="w-4 h-4" aria-hidden="true" />}
        </button>
      )}
      <button
        onClick={() => handleZoom(1.5, graphRefProp)}
        className="p-1.5 bg-secondary/80 hover:bg-secondary rounded text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background"
        title="Zoom in"
        aria-label="Zoom in"
      >
        <ZoomIn className="w-4 h-4" aria-hidden="true" />
      </button>
      <button
        onClick={() => handleZoom(0.67, graphRefProp)}
        className="p-1.5 bg-secondary/80 hover:bg-secondary rounded text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background"
        title="Zoom out"
        aria-label="Zoom out"
      >
        <ZoomOut className="w-4 h-4" aria-hidden="true" />
      </button>
      <button
        onClick={() => handleReset(graphRefProp)}
        className="p-1.5 bg-secondary/80 hover:bg-secondary rounded text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background"
        title="Reset view"
        aria-label="Reset view"
      >
        <RotateCcw className="w-4 h-4" aria-hidden="true" />
      </button>
      {!isModalOpen && (
        <>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 bg-secondary/80 hover:bg-secondary rounded text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background"
            title={isExpanded ? 'Collapse' : 'Expand'}
            aria-label={isExpanded ? 'Collapse graph' : 'Expand graph'}
          >
            {isExpanded ? <Minimize2 className="w-4 h-4" aria-hidden="true" /> : <Maximize2 className="w-4 h-4" aria-hidden="true" />}
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="p-1.5 bg-primary/20 hover:bg-primary/30 rounded text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background"
            title="Open fullscreen"
            aria-label="Open fullscreen view"
          >
            <Maximize2 className="w-4 h-4" aria-hidden="true" />
          </button>
        </>
      )}
    </div>
  );

  const GraphTitle = ({ title }: { title: string }) => (
    <div className="absolute top-2 left-3 z-10 flex items-center gap-2">
      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
        {title}
      </span>
      <span className="text-[10px] text-muted-foreground/60">
        {graphData.nodes.length} nodes
      </span>
    </div>
  );

  return (
    <>
      <div className="graph-container relative" ref={containerRef}>
        <GraphControls graphRefProp={graphRef} />
        <GraphTitle title={isGlobalView ? 'Global Graph' : 'Local Graph'} />

        <ForceGraph2D
          ref={graphRef as any}
          graphData={graphData}
          width={dimensions.width}
          height={dimensions.height}
          backgroundColor="transparent"
          nodeRelSize={6}
          nodeCanvasObject={nodeCanvasObject as any}
          linkCanvasObject={linkCanvasObject as any}
          onNodeClick={(node) => handleNodeClick(node as ExtendedNodeObject, graphRef)}
          onNodeHover={handleNodeHover as any}
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

      {/* Fullscreen Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-background/95 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          />
          <div className="relative w-[90vw] h-[85vh] bg-[hsl(var(--graph-bg))] rounded-xl border border-border shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="absolute top-0 left-0 right-0 h-12 bg-card/80 backdrop-blur-sm border-b border-border flex items-center justify-between px-4 z-20">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-foreground">
                  {isGlobalView ? 'Global Graph View' : 'Local Graph View'}
                </span>
                <span className="text-xs text-muted-foreground">
                  {graphData.nodes.length} nodes · {graphData.links.length} connections
                </span>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-secondary rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background"
                aria-label="Close fullscreen view"
              >
                <X className="w-5 h-5 text-muted-foreground hover:text-foreground" aria-hidden="true" />
              </button>
            </div>

            {/* Modal Controls */}
            <div className="absolute top-16 right-4 z-20">
              <GraphControls graphRefProp={modalGraphRef} showToggle={true} />
            </div>

            {/* Modal Graph */}
            <div className="pt-12 h-full">
              <ForceGraph2D
                ref={modalGraphRef as any}
                graphData={isGlobalView ? fullGraphData : localGraphData}
                width={typeof window !== 'undefined' ? window.innerWidth * 0.9 : 1200}
                height={typeof window !== 'undefined' ? window.innerHeight * 0.85 - 48 : 800}
                backgroundColor="transparent"
                nodeRelSize={8}
                nodeCanvasObject={nodeCanvasObject as any}
                linkCanvasObject={linkCanvasObject as any}
                onNodeClick={(node) => handleNodeClick(node as ExtendedNodeObject, modalGraphRef)}
                onNodeHover={handleNodeHover as any}
                cooldownTicks={100}
                d3AlphaDecay={0.015}
                d3VelocityDecay={0.25}
                enableZoomInteraction={true}
                enablePanInteraction={true}
                warmupTicks={100}
                nodeCanvasObjectMode={() => 'replace'}
                linkCanvasObjectMode={() => 'replace'}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

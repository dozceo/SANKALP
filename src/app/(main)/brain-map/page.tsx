'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import { GraphData } from '@/data/docsData';

const InteractiveGraph = dynamic(
    () => import('@/components/InteractiveGraph').then(mod => mod.InteractiveGraph),
    { ssr: false, loading: () => <div className="flex h-[500px] items-center justify-center"><Loader2 className="h-6 w-6 animate-spin" /></div> }
);

export default function BrainMapPage() {

    const { user } = useAuth();
    const [graphData, setGraphData] = useState<GraphData>({ nodes: [], links: [] });
    const [loading, setLoading] = useState(true);
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

    useEffect(() => {
        async function fetchGraph() {
            if (!user?.uid || user.uid === 'undefined') {
                setLoading(false);
                return;
            }

            try {
                const response = await fetch(`/api/student/graph?studentId=${user.uid}`);
                if (response.ok) {
                    const data = await response.json();
                    if (data.success) {
                        setGraphData(data);
                        // Select the student node by default
                        const studentNode = data.nodes.find((n: any) => n.type === 'student');
                        if (studentNode) {
                            setSelectedNodeId(studentNode.id);
                        }
                    }
                }
            } catch (error) {
                console.error('Error fetching brain map:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchGraph();
    }, [user]);

    const handleNodeClick = (nodeId: string) => {
        setSelectedNodeId(nodeId);
    };

    const selectedNode = graphData.nodes.find(n => n.id === selectedNodeId);

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background p-6">
            <div className="max-w-7xl mx-auto">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold mb-2">My Brain Map</h1>
                    <p className="text-muted-foreground">
                        Visualize your learning journey and mastery
                    </p>
                    {user && (
                        <div className="mt-2 text-xs text-muted-foreground bg-secondary/50 p-2 rounded inline-block font-mono">
                            User ID: {user.uid}
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Graph Visualization */}
                    <div className="lg:col-span-2">
                        <div className="bg-card border border-border rounded-lg p-4 min-h-[500px]">
                            <InteractiveGraph
                                graphData={graphData}
                                onNodeClick={handleNodeClick}
                                highlightedNode={selectedNodeId || undefined}
                            />
                        </div>
                    </div>

                    {/* Node Details Panel */}
                    <div className="lg:col-span-1">
                        <div className="bg-card border border-border rounded-lg p-6 sticky top-6">
                            <h2 className="text-xl font-semibold mb-4">
                                {selectedNode ? 'Details' : 'Select a Node'}
                            </h2>

                            {selectedNode ? (
                                <div className="space-y-4">
                                    <div>
                                        <h3 className="font-medium text-lg">{selectedNode.name}</h3>
                                        <span className={`text-xs px-2 py-1 rounded capitalize ${selectedNode.type === 'strength' ? 'bg-green-100 text-green-700' :
                                            selectedNode.type === 'weakness' ? 'bg-red-100 text-red-700' :
                                                'bg-primary/10 text-primary'
                                            }`}>
                                            {selectedNode.type}
                                        </span>
                                    </div>

                                    {selectedNode.mastery !== undefined && (
                                        <div>
                                            <h4 className="text-sm font-semibold mb-2">Mastery</h4>
                                            <div className="w-full bg-secondary rounded-full h-2.5">
                                                <div
                                                    className="bg-primary h-2.5 rounded-full"
                                                    style={{ width: `${selectedNode.mastery * 100}%` }}
                                                ></div>
                                            </div>
                                            <p className="text-right text-xs mt-1">{Math.round(selectedNode.mastery * 100)}%</p>
                                        </div>
                                    )}

                                    {selectedNode.type === 'student' && (
                                        <p className="text-sm text-muted-foreground">
                                            This is your personal learning node. It connects to all the topics you have studied.
                                        </p>
                                    )}
                                </div>
                            ) : (
                                <p className="text-muted-foreground text-sm">
                                    Click on any node in the graph to see more details about your progress.
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Legend */}
                <div className="mt-6 bg-card border border-border rounded-lg p-4">
                    <h3 className="text-sm font-semibold mb-3">Legend</h3>
                    <div className="flex flex-wrap gap-4 text-sm">
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded-full bg-purple-600"></div>
                            <span>Me</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded-full bg-gray-500"></div>
                            <span>Topics</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded-full bg-green-500"></div>
                            <span>Strengths</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded-full bg-red-500"></div>
                            <span>Weaknesses</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}


'use client';

import { useState } from 'react';
import { InteractiveGraph } from '@/components/InteractiveGraph';
import { studentsData } from '@/data/studentsDataStatic';

export default function BrainMapPage() {
    const [selectedNode, setSelectedNode] = useState<string>('alex-kumar');

    const handleNodeClick = (nodeId: string) => {
        console.log('Node clicked:', nodeId);
        setSelectedNode(nodeId);
    };

    // Find the selected student
    const selectedStudent = studentsData.find(s => s.id === selectedNode);

    return (
        <div className="min-h-screen bg-background p-6">
            <div className="max-w-7xl mx-auto">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold mb-2">Student Brain Map</h1>
                    <p className="text-muted-foreground">
                        Interactive visualization of student learning connections
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Graph Visualization */}
                    <div className="lg:col-span-2">
                        <div className="bg-card border border-border rounded-lg p-4">
                            <InteractiveGraph
                                onNodeClick={handleNodeClick}
                                highlightedNode={selectedNode}
                            />
                        </div>
                    </div>

                    {/* Student Details Panel */}
                    <div className="lg:col-span-1">
                        <div className="bg-card border border-border rounded-lg p-6 sticky top-6">
                            <h2 className="text-xl font-semibold mb-4">
                                {selectedStudent ? 'Student Details' : 'Select a Student'}
                            </h2>

                            {selectedStudent ? (
                                <div className="space-y-4">
                                    <div>
                                        <h3 className="font-medium text-lg">{selectedStudent.name}</h3>
                                        <p className="text-sm text-muted-foreground">
                                            Grade {selectedStudent.grade} • {selectedStudent.email}
                                        </p>
                                    </div>

                                    <div>
                                        <h4 className="text-sm font-semibold mb-2">Topics</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedStudent.topics?.map(topic => (
                                                <span
                                                    key={topic}
                                                    className="px-2 py-1 bg-primary/10 text-primary rounded text-xs"
                                                >
                                                    {topic}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    {selectedStudent.masteryScores && (
                                        <div>
                                            <h4 className="text-sm font-semibold mb-2">Mastery Scores</h4>
                                            <div className="space-y-2">
                                                {Object.entries(selectedStudent.masteryScores).map(([topic, score]) => (
                                                    <div key={topic}>
                                                        <div className="flex justify-between text-xs mb-1">
                                                            <span>{topic}</span>
                                                            <span className="font-medium">{Math.round(score * 100)}%</span>
                                                        </div>
                                                        <div className="w-full bg-secondary rounded-full h-2">
                                                            <div
                                                                className="bg-primary h-2 rounded-full transition-all"
                                                                style={{ width: `${score * 100}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div>
                                        <h4 className="text-sm font-semibold mb-2">Strengths</h4>
                                        <ul className="text-sm space-y-1">
                                            {selectedStudent.strengths?.map(strength => (
                                                <li key={strength} className="text-muted-foreground">
                                                    • {strength}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div>
                                        <h4 className="text-sm font-semibold mb-2">Areas to Improve</h4>
                                        <ul className="text-sm space-y-1">
                                            {selectedStudent.weaknesses?.map(weakness => (
                                                <li key={weakness} className="text-muted-foreground">
                                                    • {weakness}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    {selectedStudent.connections && selectedStudent.connections.length > 0 && (
                                        <div>
                                            <h4 className="text-sm font-semibold mb-2">Connected Students</h4>
                                            <div className="space-y-1">
                                                {selectedStudent.connections.map(connId => {
                                                    const connStudent = studentsData.find(s => s.id === connId);
                                                    return connStudent ? (
                                                        <button
                                                            key={connId}
                                                            onClick={() => setSelectedNode(connId)}
                                                            className="w-full text-left px-3 py-2 bg-secondary/50 hover:bg-secondary rounded text-sm transition-colors"
                                                        >
                                                            {connStudent.name}
                                                        </button>
                                                    ) : null;
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <p className="text-muted-foreground text-sm">
                                    Click on a student node in the graph to view their details.
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
                            <span>Students</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded-full bg-purple-500"></div>
                            <span>Topics</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded-full bg-purple-400"></div>
                            <span>Skills</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-12 h-0.5 bg-purple-400"></div>
                            <span>Peer Connections</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

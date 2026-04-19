"use client";

import { useState, useEffect, useMemo } from "react";
import { useStudent } from "@/hooks/useStudent";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, BookCheck, Calendar, AlertTriangle, Loader2 } from "lucide-react";
import { getRevisionPlan } from "@/app/(main)/planner/actions";
import type { SmartRevisionPlannerOutput } from "@/ai/flows/smart-revision-planner";

export function ScheduleView() {
    const { currentStudent } = useStudent();
    const [plan, setPlan] = useState<SmartRevisionPlannerOutput | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const studyMaterials = currentStudent?.studyMaterials || [];

    // Get upcoming deadlines (Due or upcoming soon)
    const upcomingDeadlines = useMemo(() => studyMaterials
        .filter(m => m.status === 'Due' || m.status === 'Upcoming')
        .map(item => ({ item, time: Date.parse(item.nextReview) }))
        .sort((a, b) => a.time - b.time)
        .map(({ item }) => item), [studyMaterials]);

    const handleGeneratePlan = async () => {
        setLoading(true);
        setError(null);
        setPlan(null);
        const result = await getRevisionPlan();
        if (result) {
            setPlan(result);
        } else {
            setError("Failed to generate a revision plan. Please try again.");
        }
        setLoading(false);
    };

    const now = Date.now();

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Side - AI Generated Plan */}
            <div className="lg:col-span-2 space-y-4">
                <Card>
                    <CardHeader>
                        <CardTitle>AI Generated Plan</CardTitle>
                        <CardDescription>
                            Today's AI Suggestions - Click the button below to generate a personalized study plan for today.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button onClick={handleGeneratePlan} disabled={loading}>
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Generating...
                                </>
                            ) : (
                                "Generate Today's Plan"
                            )}
                        </Button>
                    </CardContent>
                </Card>

                {error && (
                    <Card className="border-destructive">
                        <CardHeader className="flex flex-row items-center gap-4">
                            <AlertTriangle className="h-8 w-8 text-destructive" />
                            <div>
                                <CardTitle className="text-destructive">An Error Occurred</CardTitle>
                                <CardDescription>{error}</CardDescription>
                            </div>
                        </CardHeader>
                    </Card>
                )}

                {plan && plan.revisionList.length > 0 && (
                    <div className="space-y-4">
                        {plan.revisionList.map((task, index) => (
                            <Card key={index} className="hover:border-primary transition-colors">
                                <CardHeader className="flex flex-row items-start justify-between">
                                    <div>
                                        <CardTitle>{task.topic}</CardTitle>
                                        <CardDescription className="flex items-center gap-2 mt-1">
                                            <Lightbulb className="w-4 h-4 text-amber-500" />
                                            <span>{task.reason}</span>
                                        </CardDescription>
                                    </div>
                                    <Button size="sm" variant="outline">
                                        <BookCheck className="mr-2 h-4 w-4" />
                                        Revise Now
                                    </Button>
                                </CardHeader>
                            </Card>
                        ))}
                    </div>
                )}

                {plan && plan.revisionList.length === 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>All Caught Up!</CardTitle>
                            <CardDescription>
                                No priority revisions for today. Feel free to explore new topics!
                            </CardDescription>
                        </CardHeader>
                    </Card>
                )}
            </div>

            {/* Right Side - Upcoming Deadlines */}
            <div>
                <Card>
                    <CardHeader>
                        <CardTitle>Upcoming Deadlines</CardTitle>
                        <CardDescription>
                            Materials that need review soon
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {upcomingDeadlines.length === 0 ? (
                            <div className="text-center py-8">
                                <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                <p className="text-muted-foreground text-sm">
                                    No upcoming deadlines
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {upcomingDeadlines.map(material => {
                                    const daysUntil = Math.ceil(
                                        (Date.parse(material.nextReview) - now) / (1000 * 60 * 60 * 24)
                                    );
                                    const isOverdue = daysUntil < 0;

                                    return (
                                        <div
                                            key={material.id}
                                            className="p-4 rounded-lg border hover:border-primary transition-colors"
                                        >
                                            <div className="flex items-start justify-between mb-2">
                                                <div>
                                                    <div className="font-medium">{material.topic}</div>
                                                    <div className="text-sm text-muted-foreground">
                                                        {material.subject}
                                                    </div>
                                                </div>
                                                <Badge variant={isOverdue ? "destructive" : "default"}>
                                                    {isOverdue ? "Overdue" : material.status}
                                                </Badge>
                                            </div>
                                            <div className="text-sm text-muted-foreground">
                                                {isOverdue
                                                    ? `${Math.abs(daysUntil)} days overdue`
                                                    : daysUntil === 0
                                                        ? "Due today"
                                                        : `Due in ${daysUntil} ${daysUntil === 1 ? "day" : "days"}`}
                                            </div>
                                            <div className="text-xs text-muted-foreground mt-1">
                                                {new Date(material.nextReview).toLocaleDateString()}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

/**
 * Topic Mastery Grid
 * 
 * Displays ML mastery predictions for each topic with visual indicators.
 * Replaces static "Brain Map" with real ML data.
 */

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle2, Clock } from "lucide-react";
import type { StudentIntelligence } from "@/types/intelligence";

interface TopicMasteryGridProps {
    intelligence: StudentIntelligence;
}

export function TopicMasteryGrid({ intelligence }: TopicMasteryGridProps) {
    return (
        <Card className="md:col-span-2 lg:col-span-3">
            <CardHeader>
                <CardTitle>Topic Mastery (ML-Predicted)</CardTitle>
                <p className="text-sm text-muted-foreground">
                    Real-time predictions based on your quiz history and revision patterns
                </p>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {Object.entries(intelligence.mastery).map(([topic, signal]) => {
                    const masteryPercent = Math.round(signal.score * 100);
                    const isPriority = signal.priority === "HIGH";
                    const isStrong = signal.score >= 0.7;

                    return (
                        <Card
                            key={topic}
                            className={`hover:shadow-md transition-shadow duration-300 ${isPriority ? "border-destructive" : ""
                                }`}
                        >
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-md font-medium font-headline">
                                    {topic}
                                </CardTitle>
                                {isPriority ? (
                                    <AlertCircle className="h-4 w-4 text-destructive" />
                                ) : isStrong ? (
                                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                                ) : (
                                    <Clock className="h-4 w-4 text-muted-foreground" />
                                )}
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <Progress value={masteryPercent} />
                                <div className="flex justify-between items-center">
                                    <p className="text-xs text-muted-foreground">
                                        {masteryPercent}% mastered
                                    </p>
                                    <Badge
                                        variant={isPriority ? "destructive" : "secondary"}
                                        className="text-xs"
                                    >
                                        {signal.priority}
                                    </Badge>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Last revised: {signal.daysSinceRevision}d ago
                                </p>
                                {signal.needsRevision && (
                                    <p className="text-xs font-medium text-destructive">
                                        ⚠️ Revision recommended
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    );
                })}
            </CardContent>
        </Card>
    );
}

/**
 * Learning State Card
 * 
 * Displays ML-driven intelligence about the student's current learning state.
 * Shows attention risk, overall mastery, and ADK reasoning.
 */

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, TrendingUp, Brain, Info } from "lucide-react";
import type { StudentIntelligence } from "@/types/intelligence";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

interface LearningStateCardProps {
    intelligence: StudentIntelligence;
}

export function LearningStateCard({ intelligence }: LearningStateCardProps) {
    const overallMastery = Object.values(intelligence.mastery).reduce(
        (sum, m) => sum + m.score,
        0
    ) / Object.keys(intelligence.mastery).length;

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5" />
                    Learning State
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger>
                                <Info className="h-4 w-4 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs">
                                <p className="text-sm">
                                    Based on your recent quiz performance, revision gaps, and ML predictions.
                                    Updated: {new Date(intelligence.generatedAt).toLocaleString()}
                                </p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Attention Risk */}
                <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Attention Risk</span>
                    <Badge
                        variant={
                            intelligence.attentionRisk === "HIGH"
                                ? "destructive"
                                : intelligence.attentionRisk === "MEDIUM"
                                    ? "default"
                                    : "secondary"
                        }
                        className="flex items-center gap-1"
                    >
                        {intelligence.attentionRisk === "HIGH" && (
                            <AlertTriangle className="h-3 w-3" />
                        )}
                        {intelligence.attentionRisk}
                    </Badge>
                </div>

                {/* Overall Mastery */}
                <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Mastery Level</span>
                    <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold">
                            {Math.round(overallMastery * 100)}%
                        </span>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </div>
                </div>

                {/* ADK Mode */}
                <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Learning Mode</span>
                    <Badge variant="outline">
                        {intelligence.adkDecision.replace(/_/g, " ")}
                    </Badge>
                </div>

                {/* Reasoning */}
                {intelligence.reasoning.length > 0 && (
                    <div className="pt-2 border-t">
                        <p className="text-xs text-muted-foreground mb-2">AI Analysis:</p>
                        <ul className="text-xs space-y-1">
                            {intelligence.reasoning.map((reason, idx) => (
                                <li key={idx} className="flex items-start gap-2">
                                    <span className="text-primary mt-0.5">•</span>
                                    <span>{reason}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

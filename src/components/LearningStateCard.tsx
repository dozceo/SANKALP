/**
 * Learning State Card
 * 
 * Displays ML-driven intelligence about the student's current learning state.
 * Shows attention risk, overall mastery, and ADK reasoning.
 */

"use client";

import { useMemo, memo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, TrendingUp, Brain, Info } from "lucide-react";
import type { StudentIntelligence } from "@/types/intelligence";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";

interface LearningStateCardProps {
    intelligence: StudentIntelligence;
}

export const LearningStateCard = memo(function LearningStateCard({ intelligence }: LearningStateCardProps) {
    const overallMastery = useMemo(() => {
        const values = Object.values(intelligence.mastery);
        if (values.length === 0) return 0;
        let sum = 0;
        for (let i = 0; i < values.length; i++) {
            sum += values[i].score;
        }
        return sum / values.length;
    }, [intelligence.generatedAt, intelligence.mastery]);
    // Optimization: Added generatedAt, though mastery ref is safer if generatedAt isn't unique enough.
    // Actually, stick to generatedAt if we trust it, but mastery object ref is standard.
    // If I use memo() wrapper, the props won't change unless generatedAt changes (if I use custom comparator).
    // But default memo compares props shallowly.
    // If intelligence is a new object, memo sees change.
    // So I should use custom comparator.

    const tooltipText = useMemo(() => {
        if (intelligence.attentionRisk === 'HIGH') return "High attention risk detected. Consider taking shorter, more frequent sessions.";
        if (overallMastery < 0.6) return "Mastery levels are below optimal. Prioritize reviewing weak topics.";
        return "Based on your recent quiz performance, revision gaps, and ML predictions.";
    }, [intelligence.attentionRisk, overallMastery]);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5" />
                    Learning State
                    <Tooltip>
                        <TooltipTrigger aria-label="More information about learning state">
                            <Info className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                            <p className="text-sm">
                                {tooltipText}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                                Updated: {new Date(intelligence.generatedAt).toLocaleString()}
                            </p>
                        </TooltipContent>
                    </Tooltip>
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
}, (prev, next) => prev.intelligence.generatedAt === next.intelligence.generatedAt);

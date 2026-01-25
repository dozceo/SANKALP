"use client";

import { useState, useEffect, useRef } from "react";
import { useStudent } from "@/contexts/StudentContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Clock, Play, Pause, RotateCcw } from "lucide-react";

type TimerMode = '25-min-focus' | '5-min-break' | '15-min-long-break';

const TIMER_DURATIONS = {
    '25-min-focus': 25 * 60,
    '5-min-break': 5 * 60,
    '15-min-long-break': 15 * 60,
};

export function FocusTimer() {
    const { currentStudent } = useStudent();
    const [selectedTopic, setSelectedTopic] = useState("");
    const [timerMode, setTimerMode] = useState<TimerMode>('25-min-focus');
    const [timeLeft, setTimeLeft] = useState(TIMER_DURATIONS[timerMode]);
    const [isRunning, setIsRunning] = useState(false);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    // Get all topics from study materials
    const studyMaterials = currentStudent?.studyMaterials || [];
    const topics = studyMaterials.map(m => m.topic);

    // Format time as MM:SS
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Timer logic
    useEffect(() => {
        if (isRunning && timeLeft > 0) {
            intervalRef.current = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        setIsRunning(false);
                        // TODO: Show notification
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } else {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [isRunning, timeLeft]);

    const handleStart = () => {
        if (!selectedTopic) {
            alert("Please select a topic first");
            return;
        }
        setIsRunning(true);
    };

    const handlePause = () => {
        setIsRunning(false);
    };

    const handleReset = () => {
        setIsRunning(false);
        setTimeLeft(TIMER_DURATIONS[timerMode]);
    };

    const handleModeChange = (mode: TimerMode) => {
        setTimerMode(mode);
        setTimeLeft(TIMER_DURATIONS[mode]);
        setIsRunning(false);
    };

    const progress = ((TIMER_DURATIONS[timerMode] - timeLeft) / TIMER_DURATIONS[timerMode]) * 100;

    return (
        <Card className="max-w-2xl mx-auto">
            <CardHeader>
                <div className="flex items-center justify-center gap-2">
                    <Clock className="h-5 w-5" />
                    <CardTitle>Pomodoro</CardTitle>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Topic Selection */}
                <div className="space-y-2">
                    <label className="text-sm font-medium">
                        What do you want to study?
                    </label>
                    <Select value={selectedTopic} onValueChange={setSelectedTopic}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a topic" />
                        </SelectTrigger>
                        <SelectContent>
                            {topics.length > 0 ? (
                                topics.map(topic => (
                                    <SelectItem key={topic} value={topic}>
                                        {topic}
                                    </SelectItem>
                                ))
                            ) : (
                                <SelectItem value="none" disabled>
                                    No topics available
                                </SelectItem>
                            )}
                        </SelectContent>
                    </Select>
                </div>

                {/* Session Type Selector */}
                <div className="flex gap-2 justify-center">
                    <Button
                        variant={timerMode === '25-min-focus' ? 'default' : 'outline'}
                        onClick={() => handleModeChange('25-min-focus')}
                        size="sm"
                    >
                        25-min Focus
                    </Button>
                    <Button
                        variant={timerMode === '5-min-break' ? 'default' : 'outline'}
                        onClick={() => handleModeChange('5-min-break')}
                        size="sm"
                    >
                        5-min Break
                    </Button>
                    <Button
                        variant={timerMode === '15-min-long-break' ? 'default' : 'outline'}
                        onClick={() => handleModeChange('15-min-long-break')}
                        size="sm"
                    >
                        15-min Long Break
                    </Button>
                </div>

                {/* Timer Display */}
                <div className="text-center space-y-4">
                    <div className="text-7xl font-bold tabular-nums text-primary">
                        {formatTime(timeLeft)}
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-secondary rounded-full h-2">
                        <div
                            className="bg-primary h-2 rounded-full transition-all duration-1000"
                            style={{ width: `${progress}%` }}
                        />
                    </div>

                    {/* Control Buttons */}
                    <div className="flex gap-4 justify-center pt-4">
                        {!isRunning ? (
                            <Button onClick={handleStart} size="lg" className="w-32">
                                <Play className="h-4 w-4 mr-2" />
                                Start
                            </Button>
                        ) : (
                            <Button onClick={handlePause} size="lg" variant="secondary" className="w-32">
                                <Pause className="h-4 w-4 mr-2" />
                                Pause
                            </Button>
                        )}
                        <Button onClick={handleReset} size="lg" variant="outline">
                            <RotateCcw className="h-4 w-4 mr-2" />
                            Reset
                        </Button>
                    </div>
                </div>

                {/* Current Task Display */}
                {selectedTopic && (
                    <div className="text-center p-4 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground">Currently studying</p>
                        <p className="font-medium">{selectedTopic}</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useStudent } from "@/hooks/useStudent";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Clock, Play, Pause, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type TimerMode = '25-min-focus' | '5-min-break' | '15-min-long-break';

const TIMER_DURATIONS = {
    '25-min-focus': 25 * 60,
    '5-min-break': 5 * 60,
    '15-min-long-break': 15 * 60,
};

// Psychological messages for different states
const MESSAGES = {
    focus_complete: [
        "Great job! Your brain needs a recharge. Take a breath and stretch.",
        "Focus session complete. Let your mind wander for a bit to consolidate learning.",
        "You've earned a break! Stepping away now will help you focus better next time.",
        "Well done! Rest is part of the work. Go grab some water."
    ],
    break_complete: [
        "Break is over. Let's get back into the flow!",
        "Refreshed? Time to conquer the next task.",
        "Ready to focus? Your goals are waiting.",
        "Time's up! Bring your attention back to your studies."
    ]
};

const getRandomMessage = (type: 'focus_complete' | 'break_complete') => {
    const messages = MESSAGES[type];
    return messages[Math.floor(Math.random() * messages.length)];
};

export function FocusTimer() {
    const { currentStudent } = useStudent();
    const { toast } = useToast();
    const [selectedTopic, setSelectedTopic] = useState("");
    const [timerMode, setTimerMode] = useState<TimerMode>('25-min-focus');
    const [timeLeft, setTimeLeft] = useState(TIMER_DURATIONS[timerMode]);
    const [isRunning, setIsRunning] = useState(false);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);

    // Get all topics from study materials
    const studyMaterials = currentStudent?.studyMaterials || [];
    const topics = useMemo(() => studyMaterials.map(m => m.topic), [studyMaterials]);

    // Format time as MM:SS
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const initAudio = () => {
        try {
            const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
            if (!AudioContext) return;

            if (!audioContextRef.current) {
                audioContextRef.current = new AudioContext();
            }

            if (audioContextRef.current.state === 'suspended') {
                audioContextRef.current.resume();
            }
        } catch (error) {
            console.error("Error initializing audio:", error);
        }
    };

    const playNotificationSound = () => {
        try {
            if (!audioContextRef.current) return;

            const ctx = audioContextRef.current;
            const oscillator = ctx.createOscillator();
            const gainNode = ctx.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(ctx.destination);

            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(440, ctx.currentTime); // A4
            oscillator.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.1); // Jump to A5

            gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 0.5);

            oscillator.start();
            oscillator.stop(ctx.currentTime + 0.5);
        } catch (error) {
            console.error("Error playing sound:", error);
        }
    };

    const handleTimerComplete = () => {
        setIsRunning(false);
        playNotificationSound();

        const isFocusMode = timerMode === '25-min-focus';
        const messageType = isFocusMode ? 'focus_complete' : 'break_complete';
        const title = isFocusMode ? "Focus Session Complete!" : "Break Over!";
        const message = getRandomMessage(messageType);

        // Toast notification
        toast({
            title: title,
            description: message,
            duration: 5000,
        });

        // Browser notification
        if (Notification.permission === "granted") {
            new Notification(title, {
                body: message,
                icon: "/favicon.ico" // Assuming favicon exists
            });
        }
    };

    // Timer logic
    useEffect(() => {
        if (isRunning && timeLeft > 0) {
            intervalRef.current = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 0) return 0;
                    return prev - 1;
                });
            }, 1000);
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [isRunning, timeLeft]);

    // Check for completion
    useEffect(() => {
        if (timeLeft === 0 && isRunning) {
            handleTimerComplete();
        }
    }, [timeLeft, isRunning]);

    const requestNotificationPermission = () => {
        if ("Notification" in window && Notification.permission === "default") {
            Notification.requestPermission();
        }
    };

    const handleStart = () => {
        if (!selectedTopic) {
            toast({
                title: "Topic Required",
                description: "Please select a topic before starting the timer.",
                variant: "destructive",
            });
            return;
        }
        initAudio();
        requestNotificationPermission();
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
                    <Label htmlFor="study-topic">
                        What do you want to study?
                    </Label>
                    <Select value={selectedTopic} onValueChange={setSelectedTopic}>
                        <SelectTrigger id="study-topic">
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
                    <div
                        className="text-7xl font-bold tabular-nums text-primary"
                        role="timer"
                        aria-label="Time remaining"
                    >
                        {formatTime(timeLeft)}
                    </div>

                    {/* Progress Bar */}
                    <Progress value={progress} className="h-2" />

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

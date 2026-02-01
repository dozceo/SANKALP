'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Clock, PlayCircle, StopCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { generateFriendlyErrorMessage } from '@/app/actions/ai-error';

interface SankalpSession {
    id: string;
    duration: number; // in minutes
    startTime: Date;
}

export function SankalpSwitch() {
    const [isActive, setIsActive] = useState(false);
    const [duration, setDuration] = useState<number>(30);
    const [session, setSession] = useState<SankalpSession | null>(null);
    const [timeRemaining, setTimeRemaining] = useState<number>(0);
    const [loading, setLoading] = useState(false);
    const { user } = useAuth();
    const { toast } = useToast();

    // Timer countdown
    useEffect(() => {
        if (!isActive || !session) return;

        const timer = setInterval(() => {
            const now = new Date().getTime();
            const start = new Date(session.startTime).getTime();
            const elapsed = Math.floor((now - start) / 1000); // seconds
            const total = session.duration * 60; // convert to seconds
            const remaining = Math.max(0, total - elapsed);

            setTimeRemaining(remaining);

            // Auto-end when time is up
            if (remaining === 0) {
                handleEnd();
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [isActive, session]);

    const handleStart = async () => {
        if (!user) {
            toast({
                title: 'Not authenticated',
                description: 'Please sign in first',
                variant: 'destructive',
            });
            return;
        }

        setLoading(true);

        try {
            const response = await fetch('/api/sankalp/session/start', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    studentId: user.uid,
                    targetDuration: duration,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to start session');
            }

            setSession({
                id: data.sessionId,
                duration,
                startTime: new Date(data.startTime),
            });
            setIsActive(true);
            setTimeRemaining(duration * 60);

            toast({
                title: 'SANKALP Loop Started',
                description: `${duration} minute session begun!`,
            });
        } catch (error: any) {
            const friendlyMessage = await generateFriendlyErrorMessage(error.message, 'Starting a Focus Session');
            toast({
                title: 'Failed to start',
                description: friendlyMessage,
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleEnd = async () => {
        if (!session) return;

        setLoading(true);

        try {
            const response = await fetch('/api/sankalp/session/end', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sessionId: session.id,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to end session');
            }

            setIsActive(false);
            setSession(null);
            setTimeRemaining(0);

            toast({
                title: 'SANKALP Loop Completed',
                description: `Session ended. Duration: ${data.duration} minutes`,
            });
        } catch (error: any) {
            toast({
                title: 'Failed to end',
                description: error.message,
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <Card className="border-2 border-primary/20">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <Clock className="h-5 w-5 text-primary" />
                            SANKALP Loop
                        </CardTitle>
                        <CardDescription>
                            {isActive ? 'Session in progress' : 'Start a focused study session'}
                        </CardDescription>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                        }`}>
                        {isActive ? 'Active' : 'Inactive'}
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {!isActive ? (
                    <>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Session Duration</label>
                            <Select
                                value={duration.toString()}
                                onValueChange={(val) => setDuration(parseInt(val))}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="15">15 minutes</SelectItem>
                                    <SelectItem value="30">30 minutes</SelectItem>
                                    <SelectItem value="45">45 minutes</SelectItem>
                                    <SelectItem value="60">60 minutes</SelectItem>
                                    <SelectItem value="90">90 minutes</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <Button
                            onClick={handleStart}
                            className="w-full"
                            size="lg"
                            disabled={loading}
                        >
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            <PlayCircle className="mr-2 h-5 w-5" />
                            Start SANKALP Loop
                        </Button>
                    </>
                ) : (
                    <>
                        <div className="text-center py-6">
                            <div className="text-5xl font-mono font-bold text-primary">
                                {formatTime(timeRemaining)}
                            </div>
                            <p className="text-sm text-muted-foreground mt-2">
                                Time remaining
                            </p>
                        </div>
                        <Button
                            onClick={handleEnd}
                            variant="destructive"
                            className="w-full"
                            size="lg"
                            disabled={loading}
                        >
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            <StopCircle className="mr-2 h-5 w-5" />
                            End Session
                        </Button>
                    </>
                )}
            </CardContent>
        </Card>
    );
}

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BrainCircuit, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export default function JoinClassPage() {
    const [classCode, setClassCode] = useState('');
    const [loading, setLoading] = useState(false);
    const { user } = useAuth();
    const router = useRouter();
    const { toast } = useToast();

    const handleJoin = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!user) {
            toast({
                title: 'Not authenticated',
                description: 'Please sign in first',
                variant: 'destructive',
            });
            router.push('/login');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch('/api/classes/join', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    studentId: user.uid,
                    classCode: classCode.toUpperCase(),
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to join class');
            }

            toast({
                title: 'Success!',
                description: `Joined ${data.class.className}`,
            });

            router.push('/home');
        } catch (error: any) {
            toast({
                title: 'Failed to join class',
                description: error.message || 'Invalid class code',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="w-full max-w-md shadow-md border-border/60">
            <CardHeader className="text-center space-y-1">
                <div className="flex justify-center mb-2">
                    <div className="p-3 rounded-full bg-primary/10">
                        <BrainCircuit className="h-10 w-10 text-primary" />
                    </div>
                </div>
                <CardTitle className="text-3xl font-headline tracking-tight">Join Your Class</CardTitle>
                <CardDescription className="text-base">
                    Enter the 6-character class code provided by your teacher
                </CardDescription>
            </CardHeader>
                <CardContent>
                    <form onSubmit={handleJoin} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="classCode">Class Code</Label>
                            <Input
                                id="classCode"
                                maxLength={6}
                                value={classCode}
                                onChange={(e) => setClassCode(e.target.value.toUpperCase())}
                                placeholder="ABC123"
                                className="text-center text-xl tracking-widest font-mono"
                                required
                            />
                            <p className="text-sm text-muted-foreground">
                                Example: MTH001, SCI9B2
                            </p>
                        </div>

                        <Button type="submit" className="w-full" disabled={loading || classCode.length !== 6}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Join Class
                        </Button>

                        <Button
                            type="button"
                            variant="ghost"
                            className="w-full"
                            onClick={() => router.push('/home')}
                        >
                            Skip for now
                        </Button>
                    </form>
                </CardContent>
            </Card>
    );
}

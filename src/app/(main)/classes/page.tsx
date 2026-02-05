"use client";

import { useState } from "react";
import { useStudent } from "@/hooks/useStudent";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2, BookOpen, Users, User, ArrowRight, ShieldCheck } from "lucide-react";

export default function ClassroomPage() {
    const { currentStudent, loading, joinClass } = useStudent();
    const [classCode, setClassCode] = useState("");
    const [joining, setJoining] = useState(false);
    const { toast } = useToast();

    const handleJoinClass = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!classCode.trim()) return;

        setJoining(true);
        try {
            await joinClass(classCode);
            toast({
                title: "Success!",
                description: "You have successfully joined the class.",
            });
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Failed to join class. Please check the code.",
                variant: "destructive",
            });
        } finally {
            setJoining(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[50vh]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (currentStudent?.classId) {
        return (
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold font-headline">My Classroom</h1>
                    <p className="text-muted-foreground">
                        You are currently enrolled in a class.
                    </p>
                </div>

                <Card className="max-w-2xl">
                    <CardHeader className="flex flex-row items-center gap-4">
                        <div className="bg-primary/10 p-3 rounded-full">
                            <BookOpen className="h-8 w-8 text-primary" />
                        </div>
                        <div>
                            <CardTitle className="text-2xl">{currentStudent.className}</CardTitle>
                            <CardDescription>Official Enrolled Class</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                                <User className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase font-semibold">Teacher</p>
                                    <p className="font-medium">{currentStudent.teacherName || "Assigned Teacher"}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                                <ShieldCheck className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase font-semibold">Status</p>
                                    <p className="font-medium text-green-600">Active</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 border rounded-lg bg-accent/20">
                            <h3 className="font-semibold mb-2 flex items-center gap-2">
                                <Users className="h-4 w-4" />
                                Classroom Benefits
                            </h3>
                            <ul className="text-sm space-y-2 text-muted-foreground">
                                <li>• Receive personalized assignments from your teacher.</li>
                                <li>• Track your progress relative to class benchmarks.</li>
                                <li>• Participate in class-specific quizzes and challenges.</li>
                                <li>• Your teacher can provide direct feedback on your learning map.</li>
                            </ul>
                        </div>
                    </CardContent>
                    <CardFooter className="border-t pt-6 bg-muted/20">
                        <p className="text-xs text-muted-foreground">
                            If you need to switch classes, please contact your school administrator or teacher.
                        </p>
                    </CardFooter>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold font-headline">Join a Classroom</h1>
                <p className="text-muted-foreground">
                    Connect with your teacher to access assignments and track your progress.
                </p>
            </div>

            <Card className="max-w-md">
                <CardHeader>
                    <CardTitle>Enter Class Code</CardTitle>
                    <CardDescription>
                        Ask your teacher for the 6-character class code to get started.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleJoinClass} className="space-y-4">
                        <div className="space-y-2">
                            <Input
                                placeholder="e.g. AB1234"
                                value={classCode}
                                onChange={(e) => setClassCode(e.target.value.toUpperCase())}
                                className="text-center text-2xl tracking-widest font-mono h-14"
                                maxLength={6}
                                required
                            />
                        </div>
                        <Button
                            type="submit"
                            className="w-full h-12 text-lg"
                            disabled={joining || !classCode.trim()}
                        >
                            {joining ? (
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            ) : (
                                <ArrowRight className="mr-2 h-5 w-5" />
                            )}
                            Join Class
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex flex-col items-start gap-2 text-sm text-muted-foreground bg-muted/20">
                    <p>• You can only be in one class at a time.</p>
                    <p>• Make sure you have the correct code from your teacher.</p>
                </CardFooter>
            </Card>
        </div>
    );
}

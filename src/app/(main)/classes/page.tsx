"use client";

import { useState } from "react";
import { useStudent } from "@/contexts/StudentContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2, BookOpen, Users, User, ArrowRight, ShieldCheck, LogOut, GraduationCap, Info } from "lucide-react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function ClassroomPage() {
    const { currentStudent, loading, joinClass, leaveClass } = useStudent();
    const [classCode, setClassCode] = useState("");
    const [joining, setJoining] = useState(false);
    const [leaving, setLeaving] = useState(false);
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
            setClassCode("");
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

    const handleLeaveClass = async () => {
        setLeaving(true);
        try {
            await leaveClass();
            toast({
                title: "Left Class",
                description: "You have successfully left the classroom.",
            });
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Failed to leave class.",
                variant: "destructive",
            });
        } finally {
            setLeaving(false);
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
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold font-headline text-foreground">My Classroom</h1>
                        <p className="text-muted-foreground">
                            You are currently enrolled in an active class.
                        </p>
                    </div>

                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="outline" className="text-destructive hover:bg-destructive/10 border-destructive/20" disabled={leaving}>
                                {leaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <LogOut className="h-4 w-4 mr-2" />}
                                Leave Class
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This will remove you from <strong>{currentStudent.className}</strong>.
                                    You will lose access to class-specific assignments and your teacher will no longer see your progress in their dashboard.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleLeaveClass} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                    Leave Class
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Card className="lg:col-span-2 overflow-hidden border-primary/10">
                        <CardHeader className="flex flex-row items-center gap-4 bg-primary/5 pb-8">
                            <div className="bg-primary p-3 rounded-xl shadow-lg shadow-primary/20">
                                <GraduationCap className="h-8 w-8 text-primary-foreground" />
                            </div>
                            <div>
                                <CardTitle className="text-2xl font-bold">{currentStudent.className}</CardTitle>
                                <CardDescription className="flex items-center gap-2">
                                    <ShieldCheck className="h-3 w-3 text-green-600" />
                                    Official Enrolled Class
                                </CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6 pt-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="flex items-center gap-3 p-4 bg-muted/40 rounded-xl border border-border/50">
                                    <User className="h-5 w-5 text-primary" />
                                    <div>
                                        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Teacher</p>
                                        <p className="font-semibold">{currentStudent.teacherName || "Assigned Teacher"}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-4 bg-muted/40 rounded-xl border border-border/50">
                                    <BookOpen className="h-5 w-5 text-primary" />
                                    <div>
                                        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Subject</p>
                                        <p className="font-semibold">{currentStudent.classSubject || "Not Specified"}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-4 bg-muted/40 rounded-xl border border-border/50">
                                    <Info className="h-5 w-5 text-primary" />
                                    <div>
                                        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Grade/Level</p>
                                        <p className="font-semibold text-foreground">{currentStudent.grade || "N/A"}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 border rounded-2xl bg-gradient-to-br from-primary/5 to-transparent border-primary/10">
                                <h3 className="font-bold mb-4 flex items-center gap-2 text-foreground">
                                    <Users className="h-5 w-5 text-primary" />
                                    Classroom Benefits
                                </h3>
                                <ul className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-6 text-sm">
                                    <li className="flex gap-2">
                                        <span className="text-primary font-bold">•</span>
                                        <span className="text-muted-foreground">Receive personalized assignments from your teacher.</span>
                                    </li>
                                    <li className="flex gap-2">
                                        <span className="text-primary font-bold">•</span>
                                        <span className="text-muted-foreground">Track your progress relative to class benchmarks.</span>
                                    </li>
                                    <li className="flex gap-2">
                                        <span className="text-primary font-bold">•</span>
                                        <span className="text-muted-foreground">Participate in class-specific quizzes and challenges.</span>
                                    </li>
                                    <li className="flex gap-2">
                                        <span className="text-primary font-bold">•</span>
                                        <span className="text-muted-foreground">Get direct feedback on your learning map.</span>
                                    </li>
                                </ul>
                            </div>
                        </CardContent>
                        <CardFooter className="border-t py-4 bg-muted/20 px-6">
                            <p className="text-xs text-muted-foreground italic">
                                Enrolled since {currentStudent.joinedClassAt ? new Date(currentStudent.joinedClassAt as any).toLocaleDateString() : 'recently'}.
                            </p>
                        </CardFooter>
                    </Card>

                    <Card className="h-fit">
                        <CardHeader>
                            <CardTitle className="text-lg">Class Announcements</CardTitle>
                            <CardDescription>Stay updated with your teacher</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center py-8 text-muted-foreground">
                                <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-20" />
                                <p className="text-sm">No new announcements from your teacher yet.</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold font-headline text-foreground">Join a Classroom</h1>
                <p className="text-muted-foreground">
                    Connect with your teacher to access assignments and track your progress.
                </p>
            </div>

            <Card className="max-w-md border-primary/20 shadow-xl shadow-primary/5">
                <CardHeader className="text-center">
                    <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Users className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle className="text-2xl">Enter Class Code</CardTitle>
                    <CardDescription>
                        Ask your teacher for the 6-character class code to get started.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleJoinClass} className="space-y-6">
                        <div className="space-y-2">
                            <Input
                                placeholder="e.g. AB1234"
                                value={classCode}
                                onChange={(e) => setClassCode(e.target.value.toUpperCase())}
                                className="text-center text-3xl tracking-[0.5em] font-mono h-20 border-2 focus-visible:ring-primary/20"
                                maxLength={6}
                                required
                            />
                        </div>
                        <Button
                            type="submit"
                            className="w-full h-14 text-lg font-bold shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                            disabled={joining || !classCode.trim()}
                        >
                            {joining ? (
                                <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                            ) : (
                                <ArrowRight className="mr-2 h-6 w-6" />
                            )}
                            Join Classroom
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex flex-col items-start gap-3 text-sm text-muted-foreground bg-muted/30 p-6 border-t">
                    <div className="flex gap-2">
                        <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <span className="text-[10px] font-bold text-primary">1</span>
                        </div>
                        <p>You can only be enrolled in one class at a time.</p>
                    </div>
                    <div className="flex gap-2">
                        <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <span className="text-[10px] font-bold text-primary">2</span>
                        </div>
                        <p>Joining a new class will automatically unenroll you from any previous class.</p>
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
}

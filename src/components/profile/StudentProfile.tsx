"use client";

import { useStudent } from "@/hooks/useStudent";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Mail, School, GraduationCap, Brain, TrendingUp, AlertCircle, Pencil } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface StudentProfileProps {
    userId: string;
}

const AVATAR_COLORS = [
    'bg-blue-500',
    'bg-purple-500',
    'bg-green-500',
    'bg-orange-500',
    'bg-pink-500',
];

// Helper for avatar color
const getAvatarColor = (grade?: number) => {
    return AVATAR_COLORS[(grade || 0) % AVATAR_COLORS.length];
};

// ⚡ Bolt: Optimize getInitials to use a single-pass string loop without creating arrays
// 📊 Impact: Prevents multiple array allocations and GC pauses on render for each student/teacher avatar
const getInitials = (name: string) => {
    let initials = "";
    let isNewWord = true;
    for (let i = 0; i < name.length; i++) {
        if (name[i] === ' ') {
            isNewWord = true;
        } else if (isNewWord) {
            initials += name[i];
            isNewWord = false;
            if (initials.length === 2) break;
        }
    }
    return initials.toUpperCase();
};

export default function StudentProfile({ userId }: StudentProfileProps) {
    const { currentStudent, loading } = useStudent();

    if (loading) {
        return (
            <div className="space-y-6">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
                            <Skeleton className="h-32 w-32 rounded-full" />
                            <div className="space-y-4 flex-1 w-full">
                                <Skeleton className="h-8 w-1/2" />
                                <Skeleton className="h-4 w-1/3" />
                                <Skeleton className="h-4 w-full" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Skeleton className="h-64" />
                    <Skeleton className="h-64" />
                </div>
            </div>
        );
    }

    if (!currentStudent) {
        return (
             <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
                <h2 className="text-2xl font-bold text-muted-foreground">Student Profile Not Found</h2>
                <p className="text-muted-foreground">Unable to load student data for ID: {userId}</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-5xl mx-auto pb-10">
            {/* Header Section - LinkedIn Style Banner/Profile */}
            <Card className="overflow-hidden border-none shadow-md">
                <div className="h-32 bg-gradient-to-r from-primary/80 to-accent/80 relative">
                     {/* Cover Image Placeholder */}
                </div>
                <CardContent className="px-6 pb-6 relative">
                     <div className="flex flex-col md:flex-row gap-6 items-center md:items-end -mt-12 mb-4">
                        <Avatar className={`h-32 w-32 border-4 border-background shadow-lg ${getAvatarColor(currentStudent.grade)}`}>
                            <AvatarFallback className="text-4xl text-white font-bold">
                                {getInitials(currentStudent.name)}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 text-center md:text-left space-y-1 mt-2 md:mt-0">
                            <h1 className="text-3xl font-bold font-headline">{currentStudent.name}</h1>
                            <p className="text-muted-foreground font-medium flex items-center justify-center md:justify-start gap-2">
                                <GraduationCap className="h-4 w-4" />
                                Grade {currentStudent.grade} Student
                            </p>
                             <div className="flex items-center justify-center md:justify-start gap-4 text-sm text-muted-foreground mt-2">
                                {currentStudent.email && (
                                    <span className="flex items-center gap-1">
                                        <Mail className="h-3 w-3" /> {currentStudent.email}
                                    </span>
                                )}
                                <span className="flex items-center gap-1">
                                    <School className="h-3 w-3" /> Sankalp High
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 mt-4 md:mt-0 mb-2">
                             <Link href="/settings">
                                <Button variant="outline" size="sm" className="gap-2">
                                    <Pencil className="h-3 w-3" />
                                    Edit Profile
                                </Button>
                             </Link>
                        </div>
                     </div>

                     <div className="mt-6">
                        <h3 className="text-lg font-semibold mb-2">About</h3>
                        <p className="text-muted-foreground text-sm leading-relaxed">
                            Passionate student focused on academic excellence.
                            Currently exploring {currentStudent.topics?.length ? currentStudent.topics.slice(0, 3).join(", ") : "various subjects"}
                            and working on improving mastery in key areas.
                        </p>
                     </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left Column - Stats & Skills */}
                <div className="space-y-6 md:col-span-2">
                     {/* Academic Performance / Mastery */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Brain className="h-5 w-5 text-primary" />
                                Subject Mastery
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {currentStudent.masteryScores && Object.keys(currentStudent.masteryScores).length > 0 ? (
                                Object.entries(currentStudent.masteryScores).map(([subject, score]) => (
                                    <div key={subject} className="space-y-2">
                                        <div className="flex justify-between text-sm font-medium">
                                            <span className="capitalize">{subject}</span>
                                            <span className="text-muted-foreground">{Math.round(score * 100)}%</span>
                                        </div>
                                        <Progress value={score * 100} className="h-2" />
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-muted-foreground">No mastery data available yet.</p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Areas of Focus */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className="h-full">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <TrendingUp className="h-5 w-5 text-green-500" />
                                    Strengths
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap gap-2">
                                    {currentStudent.strengths && currentStudent.strengths.length > 0 ? (
                                        currentStudent.strengths.map((strength, i) => (
                                            <Badge key={i} variant="secondary" className="bg-green-50 text-green-700 hover:bg-green-100 border-green-200">
                                                {strength}
                                            </Badge>
                                        ))
                                    ) : (
                                        <span className="text-sm text-muted-foreground">No strengths recorded.</span>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="h-full">
                             <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <AlertCircle className="h-5 w-5 text-orange-500" />
                                    Areas for Improvement
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap gap-2">
                                    {currentStudent.weaknesses && currentStudent.weaknesses.length > 0 ? (
                                        currentStudent.weaknesses.map((weakness, i) => (
                                            <Badge key={i} variant="outline" className="border-orange-200 text-orange-700 bg-orange-50">
                                                {weakness}
                                            </Badge>
                                        ))
                                    ) : (
                                        <span className="text-sm text-muted-foreground">No specific areas identified.</span>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Right Column - Interests & Details */}
                <div className="space-y-6">
                     <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Current Topics</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-2">
                                {currentStudent.topics && currentStudent.topics.length > 0 ? (
                                    currentStudent.topics.map((topic, i) => (
                                        <Badge key={i} variant="secondary" className="font-normal">
                                            {topic}
                                        </Badge>
                                    ))
                                ) : (
                                    <p className="text-sm text-muted-foreground">No active topics.</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Recent Activity</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-start gap-3 text-sm">
                                    <div className="mt-1 bg-primary/10 p-1 rounded-full">
                                        <Brain className="h-3 w-3 text-primary" />
                                    </div>
                                    <div>
                                        <p className="font-medium">Completed Quiz</p>
                                        <p className="text-xs text-muted-foreground">2 hours ago</p>
                                    </div>
                                </div>
                                <Separator />
                                <div className="flex items-start gap-3 text-sm">
                                    <div className="mt-1 bg-primary/10 p-1 rounded-full">
                                        <GraduationCap className="h-3 w-3 text-primary" />
                                    </div>
                                    <div>
                                        <p className="font-medium">Mastered "Algebra"</p>
                                        <p className="text-xs text-muted-foreground">Yesterday</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

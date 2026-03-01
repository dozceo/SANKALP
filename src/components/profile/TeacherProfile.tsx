"use client";

import { useTeacher } from "@/hooks/useTeacher";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Mail, School, BookOpen, Users, Pencil, Briefcase } from "lucide-react";
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface TeacherProfileProps {
    userId: string;
}

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

export default function TeacherProfile({ userId }: TeacherProfileProps) {
    const { teacher, loading, error } = useTeacher(userId);

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

    if (error || !teacher) {
        return (
            <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
                <h2 className="text-2xl font-bold text-muted-foreground">Teacher Profile Not Found</h2>
                <p className="text-muted-foreground">{error ? error.message : "Unable to load teacher data."}</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-5xl mx-auto pb-10">
            {/* Header Section */}
            <Card className="overflow-hidden border-none shadow-md">
                <div className="h-32 bg-gradient-to-r from-blue-600/80 to-indigo-600/80 relative">
                </div>
                <CardContent className="px-6 pb-6 relative">
                    <div className="flex flex-col md:flex-row gap-6 items-center md:items-end -mt-12 mb-4">
                        <Avatar className="h-32 w-32 border-4 border-background shadow-lg bg-blue-500">
                            <AvatarFallback className="text-4xl text-white font-bold">
                                {getInitials(teacher.name)}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 text-center md:text-left space-y-1 mt-2 md:mt-0">
                            <h1 className="text-3xl font-bold font-headline">{teacher.name}</h1>
                            <p className="text-muted-foreground font-medium flex items-center justify-center md:justify-start gap-2">
                                <Briefcase className="h-4 w-4" />
                                Educator
                            </p>
                            <div className="flex items-center justify-center md:justify-start gap-4 text-sm text-muted-foreground mt-2">
                                {teacher.email && (
                                    <span className="flex items-center gap-1">
                                        <Mail className="h-3 w-3" /> {teacher.email}
                                    </span>
                                )}
                                {teacher.schoolName && (
                                    <span className="flex items-center gap-1">
                                        <School className="h-3 w-3" /> {teacher.schoolName}
                                    </span>
                                )}
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
                        <h3 className="text-lg font-semibold mb-2">Professional Summary</h3>
                        <p className="text-muted-foreground text-sm leading-relaxed">
                            Dedicated educator committed to fostering a dynamic and engaging learning environment.
                            Specializing in {teacher.subjects?.length ? teacher.subjects.join(", ") : "various subjects"}
                            for {teacher.gradeLevels?.length ? teacher.gradeLevels.join(", ") : "multiple grade levels"}.
                        </p>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Teaching Details */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BookOpen className="h-5 w-5 text-blue-500" />
                            Subjects & Expertise
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <h4 className="text-sm font-medium text-muted-foreground mb-2">Subjects Taught</h4>
                            <div className="flex flex-wrap gap-2">
                                {teacher.subjects && teacher.subjects.length > 0 ? (
                                    teacher.subjects.map((subject, i) => (
                                        <Badge key={i} variant="secondary">
                                            {subject}
                                        </Badge>
                                    ))
                                ) : (
                                    <span className="text-sm text-muted-foreground">No subjects listed.</span>
                                )}
                            </div>
                        </div>
                        <div>
                            <h4 className="text-sm font-medium text-muted-foreground mb-2">Grade Levels</h4>
                            <div className="flex flex-wrap gap-2">
                                {teacher.gradeLevels && teacher.gradeLevels.length > 0 ? (
                                    teacher.gradeLevels.map((grade, i) => (
                                        <Badge key={i} variant="outline">
                                            {grade}
                                        </Badge>
                                    ))
                                ) : (
                                    <span className="text-sm text-muted-foreground">No grade levels listed.</span>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Class Information */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5 text-indigo-500" />
                            Class Overview
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                            <div className="space-y-1">
                                <p className="text-sm font-medium">Expected Class Size</p>
                                <p className="text-2xl font-bold">{teacher.expectedClassSize || "N/A"}</p>
                            </div>
                            <Users className="h-8 w-8 text-muted-foreground/50" />
                        </div>
                        <div className="text-sm text-muted-foreground">
                            <p>Currently managing classes and student progress through the Sankalp dashboard.</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

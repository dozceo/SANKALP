"use client";

import { useAuth } from "@/contexts/AuthContext";
import StudentProfile from "@/components/profile/StudentProfile";
import TeacherProfile from "@/components/profile/TeacherProfile";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export default function ProfilePage() {
    const { user, role, loading } = useAuth();

    if (loading) {
        return (
            <div className="space-y-6 max-w-5xl mx-auto">
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

    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
                <h2 className="text-2xl font-bold text-muted-foreground">Please Log In</h2>
                <p className="text-muted-foreground">You must be logged in to view your profile.</p>
            </div>
        );
    }

    if (role === 'teacher') {
        return <TeacherProfile userId={user.uid} />;
    }

    // Default to student profile for 'student' role or as fallback
    return <StudentProfile userId={user.uid} />;
}

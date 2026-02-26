"use client";

import { useStudent } from '@/hooks/useStudent';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import Link from 'next/link';
import { Skeleton } from "@/components/ui/skeleton";
import { getInitials, getAvatarColor } from '@/lib/student-utils';

export function StudentSelector() {
    const { currentStudent, loading } = useStudent();

    if (loading) {
        return (
             <Skeleton className="h-8 w-8 rounded-full" />
        );
    }

    if (!currentStudent) {
        return null;
    }

    return (
        <Link href="/profile" passHref>
             <button
                aria-label={`View profile for ${currentStudent.name}`}
                className="flex items-center gap-2 rounded-full hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
                <Avatar className={`h-8 w-8 ${getAvatarColor(currentStudent.grade)}`}>
                    <AvatarFallback className="text-white font-medium text-xs">
                        {getInitials(currentStudent.name)}
                    </AvatarFallback>
                </Avatar>
            </button>
        </Link>
    );
}

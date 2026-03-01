"use client";

import { useStudent } from '@/hooks/useStudent';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import Link from 'next/link';
import { Skeleton } from "@/components/ui/skeleton";

const AVATAR_COLORS = [
    'bg-blue-500',
    'bg-purple-500',
    'bg-green-500',
    'bg-orange-500',
    'bg-pink-500',
];

// Get color based on student grade
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

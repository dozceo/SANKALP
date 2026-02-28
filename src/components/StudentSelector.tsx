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

// ⚡ Bolt: Use a single string loop for getInitials and externalize color array
// 📊 Impact: Prevents garbage collector from cleaning up multiple short-lived arrays per render
const getInitials = (name: string) => {
    let initials = '';
    let isNewWord = true;
    for (let i = 0; i < name.length && initials.length < 2; i++) {
        if (name[i] === ' ') {
            isNewWord = true;
        } else if (isNewWord) {
            initials += name[i];
            isNewWord = false;
        }
    }
    return initials.toUpperCase();
};

const getAvatarColor = (grade?: number) => {
    // Optimization: Fallback to length to avoid NaN or undefined edge cases
    return AVATAR_COLORS[(grade || 0) % AVATAR_COLORS.length];
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

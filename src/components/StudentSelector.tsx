"use client";

import { useStudent } from '@/contexts/StudentContext';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Check } from 'lucide-react';

export function StudentSelector() {
    const { currentStudent, selectStudent, allStudents } = useStudent();

    if (!currentStudent) {
        return null;
    }

    // Get initials for avatar
    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase();
    };

    // Get color based on student grade
    const getAvatarColor = (grade?: number) => {
        const colors = [
            'bg-blue-500',
            'bg-purple-500',
            'bg-green-500',
            'bg-orange-500',
            'bg-pink-500',
        ];
        return colors[(grade || 0) % colors.length];
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-full hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
                    <Avatar className={`h-8 w-8 ${getAvatarColor(currentStudent.grade)}`}>
                        <AvatarFallback className="text-white font-medium text-sm">
                            {getInitials(currentStudent.name)}
                        </AvatarFallback>
                    </Avatar>
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Switch Student</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {allStudents.map((student) => (
                    <DropdownMenuItem
                        key={student.id}
                        onClick={() => selectStudent(student.id)}
                        className="flex items-center gap-3 cursor-pointer"
                    >
                        <Avatar className={`h-8 w-8 ${getAvatarColor(student.grade)}`}>
                            <AvatarFallback className="text-white font-medium text-xs">
                                {getInitials(student.name)}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                            <div className="font-medium">{student.name}</div>
                            <div className="text-xs text-muted-foreground">
                                Grade {student.grade}
                            </div>
                        </div>
                        {currentStudent.id === student.id && (
                            <Check className="h-4 w-4 text-primary" />
                        )}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

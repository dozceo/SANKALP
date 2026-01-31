"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { studentsData } from '@/data/studentsDataStatic';
import type { StudentNode } from '@/data/docsData';
import { useAuth } from './AuthContext';

interface StudentContextType {
    currentStudent: StudentNode | null;
    selectStudent: (studentId: string) => void;
    allStudents: StudentNode[];
}

const StudentContext = createContext<StudentContextType | undefined>(undefined);

export function StudentProvider({ children }: { children: ReactNode }) {
    const { user, role } = useAuth();
    const [currentStudent, setCurrentStudent] = useState<StudentNode | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // If not logged in or not a student, clear data
        if (!user || role !== 'student') {
            setCurrentStudent(null);
            setLoading(false);
            return;
        }

        // Simulating fetching student data - in real app this would call an API
        // For now, we still need to map the auth user to a student structure
        // but we start empty instead of defaulting to Alex
        const student: StudentNode = {
            id: user.uid,
            name: user.displayName || 'Student',
            // Initialize with empty defaults if no data exists
            // This prevents showing other people's data
            type: 'student',
            grade: 0,
            email: user.email || '',
            topics: [],
            strengths: [],
            weaknesses: [],
            connections: [],
            lastActive: new Date().toISOString(),
            masteryScores: {}
        };

        setCurrentStudent(student);
        setLoading(false);

    }, [user, role]);

    const selectStudent = (studentId: string) => {
        // In a real app, a student usually can't "select" another student unless they are a parent/admin
        // For now, we disable this or limit it to self
        if (studentId === user?.uid) {
            // Refetch or update
        }
    };

    return (
        <StudentContext.Provider value={{
            currentStudent,
            selectStudent,
            allStudents: currentStudent ? [currentStudent] : [] // Only show self
        }}>
            {!loading && children}
        </StudentContext.Provider>
    );
}

export function useStudent() {
    const context = useContext(StudentContext);
    if (context === undefined) {
        throw new Error('useStudent must be used within a StudentProvider');
    }
    return context;
}

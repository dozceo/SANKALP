"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { StudentNode } from '@/data/docsData';
import { useAuth } from './AuthContext';

interface StudentContextType {
    currentStudent: StudentNode | null;
    loading: boolean;
    refetch: () => void;
}

const StudentContext = createContext<StudentContextType | undefined>(undefined);

export function StudentProvider({ children }: { children: ReactNode }) {
    const { user } = useAuth();
    const [currentStudent, setCurrentStudent] = useState<StudentNode | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchStudent = async () => {
        if (!user) {
            setCurrentStudent(null);
            setLoading(false);
            return;
        }

        try {
            // Fetch student data from API
            const response = await fetch(`/api/student?studentId=${user.uid}`);

            if (response.ok) {
                const data = await response.json();
                if (data.student) {
                    // Transform to StudentNode format
                    const student: StudentNode = {
                        id: user.uid,
                        name: data.student.name || user.displayName || 'Student',
                        type: 'student',
                        grade: data.student.grade || 0,
                        email: data.student.email || user.email || '',
                        topics: data.student.topics || [],
                        strengths: data.student.strengths || [],
                        weaknesses: data.student.weaknesses || [],
                        connections: [],
                        lastActive: new Date().toISOString(),
                        masteryScores: data.student.masteryScores || {}
                    };
                    setCurrentStudent(student);
                } else {
                    // Student record doesn't exist yet - create minimal student
                    const student: StudentNode = {
                        id: user.uid,
                        name: user.displayName || 'Student',
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
                }
            } else {
                // API error - still create minimal student to prevent blocking
                const student: StudentNode = {
                    id: user.uid,
                    name: user.displayName || 'Student',
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
            }
        } catch (error) {
            console.error('Error fetching student:', error);
            // On error, still create minimal student
            const student: StudentNode = {
                id: user.uid,
                name: user.displayName || 'Student',
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
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStudent();
    }, [user?.uid]);

    return (
        <StudentContext.Provider value={{
            currentStudent,
            loading,
            refetch: fetchStudent
        }}>
            {children}
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

"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react';
import type { StudentNode, StudyMaterial } from '@/data/docsData';
import { useAuth } from './AuthContext';

export interface StudyMaterialInput {
    subject: string;
    topic: string;
    chapter?: string;
    detailedNotes: string;
    referenceLinks?: string[];
}

interface StudentContextType {
    currentStudent: StudentNode | null;
    loading: boolean;
    refetch: () => void;
    addStudyMaterial: (material: StudyMaterialInput) => Promise<string>;
    joinClass: (classCode: string) => Promise<any>;
    leaveClass: () => Promise<any>;
}

export const StudentContext = createContext<StudentContextType | undefined>(undefined);

export function StudentProvider({ children }: { children: ReactNode }) {
    const { user, role, loading: authLoading } = useAuth();
    const [currentStudent, setCurrentStudent] = useState<StudentNode | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchStudent = useCallback(async () => {
        // Wait for auth to finish loading before deciding what to fetch
        if (authLoading) return;

        if (!user || role !== 'student') {
            setCurrentStudent(null);
            setLoading(false);
            return;
        }

        try {
            // Guard against undefined userId
            if (!user?.uid || user.uid === 'undefined') {
                console.log('[StudentContext] No valid user ID, skipping fetch');
                setLoading(false);
                return;
            }

            console.log('[StudentContext] Fetching student data for:', user.uid);

            // Parallel fetch for student info and study materials
            const [studentRes, plannerRes] = await Promise.all([
                fetch(`/api/student?studentId=${user.uid}`),
                fetch(`/api/planner/data?studentId=${user.uid}`)
            ]);

            let student: StudentNode;

            if (studentRes.ok) {
                const data = await studentRes.json();
                if (data.student) {
                    student = {
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
                        masteryScores: data.student.masteryScores || {},
                        badges: data.student.badges || [],
                        streak: data.student.streak || 0,
                        classId: data.student.classId,
                        className: data.student.className,
                        classSubject: data.student.classSubject,
                        teacherName: data.student.teacherName, // Might be undefined if not in student doc
                        joinedClassAt: data.student.joinedClassAt,
                    };

                    // If we have a classId but no teacherName, we might want to fetch it
                    // But for now, let's assume it's either there or we'll live without it in the dashboard
                } else {
                    // Minimal student
                    student = {
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
                        masteryScores: {},
                        badges: [],
                        streak: 0
                    };
                }
            } else {
                 // Fallback minimal student
                 student = {
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
            }

            // Process Planner Data into StudyMaterials
            if (plannerRes.ok) {
                const plannerData = await plannerRes.json();
                if (plannerData.items && Array.isArray(plannerData.items)) {
                    const materials: StudyMaterial[] = plannerData.items.map((item: any) => {
                        // Attempt to extract chapter if we stored it in content
                        // Format assumed: "Chapter: <chapter>\n\n<notes>"
                        let chapter = undefined;
                        let notes = item.content;

                        if (item.content && item.content.startsWith("Chapter: ")) {
                            const parts = item.content.split('\n\n');
                            if (parts.length > 1) {
                                chapter = parts[0].replace("Chapter: ", "");
                                notes = parts.slice(1).join('\n\n');
                            }
                        }

                        return {
                            id: item.id,
                            subject: item.subject,
                            topic: item.topic,
                            chapter: chapter,
                            detailedNotes: notes,
                            referenceLinks: item.attachments || [],
                            nextReview: item.nextReviewDate || new Date().toISOString(),
                            status: item.completed ? 'Reviewed' : (item.nextReviewDate && new Date(item.nextReviewDate) < new Date() ? 'Due' : 'Upcoming'),
                            priority: 'MEDIUM',
                            lastReviewed: item.completedAt,
                            fileUploads: [] // API doesn't seem to return file uploads specifically distinct from attachments yet
                        };
                    });
                    student.studyMaterials = materials;
                }
            }

            console.log('[StudentContext] Student data loaded:', student);
            setCurrentStudent(student);

        } catch (error) {
            console.error('[StudentContext] Error fetching student:', error);
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
    }, [user, role, authLoading]);

    const addStudyMaterial = useCallback(async (material: StudyMaterialInput) => {
        if (!user?.uid) throw new Error("User not authenticated");

        try {
            // Prepare content with chapter if present
            const content = material.chapter
                ? `Chapter: ${material.chapter}\n\n${material.detailedNotes}`
                : material.detailedNotes;

            const payload = {
                studentId: user.uid,
                subject: material.subject,
                topic: material.topic,
                content: content,
                type: 'class_notes',
                attachments: material.referenceLinks?.filter(l => l.trim() !== '') || [],
                date: new Date().toISOString(),
            };

            const response = await fetch('/api/planner/data', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to save study material');
            }

            // Update local state
            if (currentStudent) {
                const newMaterial: StudyMaterial = {
                    id: data.itemId,
                    subject: material.subject,
                    topic: material.topic,
                    chapter: material.chapter,
                    detailedNotes: material.detailedNotes,
                    referenceLinks: material.referenceLinks?.filter(l => l.trim() !== '') || [],
                    nextReview: new Date().toISOString(), // Will be scheduled by backend logic ideally, but setting default here
                    status: 'Upcoming',
                    priority: 'MEDIUM',
                    fileUploads: []
                };

                setCurrentStudent({
                    ...currentStudent,
                    studyMaterials: [newMaterial, ...(currentStudent.studyMaterials || [])]
                });
            }

            return data.itemId;
        } catch (error) {
            console.error('[StudentContext] Error adding study material:', error);
            throw error;
        }
    }, [user?.uid, currentStudent]);

    useEffect(() => {
        fetchStudent();
    }, [fetchStudent]);

    const joinClass = useCallback(async (classCode: string) => {
        if (!user) throw new Error("User not authenticated");

        try {
            const token = await user.getIdToken();
            const response = await fetch('/api/classes/join', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    studentId: user.uid,
                    classCode: classCode,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to join class');
            }

            // Refetch student data to update the UI
            await fetchStudent();
            return data;
        } catch (error) {
            console.error('[StudentContext] Error joining class:', error);
            throw error;
        }
    }, [user, fetchStudent]);

    const leaveClass = useCallback(async () => {
        if (!user) throw new Error("User not authenticated");

        try {
            const token = await user.getIdToken();
            const response = await fetch('/api/classes/leave', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    studentId: user.uid,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to leave class');
            }

            // Refetch student data to update the UI
            await fetchStudent();
            return data;
        } catch (error) {
            console.error('[StudentContext] Error leaving class:', error);
            throw error;
        }
    }, [user, fetchStudent]);

    const value = useMemo(() => ({
        currentStudent,
        loading,
        refetch: fetchStudent,
        addStudyMaterial,
        joinClass,
        leaveClass
    }), [currentStudent, loading, fetchStudent, addStudyMaterial, joinClass, leaveClass]);

    return (
        <StudentContext.Provider value={value}>
            {children}
        </StudentContext.Provider>
    );
}


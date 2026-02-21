'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export interface Teacher {
    id: string;
    name: string;
    email: string;
    schoolName?: string;
    subjects?: string[];
    gradeLevels?: string[];
    expectedClassSize?: string;
}

export function useTeacher(teacherId: string | undefined) {
    const { user } = useAuth();
    const [teacher, setTeacher] = useState<Teacher | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        if (!teacherId || !user) {
            setLoading(false);
            return;
        }

        const currentUser = user;

        async function fetchTeacher() {
            setLoading(true);
            try {
                const token = await currentUser.getIdToken();
                const res = await fetch(`/api/teacher?teacherId=${teacherId}`, {
                    headers: { 'Authorization': `Bearer ${token}` },
                });
                if (!res.ok) throw new Error('Failed to fetch teacher data');
                const data = await res.json();
                setTeacher(data.teacher);
            } catch (err) {
                setError(err instanceof Error ? err : new Error('Unknown error'));
            } finally {
                setLoading(false);
            }
        }

        fetchTeacher();
    }, [teacherId, user]);

    return { teacher, loading, error };
}

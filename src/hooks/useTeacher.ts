'use client';

import { useState, useEffect } from 'react';

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
    const [teacher, setTeacher] = useState<Teacher | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        if (!teacherId) {
            setLoading(false);
            return;
        }

        async function fetchTeacher() {
            setLoading(true);
            try {
                const res = await fetch(`/api/teacher?teacherId=${teacherId}`);
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
    }, [teacherId]);

    return { teacher, loading, error };
}

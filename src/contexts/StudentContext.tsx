"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { studentsData } from '@/data/studentsDataStatic';
import type { StudentNode } from '@/data/docsData';

interface StudentContextType {
    currentStudent: StudentNode | null;
    selectStudent: (studentId: string) => void;
    allStudents: StudentNode[];
}

const StudentContext = createContext<StudentContextType | undefined>(undefined);

export function StudentProvider({ children }: { children: ReactNode }) {
    const [currentStudent, setCurrentStudent] = useState<StudentNode | null>(null);

    useEffect(() => {
        // Load saved student from localStorage or default to first student
        const savedStudentId = localStorage.getItem('selectedStudentId');
        const student = savedStudentId
            ? studentsData.find(s => s.id === savedStudentId) || studentsData[0]
            : studentsData[0]; // Default to Alex Kumar

        setCurrentStudent(student);
    }, []);

    const selectStudent = (studentId: string) => {
        const student = studentsData.find(s => s.id === studentId);
        if (student) {
            setCurrentStudent(student);
            localStorage.setItem('selectedStudentId', studentId);
        }
    };

    return (
        <StudentContext.Provider value={{
            currentStudent,
            selectStudent,
            allStudents: studentsData
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

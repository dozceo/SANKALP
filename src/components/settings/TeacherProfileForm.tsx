'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CheckCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

const SUBJECTS = [
    'Mathematics',
    'Physics',
    'Chemistry',
    'Biology',
    'History',
    'Geography',
    'Economics',
    'Computer Science',
    'English',
    'Other'
];

const GRADE_LEVELS = ['9th', '10th', '11th', '12th', 'College', 'Multiple'];
const CLASS_SIZES = ['1-10', '11-30', '31-50', '51-100', '100+'];

export function TeacherProfileForm() {
    const { user } = useAuth();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    const [formData, setFormData] = useState({
        name: '',
        subjects: [] as string[],
        gradeLevels: [] as string[],
        schoolName: '',
        expectedClassSize: '',
    });

    useEffect(() => {
        const fetchProfile = async () => {
            if (!user?.uid) {
                setFetching(false);
                return;
            }
            try {
                const response = await fetch(`/api/teacher?teacherId=${user.uid}`);
                if (response.ok) {
                    const data = await response.json();
                    if (data.teacher) {
                        setFormData({
                            name: data.teacher.name || '',
                            subjects: data.teacher.subjects || [], // Assuming stored
                            gradeLevels: data.teacher.gradeLevels || [], // Assuming stored
                            schoolName: data.teacher.schoolName || '', // Assuming stored
                            expectedClassSize: data.teacher.expectedClassSize || '', // Assuming stored
                        });
                    }
                }
            } catch (error) {
                console.error('Error fetching profile:', error);
                toast({
                    title: 'Error',
                    description: 'Failed to load profile data.',
                    variant: 'destructive',
                });
            } finally {
                setFetching(false);
            }
        };

        fetchProfile();
    }, [user, toast]);

    const handleSubjectToggle = (subject: string) => {
        setFormData(prev => ({
            ...prev,
            subjects: prev.subjects.includes(subject)
                ? prev.subjects.filter(s => s !== subject)
                : [...prev.subjects, subject]
        }));
    };

    const handleGradeLevelToggle = (grade: string) => {
        setFormData(prev => ({
            ...prev,
            gradeLevels: prev.gradeLevels.includes(grade)
                ? prev.gradeLevels.filter(g => g !== grade)
                : [...prev.gradeLevels, grade]
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (!user) throw new Error('User not authenticated');
            const token = await user.getIdToken();

            const response = await fetch('/api/teacher', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    teacherId: user?.uid,
                    ...formData
                }),
            });

            if (response.ok) {
                toast({
                    title: 'Profile updated',
                    description: 'Your changes have been saved.',
                });
            } else {
                throw new Error('Failed to update profile');
            }
        } catch (error) {
            console.error('Update error:', error);
            toast({
                title: 'Error',
                description: 'Failed to update profile. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin" /></div>;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Teacher Profile</CardTitle>
                <CardDescription>Update your professional information.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="teacher-name" className="block text-sm font-medium mb-2">Your Name</label>
                        <Input
                            id="teacher-name"
                            placeholder="Enter your full name"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>

                    <div>
                        <label id="teacher-subjects-label" className="block text-sm font-medium mb-2">Subjects</label>
                        <div role="group" aria-labelledby="teacher-subjects-label" className="flex flex-wrap gap-2">
                            {SUBJECTS.map(subject => (
                                <button
                                    key={subject}
                                    type="button"
                                    aria-pressed={formData.subjects.includes(subject)}
                                    onClick={() => handleSubjectToggle(subject)}
                                    className={cn(
                                        "px-3 py-2 rounded-lg border text-sm transition-all flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background",
                                        formData.subjects.includes(subject)
                                            ? 'border-blue-600 bg-blue-50 font-semibold'
                                            : 'border-gray-200 hover:border-gray-300'
                                    )}
                                >
                                    {subject}
                                    {formData.subjects.includes(subject) && <CheckCircle className="w-3 h-3 text-blue-600" />}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label id="teacher-grades-label" className="block text-sm font-medium mb-2">Grade Levels</label>
                        <div role="group" aria-labelledby="teacher-grades-label" className="flex flex-wrap gap-2">
                            {GRADE_LEVELS.map(grade => (
                                <button
                                    key={grade}
                                    type="button"
                                    aria-pressed={formData.gradeLevels.includes(grade)}
                                    onClick={() => handleGradeLevelToggle(grade)}
                                    className={cn(
                                        "px-3 py-2 rounded-lg border text-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background",
                                        formData.gradeLevels.includes(grade)
                                            ? 'border-blue-600 bg-blue-50 font-semibold'
                                            : 'border-gray-200 hover:border-gray-300'
                                    )}
                                >
                                    {grade}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label htmlFor="school-name" className="block text-sm font-medium mb-2">School/Institution Name</label>
                        <Input
                            id="school-name"
                            placeholder="e.g., Springfield High School"
                            value={formData.schoolName}
                            onChange={e => setFormData({ ...formData, schoolName: e.target.value })}
                        />
                    </div>

                    <div>
                        <label id="class-size-label" className="block text-sm font-medium mb-2">Expected Class Size</label>
                        <div role="radiogroup" aria-labelledby="class-size-label" className="flex flex-wrap gap-2">
                            {CLASS_SIZES.map(size => (
                                <button
                                    key={size}
                                    type="button"
                                    role="radio"
                                    aria-checked={formData.expectedClassSize === size}
                                    onClick={() => setFormData({ ...formData, expectedClassSize: size })}
                                    className={cn(
                                        "px-3 py-2 rounded-lg border text-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background",
                                        formData.expectedClassSize === size
                                            ? 'border-blue-600 bg-blue-50 font-semibold'
                                            : 'border-gray-200 hover:border-gray-300'
                                    )}
                                >
                                    {size}
                                </button>
                            ))}
                        </div>
                    </div>

                    <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700">
                        {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        Save Changes
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}

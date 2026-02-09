'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CheckCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const GRADES = ['9th', '10th', '11th', '12th', 'College'];
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
const STUDY_TIMES = [
    '< 1 hour',
    '1-2 hours',
    '2-4 hours',
    '4-6 hours',
    '> 6 hours'
];

export function StudentProfileForm() {
    const { user } = useAuth();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    const [formData, setFormData] = useState({
        name: '',
        grade: '',
        subjects: [] as string[],
        goals: '',
        dailyStudyTime: '',
    });

    useEffect(() => {
        const fetchProfile = async () => {
            if (!user?.uid) {
                setFetching(false);
                return;
            }
            try {
                const response = await fetch(`/api/student?studentId=${user.uid}`);
                if (response.ok) {
                    const data = await response.json();
                    if (data.student) {
                        setFormData({
                            name: data.student.name || '',
                            grade: data.student.grade || '',
                            subjects: data.student.subjects || [], // Assuming subjects are stored
                            goals: data.student.goals || '',
                            dailyStudyTime: data.student.dailyStudyTime || '',
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (!user) throw new Error('User not authenticated');
            const token = await user.getIdToken();

            const response = await fetch('/api/student', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    studentId: user?.uid,
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
                <CardTitle>Student Profile</CardTitle>
                <CardDescription>Update your personal information and study preferences.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="student-name" className="block text-sm font-medium mb-2">Your Name</label>
                        <Input
                            id="student-name"
                            placeholder="Enter your full name"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>

                    <div>
                        <label id="grade-label" className="block text-sm font-medium mb-2">Grade/Class</label>
                        <div role="radiogroup" aria-labelledby="grade-label" className="flex flex-wrap gap-2">
                            {GRADES.map(grade => (
                                <button
                                    key={grade}
                                    type="button"
                                    role="radio"
                                    aria-checked={formData.grade === grade}
                                    onClick={() => setFormData({ ...formData, grade })}
                                    className={`px-3 py-2 rounded-lg border text-sm transition-all ${formData.grade === grade
                                        ? 'border-primary bg-primary/10 font-semibold'
                                        : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                >
                                    {grade}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label id="subjects-label" className="block text-sm font-medium mb-2">Subjects</label>
                        <div role="group" aria-labelledby="subjects-label" className="flex flex-wrap gap-2">
                            {SUBJECTS.map(subject => (
                                <button
                                    key={subject}
                                    type="button"
                                    aria-pressed={formData.subjects.includes(subject)}
                                    onClick={() => handleSubjectToggle(subject)}
                                    className={`px-3 py-2 rounded-lg border text-sm transition-all flex items-center gap-2 ${formData.subjects.includes(subject)
                                        ? 'border-primary bg-primary/10 font-semibold'
                                        : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                >
                                    {subject}
                                    {formData.subjects.includes(subject) && <CheckCircle className="w-3 h-3 text-primary" />}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label id="study-time-label" className="block text-sm font-medium mb-2">Daily Study Time</label>
                        <div role="radiogroup" aria-labelledby="study-time-label" className="flex flex-wrap gap-2">
                            {STUDY_TIMES.map(time => (
                                <button
                                    key={time}
                                    type="button"
                                    role="radio"
                                    aria-checked={formData.dailyStudyTime === time}
                                    onClick={() => setFormData({ ...formData, dailyStudyTime: time })}
                                    className={`px-3 py-2 rounded-lg border text-sm transition-all ${formData.dailyStudyTime === time
                                        ? 'border-primary bg-primary/10 font-semibold'
                                        : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                >
                                    {time}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label htmlFor="student-goals" className="block text-sm font-medium mb-2">Learning Goals</label>
                        <Textarea
                            id="student-goals"
                            placeholder="e.g., Score 95% in board exams, Master calculus, Improve problem-solving..."
                            value={formData.goals}
                            onChange={e => setFormData({ ...formData, goals: e.target.value })}
                            rows={4}
                        />
                    </div>

                    <Button type="submit" disabled={loading}>
                        {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        Save Changes
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}

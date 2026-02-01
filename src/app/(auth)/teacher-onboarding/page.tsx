'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react';

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

export default function TeacherOnboardingPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        name: user?.displayName || '',
        subjects: [] as string[],
        gradeLevels: [] as string[],
        schoolName: '',
        expectedClassSize: '',
    });

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

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/teacher/onboard', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user?.uid,
                    ...formData
                }),
            });

            if (response.ok) {
                router.push('/teacher');
            } else {
                alert('Failed to complete onboarding. Please try again.');
            }
        } catch (error) {
            console.error('Onboarding error:', error);
            alert('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const canProceed = () => {
        switch (step) {
            case 1: return formData.name;
            case 2: return formData.subjects.length > 0 && formData.gradeLevels.length > 0;
            case 3: return formData.schoolName && formData.expectedClassSize;
            default: return false;
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-6">
            <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl p-8">
                {/* Progress Bar */}
                <div className="mb-8">
                    <div className="flex justify-between mb-2">
                        {[1, 2, 3].map(i => (
                            <div
                                key={i}
                                className={`w-1/3 h-2 rounded-full mx-1 transition-all ${i <= step ? 'bg-blue-600' : 'bg-gray-200'
                                    }`}
                            />
                        ))}
                    </div>
                    <p className="text-sm text-muted-foreground text-center">
                        Step {step} of 3
                    </p>
                </div>

                {/* Step 1: Personal Info */}
                {step === 1 && (
                    <div className="space-y-6">
                        <div>
                            <h1 className="text-3xl font-bold mb-2 text-foreground">Welcome, Teacher! 👨‍🏫</h1>
                            <p className="text-foreground/80">Let's set up your teaching dashboard</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Your Name</label>
                            <Input
                                placeholder="Enter your full name"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                    </div>
                )}

                {/* Step 2: Subjects & Grade Levels */}
                {step === 2 && (
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-2xl font-bold mb-2 text-foreground">What do you teach?</h2>
                            <p className="text-foreground/80">Select subjects and grade levels</p>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold mb-3">Subjects</label>
                            <div className="grid grid-cols-2 gap-3">
                                {SUBJECTS.map(subject => (
                                    <button
                                        key={subject}
                                        onClick={() => handleSubjectToggle(subject)}
                                        className={`p-3 rounded-lg border-2 transition-all text-left ${formData.subjects.includes(subject)
                                            ? 'border-blue-600 bg-blue-50 font-semibold'
                                            : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span>{subject}</span>
                                            {formData.subjects.includes(subject) && (
                                                <CheckCircle className="w-5 h-5 text-blue-600" />
                                            )}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold mb-3">Grade Levels</label>
                            <div className="grid grid-cols-3 gap-3">
                                {GRADE_LEVELS.map(grade => (
                                    <button
                                        key={grade}
                                        onClick={() => handleGradeLevelToggle(grade)}
                                        className={`p-3 rounded-lg border-2 transition-all ${formData.gradeLevels.includes(grade)
                                            ? 'border-blue-600 bg-blue-50 font-semibold'
                                            : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                    >
                                        {grade}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 3: School & Class Size */}
                {step === 3 && (
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-2xl font-bold mb-2 text-foreground">About your institution</h2>
                            <p className="text-foreground/80">Help us understand your teaching environment</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">School/Institution Name</label>
                            <Input
                                placeholder="e.g., Springfield High School"
                                value={formData.schoolName}
                                onChange={e => setFormData({ ...formData, schoolName: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Expected Class Size (Total Students)</label>
                            <div className="grid grid-cols-2 gap-3">
                                {CLASS_SIZES.map(size => (
                                    <button
                                        key={size}
                                        onClick={() => setFormData({ ...formData, expectedClassSize: size })}
                                        className={`p-3 rounded-lg border-2 transition-all ${formData.expectedClassSize === size
                                            ? 'border-blue-600 bg-blue-50 font-semibold'
                                            : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                    >
                                        {size} students
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between mt-8 pt-6 border-t">
                    <Button
                        variant="outline"
                        onClick={() => setStep(step - 1)}
                        disabled={step === 1 || loading}
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back
                    </Button>

                    {step < 3 ? (
                        <Button
                            onClick={() => setStep(step + 1)}
                            disabled={!canProceed() || loading}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            Next
                            <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    ) : (
                        <Button
                            onClick={handleSubmit}
                            disabled={!canProceed() || loading}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Setting up...
                                </>
                            ) : (
                                <>
                                    Complete Setup
                                    <CheckCircle className="w-4 h-4 ml-2" />
                                </>
                            )}
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}

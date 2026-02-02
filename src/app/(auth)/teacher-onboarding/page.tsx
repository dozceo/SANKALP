'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, ArrowRight, ArrowLeft, CheckCircle, BookOpen, GraduationCap, School, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateFriendlyErrorMessage } from '@/app/actions/ai-error';

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
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        subjects: [] as string[],
        gradeLevels: [] as string[],
        schoolName: '',
        expectedClassSize: '',
    });

    // Update name when user loads
    useEffect(() => {
        if (user?.displayName) {
            setFormData(prev => ({ ...prev, name: user.displayName! }));
        }
    }, [user]);

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

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
                toast({
                    title: 'Onboarding complete!',
                    description: 'Your teacher profile has been set up successfully.',
                });
                router.push('/teacher');
            } else {
                toast({
                    title: 'Onboarding failed',
                    description: 'Failed to complete onboarding. Please try again.',
                    variant: 'destructive',
                });
            }
        } catch (error: any) {
            console.error('Onboarding error:', error);
            const friendlyMessage = await generateFriendlyErrorMessage(error.message || 'Unknown error', 'Teacher Onboarding');
            toast({
                title: 'Onboarding Issue',
                description: friendlyMessage,
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const canProceed = () => {
        switch (step) {
            case 1: return formData.name && formData.name.trim().length > 0;
            case 2: return formData.subjects.length > 0 && formData.gradeLevels.length > 0;
            case 3: return formData.schoolName && formData.expectedClassSize;
            default: return false;
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
            <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg border border-slate-100 p-8">
                {/* Progress Bar */}
                <div className="mb-8">
                    <div className="flex justify-between mb-2 gap-2">
                        {[1, 2, 3].map(i => (
                            <div
                                key={i}
                                className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                                    i <= step ? 'bg-primary' : 'bg-slate-100'
                                }`}
                            />
                        ))}
                    </div>
                    <p className="text-xs font-medium text-slate-500 text-center uppercase tracking-wide">
                        Step {step} of 3
                    </p>
                </div>

                {/* Step 1: Personal Info */}
                {step === 1 && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="text-center space-y-2">
                            <div className="mx-auto w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                                <span className="text-2xl">👨‍🏫</span>
                            </div>
                            <h1 className="text-3xl font-bold text-slate-900">Welcome, Teacher!</h1>
                            <p className="text-slate-500">Let's set up your teaching dashboard</p>
                        </div>

                        <div className="space-y-4">
                            <label className="block text-sm font-semibold text-slate-700">Your Full Name</label>
                            <Input
                                placeholder="e.g. Sarah Mitchell"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                className="h-12 text-lg bg-white border-slate-200 focus:border-primary focus:ring-primary/20"
                            />
                        </div>
                    </div>
                )}

                {/* Step 2: Subjects & Grade Levels */}
                {step === 2 && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="text-center space-y-2">
                             <div className="mx-auto w-12 h-12 bg-purple-50 rounded-full flex items-center justify-center mb-4">
                                <BookOpen className="w-6 h-6 text-purple-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900">What do you teach?</h2>
                            <p className="text-slate-500">Select your subjects and grade levels</p>
                        </div>

                        <div className="space-y-4">
                            <label className="block text-sm font-semibold text-slate-700">Subjects</label>
                            <div className="grid grid-cols-2 gap-3">
                                {SUBJECTS.map(subject => (
                                    <button
                                        key={subject}
                                        onClick={() => handleSubjectToggle(subject)}
                                        className={`p-4 rounded-lg border transition-all text-left relative group ${
                                            formData.subjects.includes(subject)
                                            ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                                            : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className={`font-medium ${formData.subjects.includes(subject) ? 'text-primary' : 'text-slate-700'}`}>
                                                {subject}
                                            </span>
                                            {formData.subjects.includes(subject) && (
                                                <CheckCircle className="w-5 h-5 text-primary" />
                                            )}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <label className="block text-sm font-semibold text-slate-700">Grade Levels</label>
                            <div className="grid grid-cols-3 gap-3">
                                {GRADE_LEVELS.map(grade => (
                                    <button
                                        key={grade}
                                        onClick={() => handleGradeLevelToggle(grade)}
                                        className={`p-3 rounded-lg border transition-all text-center ${
                                            formData.gradeLevels.includes(grade)
                                            ? 'border-primary bg-primary/5 ring-1 ring-primary/20 text-primary font-medium'
                                            : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-600'
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
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="text-center space-y-2">
                             <div className="mx-auto w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mb-4">
                                <School className="w-6 h-6 text-green-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900">About your institution</h2>
                            <p className="text-slate-500">Help us understand your teaching environment</p>
                        </div>

                        <div className="space-y-4">
                            <label className="block text-sm font-semibold text-slate-700">School / Institution Name</label>
                            <div className="relative">
                                <School className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
                                <Input
                                    placeholder="e.g. Springfield High School"
                                    value={formData.schoolName}
                                    onChange={e => setFormData({ ...formData, schoolName: e.target.value })}
                                    className="pl-10 h-12"
                                />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <label className="block text-sm font-semibold text-slate-700">Total Students</label>
                            <div className="grid grid-cols-2 gap-3">
                                {CLASS_SIZES.map(size => (
                                    <button
                                        key={size}
                                        onClick={() => setFormData({ ...formData, expectedClassSize: size })}
                                        className={`p-4 rounded-lg border transition-all flex items-center gap-3 ${
                                            formData.expectedClassSize === size
                                            ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                                            : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                                        }`}
                                    >
                                        <Users className={`h-5 w-5 ${formData.expectedClassSize === size ? 'text-primary' : 'text-slate-400'}`} />
                                        <span className={`font-medium ${formData.expectedClassSize === size ? 'text-primary' : 'text-slate-700'}`}>
                                            {size}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between mt-10 pt-6 border-t border-slate-100">
                    <Button
                        variant="ghost"
                        onClick={() => setStep(step - 1)}
                        disabled={step === 1 || loading}
                        className="text-slate-500 hover:text-slate-900"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back
                    </Button>

                    {step < 3 ? (
                        <Button
                            onClick={() => setStep(step + 1)}
                            disabled={!canProceed() || loading}
                            className="bg-primary hover:bg-primary/90 min-w-[120px]"
                        >
                            Next
                            <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    ) : (
                        <Button
                            onClick={handleSubmit}
                            disabled={!canProceed() || loading}
                            className="bg-primary hover:bg-primary/90 min-w-[140px]"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Setting up...
                                </>
                            ) : (
                                <>
                                    Complete
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

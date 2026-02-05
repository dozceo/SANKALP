'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Loader2, ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateFriendlyErrorMessage } from '@/app/actions/ai-error';

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

export default function OnboardingPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        grade: '',
        subjects: [] as string[],
        goals: '',
        dailyStudyTime: '',
        classCode: '',
    });

    // Update name when user loads
    useEffect(() => {
        if (user?.displayName) {
            setFormData(prev => ({ ...prev, name: user.displayName! }));
        }
    }, [user]);

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
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

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/student/onboard', {
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
                    description: 'Your profile has been set up successfully.',
                });
                router.push('/home');
            } else {
                toast({
                    title: 'Onboarding failed',
                    description: 'Failed to complete onboarding. Please try again.',
                    variant: 'destructive',
                });
            }
        } catch (error: any) {
            console.error('Onboarding error:', error);
            const friendlyMessage = await generateFriendlyErrorMessage(error.message || 'Unknown error', 'Student Onboarding');
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
            case 1: return formData.name && formData.grade;
            case 2: return formData.subjects.length > 0;
            case 3: return formData.goals && formData.dailyStudyTime;
            case 4: return true; // Class code is optional
            default: return false;
        }
    };

    return (
        <div className="p-6 w-full flex justify-center">
            <Card className="w-full max-w-2xl shadow-xl">
                <CardHeader>
                    {/* Progress Bar */}
                    <div className="mb-4">
                        <div className="flex justify-between mb-2">
                            {[1, 2, 3, 4].map(i => (
                                <div
                                    key={i}
                                    className={`w-1/4 h-2 rounded-full mx-1 transition-all ${i <= step ? 'bg-primary' : 'bg-muted'
                                        }`}
                                />
                            ))}
                        </div>
                        <p className="text-sm text-muted-foreground text-center">
                            Step {step} of 4
                        </p>
                    </div>
                </CardHeader>

                <CardContent>
                    {/* Step 1: Personal Info */}
                    {step === 1 && (
                        <div className="space-y-6">
                            <div>
                                <h1 className="text-3xl font-bold mb-2 text-foreground">Welcome to Sankalp! 👋</h1>
                                <p className="text-muted-foreground text-lg">Let's set up your personalized learning journey</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Your Name</label>
                                <Input
                                    placeholder="Enter your full name"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Grade/Class</label>
                                <div className="grid grid-cols-3 gap-3">
                                    {GRADES.map(grade => (
                                        <button
                                            key={grade}
                                            onClick={() => setFormData({ ...formData, grade })}
                                            className={`p-3 rounded-lg border-2 transition-all ${formData.grade === grade
                                                ? 'border-primary bg-primary/10 font-semibold'
                                                : 'border-border hover:border-primary/30'
                                                }`}
                                        >
                                            {grade}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Subjects */}
                    {step === 2 && (
                        <div className="space-y-6">
                            <div>
                                <h2 className="text-2xl font-bold mb-2 text-foreground">What subjects are you studying?</h2>
                                <p className="text-muted-foreground">Select all that apply</p>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                {SUBJECTS.map(subject => (
                                    <button
                                        key={subject}
                                        onClick={() => handleSubjectToggle(subject)}
                                        className={`p-4 rounded-lg border-2 transition-all text-left ${formData.subjects.includes(subject)
                                            ? 'border-primary bg-primary/10 font-semibold'
                                            : 'border-border hover:border-primary/30'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span>{subject}</span>
                                            {formData.subjects.includes(subject) && (
                                                <CheckCircle className="w-5 h-5 text-primary" />
                                            )}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Step 3: Goals & Study Time */}
                    {step === 3 && (
                        <div className="space-y-6">
                            <div>
                                <h2 className="text-2xl font-bold mb-2 text-foreground">Tell us about your goals</h2>
                                <p className="text-muted-foreground">What do you want to achieve this year?</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Learning Goals</label>
                                <Textarea
                                    placeholder="e.g., Score 95% in board exams, Master calculus, Improve problem-solving..."
                                    value={formData.goals}
                                    onChange={e => setFormData({ ...formData, goals: e.target.value })}
                                    rows={4}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Daily Study Time</label>
                                <div className="grid grid-cols-2 gap-3">
                                    {STUDY_TIMES.map(time => (
                                        <button
                                            key={time}
                                            onClick={() => setFormData({ ...formData, dailyStudyTime: time })}
                                            className={`p-3 rounded-lg border-2 transition-all ${formData.dailyStudyTime === time
                                                ? 'border-primary bg-primary/10 font-semibold'
                                                : 'border-border hover:border-primary/30'
                                                }`}
                                        >
                                            {time}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 4: Class Code */}
                    {step === 4 && (
                        <div className="space-y-6">
                            <div>
                                <h2 className="text-2xl font-bold mb-2 text-foreground">Join Your Class (Optional)</h2>
                                <p className="text-muted-foreground">
                                    If your teacher gave you a class code, enter it below
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Class Code</label>
                                <Input
                                    placeholder="e.g., MATH2024-A"
                                    value={formData.classCode}
                                    onChange={e => setFormData({ ...formData, classCode: e.target.value.toUpperCase() })}
                                />
                                <p className="text-xs text-muted-foreground mt-1">
                                    You can skip this and add it later from settings
                                </p>
                            </div>
                        </div>
                    )}
                </CardContent>

                <CardFooter className="flex justify-between border-t p-8">
                    <Button
                        variant="outline"
                        onClick={() => setStep(step - 1)}
                        disabled={step === 1 || loading}
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back
                    </Button>

                    {step < 4 ? (
                        <Button
                            onClick={() => setStep(step + 1)}
                            disabled={!canProceed() || loading}
                        >
                            Next
                            <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    ) : (
                        <Button
                            onClick={handleSubmit}
                            disabled={loading}
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
                </CardFooter>
            </Card>
        </div>
    );
}

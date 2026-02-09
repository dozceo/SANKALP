'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Loader2, ArrowRight, ArrowLeft, CheckCircle, Sparkles } from 'lucide-react';
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
        <div className="w-full max-w-2xl mx-auto">
            <Card className="shadow-xl border-border/60 overflow-hidden">
                <CardHeader className="bg-muted/30 pb-8">
                    {/* Progress Bar */}
                    <div className="space-y-4">
                        <div className="flex justify-between gap-2">
                            {[1, 2, 3, 4].map(i => (
                                <div
                                    key={i}
                                    className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
                                        i <= step ? 'bg-primary' : 'bg-primary/20'
                                    }`}
                                />
                            ))}
                        </div>
                        <div className="flex justify-between items-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            <span>Progress</span>
                            <span>Step {step} of 4</span>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="pt-8">
                    {/* Step 1: Personal Info */}
                    {step === 1 && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="space-y-2">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-2">
                                    <Sparkles className="w-3 h-3" />
                                    Welcome to Sankalp
                                </div>
                                <h1 className="text-4xl font-headline font-bold text-foreground tracking-tight">Let's get started 👋</h1>
                                <p className="text-muted-foreground text-lg">Tell us a bit about yourself to personalize your experience.</p>
                            </div>

                            <div className="space-y-4">
                                <Label htmlFor="name" className="text-base font-semibold">Your Full Name</Label>
                                <Input
                                    id="name"
                                    placeholder="e.g. Alex Johnson"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    className="h-12 text-lg"
                                />
                            </div>

                            <div className="space-y-4">
                                <Label className="text-base font-semibold">Grade / Level</Label>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                    {GRADES.map(grade => (
                                        <button
                                            key={grade}
                                            onClick={() => setFormData({ ...formData, grade })}
                                            className={`p-4 rounded-xl border-2 transition-all text-center ${
                                                formData.grade === grade
                                                ? 'border-primary bg-primary/5 text-primary font-bold shadow-sm'
                                                : 'border-border hover:border-primary/30 hover:bg-accent/50'
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
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="space-y-2">
                                <h2 className="text-3xl font-headline font-bold text-foreground">What subjects are you studying?</h2>
                                <p className="text-muted-foreground text-lg">Select the ones you want to focus on this year.</p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {SUBJECTS.map(subject => (
                                    <button
                                        key={subject}
                                        onClick={() => handleSubjectToggle(subject)}
                                        className={`p-4 rounded-xl border-2 transition-all text-left group ${
                                            formData.subjects.includes(subject)
                                            ? 'border-primary bg-primary/5 text-primary font-bold'
                                            : 'border-border hover:border-primary/30 hover:bg-accent/50'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span>{subject}</span>
                                            {formData.subjects.includes(subject) ? (
                                                <CheckCircle className="w-5 h-5 text-primary" />
                                            ) : (
                                                <div className="w-5 h-5 rounded-full border border-border group-hover:border-primary/30" />
                                            )}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Step 3: Goals & Study Time */}
                    {step === 3 && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="space-y-2">
                                <h2 className="text-3xl font-headline font-bold text-foreground">Tell us about your goals</h2>
                                <p className="text-muted-foreground text-lg">What do you want to achieve with Sankalp?</p>
                            </div>

                            <div className="space-y-4">
                                <Label htmlFor="goals" className="text-base font-semibold">Your Learning Goals</Label>
                                <Textarea
                                    id="goals"
                                    placeholder="e.g., Score 95% in board exams, Master calculus, Improve problem-solving..."
                                    value={formData.goals}
                                    onChange={e => setFormData({ ...formData, goals: e.target.value })}
                                    className="min-h-[120px] text-lg resize-none"
                                />
                            </div>

                            <div className="space-y-4">
                                <Label className="text-base font-semibold">Daily Study Commitment</Label>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                    {STUDY_TIMES.map(time => (
                                        <button
                                            key={time}
                                            onClick={() => setFormData({ ...formData, dailyStudyTime: time })}
                                            className={`p-4 rounded-xl border-2 transition-all text-center ${
                                                formData.dailyStudyTime === time
                                                ? 'border-primary bg-primary/5 text-primary font-bold'
                                                : 'border-border hover:border-primary/30 hover:bg-accent/50'
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
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="space-y-2">
                                <h2 className="text-3xl font-headline font-bold text-foreground">Join Your Class</h2>
                                <p className="text-muted-foreground text-lg">
                                    If your teacher provided a code, enter it here to sync with your class.
                                </p>
                            </div>

                            <div className="space-y-4">
                                <Label htmlFor="classCode" className="text-base font-semibold">Class Code (Optional)</Label>
                                <Input
                                    id="classCode"
                                    placeholder="e.g., MATH2024-A"
                                    value={formData.classCode}
                                    onChange={e => setFormData({ ...formData, classCode: e.target.value.toUpperCase() })}
                                    className="h-14 text-2xl text-center font-mono tracking-widest uppercase"
                                />
                                <p className="text-sm text-center text-muted-foreground">
                                    You can skip this and add it later from your settings.
                                </p>
                            </div>
                        </div>
                    )}
                </CardContent>

                <CardFooter className="flex justify-between border-t p-8 bg-muted/10">
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

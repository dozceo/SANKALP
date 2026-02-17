"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Loader2, ArrowRight, ArrowLeft, CheckCircle, BookOpen, GraduationCap, School, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { generateFriendlyErrorMessage } from "@/app/actions/ai-error";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const SUBJECTS = [
    "Mathematics",
    "Physics",
    "Chemistry",
    "Biology",
    "History",
    "Geography",
    "Economics",
    "Computer Science",
    "English",
    "Other",
];

const GRADE_LEVELS = ["9th", "10th", "11th", "12th", "College", "Multiple"];

const CLASS_SIZES = ["1-10", "11-30", "31-50", "51-100", "100+"];

const teacherOnboardingSchema = z.object({
  name: z.string().min(2, "Please enter your full name"),
  subjects: z.array(z.string()).min(1, "Please select at least one subject"),
  gradeLevels: z.array(z.string()).min(1, "Please select at least one grade level"),
  schoolName: z.string().min(2, "Please enter your school name"),
  expectedClassSize: z.string({ required_error: "Please select your expected class size" }),
});

type TeacherOnboardingFormData = z.infer<typeof teacherOnboardingSchema>;

export default function TeacherOnboardingPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        trigger,
        formState: { errors },
    } = useForm<TeacherOnboardingFormData>({
        resolver: zodResolver(teacherOnboardingSchema),
        defaultValues: {
            name: user?.displayName || "",
            subjects: [],
            gradeLevels: [],
            schoolName: "",
            expectedClassSize: "",
        },
    });

    const formData = watch();

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    const handleSubjectToggle = (subject: string) => {
        const current = formData.subjects || [];
        const updated = current.includes(subject)
            ? current.filter((s) => s !== subject)
            : [...current, subject];
        setValue("subjects", updated, { shouldValidate: true });
    };

    const handleGradeLevelToggle = (grade: string) => {
        const current = formData.gradeLevels || [];
        const updated = current.includes(grade)
            ? current.filter((g) => g !== grade)
            : [...current, grade];
        setValue("gradeLevels", updated, { shouldValidate: true });
    };

    const onSubmit = async (data: TeacherOnboardingFormData) => {
        setLoading(true);
        try {
            const response = await fetch('/api/teacher/onboard', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user?.uid,
                    ...data
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

    const nextStep = async () => {
        let isValid = false;
        if (step === 1) isValid = await trigger("name");
        if (step === 2) isValid = await trigger(["subjects", "gradeLevels"]);

        if (isValid) {
            setStep((prev) => prev + 1);
        }
    };

    const prevStep = () => setStep((prev) => prev - 1);

    return (
        <div className="w-full max-w-2xl mx-auto">
            <Card className="shadow-xl border-border/60 overflow-hidden">
                <CardHeader className="bg-muted/30 pb-8">
                    {/* Progress Bar */}
                    <div className="space-y-4">
                        <div className="flex justify-between gap-2">
                            {[1, 2, 3].map(i => (
                                <div
                                    key={i}
                                    className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
                                        i <= step ? 'bg-primary' : 'bg-primary/20'
                                    }`}
                                />
                            ))}
                        </div>
                        <div className="flex justify-between items-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            <span>Teacher Setup</span>
                            <span>Step {step} of 3</span>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="pt-8">
                    <form onSubmit={handleSubmit(onSubmit)}>
                        {/* Step 1: Personal Info */}
                        {step === 1 && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="text-center space-y-2">
                                    <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 text-3xl">
                                        👨‍🏫
                                    </div>
                                    <h1 className="text-4xl font-headline font-bold text-foreground tracking-tight">Welcome, Teacher!</h1>
                                    <p className="text-muted-foreground text-lg text-balance">Let's set up your teaching dashboard and personalized tools.</p>
                                </div>

                                <div className="space-y-4">
                                    <Label htmlFor="name" className="text-base font-semibold">Your Full Name</Label>
                                    <Input
                                        id="name"
                                        placeholder="e.g. Sarah Mitchell"
                                        {...register("name")}
                                        className="h-12 text-lg"
                                        aria-invalid={!!errors.name}
                                    />
                                    {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
                                </div>
                            </div>
                        )}

                        {/* Step 2: Subjects & Grade Levels */}
                        {step === 2 && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="text-center space-y-2">
                                    <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                                        <BookOpen className="w-8 h-8 text-primary" />
                                    </div>
                                    <h2 className="text-3xl font-headline font-bold text-foreground">What do you teach?</h2>
                                    <p className="text-muted-foreground text-lg">Select your subjects and grade levels.</p>
                                </div>

                                <div className="space-y-4">
                                    <Label className="text-base font-semibold">Subjects</Label>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {SUBJECTS.map(subject => (
                                            <button
                                                key={subject}
                                                type="button"
                                                onClick={() => handleSubjectToggle(subject)}
                                                className={`p-4 rounded-xl border-2 transition-all text-left relative group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background ${
                                                    formData.subjects?.includes(subject)
                                                    ? 'border-primary bg-primary/5 text-primary font-bold shadow-sm'
                                                    : 'border-border hover:border-primary/30 hover:bg-accent/50'
                                                }`}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <span>{subject}</span>
                                                    {formData.subjects?.includes(subject) ? (
                                                        <CheckCircle className="w-5 h-5 text-primary" />
                                                    ) : (
                                                        <div className="w-5 h-5 rounded-full border border-border group-hover:border-primary/30" />
                                                    )}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                    {errors.subjects && <p className="text-sm text-destructive">{errors.subjects.message}</p>}
                                </div>

                                <div className="space-y-4">
                                    <Label className="text-base font-semibold">Grade Levels</Label>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                        {GRADE_LEVELS.map(grade => (
                                            <button
                                                key={grade}
                                                type="button"
                                                onClick={() => handleGradeLevelToggle(grade)}
                                                className={`p-3 rounded-xl border-2 transition-all text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background ${
                                                    formData.gradeLevels?.includes(grade)
                                                    ? 'border-primary bg-primary/5 text-primary font-bold shadow-sm'
                                                    : 'border-border hover:border-primary/30 hover:bg-accent/50'
                                                }`}
                                            >
                                                {grade}
                                            </button>
                                        ))}
                                    </div>
                                    {errors.gradeLevels && <p className="text-sm text-destructive">{errors.gradeLevels.message}</p>}
                                </div>
                            </div>
                        )}

                        {/* Step 3: School & Class Size */}
                        {step === 3 && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="text-center space-y-2">
                                    <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                                        <School className="w-8 h-8 text-primary" />
                                    </div>
                                    <h2 className="text-3xl font-headline font-bold text-foreground">About your institution</h2>
                                    <p className="text-muted-foreground text-lg text-balance">Help us understand your teaching environment.</p>
                                </div>

                                <div className="space-y-4">
                                    <Label htmlFor="school" className="text-base font-semibold">School / Institution Name</Label>
                                    <div className="relative">
                                        <School className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
                                        <Input
                                            id="school"
                                            placeholder="e.g. Springfield High School"
                                            {...register("schoolName")}
                                            className="pl-10 h-12"
                                            aria-invalid={!!errors.schoolName}
                                        />
                                    </div>
                                    {errors.schoolName && <p className="text-sm text-destructive">{errors.schoolName.message}</p>}
                                </div>

                                <div className="space-y-4">
                                    <Label className="text-base font-semibold">Total Students</Label>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                        {CLASS_SIZES.map(size => (
                                            <button
                                                key={size}
                                                type="button"
                                                onClick={() => setValue("expectedClassSize", size, { shouldValidate: true })}
                                                className={`p-4 rounded-xl border-2 transition-all flex items-center justify-center gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background ${
                                                    formData.expectedClassSize === size
                                                    ? 'border-primary bg-primary/5 text-primary font-bold shadow-sm'
                                                    : 'border-border hover:border-primary/30 hover:bg-accent/50'
                                                }`}
                                            >
                                                <Users className={`h-5 w-5 ${formData.expectedClassSize === size ? 'text-primary' : 'text-muted-foreground'}`} />
                                                <span>{size}</span>
                                            </button>
                                        ))}
                                    </div>
                                    {errors.expectedClassSize && <p className="text-sm text-destructive">{errors.expectedClassSize.message}</p>}
                                </div>
                            </div>
                        )}
                    </form>
                </CardContent>

                {/* Navigation Buttons */}
                <CardFooter className="flex justify-between border-t p-8 bg-muted/10">
                    <Button
                        variant="ghost"
                        onClick={prevStep}
                        disabled={step === 1 || loading}
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back
                    </Button>

                    {step < 3 ? (
                        <Button
                            onClick={nextStep}
                            disabled={loading}
                            className="min-w-[120px]"
                        >
                            Next
                            <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    ) : (
                        <Button
                            onClick={handleSubmit(onSubmit)}
                            disabled={loading}
                            className="min-w-[140px]"
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
                </CardFooter>
            </Card>
        </div>
    );
}

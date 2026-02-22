"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Loader2, ArrowRight, ArrowLeft, CheckCircle, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { generateFriendlyErrorMessage } from "@/app/actions/ai-error";
import { useTranslations } from "next-intl";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const GRADES = ["9th", "10th", "11th", "12th", "College"];
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
const STUDY_TIMES = [
  "< 1 hour",
  "1-2 hours",
  "2-4 hours",
  "4-6 hours",
  "> 6 hours",
];
const GOAL_OPTIONS = [
  "Improve Grades",
  "Prepare for Exam",
  "Learn a New Skill",
  "Get Homework Help",
  "Clarify Concepts",
];

const studentOnboardingSchema = z.object({
  name: z.string().min(2, "Please enter your name"),
  grade: z.string({ required_error: "Please select your grade" }),
  subjects: z.array(z.string()).min(1, { message: "Please select at least one subject" }),
  goals: z.array(z.string()).min(1, { message: "Please select or enter at least one goal" }),
  customGoal: z.string().optional(),
  dailyStudyTime: z.string({ required_error: "Please select your study time" }),
  classCode: z.string().optional().transform(val => val?.toUpperCase() || ""),
});

type OnboardingFormData = z.infer<typeof studentOnboardingSchema>;

export default function OnboardingPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const t = useTranslations("Onboarding");
  const tCommon = useTranslations("Common");

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    trigger,
    formState: { errors },
  } = useForm<OnboardingFormData>({
    resolver: zodResolver(studentOnboardingSchema),
    defaultValues: {
      name: user?.displayName || "",
      grade: "",
      subjects: [],
      goals: [],
      customGoal: "",
      dailyStudyTime: "",
      classCode: "",
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
    const currentSubjects = formData.subjects || [];
    const newSubjects = currentSubjects.includes(subject)
      ? currentSubjects.filter((s) => s !== subject)
      : [...currentSubjects, subject];
    setValue("subjects", newSubjects, { shouldValidate: true });
  };

  const handleGoalToggle = (goal: string) => {
    const currentGoals = formData.goals || [];
    const newGoals = currentGoals.includes(goal)
      ? currentGoals.filter((g) => g !== goal)
      : [...currentGoals, goal];
    setValue("goals", newGoals, { shouldValidate: true });
  };

  const onSubmit = async (data: OnboardingFormData) => {
    setLoading(true);
    // Combine predefined goals with custom goal
    const finalGoals = [...data.goals];
    if (data.customGoal?.trim()) {
      finalGoals.push(data.customGoal.trim());
    }
    const goalsString = finalGoals.join(", ");

    try {
      const response = await fetch("/api/student/onboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.uid,
          ...data,
          goals: goalsString, // Send as string to backend as per previous schema
        }),
      });

      if (response.ok) {
        toast({
          title: "Onboarding complete!",
          description: "Your profile has been set up successfully.",
        });
        router.push("/home");
      } else {
        toast({
          title: "Onboarding failed",
          description: "Failed to complete onboarding. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Onboarding error:", error);
      const friendlyMessage = await generateFriendlyErrorMessage(
        error.message || "Unknown error",
        "Student Onboarding"
      );
      toast({
        title: "Onboarding Issue",
        description: friendlyMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const nextStep = async () => {
    let isValid = false;
    if (step === 1) isValid = await trigger(["name", "grade"]);
    if (step === 2) isValid = await trigger(["subjects"]);
    if (step === 3) isValid = await trigger(["goals", "dailyStudyTime"]);

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
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${i <= step ? "bg-primary" : "bg-primary/20"
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
          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Step 1: Personal Info */}
            {step === 1 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider mb-2">
                    <Sparkles className="w-3 h-3" />
                    {t("welcome")}
                  </div>
                  <h1 className="text-4xl font-headline font-bold text-foreground tracking-tight">
                    {t("getStarted")} 👋
                  </h1>
                  <p className="text-muted-foreground text-lg">
                    Tell us a bit about yourself to personalize your experience.
                  </p>
                </div>

                <div className="space-y-4">
                  <Label htmlFor="name" className="text-base font-semibold">
                    {t("nameLabel")}
                  </Label>
                  <Input
                    id="name"
                    placeholder="e.g. Alex Johnson"
                    {...register("name")}
                    className="h-12 text-lg"
                    aria-invalid={!!errors.name}
                  />
                  {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
                </div>

                <div className="space-y-4">
                  <Label className="text-base font-semibold">{t("gradeLabel")}</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {GRADES.map((grade) => (
                      <button
                        key={grade}
                        type="button"
                        onClick={() => setValue("grade", grade, { shouldValidate: true })}
                        className={`p-4 rounded-xl border-2 transition-all text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background ${formData.grade === grade
                            ? "border-primary bg-primary/5 text-primary font-bold shadow-sm"
                            : "border-border hover:border-primary/30 hover:bg-accent/50"
                          }`}
                      >
                        {grade}
                      </button>
                    ))}
                  </div>
                  {errors.grade && <p className="text-sm text-destructive">{errors.grade.message}</p>}
                </div>
              </div>
            )}

            {/* Step 2: Subjects */}
            {step === 2 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="space-y-2">
                  <h2 className="text-3xl font-headline font-bold text-foreground">
                    {t("subjectsTitle")}
                  </h2>
                  <p className="text-muted-foreground text-lg">
                    Select the ones you want to focus on this year.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {SUBJECTS.map((subject) => (
                    <button
                      key={subject}
                      type="button"
                      onClick={() => handleSubjectToggle(subject)}
                      className={`p-4 rounded-xl border-2 transition-all text-left group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background ${formData.subjects?.includes(subject)
                          ? "border-primary bg-primary/5 text-primary font-bold"
                          : "border-border hover:border-primary/30 hover:bg-accent/50"
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
                {errors.subjects && (
                  <p className="text-sm text-destructive">{errors.subjects.message}</p>
                )}
              </div>
            )}

            {/* Step 3: Goals & Study Time */}
            {step === 3 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="space-y-2">
                  <h2 className="text-3xl font-headline font-bold text-foreground">
                    {t("goalsTitle")}
                  </h2>
                  <p className="text-muted-foreground text-lg">
                    What do you want to achieve with Sankalp?
                  </p>
                </div>

                <div className="space-y-4">
                  <Label className="text-base font-semibold">{t("goalsLabel")}</Label>
                  <div className="flex flex-wrap gap-2">
                    {GOAL_OPTIONS.map((goal) => (
                      <button
                        key={goal}
                        type="button"
                        onClick={() => handleGoalToggle(goal)}
                        className={`px-4 py-2 rounded-full border transition-all text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background ${formData.goals?.includes(goal)
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-background hover:bg-accent border-input"
                          }`}
                      >
                        {goal}
                      </button>
                    ))}
                  </div>
                  <Input
                    placeholder="Other goals..."
                    {...register("customGoal")}
                    className="mt-2"
                  />
                  {errors.goals && <p className="text-sm text-destructive">{errors.goals.message}</p>}
                </div>

                <div className="space-y-4">
                  <Label className="text-base font-semibold">{t("studyTimeLabel")}</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {STUDY_TIMES.map((time) => (
                      <button
                        key={time}
                        type="button"
                        onClick={() => setValue("dailyStudyTime", time, { shouldValidate: true })}
                        className={`p-4 rounded-xl border-2 transition-all text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background ${formData.dailyStudyTime === time
                            ? "border-primary bg-primary/5 text-primary font-bold"
                            : "border-border hover:border-primary/30 hover:bg-accent/50"
                          }`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                  {errors.dailyStudyTime && (
                    <p className="text-sm text-destructive">{errors.dailyStudyTime.message}</p>
                  )}
                </div>
              </div>
            )}

            {/* Step 4: Class Code */}
            {step === 4 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="space-y-2">
                  <h2 className="text-3xl font-headline font-bold text-foreground">
                    {t("classCodeTitle")}
                  </h2>
                  <p className="text-muted-foreground text-lg">
                    If your teacher provided a code, enter it here to sync with your class.
                  </p>
                </div>

                <div className="space-y-4">
                  <Label htmlFor="classCode" className="text-base font-semibold">
                    {t("classCodeLabel")}
                  </Label>
                  <Input
                    id="classCode"
                    placeholder="e.g., MATH2024-A"
                    {...register("classCode")}
                    className="h-14 text-2xl text-center font-mono tracking-widest uppercase"
                  />
                  <div className="flex justify-center">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={handleSubmit(onSubmit)}
                      disabled={loading}
                      className="text-muted-foreground"
                    >
                      {t("skipClassCode")}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </form>
        </CardContent>

        <CardFooter className="flex justify-between border-t p-8 bg-muted/10">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={step === 1 || loading}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t("backButton")}
          </Button>

          {step < 4 ? (
            <Button onClick={nextStep} disabled={loading}>
              {t("nextButton")}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleSubmit(onSubmit)} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {tCommon("loading")}
                </>
              ) : (
                <>
                  {t("completeButton")}
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

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, ArrowRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const joinClassSchema = z.object({
  classCode: z
    .string()
    .length(6, "Class code must be exactly 6 characters")
    .regex(/^[A-Z0-9]+$/, "Class code must contain only uppercase letters and numbers"),
});

type JoinClassFormData = z.infer<typeof joinClassSchema>;

export default function JoinClassPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isValid },
  } = useForm<JoinClassFormData>({
    resolver: zodResolver(joinClassSchema),
    mode: "onChange",
  });

  const onSubmit = async (data: JoinClassFormData) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in first to join a class.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/classes/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.uid,
          classCode: data.classCode,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        toast({
          title: "Class Joined!",
          description: `Successfully joined ${result.className}`,
        });
        router.push("/home");
      } else {
        toast({
          title: "Failed to join",
          description: result.error || "Please verify the code and try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase();
    if (value.length <= 6) {
      setValue("classCode", value, { shouldValidate: true });
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <Card className="w-full max-w-md border-border/60 shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-headline text-center">Join a Class</CardTitle>
          <CardDescription className="text-center">
            Enter the 6-character code provided by your teacher.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="flex flex-col items-center gap-4">
              <Input
                placeholder="X Y Z 1 2 3"
                className="text-center text-3xl tracking-[0.5em] font-mono h-16 uppercase placeholder:tracking-normal"
                maxLength={6}
                {...register("classCode")}
                onChange={handleInputChange}
                aria-invalid={!!errors.classCode}
              />
              {errors.classCode && <p className="text-sm text-destructive">{errors.classCode.message}</p>}
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-lg"
              disabled={loading || !isValid}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Joining...
                </>
              ) : (
                <>
                  Join Class <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

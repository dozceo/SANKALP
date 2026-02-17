import { z } from "zod";

// Base schemas
export const emailSchema = z.string().email({ message: "Please enter a valid email address" });
export const passwordSchema = z.string().min(6, { message: "Password must be at least 6 characters" });
export const nameSchema = z.string().min(2, { message: "Name must be at least 2 characters" });

// Login Schema
export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

// Sign Up Schema
export const signUpSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
  role: z.enum(["student", "teacher"], { required_error: "Please select a role" }),
});

// Join Class Schema
export const joinClassSchema = z.object({
  classCode: z.string()
    .length(6, { message: "Class code must be exactly 6 characters" })
    .regex(/^[A-Z0-9]+$/, { message: "Class code must contain only uppercase letters and numbers" }),
});

// Onboarding Schemas
export const studentOnboardingSchema = z.object({
  name: nameSchema,
  grade: z.string({ required_error: "Please select your grade" }).min(1, "Please select your grade"),
  subjects: z.array(z.string()).min(1, { message: "Please select at least one subject" }),
  goals: z.array(z.string()).min(1, { message: "Please select or enter at least one goal" }),
  customGoal: z.string().optional(),
  dailyStudyTime: z.string({ required_error: "Please select your study time" }).min(1, "Please select your study time"),
  classCode: z.string().optional().transform(val => val?.toUpperCase() || ""),
});

export const teacherOnboardingSchema = z.object({
  name: nameSchema,
  subjects: z.array(z.string()).min(1, { message: "Please select at least one subject" }),
  gradeLevels: z.array(z.string()).min(1, { message: "Please select at least one grade level" }),
  schoolName: z.string().min(2, { message: "Please enter your school name" }),
  expectedClassSize: z.string({ required_error: "Please select your expected class size" }).min(1, "Please select your expected class size"),
});

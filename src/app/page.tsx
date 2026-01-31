'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

export default function RootPage() {
  const { user, role, loading: authLoading } = useAuth();
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    async function handleRedirect() {
      // Wait for auth to finish loading
      if (authLoading) return;

      console.log('[Root] Auth loaded. User:', user?.uid, 'Role:', role);

      // Not logged in → send to login
      if (!user) {
        console.log('[Root] No user, redirecting to /login');
        router.replace('/login');
        return;
      }

      // If we already have role from AuthContext, use it
      if (role) {
        console.log('[Root] Role from context:', role);
        try {
          if (role === 'teacher') {
            // Check teacher onboarding status
            const teacherResponse = await fetch(`/api/teacher?teacherId=${user.uid}`);
            if (!teacherResponse.ok) {
              console.warn('[Root] Teacher API returned', teacherResponse.status);
              router.replace('/teacher-onboarding');
              return;
            }

            const teacherData = await teacherResponse.json();
            console.log('[Root] Teacher data:', teacherData);

            if (teacherData.teacher?.onboardingCompleted) {
              router.replace('/teacher');
            } else {
              router.replace('/teacher-onboarding');
            }
            return;
          } else {
            // Student role
            const studentResponse = await fetch(`/api/student?studentId=${user.uid}`);

            if (!studentResponse.ok) {
              console.warn('[Root] Student API returned', studentResponse.status, '- sending to onboarding');
              router.replace('/onboarding');
              return;
            }

            const studentData = await studentResponse.json();
            console.log('[Root] Student data:', studentData);

            if (studentData.student?.onboardingCompleted) {
              router.replace('/home');
            } else {
              router.replace('/onboarding');
            }
            return;
          }
        } catch (error) {
          console.error('[Root] Error checking onboarding status:', error);
          // Default based on role
          if (role === 'teacher') {
            router.replace('/teacher-onboarding');
          } else {
            router.replace('/onboarding');
          }
          return;
        }
      }

      // Fallback: If no role in context, try to infer from API
      console.warn('[Root] No role in context, checking APIs');
      try {
        // Check teacher first (less common)
        const teacherResponse = await fetch(`/api/teacher?teacherId=${user.uid}`);
        if (teacherResponse.ok) {
          const teacherData = await teacherResponse.json();
          if (teacherData.teacher) {
            console.log('[Root] Found teacher via API');
            if (teacherData.teacher.onboardingCompleted) {
              router.replace('/teacher');
            } else {
              router.replace('/teacher-onboarding');
            }
            return;
          }
        }

        // Try student API
        const studentResponse = await fetch(`/api/student?studentId=${user.uid}`);
        if (studentResponse.ok) {
          const studentData = await studentResponse.json();
          console.log('[Root] Student API response:', studentData);

          if (studentData.student?.onboardingCompleted) {
            router.replace('/home');
          } else {
            // New student - send to onboarding
            router.replace('/onboarding');
          }
        } else {
          // No student record yet - default to student onboarding
          console.log('[Root] No student record, sending to onboarding');
          router.replace('/onboarding');
        }
      } catch (error) {
        console.error('[Root] Critical error in routing:', error);
        // Last resort: go to student onboarding
        router.replace('/onboarding');
      } finally {
        setChecking(false);
      }
    }

    handleRedirect();
  }, [user, role, authLoading, router]);

  // Show loading spinner
  return (
    <div className="flex h-screen items-center justify-center bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
        <p className="text-foreground">Loading your personalized learning space...</p>
      </div>
    </div>
  );
}

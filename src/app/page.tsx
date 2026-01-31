'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

export default function RootPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    async function handleRedirect() {
      if (authLoading) return;

      // Not logged in → send to login
      if (!user) {
        router.replace('/login');
        return;
      }

      try {
        // Check if user is a teacher
        const teacherResponse = await fetch(`/api/teacher?teacherId=${user.uid}`);
        if (teacherResponse.ok) {
          const teacherData = await teacherResponse.json();
          if (teacherData.teacher) {
            router.replace('/teacher');
            return;
          }
        }

        // User is a student - check onboarding status
        const studentResponse = await fetch(`/api/student?studentId=${user.uid}`);
        if (studentResponse.ok) {
          const studentData = await studentResponse.json();

          // Check if onboarding is completed
          if (studentData.student?.onboardingCompleted) {
            router.replace('/home');
          } else {
            // New student - send to onboarding
            router.replace('/onboarding');
          }
        } else {
          // Student record doesn't exist yet - definitely need onboarding
          router.replace('/onboarding');
        }
      } catch (error) {
        console.error('Error checking user status:', error);
        // Default to onboarding on error
        router.replace('/onboarding');
      } finally {
        setChecking(false);
      }
    }

    handleRedirect();
  }, [user, authLoading, router]);

  // Show loading spinner
  return (
    <div className="flex h-screen items-center justify-center bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
        <p className="text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}

/**
 * Logout Button Component
 * Handles sign-out and cleanup
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { eventTracker } from '@/lib/eventTracker';

export function LogoutButton() {
    const { signOut } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const handleLogout = async () => {
        setIsLoggingOut(true);

        try {
            // Track logout event
            eventTracker.track('click', 'logout-button', 'auth', {
                completed: true
            });

            // Flush any pending events
            await eventTracker.flush();

            // Sign out from Firebase
            await signOut();

            toast({
                title: 'Signed out successfully',
                description: 'See you next time!',
            });

            // Redirect to sign-in
            router.push('/sign-in');
        } catch (error: any) {
            console.error('Logout error:', error);
            toast({
                title: 'Logout failed',
                description: error.message || 'Please try again',
                variant: 'destructive',
            });
        } finally {
            setIsLoggingOut(false);
        }
    };

    return (
        <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="gap-2"
        >
            {isLoggingOut ? (
                <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
                <LogOut className="h-4 w-4" />
            )}
            {isLoggingOut ? 'Signing out...' : 'Logout'}
        </Button>
    );
}

/**
 * EventTracker Initializer
 * Sets up the event tracker when user authenticates
 */

'use client';

import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { eventTracker } from '@/lib/eventTracker';

export function EventTrackerInit() {
    const { user } = useAuth();

    useEffect(() => {
        if (user) {
            // Set student ID for tracking
            eventTracker.setStudentId(user.uid);

            // Track session start
            eventTracker.track('navigation', 'app-loaded', 'system', {
                completed: true
            });
        }
    }, [user]);

    return null; // This component doesn't render anything
}

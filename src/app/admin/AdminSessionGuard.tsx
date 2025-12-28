'use client'

import React, { useEffect, useState } from 'react'
import { supabase } from '@/utils/supabase'
import SessionExpiredModal from '@/components/ui/SessionExpiredModal'

export default function AdminSessionGuard() {
    const [isSessionExpired, setIsSessionExpired] = useState(false)

    useEffect(() => {
        // 1. Initial Check
        const checkSession = async () => {
            const { data: { session }, error } = await supabase.auth.getSession()
            if (error || !session) {
                // If checking initially fails, we might just be logged out or token is invalid.
                // However, middleware handles initial protection. 
                // We only want to show the modal if we were supposedly logged in.
                // But for now, let's rely on the auth state change listener which catches active expirations.
                // If we want to be strict: 
                // setIsSessionExpired(true) 

                // Better approach: Let middleware redirect if completely missing. 
                // Here we handle *active* expirations/timeouts while using the app.
            }
        }

        checkSession()

        // 2. Listen for Auth Changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            // Events: INITIAL_SESSION, SIGNED_IN, SIGNED_OUT, PASSWORD_RECOVERY, TOKEN_REFRESHED, USER_UPDATED

            if (event === 'SIGNED_OUT') {
                // If explicitly signed out (e.g. from another tab or code), redirect or show modal.
                // Usually we just want to redirect if the user clicked logout, but if it happened 
                // passively (if that's possible via Supabase logic), we show modal.
                // For 'SIGNED_OUT', usually we just let the app redirect.
                // But 'TOKEN_REFRESH_REVOKED' is a clear indicator of forced expiry.
            }

            // Note: Supabase JS client handles auto refresh. 
            // If the refresh fails (refresh logic inside supabase-js), it usually emits SIGNED_OUT.

            // To simulate "Session Timeout" specifically, Supabase defaults to "never" effectively 
            // unless we enforce it or the refresh token expires (default 1 week or whatever configured).

            // Since the user asked for a "time limit", and Supabase JWTs are short lived (1 hour) but auto-refreshed,
            // the true "session" is the Refresh Token lifespan.

            if (!session && event !== 'INITIAL_SESSION') {
                // If session is suddenly null after being active
                setIsSessionExpired(true)
            }
        })

        return () => {
            subscription.unsubscribe()
        }
    }, [])

    return (
        <SessionExpiredModal isOpen={isSessionExpired} />
    )
}

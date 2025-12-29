'use client';

import { useEffect } from 'react';

// Assuming IS_EMBEDED is not strictly defined in global scope or env for this specific request context, 
// we'll default it to false as it's likely a specific app flag. 
// If it needs to be an env var, we can change it to process.env.NEXT_PUBLIC_IS_EMBEDED === 'true'
const IS_EMBEDED = false;

export default function ServiceWorkerRegister() {
    useEffect(() => {
        if ('serviceWorker' in navigator) {
            // In Next.js, NODE_ENV is available via process.env.NODE_ENV
            if (process.env.NODE_ENV !== 'development' && !IS_EMBEDED) {
                navigator.serviceWorker.getRegistrations()
                    .then(registrations => {
                        const foundRegistration = registrations.find(registration =>
                            registration.active?.scriptURL === `${window.location.origin}/sw.js`
                        )

                        if (!foundRegistration) {
                            navigator.serviceWorker.register('/sw.js')
                                .then(registration => {
                                    console.log('Service Worker registered with scope:', registration.scope);
                                })
                                .catch(error => {
                                    console.error('Service Worker registration failed:', error);
                                });
                        }
                    })
            } else {
                // Unregister in development or executed environment
                navigator.serviceWorker.getRegistrations()
                    .then(registrations => {
                        registrations.forEach(registration => {
                            registration.unregister()
                        })
                    })

                if (!IS_EMBEDED) {
                    caches.keys().then(function (names) {
                        for (let name of names) {
                            caches.delete(name);
                        }
                    })
                }
            }
        }
    }, []);

    return null;
}

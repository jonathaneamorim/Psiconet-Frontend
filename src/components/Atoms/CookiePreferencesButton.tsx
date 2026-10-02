'use client';

import { useCookieConsent } from "@/contexts/CookieConsentContext";

/** Reabre as preferências de cookies (revogar é tão fácil quanto aceitar). */
export function CookiePreferencesButton({ className = "" }: { className?: string }) {
    const { openPreferences } = useCookieConsent();
    return (
        <button type="button" onClick={openPreferences} className={className}>
            Preferências de cookies
        </button>
    );
}

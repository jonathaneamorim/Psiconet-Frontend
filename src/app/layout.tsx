import { sharedMetadata } from "./shared-metadata";
import { Raleway } from 'next/font/google';
import "./globals.css";
import { ToasterProvider } from "@/components/Atoms/ToasterProvider";
import { Header } from "@/components/Organism/Header";
import { LateralMenu } from "@/components/Organism/LateralMenu";
import { getUserRole } from "@/lib/auth";
import { getHeaderUserAction } from "@/actions/profile";
import { Footer } from "@/components/Organism/Footer";
import { CookieBanner } from "@/components/Organism/CookieBanner";
import { CookieConsentProvider } from "@/contexts/CookieConsentContext";
import { getLegalVersions } from "@/services/legalService";
import { parseConsent } from "@/lib/cookieConsent";
import { COOKIE_CONSENT } from "@/constants/cookies";
import { cookies } from "next/headers";
import { ConnectionProvider } from "@/contexts/ConnectionContext";
import NextTopLoader from "nextjs-toploader";

const raleway = Raleway({
  subsets: ['latin'],
  weight: ['500', '600'],
  variable: '--font-raleway',
});

export const metadata = sharedMetadata;

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const role = await getUserRole();
  const [headerUser, legalVersions, cookieStore] = await Promise.all([
    role ? getHeaderUserAction() : Promise.resolve(null),
    getLegalVersions(),
    cookies(),
  ]);
  // Lido no servidor: o banner de cookies já vem no HTML inicial (sem "piscar" na hidratação).
  const cookiePolicyVersion = legalVersions?.cookies.version ?? null;
  const cookieConsent = parseConsent(cookieStore.get(COOKIE_CONSENT)?.value, cookiePolicyVersion);
  return (
    <html lang="pt-br">
      <body className={raleway.variable}>

        <NextTopLoader 
          color="var(--primary)"
          height={5} 
          showSpinner={false}
        />
        
        <CookieConsentProvider initialConsent={cookieConsent} policyVersion={cookiePolicyVersion}>
          <ConnectionProvider>
            <Header userRole={role} user={headerUser} />
            <LateralMenu userRole={role} />
            <main className={role ? "lg:pl-16" : ""}>
              {children}
            </main>
            <div className={role ? "lg:pl-16" : ""}>
              <Footer />
            </div>
          </ConnectionProvider>
          <CookieBanner />
        </CookieConsentProvider>
        <ToasterProvider />
      </body>
    </html>
  );
}

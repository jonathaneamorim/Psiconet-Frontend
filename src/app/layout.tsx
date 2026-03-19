import { sharedMetadata } from "./shared-metadata";
import { Raleway } from 'next/font/google';
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { Header } from "@/components/Organism/Header";
import { LateralMenu } from "@/components/Organism/LateralMenu";
import { getUserRole } from "@/lib/auth";
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
  return (
    <html lang="pt-br">
      <body className={raleway.variable}>

        <NextTopLoader 
          color="var(--primary)"
          height={5} 
          showSpinner={false}
        />
        
        <Header userRole={role} />
        <LateralMenu userRole={role} />
        <main className={role ? "lg:pl-16" : ""}>
          {children}
        </main>
        <Toaster 
          position="top-right" 
          toastOptions={{ 
            duration: 4000,
            style: {
              maxWidth: '350px',
              wordBreak: 'break-word', 
            },
            className: '!max-w-[90vw] md:!max-w-sm truncate', 
          }}
          />
      </body>
    </html>
  );
}

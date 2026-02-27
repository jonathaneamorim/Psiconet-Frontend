import { sharedMetadata } from "./shared-metadata";
import { Raleway } from 'next/font/google';
import "./globals.css";
import { Toaster } from "react-hot-toast";

const raleway = Raleway({
  subsets: ['latin'],
  weight: ['500', '600'],
  variable: '--font-raleway',
});

export const metadata = sharedMetadata;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-br">
      <body className={raleway.variable}>
        {children}
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

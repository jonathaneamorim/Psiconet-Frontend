import { Metadata } from "next";

export const sharedMetadata: Metadata = {
  title: "Psiconet",
  description: "Psiconet - Plataforma de Psicologia",
  icons: {
    icon: [
      { url: 'siteIcons/favicon.ico', sizes: 'any' },
      { url: 'siteIcons/favicon-16x16.png', type: 'image/png', sizes: '16x16' },
      { url: 'siteIcons/favicon-32x32.png', type: 'image/png', sizes: '32x32' },
      { url: 'siteIcons/android-chrome-192x192.png', type: 'image/png', sizes: '192x192' },
    ],
      shortcut: ['siteIcons/favicon.ico'],
      apple: [
        { url: 'siteIcons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
      ],
    },
  manifest: 'siteIcons/site.webmanifest',
};

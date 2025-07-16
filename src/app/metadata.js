// src/app/metadata.ts

export const metadata = {
    title: {
        default: 'Concours Blanc | Elearn Prepa',
        template: '%s | Elearn Prepa',
    },
    description: 'Plateforme dédiée aux concours blancs Elearn Prepa pour préparer les concours d\'ingénieur et de médecine.',
    // keywords: ['concours blanc', 'ingénieur', 'médecine', 'préparation', 'examens'],
    authors: [{ name: 'Elearn Prepa', url: 'https://elearnbac.ezadrive.com' }],
    creator: 'Elearn Prepa',
    openGraph: {
        type: 'website',
        locale: 'fr_FR',
        url: 'https://elearnbac.ezadrive.com',
        title: 'Concours Blanc | Elearn Prepa',
        description: 'Plateforme dédiée aux concours blancs Elearn Prepa pour préparer les concours d\'ingénieur et de médecine.',
        siteName: 'Elearn Prepa',
        images: [
            {
                url: '/icon.png',
                width: 1200,
                height: 630,
                alt: 'Elearn Prepa - Plateforme de concours blancs',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Concours Blanc | Elearn Prepa',
        description: 'Elearn Prepa - Plateforme de concours blancs',
        images: ['/Icon.jpg'],
        creator: '@elearnprepa',
    },
    icons: {
        icon: [
            { url: '/icon.png', type: 'image/png', sizes: '32x32' },
            { url: '/favicon.ico' },
        ],
        apple: [
            { url: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
            { url: '/apple-icon.png', sizes: '152x152', type: 'image/png' },
            { url: '/apple-icon.png', sizes: '144x144', type: 'image/png' },
            { url: '/apple-icon.png', sizes: '120x120', type: 'image/png' },
            { url: '/apple-icon.png', sizes: '114x114', type: 'image/png' },
            { url: '/apple-icon.png', sizes: '76x76', type: 'image/png' },
            { url: '/apple-icon.png', sizes: '72x72', type: 'image/png' },
            { url: '/apple-icon.png', sizes: '60x60', type: 'image/png' },
            { url: '/apple-icon.png', sizes: '57x57', type: 'image/png' },
        ],
    },
    manifest: '/site.webmanifest',
    robots: {
        index: false,
        follow: true,
    },
};
// src/app/metadata.ts

export const metadata = {
    title: {
        default: 'Elearn Prepa',
        template: '%s | Elearn Prepa',
    },
    description: 'Plateforme dédiée aux administrateur et staff de Elearn Prepa pour gérer les utilisateurs et les données de la plateforme.',
    // keywords: ['influenceur', 'code promo', 'statistiques', 'partenariat', 'affiliation'],
    authors: [{ name: 'Elearn Prepa', url: 'https://learn.ezadrive.com' }],
    creator: 'Elearn Prepa',
    openGraph: {
        type: 'website',
        locale: 'fr_FR',
        url: 'https://elearn.ezadrive.com/login',
        title: 'Elearn Prepa',
        description: 'Plateforme dédiée aux administrateur et staff de Elearn Prepa pour gérer les utilisateurs et les données de la plateforme.',
        siteName: 'Elearn Prepa',
        images: [
            {
                url: '/icon.png',
                width: 1200,
                height: 630,
                alt: 'Elearn Prepa - Plateforme de gestion',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Elearn Prepa',
        description: 'Elearn Prepa - Plateforme de gestion',
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
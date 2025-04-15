// app/layout.js
// 'use client';
"use client";
import './globals.scss';
import { AuthProvider } from '@/context/AuthContext';
import { usePathname } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export default function RootLayout({ children }) {
    const pathname = usePathname();

    // Pages où on ne veut pas afficher le Navbar et Footer
    const noLayoutPages = ['/', '/bac-selection', '/auth/login', '/auth/register', '/forgot-password', '/reset-password'];
    const showLayout = !noLayoutPages.includes(pathname);

    return (
        <html lang="fr">
        <body className="flex flex-col min-h-screen">
        <AuthProvider>
            {showLayout && <Navbar />}
            <main className="flex-grow">
                {children}
            </main>
            {showLayout && <Footer />}
        </AuthProvider>
        </body>
        </html>
    );
}
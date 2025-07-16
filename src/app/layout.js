// app/layout.js
// 'use client';
"use client";
import './globals.scss';
import {TokenAuthProvider} from '@/context/TokenAuthContext';
import {usePathname} from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import {ExamProvider} from "@/context/ExamContext";

export default function RootLayout({children}) {
    const pathname = usePathname();

    // Pages où on ne veut pas afficher le Navbar et Footer
    const noLayoutPages = ['/', '/concours-selection'];
    const showLayout = !noLayoutPages.includes(pathname);

    return (
        <html lang="fr">
        <body className="flex flex-col min-h-screen">
        <TokenAuthProvider>
            <ExamProvider>

                {showLayout && <Navbar/>}
                <main className="flex-grow">
                    {children}
                </main>
                {showLayout && <Footer/>}
            </ExamProvider>
        </TokenAuthProvider>
        </body>
        </html>
    );
}
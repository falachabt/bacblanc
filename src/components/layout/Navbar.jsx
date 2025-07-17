'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTokenAuth } from '@/context/TokenAuthContext';
import { isAdmin } from '@/lib/adminAgent';
import { Home, Book, LogOut, Settings } from 'lucide-react';
import Image from 'next/image';

export default function Navbar() {
    const pathname = usePathname();
    
    // Safely use the hook with error handling
    let user = null;
    let logout = () => {};
    
    try {
        const auth = useTokenAuth();
        user = auth.user;
        logout = auth.logout;
    } catch (error) {
        // Component is being used outside of provider context
        // This can happen during SSR or in error scenarios
        console.warn('Navbar: TokenAuth context not available');
    }

    return (
        <>
            {/* App Header - Simple sur mobile */}
            <header className="bg-green-900 text-white shadow-md fixed top-0 w-full z-50">
                <div className="px-4 md:container md:mx-auto">
                    <div className="flex justify-center md:justify-between items-center h-14 md:h-16">
                        {/* Logo/Brand - Centré sur mobile, aligné à gauche sur desktop */}
                        <Link href={user ? '/exams' : '/'} className="text-xl flex items-center gap-4 font-bold">

                          <Image className={"rounded-md"} src={"/icon.png"} alt={"logo"} width={32} height={32} />
                            Elearn Prepa
                        </Link>

                        {/* Navigation Desktop - Cachée sur mobile */}
                        <nav className="hidden md:block">
                            <ul className="flex space-x-6 items-center">
                                {user ? (
                                    <>
                                        <li>
                                            <Link
                                                href="/"
                                                className={`flex items-center hover:text-green-200 transition ${
                                                    pathname === '/' ? 'font-bold' : ''
                                                }`}
                                            >
                                                <Home className="mr-2" size={20} />
                                                Accueil
                                            </Link>
                                        </li>
                                        <li>
                                            <Link
                                                href="/exams"
                                                className={`flex items-center hover:text-green-200 transition ${
                                                    pathname === '/exams' ? 'font-bold' : ''
                                                }`}
                                            >
                                                <Book className="mr-2" size={20} />
                                                Examens
                                            </Link>
                                        </li>
                                        {/* Lien Admin - visible seulement pour les administrateurs */}
                                        {user && isAdmin(user.external_id || user.id) && (
                                            <li>
                                                <Link
                                                    href="/admin"
                                                    className={`flex items-center hover:text-green-200 transition ${
                                                        pathname === '/admin' ? 'font-bold' : ''
                                                    }`}
                                                >
                                                    <Settings className="mr-2" size={20} />
                                                    Admin
                                                </Link>
                                            </li>
                                        )}
                                        <li>
                                            <button
                                                onClick={logout}
                                                className="bg-white text-green-600 px-4 py-2 rounded-full hover:bg-gray-100 transition flex items-center"
                                            >
                                                <LogOut className="mr-2" size={20} />
                                                Déconnexion
                                            </button>
                                        </li>
                                    </>
                                ) : null}
                            </ul>
                        </nav>
                    </div>
                </div>
            </header>

            {/* Navigation Bottom Tab pour Mobile - Cachée sur desktop */}
            <div className="md:hidden fixed bottom-0 w-full bg-white shadow-lg border-t border-gray-200 z-50">
                {user ? (
                    <div className="flex justify-around">
                        <Link
                            href="/"
                            className={`flex flex-col items-center py-3 ${
                                pathname === '/' ? 'text-green-600' : 'text-gray-500'
                            }`}
                        >
                            <Home size={24} />
                            <span className="text-xs mt-1">Accueil</span>
                        </Link>
                        <Link
                            href="/exams"
                            className={`flex flex-col items-center py-3 ${
                                pathname === '/exams' ? 'text-green-600' : 'text-gray-500'
                            }`}
                        >
                            <Book size={24} />
                            <span className="text-xs mt-1">Examens</span>
                        </Link>
                        <button
                            onClick={logout}
                            className="flex flex-col items-center py-3 text-gray-500"
                        >
                            <LogOut size={24} />
                            <span className="text-xs mt-1">Quitter</span>
                        </button>
                    </div>
                ) : null}
            </div>

            {/* Padding minimal pour compenser uniquement l'en-tête fixe */}
            <div className="pt-14 md:pt-16"></div>
        </>
    );
}
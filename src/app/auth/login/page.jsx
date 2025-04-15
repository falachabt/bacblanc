'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import Image from "next/image";

export default function LoginPage() {
    const router = useRouter();
    const { user, login, loading } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Rediriger si déjà connecté
    useEffect(() => {
        if (!loading && user) {
            console.log("User is already logged in, redirecting to /exams");
            router.push('/exams');
        }
    }, [user, loading, router]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);

        try {
            const { user, error } = await login(email, password);

            if (error) {
                setError(error.message);
            } else if (user) {
                router.push('/exams');
            }
        } catch (error) {
            setError('Une erreur est survenue. Veuillez réessayer.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen w-screen">
                <div className="w-8 h-8 border-t-4 border-green-600 border-solid rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen w-screen bg-gray-100">
            {/* En-tête vert avec logo */}
            <div className="bg-green-900 text-white py-8 px-6 text-center">
                <div className="rounded-full bg-green-500/10 w-16 h-16 mx-auto flex items-center justify-center mb-4">

                    <Image src={"/icon.png"} className={" rounded-xl "} alt={"logo"} width={256} height={256} />
                </div>
                <h2 className="text-2xl font-bold">
                    Bienvenue sur Elearn Prepa
                </h2>
                <p className="mt-1 text-sm text-white/90">
                    Connectez-vous pour accéder à vos examens
                </p>
            </div>

            {/* Formulaire */}
            <div className="flex-1 flex flex-col p-6 overflow-y-auto">
                {error && (
                    <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4 rounded">
                        <div className="text-sm text-red-700">{error}</div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5 flex-1 flex flex-col">
                    <div className="flex-none">
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                            Email
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="votre@email.com"
                                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                            />
                        </div>
                    </div>

                    <div className="flex-none">
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                            Mot de passe
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            </div>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                            />
                        </div>
                    </div>

                    {/* Mot de passe oublié à droite */}
                    <div className="flex justify-end flex-none">
                        <Link href="/auth/reset-password" className="text-sm text-green-600 hover:text-green-500 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Mot de passe oublié?
                        </Link>
                    </div>

                    <div className="mt-auto flex-none">
                        {/* Bouton de connexion */}
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-white text-lg ${
                                isSubmitting
                                    ? 'bg-green-500 cursor-not-allowed'
                                    : 'bg-green-600 hover:bg-green-700'
                            }`}
                        >
                            {isSubmitting ? 'Connexion...' : (
                                <>
                                    Se connecter
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                    </svg>
                                </>
                            )}
                        </button>

                        {/* Option de création de compte */}
                        <div className="mt-6 text-center">
                            <p className="text-sm text-gray-600">
                                Pas encore de compte?
                            </p>
                            <Link href="/auth/register" className="text-green-600 hover:text-green-500 flex items-center justify-center mt-1">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                </svg>
                                Créer un compte
                            </Link>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
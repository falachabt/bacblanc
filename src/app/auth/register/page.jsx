'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import Image from "next/image";

export default function RegisterPage() {
    const router = useRouter();
    const { user, register, loading } = useAuth();
    const [fullName, setFullName] = useState('');
    const [identifier, setIdentifier] = useState(''); // Email ou téléphone
    const [identifierType, setIdentifierType] = useState('email'); // 'email' ou 'phone'
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Récupérer la série BAC du localStorage
    const [bacSeries, setBacSeries] = useState('');

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('selectedBacSeries');
            if (stored) {
                setBacSeries(stored);
            } else {
                // Si aucune série n'est sélectionnée, rediriger vers la page de sélection
                router.push('/bac-selection');
            }
        }
    }, [router]);

    // Rediriger si déjà connecté
    useEffect(() => {
        if (!loading && user) {
            router.push('/exams');
        }
    }, [user, loading, router]);

    // Détecter si l'identifiant est un email ou un numéro de téléphone
    const detectIdentifierType = (value) => {
        // Expression régulière simple pour détecter un email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        // Expression régulière pour valider un numéro de téléphone camerounais (6XXXXXXXX)
        const phoneRegex = /^(6|2)([0-9]{8})$/;

        if (emailRegex.test(value)) {
            return 'email';
        } else if (phoneRegex.test(value.replace(/\s+/g, ''))) {
            return 'phone';
        }

        // Par défaut, on regarde si ça ressemble plus à un email ou un téléphone
        return value.includes('@') ? 'email' : 'phone';
    };

    const handleIdentifierChange = (e) => {
        const value = e.target.value;
        setIdentifier(value);
        setIdentifierType(detectIdentifierType(value));
    };

    // Fonction pour formater le numéro de téléphone
    const formatPhoneNumber = (phone) => {
        // Supprimer tous les espaces
        let formattedPhone = phone.replace(/\s+/g, '');

        // Si le numéro commence par +237, l'enlever
        if (formattedPhone.startsWith('+237')) {
            formattedPhone = formattedPhone.substring(4);
        } else if (formattedPhone.startsWith('237')) {
            formattedPhone = formattedPhone.substring(3);
        }

        return formattedPhone;
    };

    // Mapper les IDs de série BAC aux noms complets
    const getBacSeriesFullName = (id) => {
        const seriesMap = {
            'A': 'BAC A - Littéraire',
            'C': 'BAC C - Mathématiques et Sciences Physiques',
            'D': 'BAC D - Mathématiques et Sciences Naturelles',
            'E': 'BAC E - Mathématiques et Sciences Physiques',
            'TI': 'BAC TI - Sciences et Technologies'
        };
        return seriesMap[id] || id;
    };

    const handleChangeBacSeries = () => {
        router.push('/bac-selection');
    };

    const validateIdentifier = () => {
        if (identifierType === 'email') {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(identifier)) {
                return "Format d'email invalide";
            }
        } else if (identifierType === 'phone') {
            const phoneRegex = /^(6|2)([0-9]{8})$/;
            const formattedPhone = formatPhoneNumber(identifier);
            if (!phoneRegex.test(formattedPhone)) {
                return "Format de numéro de téléphone invalide. Utilisez le format 6XXXXXXXX";
            }
        }
        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        // Validation
        if (password !== confirmPassword) {
            setError('Les mots de passe ne correspondent pas');
            return;
        }

        if (password.length < 6) {
            setError('Le mot de passe doit contenir au moins 6 caractères');
            return;
        }

        const identifierError = validateIdentifier();
        if (identifierError) {
            setError(identifierError);
            return;
        }

        setIsSubmitting(true);

        try {
            let authIdentifier = identifier;

            // Formater le numéro de téléphone si nécessaire
            if (identifierType === 'phone') {
                authIdentifier = formatPhoneNumber(identifier);
            }

            const { user, error } = await register(
                authIdentifier,
                password,
                fullName,
                bacSeries,
                identifierType
            );

            if (error) {
                setError(error.message);
            } else if (user) {
                // Effacer le localStorage
                localStorage.removeItem('selectedBacSeries');
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
                    <Image src={"/icon.png"} className={"rounded-xl"} alt={"logo"} width={256} height={256} />
                </div>
                <h2 className="text-2xl font-bold">
                    Créer un compte
                </h2>
                <p className="mt-1 text-sm text-white/90">
                    Rejoignez Elearn Prepa pour préparer vos examens
                </p>
            </div>

            {/* Formulaire */}
            <div className="flex-1 p-6 overflow-y-auto">
                {error && (
                    <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4 rounded">
                        <div className="text-sm text-red-700">{error}</div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Nom complet */}
                    <div>
                        <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                            Nom complet
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                            <input
                                id="fullName"
                                name="fullName"
                                type="text"
                                required
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                placeholder="Entrez votre nom complet"
                                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                            />
                        </div>
                    </div>

                    {/* Email ou téléphone */}
                    <div>
                        <label htmlFor="identifier" className="flex items-center text-sm font-medium text-gray-700 mb-1">
                            <span>Identifiant de connexion</span>
                            <span className="ml-2 px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full">Email ou Téléphone</span>
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                <div className="relative">
                                    {identifierType === 'email' ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                        </svg>
                                    )}
                                </div>
                            </div>
                            <input
                                id="identifier"
                                name="identifier"
                                type="text"
                                autoComplete={identifierType === 'email' ? 'email' : 'tel'}
                                required
                                value={identifier}
                                onChange={handleIdentifierChange}
                                placeholder="votre@email.com ou 6XXXXXXXX"
                                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                            />
                        </div>
                        <div className="mt-1 flex items-center">
                            <div className={`w-3 h-3 rounded-full mr-1 ${identifierType === 'email' ? 'bg-blue-500' : 'bg-green-500'}`}></div>
                            <p className="text-xs text-gray-500">
                                {identifierType === 'email'
                                    ? "Format détecté: Email (ex: nom@exemple.com)"
                                    : "Format détecté: Téléphone (ex: 6XXXXXXXX sans +237)"}
                            </p>
                        </div>
                    </div>

                    {/* Mot de passe */}
                    <div>
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
                                autoComplete="new-password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                            />
                        </div>
                        <p className="mt-1 text-xs text-gray-500">Minimum 6 caractères</p>
                    </div>

                    {/* Confirmer mot de passe */}
                    <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                            Confirmer le mot de passe
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                            </div>
                            <input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                autoComplete="new-password"
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="••••••••"
                                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                            />
                        </div>
                    </div>

                    {/* Série BAC avec bouton de modification */}
                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <label className="block text-sm font-medium text-gray-700">
                                Série BAC
                            </label>
                            <button
                                type="button"
                                onClick={handleChangeBacSeries}
                                className="text-xs text-green-600 hover:text-green-700 flex items-center"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                Modifier
                            </button>
                        </div>
                        <div className="relative flex">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                            </div>
                            <div className="flex-1 pl-10 pr-3 py-3 border border-gray-300 bg-gray-50 rounded-md text-gray-700">
                                {getBacSeriesFullName(bacSeries)}
                            </div>
                            <button
                                type="button"
                                onClick={handleChangeBacSeries}
                                className="flex items-center justify-center px-4 ml-2 border border-green-600 rounded-md text-green-600 hover:bg-green-50"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 15l-3-3m0 0l3-3m-3 3h8M3 12a9 9 0 1118 0 9 9 0 01-18 0z" />
                                </svg>
                                <span className="ml-1 hidden sm:inline">Retour</span>
                            </button>
                        </div>
                    </div>

                    {/* Bouton d'inscription */}
                    <button
                        type="submit"
                        disabled={isSubmitting || !bacSeries}
                        className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-white text-lg mt-6 ${
                            isSubmitting || !bacSeries
                                ? 'bg-green-400 cursor-not-allowed'
                                : 'bg-green-600 hover:bg-green-700'
                        }`}
                    >
                        {isSubmitting ? 'Inscription en cours...' : (
                            <>
                                S'inscrire
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                </svg>
                            </>
                        )}
                    </button>

                    {/* Lien vers connexion */}
                    <div className="mt-4 text-center">
                        <p className="text-sm text-gray-600">
                            Déjà un compte?
                        </p>
                        <Link href="/auth/login" className="text-green-600 hover:text-green-500 flex items-center justify-center mt-1">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                            </svg>
                            Se connecter
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
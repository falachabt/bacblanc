'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Image from "next/image";

export default function BacSelectionPage() {
    const router = useRouter();
    const { user, profile, loading } = useAuth();
    const [selectedSeries, setSelectedSeries] = useState(null);

    // Si déjà connecté avec une série BAC, redirection vers la page des examens
    useEffect(() => {
        if (!loading) {
            if (user && profile?.bac_series) {
                router.push('/exams');
            } else if (user) {
                // L'utilisateur est connecté mais n'a pas de série BAC définie
                router.push('/auth/complete-profile');
            }
        }
    }, [user, profile, loading, router]);

    const handleSelection = (series) => {
        setSelectedSeries(series);
    };

    const handleContinue = () => {
        if (selectedSeries) {
            // Stocker la sélection dans localStorage pour l'utiliser lors de l'inscription
            localStorage.setItem('selectedBacSeries', selectedSeries);
            router.push('/auth/register');
        }
    };

    const seriesOptions = [
        { id: 'A', name: 'BAC A', description: 'Littéraire', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
        { id: 'C', name: 'BAC C', description: 'Mathématiques et Sciences Physiques', icon: 'M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z' },
        { id: 'D', name: 'BAC D', description: 'Mathématiques et Sciences Naturelles', icon: 'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z' },
        { id: 'E', name: 'BAC E', description: 'Mathématiques et Sciences Physiques', icon: 'M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z' },
        { id: 'TI', name: 'BAC TI', description: 'Sciences et Technologies', icon: 'M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z' },
    ];

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
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
                    Choisissez votre série BAC
                </h2>
                <p className="mt-1 text-sm text-white/90">
                    Cette information nous aide à personnaliser votre expérience
                </p>
            </div>

            {/* Contenu principal */}
            <div className="flex-1 flex flex-col p-6 overflow-y-auto">
                <div className="space-y-4 mb-6">
                    {seriesOptions.map((series) => (
                        <button
                            key={series.id}
                            onClick={() => handleSelection(series.id)}
                            className={`w-full p-4 rounded-lg border shadow-sm transition-all flex items-center ${
                                selectedSeries === series.id
                                    ? 'border-green-600 bg-green-50'
                                    : 'border-gray-200 hover:border-green-400 bg-white'
                            }`}
                        >
                            <div className={`w-10 h-10 rounded-full mr-4 flex items-center justify-center ${
                                selectedSeries === series.id ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-500'
                            }`}>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={series.icon} />
                                </svg>
                            </div>

                            <div className="flex-1 text-left">
                                <p className="font-semibold text-gray-800">{series.name}</p>
                                <p className="text-sm text-gray-600">{series.description}</p>
                            </div>

                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                selectedSeries === series.id ? 'border-green-600' : 'border-gray-400'
                            }`}>
                                {selectedSeries === series.id && (
                                    <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                                )}
                            </div>
                        </button>
                    ))}
                </div>

                <div className="mt-auto">
                    <button
                        onClick={handleContinue}
                        disabled={!selectedSeries}
                        className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-white text-lg ${
                            selectedSeries
                                ? 'bg-green-600 hover:bg-green-700'
                                : 'bg-gray-400 cursor-not-allowed'
                        }`}
                    >
                        Continuer
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                    </button>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-600">
                            Déjà un compte?
                        </p>
                        <a href="/auth/login" className="text-green-600 hover:text-green-500 flex items-center justify-center mt-1">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14" />
                            </svg>
                            Se connecter
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
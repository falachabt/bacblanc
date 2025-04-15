'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

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
            router.push('/auth/login');
        }
    };

    const seriesOptions = [
        { id: 'A', name: 'BAC A', description: 'Littéraire' },
        { id: 'C', name: 'BAC C', description: 'Mathématiques et Sciences Physiques' },
        { id: 'D', name: 'BAC D', description: 'Mathématiques et Sciences Naturelles' }
    ];

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="w-8 h-8 border-t-4 border-green-600 border-solid rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-green-600 to-green-400 text-white p-4">
            <div className="max-w-md w-full bg-white text-gray-800 rounded-lg shadow-lg p-6">
                <h1 className="text-2xl font-bold text-center text-green-600 mb-6">
                    Choisissez votre série BAC
                </h1>

                <div className="space-y-4 mb-6">
                    {seriesOptions.map((series) => (
                        <button
                            key={series.id}
                            onClick={() => handleSelection(series.id)}
                            className={`w-full p-4 rounded-lg border-2 transition-all ${
                                selectedSeries === series.id
                                    ? 'border-green-600 bg-green-50'
                                    : 'border-gray-200 hover:border-green-400'
                            }`}
                        >
                            <div className="flex items-center">
                                <div className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${
                                    selectedSeries === series.id ? 'border-green-600' : 'border-gray-400'
                                }`}>
                                    {selectedSeries === series.id && (
                                        <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                                    )}
                                </div>
                                <div className="text-left">
                                    <p className="font-semibold">{series.name}</p>
                                    <p className="text-sm text-gray-600">{series.description}</p>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>

                <button
                    onClick={handleContinue}
                    disabled={!selectedSeries}
                    className={`w-full py-3 rounded-lg text-white font-semibold ${
                        selectedSeries
                            ? 'bg-green-600 hover:bg-green-700'
                            : 'bg-gray-400 cursor-not-allowed'
                    }`}
                >
                    Continuer
                </button>
            </div>
        </div>
    );
}
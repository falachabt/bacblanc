'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTokenAuth } from '@/context/TokenAuthContext';
import Image from "next/image";

export default function ConcoursSelectionPage() {
    const router = useRouter();
    
    // Safely get auth context
    let user = null;
    let profile = null;
    let loading = true;
    let updateConcoursType = async () => ({ data: null, error: 'Not available' });
    
    try {
        const auth = useTokenAuth();
        user = auth.user;
        profile = auth.profile;
        loading = auth.loading;
        updateConcoursType = auth.updateConcoursType;
    } catch (error) {
        console.warn('ConcoursSelectionPage: TokenAuth context not available');
    }
    
    const [selectedType, setSelectedType] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Si déjà connecté avec un type de concours, redirection vers la page des examens
    useEffect(() => {
        if (!loading) {
            if (user && profile?.concours_type) {
                router.push('/exams');
            } else if (!user) {
                // Si pas d'utilisateur, rediriger vers l'accueil
                router.push('/');
            }
        }
    }, [user, profile, loading, router]);

    const handleSelection = (type) => {
        setSelectedType(type);
    };

    const handleContinue = async () => {
        if (selectedType && user) {
            setIsSubmitting(true);
            try {
                const { data, error } = await updateConcoursType(selectedType);
                if (error) {
                    console.error('Error updating concours type:', error);
                } else {
                    router.push('/exams');
                }
            } catch (error) {
                console.error('Error updating concours type:', error);
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    const concoursTypes = [
        { 
            id: 'ingenieur', 
            name: 'Concours Ingénieur', 
            description: 'Mathématiques, Physique, Sciences de l\'Ingénieur', 
            icon: 'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z',
            color: 'blue'
        },
        { 
            id: 'medecine', 
            name: 'Concours Médecine', 
            description: 'Biologie, Chimie, Physique, Mathématiques', 
            icon: 'M4.326 10.408a4 4 0 00-.895 2.633l-.003.205a3 3 0 00.585 1.762l.001.003.001.003a3 3 0 003.226 1.223l6.68-1.005a3 3 0 002.595-2.47 3 3 0 00-1.42-3.207 4 4 0 00-1.726-.63l-6.68-.777a4 4 0 00-2.364.485z',
            color: 'green'
        }
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
                    Choisissez votre type de concours
                </h2>
                <p className="mt-1 text-sm text-white/90">
                    Cette information nous aide à personnaliser votre expérience
                </p>
            </div>

            {/* Contenu principal */}
            <div className="flex-1 flex flex-col p-6 overflow-y-auto">
                <div className="space-y-4 mb-6">
                    {concoursTypes.map((type) => (
                        <button
                            key={type.id}
                            onClick={() => handleSelection(type.id)}
                            className={`w-full p-4 rounded-lg border shadow-sm transition-all flex items-center ${
                                selectedType === type.id
                                    ? 'border-green-600 bg-green-50'
                                    : 'border-gray-200 hover:border-green-400 bg-white'
                            }`}
                        >
                            <div className={`w-10 h-10 rounded-full mr-4 flex items-center justify-center ${
                                selectedType === type.id ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-500'
                            }`}>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={type.icon} />
                                </svg>
                            </div>

                            <div className="flex-1 text-left">
                                <p className="font-semibold text-gray-800">{type.name}</p>
                                <p className="text-sm text-gray-600">{type.description}</p>
                            </div>

                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                selectedType === type.id ? 'border-green-600' : 'border-gray-400'
                            }`}>
                                {selectedType === type.id && (
                                    <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                                )}
                            </div>
                        </button>
                    ))}
                </div>

                <div className="mt-auto">
                    <button
                        onClick={handleContinue}
                        disabled={!selectedType || isSubmitting}
                        className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-white text-lg ${
                            selectedType && !isSubmitting
                                ? 'bg-green-600 hover:bg-green-700'
                                : 'bg-gray-400 cursor-not-allowed'
                        }`}
                    >
                        {isSubmitting ? 'Enregistrement...' : (
                            <>
                                Continuer
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                </svg>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
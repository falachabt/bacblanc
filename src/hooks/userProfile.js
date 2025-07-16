// hooks/useProfile.js
'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import supabase from "@/lib/supabase";

export function useProfile() {
    const { user, profile, setProfile } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Mettre à jour le profil utilisateur
    const updateProfile = async (updatedData) => {
        if (!user) {
            setError("Aucun utilisateur connecté");
            return { success: false, error: "Aucun utilisateur connecté" };
        }

        setLoading(true);
        setError(null);

        try {
            const { data, error: updateError } = await supabase
                .from('concours_blanc.users_profiles')
                .update(updatedData)
                .eq('id', user.id)
                .select()
                .single();

            if (updateError) throw updateError;

            // Mettre à jour l'état du profile dans le contexte
            setProfile(data);

            return { success: true, data };
        } catch (error) {
            setError(error.message);
            return { success: false, error: error.message };
        } finally {
            setLoading(false);
        }
    };

    // Mettre à jour spécifiquement la série BAC
    const updateBacSeries = async (bacSeries) => {
        return await updateProfile({ bac_series: bacSeries });
    };

    return {
        profile,
        loading,
        error,
        updateProfile,
        updateBacSeries
    };
}
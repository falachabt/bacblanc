// hooks/useProfile.js
'use client';

import { useState } from 'react';
import { useTokenAuth } from '@/context/TokenAuthContext';
import supabase from "@/lib/supabase";

export function useProfile() {
    // Safely get auth context
    let user = null;
    let profile = null;
    let setProfile = () => {};
    
    try {
        const auth = useTokenAuth();
        user = auth.user;
        profile = auth.profile;
        setProfile = auth.setProfile || (() => {}); // setProfile might not be available
    } catch (error) {
        console.warn('useProfile: TokenAuth context not available');
    }
    
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
                .from('users_profiles')
                .update(updatedData)
                .eq('external_id', user.id)
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

    // Mettre à jour spécifiquement le type de concours
    const updateConcoursType = async (concoursType) => {
        return await updateProfile({ concours_type: concoursType });
    };

    return {
        profile,
        loading,
        error,
        updateProfile,
        updateConcoursType
    };
}
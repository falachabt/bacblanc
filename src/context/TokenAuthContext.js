'use client';

import { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import supabase from "@/lib/supabase";

const TokenAuthContext = createContext();

export function TokenAuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    // Fonction pour récupérer le token depuis les headers
    const getTokenFromHeaders = useCallback(() => {
        // Dans un environnement React Native WebView, le token sera passé via une méthode spécifique
        // Pour le moment, on simule avec localStorage pour les tests locaux
        if (typeof window !== 'undefined') {
            return localStorage.getItem('authToken') || window.authToken;
        }
        return null;
    }, []);

    // Fonction pour appeler le serveur externe avec le token
    const fetchUserFromExternalAPI = useCallback(async (token) => {
        try {
            // TODO: Remplacer par l'URL réelle de l'API externe
            const response = await fetch('/api/external-user', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch user from external API');
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching user from external API:', error);
            return null;
        }
    }, []);

    // Fonction pour vérifier ou créer le profil utilisateur dans la base de données
    const ensureProfileExists = useCallback(async (externalUser) => {
        try {
            // Vérifier si le profil existe
            const { data: existingProfile, error: fetchError } = await supabase
                .from('users_profiles')
                .select('*')
                .eq('external_id', externalUser.id)
                .single();

            if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 = "not found"
                throw fetchError;
            }

            if (existingProfile) {
                return existingProfile;
            }

            // Créer un nouveau profil si il n'existe pas
            const { data: newProfile, error: insertError } = await supabase
                .from('users_profiles')
                .insert([{
                    external_id: externalUser.id,
                    full_name: externalUser.firstname || 'User',
                    concours_type: null, // Sera défini lors de la sélection
                    created_at: new Date().toISOString(),
                }])
                .select()
                .single();

            if (insertError) throw insertError;

            return newProfile;
        } catch (error) {
            console.error("Error ensuring profile exists:", error.message);
            throw error;
        }
    }, []);

    // Fonction principale d'authentification par token
    const authenticateWithToken = useCallback(async () => {
        try {
            setLoading(true);
            const token = getTokenFromHeaders();

            if (!token) {
                setUser(null);
                setProfile(null);
                setLoading(false);
                return;
            }

            // Récupérer les informations utilisateur depuis l'API externe
            const externalUser = await fetchUserFromExternalAPI(token);
            
            if (!externalUser) {
                setUser(null);
                setProfile(null);
                setLoading(false);
                return;
            }

            // Définir l'utilisateur avec les données externes
            setUser({
                id: externalUser.id,
                firstname: externalUser.firstname,
                token: token
            });

            // Vérifier ou créer le profil dans la base de données
            const userProfile = await ensureProfileExists(externalUser);
            setProfile(userProfile);

            // Rediriger vers la sélection de concours si le type n'est pas défini
            if (!userProfile.concours_type) {
                router.push('/concours-selection');
            }

        } catch (error) {
            console.error("Error during token authentication:", error);
            setUser(null);
            setProfile(null);
        } finally {
            setLoading(false);
        }
    }, [getTokenFromHeaders, fetchUserFromExternalAPI, ensureProfileExists, router]);

    // Initialisation de l'authentification
    useEffect(() => {
        authenticateWithToken();
    }, [authenticateWithToken]);

    // Fonction pour mettre à jour le type de concours
    const updateConcoursType = async (concoursType) => {
        try {
            setLoading(true);
            if (!user) throw new Error("No user logged in.");

            const { data, error } = await supabase
                .from('users_profiles')
                .update({ concours_type: concoursType })
                .eq('external_id', user.id)
                .select()
                .single();

            if (error) throw error;

            setProfile(data);
            return { data, error: null };
        } catch (error) {
            console.error("Error updating concours type:", error.message);
            return { data: null, error };
        } finally {
            setLoading(false);
        }
    };

    // Fonction de déconnexion (vider les états locaux)
    const logout = async () => {
        try {
            setLoading(true);
            setUser(null);
            setProfile(null);
            if (typeof window !== 'undefined') {
                localStorage.removeItem('authToken');
            }
            router.push('/');
        } catch (error) {
            console.error("Error during logout:", error.message);
        } finally {
            setLoading(false);
        }
    };

    const value = {
        user,
        profile,
        updateConcoursType,
        logout,
        loading,
        authenticateWithToken,
    };

    return <TokenAuthContext.Provider value={value}>{children}</TokenAuthContext.Provider>;
}

export function useTokenAuth() {
    return useContext(TokenAuthContext);
}
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

    // Fonction pour récupérer le token depuis les headers ou localStorage
    const getTokenFromHeaders = useCallback(() => {
        // Only run on client side
        if (typeof window === 'undefined') return null;
        
        try {
            // Check for token in localStorage or window.authToken (for WebView integration)
            let token = localStorage.getItem('authToken') || window.authToken;
            return token || null;
        } catch (error) {
            console.error('Error accessing localStorage:', error);
            return null;
        }
    }, []);

    // Fonction pour appeler le serveur externe avec le token via proxy
    const fetchUserFromExternalAPI = useCallback(async (token) => {
        try {
            console.log('TokenAuthContext - Making user-info request with token:', token);
            
            // Call our proxy API instead of direct external API to avoid CORS issues
            // Use custom headers to avoid Supabase interference
            const response = await fetch('/api/elearn/user-info', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    // 'X-Elearn-Token': token
                },
                // Disable credentials to prevent automatic auth header injection
                // credentials: 'omit'
            });

            console.log('TokenAuthContext - Response status:', response.status);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.log('TokenAuthContext - Error response:', errorData);
                throw new Error('Failed to fetch user from external API');
            }

            const userData = await response.json();
            console.log('TokenAuthContext - User data received:', userData.user);
            return userData.user || null;
        } catch (error) {
            console.log('Error fetching user from external API:', error);
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
                // throw fetchError;

            }

            console.log("ensure Existing profile:", existingProfile);

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

            if (insertError) {
                console.error("Error inserting new profile:", insertError.message);
                throw insertError;
            };

            return newProfile;
        } catch (error) {
            console.error("Error ensuring profile exists:", error.message);
            throw error;
        }
    }, []);

    // Fonction principale d'authentification par token
    const authenticateWithToken = useCallback(async () => {
        // Skip on server side
        if (typeof window === 'undefined') {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const token = getTokenFromHeaders();

            console.log("Token from localStorage:", token);
            console.log("localStorage authToken:", localStorage.getItem('authToken'));
            console.log("window.authToken:", window.authToken);

            if (!token) {
                console.log("No token found, setting user and profile to null");
                setUser(null);
                setProfile(null);
                setLoading(false);
                return;
            }

            // Récupérer les informations utilisateur depuis l'API externe
            const externalUser = await fetchUserFromExternalAPI(token);

            console.log("External User:", externalUser);
            
            if (!externalUser) {
                setUser(null);
                setProfile(null);
                setLoading(false);
                return;
            }



            // Vérifier ou créer le profil dans la base de données
            let userProfile;
            let supabaseError = null;
            try {
                userProfile = await ensureProfileExists(externalUser);
            } catch (error) {
                console.warn("Supabase error, using fallback profile:", error);
                supabaseError = error;
                // Fallback pour l'admin quand Supabase n'est pas disponible
                userProfile = {
                    id: externalUser.id,
                    external_id: externalUser.id,
                    full_name: externalUser.firstname || 'User',
                    concours_type: 'general', // Valeur par défaut pour éviter la redirection
                    created_at: new Date().toISOString()
                };
            }

            setUser({
                ...userProfile,
                full_name: userProfile.full_name || externalUser.firstname || 'User',
                token: token
            })

            // Rediriger vers la sélection de concours si le type n'est pas défini
            // Skip pour les admins en mode fallback
            if (!userProfile.concours_type && !supabaseError) {
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
        // Only run on client side
        if (typeof window !== 'undefined') {
            authenticateWithToken();
        } else {
            setLoading(false);
        }
    }, [authenticateWithToken]);

    // Fonction pour mettre à jour le type de concours
    const updateConcoursType = async (concoursType) => {
        try {
            setLoading(true);
            if (!user) throw new Error("No user logged in.");

            console.log("Updating concours type:", concoursType);
            console.log("User:", user, profile);

            const { data, error } = await supabase
                .from('users_profiles')
                .update({ concours_type: concoursType })
                .eq('external_id', user.external_id)
                .select()
                .single();

            if (error) {;
                console.error("Error updating concours type:", error.message);
                throw error;
            }

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
    const context = useContext(TokenAuthContext);

    if (context === undefined) {
        // Return default values instead of throwing an error during SSR
        if (typeof window === 'undefined') {
            return {
                user: null,
                profile: null,
                updateConcoursType: async () => ({ data: null, error: 'Not available during SSR' }),
                logout: () => {},
                loading: true,
                authenticateWithToken: () => {},
            };
        }
        throw new Error('useTokenAuth must be used within a TokenAuthProvider');
    }
    return context;
}
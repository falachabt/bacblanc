'use client';

import {createContext, useState, useEffect, useContext} from 'react';
import {usePathname, useRouter} from 'next/navigation';
import supabase from "@/lib/supabase";

const AuthContext = createContext();

export function AuthProvider({children}) {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    // Dans context/AuthContext.js - useEffect mis à jour
    useEffect(() => {
        const getUser = async () => {
            // Vérifie la session de l'utilisateur
            const {data: {session}} = await supabase.auth.getSession();

            if (session?.user) {
                setUser(session.user);

                try {
                    // Vérifier que le profil existe, ou le créer si nécessaire
                    const profile = await ensureProfileExists(session.user.id);
                    setProfile(profile);
                } catch (error) {
                    console.error("Erreur lors de la récupération/création du profil:", error);
                }
            }

            setLoading(false);
        };

        // Obtenir la session initiale
        getUser();

        // Écouter les changements d'authentification
        const {data: {subscription}} = supabase.auth.onAuthStateChange(
            async (event, session) => {
                if (session?.user) {
                    setUser(session.user);

                    console.log("Nouvelle session:", session);

                    try {
                        // Vérifier que le profil existe, ou le créer si nécessaire
                        const profile = await ensureProfileExists(session.user.id);
                        setProfile(profile);
                    } catch (error) {
                        console.error("Erreur lors de la récupération/création du profil:", error);
                    }
                } else {
                    if ((pathname != "/" && pathname != "/bac-selection")) {
                        console.log("Nouvelle pathname", pathname);
                        router.push('/auth/login');
                    }

                    setUser(null);
                    setProfile(null);
                }
                setLoading(false);
            }
        );

        return () => {
            subscription?.unsubscribe();
        };
    }, []);

    // Se connecter avec email et mot de passe
    const login = async (email, password) => {
        try {
            setLoading(true);
            const {data, error} = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (error) throw error;

            return {user: data.user, error: null};
        } catch (error) {
            return {user: null, error};
        } finally {
            setLoading(false);
        }
    };

    // S'inscrire avec email et mot de passe
    const register = async (email, password, fullName, bacSeries) => {
        try {
            setLoading(true);

            // 1. Inscrire l'utilisateur
            const {data, error: registerError} = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName, // Aussi stocké dans les métadonnées auth
                        bac_series: bacSeries
                    }
                }
            });

            if (registerError) throw registerError;

            // 2. S'assurer que l'utilisateur a été créé
            if (!data.user) {
                throw new Error("L'inscription a échoué, aucun utilisateur créé");
            }

            // 3. Créer le profil utilisateur dans la table users_profiles
            const {error: profileError} = await supabase
                .from('users_profiles')
                .insert([{
                    id: data.user.id,
                    full_name: fullName,
                    bac_series: bacSeries,
                    created_at: new Date().toISOString()
                }]);

            // 4. Si la création du profil échoue, journaliser et tenter de supprimer l'utilisateur
            if (profileError) {
                console.error("Erreur lors de la création du profil:", profileError);

                // Tentative de nettoyage en supprimant l'utilisateur créé
                try {
                    // Note: Ceci nécessite généralement des droits d'administrateur ou une fonction serveur
                    await supabase.auth.admin.deleteUser(data.user.id);
                } catch (cleanupError) {
                    console.error("Impossible de supprimer l'utilisateur après échec de création du profil:", cleanupError);
                }

                throw profileError;
            }

            return {user: data.user, error: null};
        } catch (error) {
            console.error("Erreur d'inscription:", error.message);
            return {user: null, error};
        } finally {
            setLoading(false);
        }
    };

    const ensureProfileExists = async (userId) => {
        try {
            // Vérifier si le profil existe
            const {data: existingProfile, error: fetchError} = await supabase
                .from('users_profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 = not found
                throw fetchError;
            }

            // Si le profil existe déjà, retourner
            if (existingProfile) {
                return existingProfile;
            }

            // Si le profil n'existe pas, récupérer les données d'utilisateur
            const {data: userData} = await supabase.auth.getUser();

            if (!userData.user) {
                throw new Error("Impossible de récupérer les données utilisateur");
            }

            // Extraire les informations des métadonnées utilisateur ou utiliser des valeurs par défaut
            const metaData = userData.user.user_metadata || {};
            const fullName = metaData.full_name || 'Utilisateur';
            const bacSeries = metaData.bac_series || '';

            // Créer le profil manquant
            const {data: newProfile, error: insertError} = await supabase
                .from('users_profiles')
                .insert([{
                    id: userId,
                    full_name: fullName,
                    bac_series: bacSeries,
                    created_at: new Date().toISOString()
                }])
                .select()
                .single();

            if (insertError) {
                throw insertError;
            }

            return newProfile;
        } catch (error) {
            console.error("Erreur lors de la vérification/création du profil:", error.message);
            throw error;
        }
    };

    // Se déconnecter
    const logout = async () => {
        try {
            setLoading(true);
            const {error} = await supabase.auth.signOut();
            if (error) throw error;
            router.push('/');
            router.refresh();
        } catch (error) {
            console.error('Erreur lors de la déconnexion:', error.message);
        } finally {
            setLoading(false);
        }
    };

    // Mettre à jour la série BAC de l'utilisateur
    const updateBacSeries = async (bacSeries) => {
        try {
            setLoading(true);
            if (!user) throw new Error('Aucun utilisateur connecté');

            const {data, error} = await supabase
                .from('users_profiles')
                .update({bac_series: bacSeries})
                .eq('id', user.id)
                .select()
                .single();

            if (error) throw error;

            setProfile(data);
            return {data, error: null};
        } catch (error) {
            return {data: null, error};
        } finally {
            setLoading(false);
        }
    };

    const value = {
        user,
        profile,
        login,
        register,
        logout,
        updateBacSeries,
        loading
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    return useContext(AuthContext);
}
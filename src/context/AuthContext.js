'use client';

import { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import supabase from "@/lib/supabase";

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    // Memoize fetchUserAndProfile to prevent unnecessary recreations
    const fetchUserAndProfile = useCallback(async (session) => {
        try {
            if (session?.user) {
                setUser(session.user);

                // Only fetch profile if we don't already have it or user changed
                if (!profile || profile.id !== session.user.id) {
                    const fetchedProfile = await ensureProfileExists(session.user.id);
                    setProfile(fetchedProfile);
                }
            } else {
                setUser(null);
                setProfile(null);

                // Only redirect if on protected routes
                const publicRoutes = ["/", "/concours-selection"];
                if (!publicRoutes.includes(pathname)) {
                    router.push('/');
                }
            }
        } catch (error) {
            console.error("Error fetching user or profile:", error);
        } finally {
            setLoading(false);
        }
    }, [profile, pathname, router]);

    // Memoize ensureProfileExists to prevent unnecessary recreations
    const ensureProfileExists = useCallback(async (userId) => {
        try {
            // Check if profile exists
            const { data: existingProfile, error: fetchError } = await supabase
                .from('users_profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 = "not found"
                throw fetchError;
            }

            if (existingProfile) return existingProfile;

            // Create profile if it doesn't exist
            const { data: userData } = await supabase.auth.getUser();
            if (!userData.user) throw new Error("User data not found.");

            const metaData = userData.user.user_metadata || {};
            const fullName = metaData.full_name || 'User';
            const concoursType = metaData.concours_type || '';

            const { data: newProfile, error: insertError } = await supabase
                .from('users_profiles')
                .insert([{
                    id: userId,
                    full_name: fullName,
                    concours_type: concoursType,
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

    useEffect(() => {
        let isMounted = true;
        let authSubscription = null;

        const initializeAuth = async () => {
            try {
                // Fetch initial user session
                const { data: { session } } = await supabase.auth.getSession();
                if (isMounted) await fetchUserAndProfile(session);

                // Listen for auth state changes
                const { data: { subscription } } = supabase.auth.onAuthStateChange(
                    async (event, session) => {
                        if (isMounted && (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'USER_UPDATED')) {
                            setLoading(true);
                            await fetchUserAndProfile(session);
                        }
                    }
                );

                authSubscription = subscription;
            } catch (error) {
                console.error("Error initializing auth:", error);
                if (isMounted) setLoading(false);
            }
        };

        initializeAuth();

        return () => {
            isMounted = false;
            if (authSubscription) authSubscription.unsubscribe();
        };
    }, [fetchUserAndProfile]); // Only depend on fetchUserAndProfile which is memoized

    const register = async (identifier, password, fullName, concoursType, identifierType = 'email') => {
        try {
            // Préparation des données utilisateur
            const userData = {
                full_name: fullName,
                concours_type: concoursType,
            };

            // Déterminer si on utilise email ou téléphone pour l'authentification
            let authData = {};
            if (identifierType === 'email') {
                authData = { email: identifier };
            } else if (identifierType === 'phone') {
                authData = { phone: identifier };
            }

            // Inscription de l'utilisateur
            const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
                ...authData,
                password,
                options: {
                    data: userData
                }
            });

            if (signUpError) throw signUpError;

            // Si l'inscription réussit, mettre à jour l'état
            if (signUpData.user) {
                setUser(signUpData.user);
                return { user: signUpData.user, error: null };
            }

            return { user: null, error: new Error('Échec de l\'inscription.') };
        } catch (error) {
            console.error('Erreur d\'inscription:', error.message);
            return { user: null, error };
        }
    };


    const login = async (identifier, password, identifierType = 'email') => {
        try {
            // Déterminer si on utilise email ou téléphone pour l'authentification
            let authData = {};
            if (identifierType === 'email') {
                authData = { email: identifier };
            } else if (identifierType === 'phone') {
                authData = { phone: identifier };
            }

            // Connexion de l'utilisateur
            const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
                ...authData,
                password
            });

            if (signInError) throw signInError;

            // Si la connexion réussit, mettre à jour l'état
            if (signInData.user) {
                setUser(signInData.user);
                return { user: signInData.user, error: null };
            }

            return { user: null, error: new Error('Échec de la connexion.') };
        } catch (error) {
            console.error('Erreur de connexion:', error.message);
            return { user: null, error };
        }
    };
    const logout = async () => {
        try {
            setLoading(true);
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
            localStorage.clear();
            router.push('/');
        } catch (error) {
            console.error("Error during logout:", error.message);
        } finally {
            setLoading(false);
        }
    };

    const updateConcoursType = async (concoursType) => {
        try {
            setLoading(true);
            if (!user) throw new Error("No user logged in.");

            const { data, error } = await supabase
                .from('users_profiles')
                .update({ concours_type: concoursType })
                .eq('id', user.id)
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

    const value = {
        user,
        profile,
        login,
        register,
        logout,
        updateConcoursType,
        loading,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    return useContext(AuthContext);
}
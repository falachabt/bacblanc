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
                const publicRoutes = ["/", "/bac-selection", "/auth/register", "/auth/login"];
                if (!publicRoutes.includes(pathname)) {
                    router.push('/auth/login');
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
            const bacSeries = metaData.bac_series || '';

            const { data: newProfile, error: insertError } = await supabase
                .from('users_profiles')
                .insert([{
                    id: userId,
                    full_name: fullName,
                    bac_series: bacSeries,
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

    const login = async (email, password) => {
        try {
            setLoading(true);
            const { data, error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) throw error;
            return { user: data.user, error: null };
        } catch (error) {
            console.error("Error during login:", error.message);
            return { user: null, error };
        } finally {
            setLoading(false);
        }
    };

    const register = async (email, password, fullName, bacSeries) => {
        try {
            setLoading(true);

            // Register the user
            const { data, error: registerError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName,
                        bac_series: bacSeries,
                    },
                },
            });

            if (registerError) throw registerError;

            if (!data.user) {
                throw new Error("Registration failed, no user created.");
            }

            // Create user profile
            const { error: profileError } = await supabase
                .from('users_profiles')
                .insert([{
                    id: data.user.id,
                    full_name: fullName,
                    bac_series: bacSeries,
                    created_at: new Date().toISOString(),
                }]);

            if (profileError) {
                console.error("Error creating user profile:", profileError);

                // Cleanup: Delete the user if profile creation fails
                try {
                    await supabase.auth.admin.deleteUser(data.user.id);
                } catch (cleanupError) {
                    console.error("Failed to delete user after profile creation error:", cleanupError);
                }

                throw profileError;
            }

            return { user: data.user, error: null };
        } catch (error) {
            console.error("Error during registration:", error.message);
            return { user: null, error };
        } finally {
            setLoading(false);
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

    const updateBacSeries = async (bacSeries) => {
        try {
            setLoading(true);
            if (!user) throw new Error("No user logged in.");

            const { data, error } = await supabase
                .from('users_profiles')
                .update({ bac_series: bacSeries })
                .eq('id', user.id)
                .select()
                .single();

            if (error) throw error;

            setProfile(data);
            return { data, error: null };
        } catch (error) {
            console.error("Error updating BAC series:", error.message);
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
        updateBacSeries,
        loading,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    return useContext(AuthContext);
}
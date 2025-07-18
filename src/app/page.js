'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTokenAuth } from '@/context/TokenAuthContext';
import ElearnAdminLogin from '@/components/ElearnAdminLogin';
import Image from 'next/image';
import Link from 'next/link';

export default function HomePage() {
  const router = useRouter();
  const [showLogin, setShowLogin] = useState(false);

  // Safely get auth context
  let user = null;
  let loading = true;
  let authenticateWithToken = null;

  try {
    const auth = useTokenAuth();
    user = auth.user;
    loading = auth.loading;
    authenticateWithToken = auth.authenticateWithToken;
  } catch (error) {
    console.warn('HomePage: TokenAuth context not available');
  }

  // Handle authentication data from ElearnAdminLogin
  const handleAuth = (authData) => {
    if (authData && authData.token) {
      try {
        // Store token in multiple storage locations for redundancy
        // 1. Store in localStorage (primary storage)
        localStorage.setItem('authToken', authData.token);

        // 2. Store in sessionStorage (backup storage)
        sessionStorage.setItem('authToken', authData.token);

        console.log('Token stored in localStorage and sessionStorage');
      } catch (error) {
        console.error('Error storing token:', error);
      }

      // Use a small delay to ensure storage is updated before re-authentication
      setTimeout(() => {
        if (authenticateWithToken) {
          authenticateWithToken();
        }
      }, 100);

      // Hide login form
      setShowLogin(false);
    }
  };

  // Rediriger si déjà connecté
  useEffect(() => {
    if (!loading) {
      if (user) {
        console.log("user", user);
        router.push('/exams');
      } else {
        // No user found, show login
        setShowLogin(true);
      }
    }
  }, [user, loading, router]);

  // Show login form if no authentication is found
  if (showLogin && !loading && !user) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-green-700 to-green-900 text-white flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <ElearnAdminLogin onAuth={handleAuth} />
        </div>
      </div>
    );
  }

  // Show loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-green-700 to-green-900 text-white p-4">
        <div className="w-40 h-40 bg-white rounded-lg flex items-center justify-center mb-8">
          <div className="w-32 h-32 relative">
            <Image
                src="/icon.png"
                alt="Elearn Prepa Logo"
                layout="fill"
                className={"rounded-xl"}
                priority
            />
          </div>
        </div>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-lg">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-green-700 to-green-900 text-white p-4">
        <div className="w-40 h-40 bg-white rounded-lg flex items-center justify-center mb-8">
          <div className="w-32 h-32 relative">
            <Image
                src="/icon.png"
                alt="Elearn Prepa Logo"
                layout="fill"
                className={"rounded-xl"}
                priority
            />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-center mb-4">
            Prêt à relever le challenge ?
        </h1>

        <p className="text-xl text-center mb-8">
          Concours Blanc | Elearn Prepa
        </p>

        <Link href="/concours-selection" className="bg-white text-green-600 px-6 py-3 rounded-lg text-lg font-semibold transition-transform transform hover:scale-105 shadow-lg">
          Commencer
        </Link>
      </div>
  );
}

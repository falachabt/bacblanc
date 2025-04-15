'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Image from 'next/image';
import Link from 'next/link';

export default function HomePage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  // Rediriger si déjà connecté
  useEffect(() => {
    if (!loading && user) {
      router.push('/exams');
    }
  }, [user, loading, router]);

  return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-green-600 to-green-400 text-white p-4">
        <div className="w-40 h-40 bg-white rounded-lg flex items-center justify-center mb-8">
          <div className="w-32 h-32 relative">
            <Image
                src="/images/logo.svg"
                alt="EZ Drive Logo"
                layout="fill"
                priority
            />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-center mb-4">
          Bienvenue sur EZ Drive
        </h1>

        <p className="text-xl text-center mb-8">
          Prêt à relever le challenge ?
        </p>

        <Link href="/bac-selection" className="bg-white text-green-600 px-6 py-3 rounded-lg text-lg font-semibold transition-transform transform hover:scale-105 shadow-lg">
          Commencer
        </Link>
      </div>
  );
}
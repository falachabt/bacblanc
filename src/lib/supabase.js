import { createClient } from '@supabase/supabase-js';

// Récupération des variables d'environnement pour la connexion à Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Vérification que les variables d'environnement sont définies
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Les variables d\'environnement Supabase ne sont pas définies.');
}

// Configuration pour utiliser le schéma concours_blanc par défaut
const supabaseOptions = {
  db: {
    schema: 'concours_blanc'
  }
};

// Création du client Supabase avec le schéma concours_blanc
export const supabase = createClient(supabaseUrl, supabaseAnonKey, supabaseOptions);

// Export d'une fonction pour créer un client Supabase avec des options personnalisées
export const createCustomClient = (options) => {
  const mergedOptions = {
    ...supabaseOptions,
    ...options,
    db: {
      ...supabaseOptions.db,
      ...(options?.db || {})
    }
  };
  return createClient(supabaseUrl, supabaseAnonKey, mergedOptions);
};

export default supabase;
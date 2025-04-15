import { createClient } from '@supabase/supabase-js';

// Récupération des variables d'environnement pour la connexion à Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Vérification que les variables d'environnement sont définies
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Les variables d\'environnement Supabase ne sont pas définies.');
}

// Création du client Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Export d'une fonction pour créer un client Supabase avec des options personnalisées
export const createCustomClient = (options) => {
  return createClient(supabaseUrl, supabaseAnonKey, options);
};

export default supabase;

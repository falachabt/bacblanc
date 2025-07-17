import { createClient } from '@supabase/supabase-js';

// Récupération des variables d'environnement pour la connexion à Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Vérification que les variables d'environnement sont définies
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Les variables d\'environnement Supabase ne sont pas définies.');
}

// Création du client Supabase avec la configuration par défaut ou un client factice en mode démo
export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : {
      from: () => ({
        select: () => ({
          eq: () => ({ data: null, error: new Error('Supabase not configured') }),
          order: () => ({ data: null, error: new Error('Supabase not configured') }),
        }),
        insert: () => ({
          select: () => ({
            single: () => ({ data: null, error: new Error('Supabase not configured') })
          })
        }),
        update: () => ({
          eq: () => ({
            select: () => ({
              single: () => ({ data: null, error: new Error('Supabase not configured') })
            })
          })
        }),
        delete: () => ({
          eq: () => ({ error: new Error('Supabase not configured') })
        })
      })
    };

// Export d'une fonction pour créer un client Supabase avec des options personnalisées
export const createCustomClient = (options) => {
  if (!supabaseUrl || !supabaseAnonKey) {
    return supabase; // Return the mock client
  }
  return createClient(supabaseUrl, supabaseAnonKey, options);
};

export default supabase;
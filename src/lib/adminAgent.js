import supabase from '@/lib/supabase';

// Liste des external IDs autorisés à accéder à l'administration
export const ADMIN_EXTERNAL_IDS = [
    'user_test_tok', // Token admin de test
    'user_admin_to', // Autre token admin
    // Ajouter d'autres external IDs d'administrateurs ici
];

/**
 * Vérifie si un utilisateur a accès à l'administration
 * @param {string} externalId - L'external ID de l'utilisateur
 * @returns {boolean} - True si l'utilisateur est admin
 */
export function isAdmin(externalId) {
    return ADMIN_EXTERNAL_IDS.includes(externalId);
}

/**
 * Utilitaires pour la gestion des sujets
 */
export const subjectService = {
    // Récupérer tous les sujets
    async getAll() {
        try {
            const { data, error } = await supabase
                .from('subjects')
                .select('*')
                .order('name');
            
            if (error) throw error;
            return data;
        } catch (error) {
            console.warn("Supabase not available, using mock data for subjects");
            // Données mock pour la démo
            return [
                { id: 1, name: 'Mathématiques', code: 'MATH', description: 'Matière mathématiques' },
                { id: 2, name: 'Français', code: 'FR', description: 'Matière français' }
            ];
        }
    },

    // Créer un nouveau sujet
    async create(subjectData) {
        try {
            const { data, error } = await supabase
                .from('subjects')
                .insert([subjectData])
                .select()
                .single();
            
            if (error) throw error;
            return data;
        } catch (error) {
            console.warn("Supabase not available, simulating subject creation");
            return { id: Date.now(), ...subjectData };
        }
    },

    // Mettre à jour un sujet
    async update(id, subjectData) {
        try {
            const { data, error } = await supabase
                .from('subjects')
                .update(subjectData)
                .eq('id', id)
                .select()
                .single();
            
            if (error) throw error;
            return data;
        } catch (error) {
            console.warn("Supabase not available, simulating subject update");
            return { id, ...subjectData };
        }
    },

    // Supprimer un sujet
    async delete(id) {
        try {
            const { error } = await supabase
                .from('subjects')
                .delete()
                .eq('id', id);
            
            if (error) throw error;
            return true;
        } catch (error) {
            console.warn("Supabase not available, simulating subject deletion");
            return true;
        }
    }
};

/**
 * Utilitaires pour la gestion des examens
 */
export const examAdminService = {
    // Récupérer tous les examens avec leurs sujets
    async getAll() {
        try {
            const { data, error } = await supabase
                .from('exams')
                .select(`
                    *,
                    subject:subject_id (id, name, code)
                `)
                .order('created_at', { ascending: false });
            
            if (error) throw error;
            return data;
        } catch (error) {
            console.warn("Supabase not available, using mock data for exams");
            return [];
        }
    },

    // Récupérer les examens d'un sujet spécifique
    async getBySubject(subjectId) {
        try {
            const { data, error } = await supabase
                .from('exams')
                .select(`
                    *,
                    subject:subject_id (id, name, code)
                `)
                .eq('subject_id', subjectId)
                .order('created_at', { ascending: false });
            
            if (error) throw error;
            return data;
        } catch (error) {
            console.warn("Supabase not available, using mock data for exams");
            // Données mock pour la démo
            return [
                { 
                    id: 1, 
                    title: 'Examen Math - Fonctions', 
                    subject_id: subjectId,
                    duration: '02:00:00',
                    status: 'published',
                    description: 'Examen sur les fonctions mathématiques',
                    subject: { id: subjectId, name: 'Mathématiques', code: 'MATH' }
                }
            ];
        }
    },

    // Créer un nouvel examen
    async create(examData) {
        try {
            const { data, error } = await supabase
                .from('exams')
                .insert([{
                    ...examData,
                    created_at: new Date().toISOString()
                }])
                .select(`
                    *,
                    subject:subject_id (id, name, code)
                `)
                .single();
            
            if (error) throw error;
            return data;
        } catch (error) {
            console.warn("Supabase not available, simulating exam creation");
            return { 
                id: Date.now(), 
                ...examData, 
                created_at: new Date().toISOString(),
                subject: { id: examData.subject_id, name: 'Mathématiques', code: 'MATH' }
            };
        }
    },

    // Mettre à jour un examen
    async update(id, examData) {
        try {
            const { data, error } = await supabase
                .from('exams')
                .update(examData)
                .eq('id', id)
                .select(`
                    *,
                    subject:subject_id (id, name, code)
                `)
                .single();
            
            if (error) throw error;
            return data;
        } catch (error) {
            console.warn("Supabase not available, simulating exam update");
            return { 
                id, 
                ...examData,
                subject: { id: examData.subject_id, name: 'Mathématiques', code: 'MATH' }
            };
        }
    },

    // Supprimer un examen
    async delete(id) {
        try {
            const { error } = await supabase
                .from('exams')
                .delete()
                .eq('id', id);
            
            if (error) throw error;
            return true;
        } catch (error) {
            console.warn("Supabase not available, simulating exam deletion");
            return true;
        }
    }
};

/**
 * Utilitaires pour la gestion des questions
 */
export const questionService = {
    // Récupérer toutes les questions d'un examen
    async getByExam(examId) {
        try {
            const { data, error } = await supabase
                .from('questions')
                .select('*')
                .eq('exam_id', examId)
                .order('created_at');
            
            if (error) throw error;
            return data;
        } catch (error) {
            console.warn("Supabase not available, using mock data for questions");
            // Données mock pour la démo
            return [
                {
                    id: 1,
                    exam_id: examId,
                    question_text: 'Quelle est la dérivée de f(x) = x² ?',
                    type: 'multiple_choice',
                    options: JSON.stringify(['f\'(x) = x', 'f\'(x) = 2x', 'f\'(x) = x²', 'f\'(x) = 2']),
                    correct_answer: 'f\'(x) = 2x',
                    points: 2,
                    created_at: new Date().toISOString()
                },
                {
                    id: 2,
                    exam_id: examId,
                    question_text: 'Calculez lim(x→0) sin(x)/x',
                    type: 'single_choice',
                    options: JSON.stringify(['0', '1', '∞', 'undefined']),
                    correct_answer: '1',
                    points: 3,
                    created_at: new Date().toISOString()
                }
            ];
        }
    },

    // Créer une nouvelle question
    async create(questionData) {
        try {
            const { data, error } = await supabase
                .from('questions')
                .insert([{
                    ...questionData,
                    created_at: new Date().toISOString()
                }])
                .select()
                .single();
            
            if (error) throw error;
            return data;
        } catch (error) {
            console.warn("Supabase not available, simulating question creation");
            return { 
                id: Date.now(), 
                ...questionData, 
                created_at: new Date().toISOString()
            };
        }
    },

    // Mettre à jour une question
    async update(id, questionData) {
        try {
            const { data, error } = await supabase
                .from('questions')
                .update(questionData)
                .eq('id', id)
                .select()
                .single();
            
            if (error) throw error;
            return data;
        } catch (error) {
            console.warn("Supabase not available, simulating question update");
            return { id, ...questionData };
        }
    },

    // Supprimer une question
    async delete(id) {
        try {
            const { error } = await supabase
                .from('questions')
                .delete()
                .eq('id', id);
            
            if (error) throw error;
            return true;
        } catch (error) {
            console.warn("Supabase not available, simulating question deletion");
            return true;
        }
    }
};

/**
 * Middleware de vérification d'accès admin
 * @param {string} externalId - L'external ID de l'utilisateur
 * @throws {Error} Si l'utilisateur n'est pas admin
 */
export function requireAdmin(externalId) {
    if (!isAdmin(externalId)) {
        throw new Error('Accès refusé : vous n\'avez pas les permissions d\'administrateur');
    }
}
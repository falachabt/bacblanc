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
        const { data, error } = await supabase
            .from('subjects')
            .select('*')
            .order('name');
        
        if (error) throw error;
        return data;
    },

    // Créer un nouveau sujet
    async create(subjectData) {
        const { data, error } = await supabase
            .from('subjects')
            .insert([subjectData])
            .select()
            .single();
        
        if (error) throw error;
        return data;
    },

    // Mettre à jour un sujet
    async update(id, subjectData) {
        const { data, error } = await supabase
            .from('subjects')
            .update(subjectData)
            .eq('id', id)
            .select()
            .single();
        
        if (error) throw error;
        return data;
    },

    // Supprimer un sujet
    async delete(id) {
        const { error } = await supabase
            .from('subjects')
            .delete()
            .eq('id', id);
        
        if (error) throw error;
        return true;
    }
};

/**
 * Utilitaires pour la gestion des examens
 */
export const examAdminService = {
    // Récupérer tous les examens avec leurs sujets
    async getAll() {
        const { data, error } = await supabase
            .from('exams')
            .select(`
                *,
                subject:subject_id (id, name, code)
            `)
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        return data;
    },

    // Récupérer les examens d'un sujet spécifique
    async getBySubject(subjectId) {
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
    },

    // Créer un nouvel examen
    async create(examData) {
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
    },

    // Mettre à jour un examen
    async update(id, examData) {
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
    },

    // Supprimer un examen
    async delete(id) {
        const { error } = await supabase
            .from('exams')
            .delete()
            .eq('id', id);
        
        if (error) throw error;
        return true;
    }
};

/**
 * Utilitaires pour la gestion des questions
 */
export const questionService = {
    // Récupérer toutes les questions d'un examen
    async getByExam(examId) {
        const { data, error } = await supabase
            .from('questions')
            .select('*')
            .eq('exam_id', examId)
            .order('created_at');
        
        if (error) throw error;
        return data;
    },

    // Créer une nouvelle question
    async create(questionData) {
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
    },

    // Mettre à jour une question
    async update(id, questionData) {
        const { data, error } = await supabase
            .from('questions')
            .update(questionData)
            .eq('id', id)
            .select()
            .single();
        
        if (error) throw error;
        return data;
    },

    // Supprimer une question
    async delete(id) {
        const { error } = await supabase
            .from('questions')
            .delete()
            .eq('id', id);
        
        if (error) throw error;
        return true;
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
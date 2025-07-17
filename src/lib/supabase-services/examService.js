import supabase from '@/lib/supabase';

export const examService = {
    // Récupérer tous les examens
    async getExams() {
        const {data, error} = await supabase
            .from('exams')
            .select(`
        *,
        subject:subject_id (id, name, code),
        questions (*)
              `)
            .eq('status', 'published')
            .order('available_at');

        if (error) throw error;
        return data;
    },

    // Récupérer un examen avec ses questions
    async getExamById(examId) {
        console.log("Exam ID:", examId);
        const {data, error} = await supabase
            .from('exams')
            .select(`
        *,
        subject:subject_id (id, name, code), 
        questions (*)
      `)
            .eq('id', examId)
            .single();

        if (error) throw error;


        return {...data};
    },

    // Vérifier si l'examen est terminé
    async isExamCompleted(userId, examId) {
        const {data, error} = await supabase
            .from('exam_attempts')
            .select('id')
            .eq('user_id', userId)
            .eq('exam_id', examId)
            .not('completed_at', 'is', null)
            .single();

        if (error && error.code !== 'PGRST116') throw error;
        return !!data;
    },

    // Récupérer un examen en cours
    async getExamProgress(userId, examId) {
        const {data, error} = await supabase
            .from('exam_attempts')
            .select('*')
            .eq('user_id', userId)
            .eq('exam_id', examId)
            .is('completed_at', null)
            .single();

        if (error && error.code !== 'PGRST116') throw error;
        return data;
    },

    // Démarrer un nouvel examen
    async startExam(userId, examId, questionOrder) {
        const {data, error} = await supabase
            .from('exam_attempts')
            .insert({
                user_id: userId,
                exam_id: examId,
                question_order: questionOrder,
                answers: {}
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // Sauvegarder la progression
    async saveProgress(userId, examId, answers, last_open_question, timeLeft, timestamp) {
        console.log("Saving progress with params:", {userId, examId, answers, last_open_question, timeLeft});
        // Vérifier s'il existe une tentative en cours
        const {data: attempt, error: attemptError} = await supabase
            .from('exam_attempts')
            .select('id')
            .eq('user_id', userId)
            .eq('exam_id', examId)
            .is('completed_at', null)
            .single();

        if (attemptError && attemptError.code !== 'PGRST116') throw attemptError;

        if (attempt) {
            // Mettre à jour la tentative existante
            const {data, error} = await supabase
                .from('exam_attempts')
                .update({
                    answers, 
                    last_open_question, 
                    timeLeft: timeLeft || null,
                    updated_at: new Date()
                })
                .eq('id', attempt.id)
                .select()
                .single();

            if (error) throw error;
            console.log("Progress updated successfully:", data);
            return data;
        } else {
            // Créer une nouvelle tentative avec les données initiales
            const {data, error} = await supabase
                .from('exam_attempts')
                .insert({
                    user_id: userId,
                    exam_id: examId,
                    answers: answers || {},
                    last_open_question: last_open_question || 0,
                    timeLeft: timeLeft || null,
                    started_at: new Date()
                })
                .select()
                .single();

            if (error) throw error;
            console.log("New attempt created successfully:", data);
            return data;
        }
    },

    // Terminer un examen
    async completeExam(userId, examId, score, answers) {
        const {data, error} = await supabase
            .from('exam_attempts')
            .update({
                completed_at: new Date(),
                score,
                answers
            })
            .eq('user_id', userId)
            .eq('exam_id', examId)
            .is('completed_at', null)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // Récupérer les résultats d'un examen
    async getExamResult(userId, examId) {
        const {data, error} = await supabase
            .from('exam_attempts')
            .select('*')
            .eq('user_id', userId)
            .eq('exam_id', examId)
            .not('completed_at', 'is', null)
            .order('completed_at', {ascending: false})
            .limit(1)
            .single();

        if (error && error.code !== 'PGRST116') throw error;
        return data;
    },

    // Récupérer tous les examens complétés
    async getCompletedExams(userId) {
        const {data, error} = await supabase
            .from('exam_attempts')
            .select(`
        *,
        exam:exam_id (
          id,
          title,
          subject:subject_id (id, name, code)
        )
      `)
            .eq('user_id', userId)
            .not('completed_at', 'is', null)
            .order('completed_at', {ascending: false});

        if (error) throw error;
        return data;
    },

    // Récupérer tous les examens en cours
    async getExamsInProgress(userId) {
        const {data, error} = await supabase
            .from('exam_attempts')
            .select(`
        *,
        exam:exam_id (
          id,
          title,
          subject:subject_id (id, name, code)
        )
      `)
            .eq('user_id', userId)
            .is('completed_at', null)
            .order('started_at', {ascending: false});

        if (error) throw error;
        return data;
    }
};

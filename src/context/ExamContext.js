// src/context/ExamContext.js
'use client';

import { createContext, useState, useEffect, useContext } from 'react';
import { useTokenAuth } from '@/context/TokenAuthContext';
import { examService } from '@/lib/supabase-services/examService';
import { convertDurationToSeconds, calculateExamResults } from '@/utils/examUtils';

// Create context
const ExamContext = createContext(null);

export function ExamProvider({ children }) {
    // Safely get auth context
    let user = null;
    
    try {
        const auth = useTokenAuth();
        user = auth.user;
    } catch (error) {
        console.warn('ExamProvider: TokenAuth context not available');
    }
    
    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [randomizedQuestions, setRandomizedQuestions] = useState({});

    // Charger les examens au montage
    useEffect(() => {
        const loadExams = async () => {
            if (!user) return;

            setLoading(true);
            try {
                const examData = await examService.getExams();
                setExams(examData);
            } catch (err) {
                console.error('Error loading exams:', err);
                setError('Impossible de charger les examens. Veuillez rafraîchir la page.');
            } finally {
                setLoading(false);
            }
        };

        loadExams();
    }, [user]);

    // Randomize questions for an exam
    const randomizeExamQuestions = (questions) => {
        if (!questions || !questions.length) return [];
        return [...questions].sort(() => Math.random() - 0.5);
    };

    // Get exam by ID
    const getExamById = async (examId) => {
        // if (loading) return null;


        try {
            // Check cache first
            // const cachedExam = exams.find(exam => exam.id === examId);
            //
            //
            // if (cachedExam) {
            //     console.log(cachedExam);
            //     return cachedExam;
            // }

            // Fetch from API if not in cache
            const exam = await examService.getExamById(examId);
            console.log("Exam fetched from API:", exam);
            return exam;
        } catch (err) {
            console.error(`Error fetching exam ${examId}:`, err);
            return null;
        }
    };

    // Start an exam
    const startExam = async (examId) => {
        if (!user) {
            return { exam: null, error: "Vous devez être connecté pour commencer un examen" };
        }


        try {
            const exam = await getExamById(examId);
            if (!exam) {
                return { exam: null, error: "Examen non trouvé" };
            }

            // Check if already completed
            const isCompleted = await examService.isExamCompleted(user.id, examId);
            if (isCompleted) {
                return { exam, error: "Cet examen a déjà été complété", completed: true };
            }

            // Check for existing progress
            const progress = await examService.getExamProgress(user.id, examId);

            if (!progress) {
                // Start new exam with randomized questions
                const shuffledQuestions = randomizeExamQuestions(exam.questions);
                const questionOrder = shuffledQuestions.map(q => q.id);

                // Save to database
                await examService.startExam(user.id, examId, questionOrder);

                // Update cache
                setRandomizedQuestions(prev => ({
                    ...prev,
                    [examId]: shuffledQuestions
                }));

                return {
                    exam: { ...exam, questions: shuffledQuestions },
                    progress: {
                        currentQuestion: 0,
                        answers: {},
                        timeLeft: convertDurationToSeconds(exam.duration)
                    }
                };
            } else {
                // Return existing progress
                const questions = exam.questions;

                // If question order is stored, respect it
                if (progress.question_order && Array.isArray(progress.question_order)) {
                    const orderedQuestions = [];
                    progress.question_order.forEach(qId => {
                        const q = questions.find(question => question.id === qId);
                        if (q) orderedQuestions.push(q);
                    });

                    // Only use ordered questions if we found all of them
                    if (orderedQuestions.length === questions.length) {
                        // Update cache
                        setRandomizedQuestions(prev => ({
                            ...prev,
                            [examId]: orderedQuestions
                        }));

                        return {
                            exam: { ...exam, questions: orderedQuestions },
                            progress: {
                                currentQuestion: 0,
                                answers: progress.answers || {},
                                timeLeft: convertDurationToSeconds(exam.duration)
                            }
                        };
                    }
                }

                // Fallback: use exam questions as is
                return {
                    exam,
                    progress: {
                        currentQuestion: 0,
                        answers: progress.answers || {},
                        timeLeft: convertDurationToSeconds(exam.duration)
                    }
                };
            }
        } catch (err) {
            console.error("Error starting exam:", err);
            return { exam: null, error: "Erreur lors du démarrage de l'examen" };
        }
    };

    // Load existing progress
    const loadExamState = async (examId) => {
        if (!user) return null;
        try {
            return await examService.getExamProgress(user.id, examId);
        } catch (err) {
            console.error("Error loading exam state:", err);
            return null;
        }
    };

    // Save current progress
    const saveExamState = async (examId, progressData) => {
        if (!user) return false;
        try {
            console.log("Saving exam state with data:", progressData);
            await examService.saveProgress(
                user.id, 
                examId, 
                progressData.answers || {}, 
                progressData.currentQuestion || 0, 
                progressData.timeLeft, 
                progressData.timestamp
            );
            return true;
        } catch (err) {
            console.error("Error saving exam state:", err);
            return false;
        }
    };

    // Complete an exam
    const completeExam = async (examId, answers) => {
        if (!user) return null;
        try {
            const exam = await getExamById(examId);
            if (!exam) return null;

            // Calculate results
            const results = calculateExamResults(exam, answers);

            // Add answers to results for storage
            const resultsWithAnswers = {
                ...results,
                answers
            };

            // Save to database
            await examService.completeExam(user.id, examId, resultsWithAnswers);

            // Clear randomized questions
            setRandomizedQuestions(prev => {
                const newState = {...prev};
                delete newState[examId];
                return newState;
            });

            return results;
        } catch (err) {
            console.error("Error completing exam:", err);
            return null;
        }
    };

    // Get existing result
    const getExistingResult = async (examId) => {
        if (!user) return null;
        try {
            return await examService.getExamResult(user.id, examId);
        } catch (err) {
            console.error("Error getting exam result:", err);
            return null;
        }
    };

    // Check if exam is completed
    const isExamCompleted = async (examId) => {
        if (!user) return false;
        try {
            return await examService.isExamCompleted(user.id, examId);
        } catch (err) {
            console.error("Error checking if exam is completed:", err);
            return false;
        }
    };

    // Check if exam is in progress
    const isExamInProgress = async (examId) => {
        if (!user) return false;
        try {
            const progress = await examService.getExamProgress(user.id, examId);
            return !!progress;
        } catch (err) {
            console.log("Error checking if exam is in progress:", err);
            return false;
        }
    };

    // Get all completed exams
    const getCompletedExams = async () => {
        if (!user) return [];
        try {
            return await examService.getCompletedExams(user.id);
        } catch (err) {
            console.error("Error getting completed exams:", err);
            return [];
        }
    };

    // Get all exams in progress
    const getExamsInProgress = async () => {
        if (!user) return [];
        try {
            return await examService.getExamsInProgress(user.id);
        } catch (err) {
            console.error("Error getting exams in progress:", err);
            return [];
        }
    };

    const value = {
        exams,
        loading,
        error,
        getExamById,
        startExam,
        loadExamState,
        saveExamState,
        completeExam,
        getExistingResult,
        isExamCompleted,
        isExamInProgress,
        getCompletedExams,
        getExamsInProgress
    };

    return <ExamContext.Provider value={value}>{children}</ExamContext.Provider>;
}

export function useExam() {
    const context = useContext(ExamContext);
    if (context === null) {
        throw new Error('useExam must be used within an ExamProvider');
    }
    return context;
}
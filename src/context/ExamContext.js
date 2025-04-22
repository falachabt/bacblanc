'use client';

import { createContext, useState, useEffect, useContext } from 'react';
import { initMockExamsData } from '@/lib/mockExamsData';
import {
    saveExamProgress,
    loadExamProgress,
    saveExamResult,
    getExamResult,
    hasCompletedExam,
    calculateExamResults,
    convertDurationToSeconds
} from '@/utils/examUtils';

// Create context
const ExamContext = createContext(null);

export function ExamProvider({ children }) {
    // Initialiser avec un tableau vide au lieu de undefined
    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentExam, setCurrentExam] = useState(null);
    const [randomizedQuestions, setRandomizedQuestions] = useState({});

    // Un seul useEffect pour initialiser les données
    useEffect(() => {
        const loadExams = async () => {
            setLoading(true);
            try {
                // Add slight delay to simulate API call
                await new Promise(resolve => setTimeout(resolve, 500));

                // Vérifier si les examens existent déjà
                let examData = localStorage.getItem('exams_data');

                // Sinon, initialiser avec des données mockées
                if (!examData) {
                    console.log("Initialisation des données d'examens");
                    const mockExams = initMockExamsData();
                    setExams(mockExams);
                    // Sauvegarder les données dans le localStorage pour la prochaine fois
                    localStorage.setItem('exams_data', JSON.stringify(mockExams));
                } else {
                    console.log("Chargement des examens existants");
                    setExams(JSON.parse(examData));
                }
            } catch (err) {
                console.error('Error loading exams:', err);
                setError('Impossible de charger les examens. Veuillez rafraîchir la page.');
                // En cas d'erreur, essayer de charger les données mockées
                const mockExams = initMockExamsData();
                setExams(mockExams);
            } finally {
                setLoading(false);
            }
        };

        loadExams();
    }, []);

    // Get exam by ID
    const getExamById = (examId) => {
        // Si les examens sont en cours de chargement, renvoyer null
        if (loading) {
            console.log("Les examens sont en cours de chargement");
            return null;
        }

        // Trouver l'examen de base
        let baseExam = exams.find(exam => exam.id === examId);

        if (!baseExam) {
            // Si l'examen n'est pas trouvé dans les examens chargés,
            // essayer de le trouver dans les données mockées
            let tempExam = initMockExamsData().find(exam => exam.id === examId);
            if (tempExam) {
                baseExam = tempExam;
            } else {
                console.error(`Exam with ID ${examId} not found`);
                return null;
            }
        }

        // Si nous avons déjà des questions randomisées pour cet examen, les utiliser
        if (randomizedQuestions[examId]) {
            return {
                ...baseExam,
                questions: randomizedQuestions[examId]
            };
        }

        // Sinon, renvoyer l'examen original
        return baseExam;
    };

    // Randomize questions for an exam - happens only when starting a new exam
    const randomizeExamQuestions = (examId) => {
        const exam = exams.find(e => e.id === examId);
        if (!exam) return null;

        // Créer une copie avec questions mélangées
        const shuffledQuestions = [...exam.questions].sort(() => Math.random() - 0.5);

        // Mettre à jour le cache des questions randomisées
        setRandomizedQuestions(prev => ({
            ...prev,
            [examId]: shuffledQuestions
        }));

        return shuffledQuestions;
    };

    // Start an exam and track progress
    const startExam = (examId) => {
        const exam = getExamById(examId);
        if (!exam) {
            console.error(`Exam with ID ${examId} not found`);
            return { exam: null, error: "Examen non trouvé" };
        }

        // Vérifier si l'examen a déjà été complété
        if (hasCompletedExam(examId)) {
            return { exam, error: "Cet examen a déjà été complété", completed: true };
        }

        // Check for existing progress
        const progress = loadExamProgress(examId);

        // Si pas de progression existante, c'est un nouvel examen - randomiser les questions
        if (!progress) {
            console.log("Nouveau démarrage d'examen, randomisation des questions");
            const randomizedQuestions = randomizeExamQuestions(examId);

            // Mettre à jour l'examen avec ces questions
            const updatedExam = {
                ...exam,
                questions: randomizedQuestions
            };

            setCurrentExam(updatedExam);

            // Initialize new progress
            const initialProgress = {
                examId,
                currentQuestion: 0,
                answers: {},
                flaggedQuestions: [],
                timeLeft: convertDurationToSeconds(exam.duration),
                timestamp: new Date().getTime()
            };
            saveExamProgress(examId, initialProgress);

            return { exam: updatedExam, progress: initialProgress };
        } else {
            // Si progression existante, utiliser l'examen tel quel
            console.log("Reprise d'un examen en cours");
            setCurrentExam(exam);
            return { exam, progress };
        }
    };

    // Load existing progress for an exam
    const loadExamState = (examId) => {
        return loadExamProgress(examId);
    };

    // Save current progress
    const saveExamState = (examId, progressData) => {
        return saveExamProgress(examId, progressData);
    };

    // Complete an exam and calculate results
    const completeExam = (examId, answers) => {
        const exam = getExamById(examId);
        if (!exam) {
            console.error(`Exam with ID ${examId} not found`);
            return null;
        }

        // Calculate results
        const results = calculateExamResults(exam, answers);

        // Save results
        saveExamResult(examId, results);

        // Clean up progress
        localStorage.removeItem(`exam_progress_${examId}`);

        // Clear randomized questions for this exam
        setRandomizedQuestions(prev => {
            const newState = {...prev};
            delete newState[examId];
            return newState;
        });

        return results;
    };

    // Get existing result for a completed exam
    const getExistingResult = (examId) => {
        return getExamResult(examId);
    };

    // Check if exam is completed
    const isExamCompleted = (examId) => {
        return hasCompletedExam(examId);
    };

    // Check if exam is in progress
    const isExamInProgress = (examId) => {
        const progress = loadExamProgress(examId);
        return !!progress;
    };

    // Refresh exams list
    const refreshExams = async () => {
        setLoading(true);
        try {
            // Forcer la régénération des examens pour un rafraîchissement complet
            localStorage.removeItem('exams_data');

            // Add slight delay to simulate API call
            await new Promise(resolve => setTimeout(resolve, 500));

            // Reinitialize mock data
            const mockExams = initMockExamsData();
            setExams(mockExams);

            // Réinitialiser les questions randomisées
            setRandomizedQuestions({});
        } catch (err) {
            console.error('Error refreshing exams:', err);
            setError('Impossible de rafraîchir les examens. Veuillez réessayer.');
        } finally {
            setLoading(false);
        }
    };

    // Get exams by subject
    const getExamsBySubject = (subjectCode) => {
        if (!subjectCode || subjectCode === 'all') {
            return exams;
        }
        return exams.filter(exam => exam.subject?.code === subjectCode);
    };

    // Search exams
    const searchExams = (query) => {
        if (!query || query.trim() === '') {
            return exams;
        }

        const normalizedQuery = query.toLowerCase().trim();
        return exams.filter(exam =>
            exam.title.toLowerCase().includes(normalizedQuery) ||
            exam.subject?.name.toLowerCase().includes(normalizedQuery) ||
            exam.description?.toLowerCase().includes(normalizedQuery)
        );
    };

    // Check exam availability status for UI display
    const getExamStatus = (examId) => {
        if (isExamCompleted(examId)) {
            return 'completed';
        }
        if (isExamInProgress(examId)) {
            return 'in-progress';
        }
        return 'available';
    };

    // Get all completed exams
    const getCompletedExams = () => {
        const completed = [];
        exams.forEach(exam => {
            if (isExamCompleted(exam.id)) {
                const result = getExistingResult(exam.id);
                if (result) {
                    completed.push({
                        exam,
                        result
                    });
                }
            }
        });
        // Sort by date (most recent first)
        completed.sort((a, b) => new Date(b.result.date) - new Date(a.result.date));
        return completed;
    };

    // Get all exams in progress
    const getExamsInProgress = () => {
        const inProgress = [];
        exams.forEach(exam => {
            if (isExamInProgress(exam.id) && !isExamCompleted(exam.id)) {
                const progress = loadExamProgress(exam.id);
                if (progress) {
                    inProgress.push({
                        exam,
                        progress
                    });
                }
            }
        });
        // Sort by timestamp (most recent first)
        inProgress.sort((a, b) => b.progress.timestamp - a.progress.timestamp);
        return inProgress;
    };

    const value = {
        exams,
        loading,
        error,
        currentExam,
        getExamById,
        startExam,
        loadExamState,
        saveExamState,
        completeExam,
        getExistingResult,
        isExamCompleted,
        isExamInProgress,
        refreshExams,
        getExamsBySubject,
        searchExams,
        getExamStatus,
        getCompletedExams,
        getExamsInProgress
    };

    return <ExamContext.Provider value={value}>{children}</ExamContext.Provider>;
}

// Custom hook to use the exam context
export function useExam() {
    const context = useContext(ExamContext);
    if (context === null) {
        throw new Error('useExam must be used within an ExamProvider');
    }
    return context;
}
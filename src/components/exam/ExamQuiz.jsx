'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useExam } from '@/context/ExamContext';
import {
    Clock, ChevronLeft, ChevronRight, AlertTriangle,
    CheckCircle, XCircle, AlertCircle, Bookmark,
    BookmarkCheck, ArrowLeft, Check, X
} from 'lucide-react';
import ConfirmationModal from './ConfirmationModal';
import QuestionDisplay from './QuestionDisplay';
import ResultsScreen from './ResultsScreen';
import { convertDurationToSeconds, formatTime } from '@/utils/examUtils';

export default function ExamQuiz({ exam, onBack }) {
    const router = useRouter();
    const { loadExamState, saveExamState, completeExam } = useExam();

    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [flaggedQuestions, setFlaggedQuestions] = useState([]);
    const [timeLeft, setTimeLeft] = useState(null);
    const [intervalId, setIntervalId] = useState(null);
    const [isFinished, setIsFinished] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const [showConfirmFinish, setShowConfirmFinish] = useState(false);
    const [showConfirmQuit, setShowConfirmQuit] = useState(false);
    const [showTimeWarning, setShowTimeWarning] = useState(false);
    const [examResult, setExamResult] = useState(null);
    const [autoSaving, setAutoSaving] = useState(false); // État pour indiquer une sauvegarde en cours
    const [lastSaveTime, setLastSaveTime] = useState(null); // Heure de la dernière sauvegarde

    // Références pour le timer et le défilement
    const timerRef = useRef(null);
    const questionContainerRef = useRef(null);
    const autoSaveIntervalRef = useRef(null);



    // Convertir correctement la durée de l'examen en secondes
    const getDurationInSeconds = (durationStr) => {
        // Regex pour extraire les heures et minutes (format 2h30)
        const match = durationStr?.match(/(\d+)h(\d+)?/);
        if (match) {
            const hours = parseInt(match[1], 10) || 0;
            const minutes = parseInt(match[2], 10) || 0;
            return (hours * 3600) + (minutes * 60);
        }
        // Par défaut, retourner 1 heure
        return 3600;
    };


    async function loadExam() {
        console.log("Chargement de l'examen:", exam.title, "avec durée:", exam.duration);

        // Charger la progression sauvegardée
        const savedProgress = await loadExamState(exam.id);

        if (savedProgress) {
            console.log("Progression sauvegardée trouvée:", savedProgress);

            try {
                setCurrentQuestionIndex(savedProgress.last_open_question || 0);
                setAnswers(savedProgress.answers || {});
                setFlaggedQuestions(savedProgress.flaggedQuestions || []);

                // Si le temps restant est sauvegardé et valide, l'utiliser
                if (savedProgress.timeLeft && savedProgress.timeLeft > 0) {
                    console.log("Utilisation du temps sauvegardé:", savedProgress.timeLeft);
                    setTimeLeft(savedProgress.timeLeft);
                } else {
                    // Sinon, initialiser avec la durée complète de l'examen
                    const durationSeconds = getDurationInSeconds(exam.duration);
                    console.log("Initialisation du timer à la durée complète:", durationSeconds);
                    setTimeLeft(durationSeconds);

                    // Sauvegarder immédiatement avec le temps initialisé
                    // saveProgress(durationSeconds);
                }

                setLastSaveTime(new Date().getTime());
            } catch (e) {
                console.error("Error parsing saved progress", e);
                initializeExam();
            }
        } else {
            console.log("Aucune progression trouvée, initialisation d'un nouvel examen");
            initializeExam();
        }



    }


    // Charger l'examen et initialiser le timer
    useEffect(() => {
        if (!exam) return;


        loadExam();

        // Commencer le timer
        const interval = setInterval(() => {
            setTimeLeft(prevTime => {
                if (prevTime <= 0) {
                    clearInterval(interval);
                    handleTimeUp();
                    return 0;
                }

                // Afficher un avertissement quand il reste 5 minutes
                if (prevTime === 300) {
                    setShowTimeWarning(true);
                    setTimeout(() => setShowTimeWarning(false), 10000); // Masquer après 10 secondes
                }

                return prevTime - 1;
            });
        }, 1000);

        setIntervalId(interval);


        // Nettoyage à la sortie
        return () => {
            if (interval) clearInterval(interval);
            if (autoSaveIntervalRef.current) clearInterval(autoSaveIntervalRef.current);
        };
    }, [exam]);

    // Configurer la sauvegarde automatique toutes les 5 secondes
    useEffect(() => {
        // Ne pas démarrer la sauvegarde auto si l'examen est terminé
        if (isFinished) {
            if (autoSaveIntervalRef.current) {
                clearInterval(autoSaveIntervalRef.current);
            }
            return;
        }

        const autoSaveInterval = setInterval(() => {
            // Sauvegarde toutes les 5 secondes
            saveProgress();
        }, 5000);

        autoSaveIntervalRef.current = autoSaveInterval;

        return () => {
            if (autoSaveIntervalRef.current) {
                clearInterval(autoSaveIntervalRef.current);
            }
        };
    }, [answers, currentQuestionIndex, flaggedQuestions, timeLeft, isFinished]);

    // Initialiser l'examen
    const initializeExam = async () => {
        // Obtenir la durée de l'examen en secondes
        await loadExam()
    };

    // Gérer la fin du temps
    const handleTimeUp = () => {
        console.log("Temps écoulé, soumission automatique de l'examen");
        setIsFinished(true);
        clearInterval(intervalId);
        if (autoSaveIntervalRef.current) {
            clearInterval(autoSaveIntervalRef.current);
        }
        calculateResults();
    };

    // Navigation entre les questions
    const goToNextQuestion = () => {
        if (currentQuestionIndex < exam.questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        }
    };

    const goToPreviousQuestion = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(currentQuestionIndex - 1);
        }
    };

    const goToQuestion = (index) => {
        if (index >= 0 && index < exam.questions.length) {
            setCurrentQuestionIndex(index);
        }
    };

    // Marquer une question
    const toggleFlagQuestion = (index) => {
        const questionIndex = index !== undefined ? index : currentQuestionIndex;
        setFlaggedQuestions(prev => {
            const newFlags = prev.includes(questionIndex)
                ? prev.filter(idx => idx !== questionIndex)
                : [...prev, questionIndex];

            // Sauvegarder après marquage/démarquage
            saveProgress(undefined, undefined, newFlags);
            return newFlags;
        });
    };

    // Enregistrer une réponse
    const handleAnswer = (questionId, answer) => {
        setAnswers(prev => {
            const newAnswers = {
                ...prev,
                [questionId]: answer
            };

            // Sauvegarder après chaque réponse
            saveProgress(undefined, newAnswers);
            return newAnswers;
        });
    };

    // Sauvegarder la progression actuelle
    const saveProgress = (currentTimeLeft, currentAnswers, currentFlags) => {
        setAutoSaving(true);
        try {
            // Utiliser les valeurs passées ou les valeurs de l'état actuel
            const timeToSave = currentTimeLeft !== undefined ? currentTimeLeft : timeLeft;
            const answersToSave = currentAnswers || answers;
            const flagsToSave = currentFlags || flaggedQuestions;

            console.log("Sauvegarde de la progression - Temps restant:", timeToSave);

            saveExamState(exam.id, {
                currentQuestion: currentQuestionIndex,
                answers: answersToSave,
                flaggedQuestions: flagsToSave,
                timeLeft: timeToSave,
                timestamp: new Date()
            });

            // Mettre à jour l'heure de la dernière sauvegarde
            setLastSaveTime(new Date().getTime());
        } catch (e) {
            console.error("Error saving progress", e);
        } finally {
            // Attendre un court délai avant de masquer l'indicateur de sauvegarde
            setTimeout(() => setAutoSaving(false), 1000);
        }
    };

    // Calculer les résultats de l'examen
    const calculateResults = () => {
        const results = completeExam(exam.id, answers);
        setExamResult(results);
        console.log("Résultats de l'examen:", results);
        setShowResults(true);
        router.push("/exam-result/" + exam.id);
        return results;

    };

    // Terminer l'examen
    const finishExam = () => {
        setIsFinished(true);
        clearInterval(intervalId);
        if (autoSaveIntervalRef.current) {
            clearInterval(autoSaveIntervalRef.current);
        }
        calculateResults();
    };

    // Quitter l'examen sans terminer
    const quitExam = () => {
        saveProgress();
        onBack();
    };

    // Si les résultats sont affichés
    if (showResults) {
        return <ResultsScreen
            result={examResult}
            exam={exam}
            onBackToDetail={onBack}
        />;
    }

    // Question actuelle
    // console.log("exam questions" , exam.questions);
    const currentQuestion = exam?.questions && exam?.questions[currentQuestionIndex];
    if (!currentQuestion) return <div>Question non trouvée</div>;

    return (
        <div className="bg-gray-50 min-h-screen">
            {/* En-tête fixe */}
            <div className="sticky top-0 z-10 bg-white shadow-md border-b">
                <div className="container mx-auto px-4 py-3">
                    <div className="flex justify-between items-center">
                        <button
                            onClick={() => setShowConfirmQuit(true)}
                            className="text-gray-600 hover:text-gray-800 flex items-center"
                        >
                            <ArrowLeft className="h-5 w-5 mr-1" />
                            <span className="hidden sm:inline">Quitter</span>
                        </button>

                        <div className="text-center">
                            <h1 className="text-lg font-bold text-gray-800 hidden sm:block">{exam.title}</h1>
                            <div className="text-sm text-gray-600">
                                Question {currentQuestionIndex + 1} / {exam.questions.length}
                            </div>
                        </div>

                        <div className={`flex items-center font-mono text-lg font-bold ${
                            timeLeft < 300 ? 'text-red-600' : 'text-green-600'
                        }`}>
                            <Clock className="h-5 w-5 mr-1" />
                            {formatTime(timeLeft)}
                        </div>
                    </div>

                    {/* Barre de progression */}
                    <div className="mt-2 h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-green-600"
                            style={{ width: `${Math.round((Object.keys(answers).length / exam.questions.length) * 100)}%` }}
                        />
                    </div>

                    {/* Indicateur de sauvegarde automatique */}
                    <div className="flex justify-end mt-1">
                        <div className={`text-xs text-gray-500 flex items-center transition-opacity ${
                            autoSaving ? 'opacity-100' : 'opacity-0'
                        }`}>
                            <div className="h-2 w-2 bg-green-500 rounded-full mr-1 animate-pulse"></div>
                            Sauvegarde automatique...
                        </div>
                    </div>
                </div>
            </div>

            {/* Alerte de temps limité */}
            {showTimeWarning && (
                <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-red-50 border border-red-300 rounded-md p-3 shadow-lg w-11/12 max-w-md animate-pulse">
                    <div className="flex items-start">
                        <AlertTriangle className="h-5 w-5 text-red-600 mr-2 flex-shrink-0" />
                        <div>
                            <h3 className="text-red-800 font-medium text-sm">Attention ! Il vous reste moins de 5 minutes.</h3>
                            <p className="text-red-700 text-xs mt-1">Assurez-vous de terminer votre examen à temps.</p>
                        </div>
                        <button
                            onClick={() => setShowTimeWarning(false)}
                            className="ml-auto text-red-600 hover:text-red-800"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            )}

            {/* Contenu principal */}
            <div className="container mx-auto px-4 py-6" ref={questionContainerRef}>
                <div className="bg-white rounded-lg shadow-md p-4 md:p-6 mb-6">
                    {/* Affichage de la question */}
                    <div className="flex justify-between items-start mb-2">
                        <h2 className="text-lg font-semibold text-gray-800">
                            Question {currentQuestionIndex + 1}
                            <span className="ml-2 text-sm font-normal text-gray-500">
                                ({currentQuestion.points} point{currentQuestion.points > 1 ? 's' : ''})
                            </span>
                        </h2>
                        <button
                            onClick={() => toggleFlagQuestion()}
                            className={`flex items-center text-sm ${
                                flaggedQuestions.includes(currentQuestionIndex)
                                    ? 'text-amber-600'
                                    : 'text-gray-500 hover:text-amber-600'
                            }`}
                        >
                            {flaggedQuestions.includes(currentQuestionIndex) ? (
                                <BookmarkCheck className="h-5 w-5 mr-1" />
                            ) : (
                                <Bookmark className="h-5 w-5 mr-1" />
                            )}
                            <span className="hidden sm:inline">
                                {flaggedQuestions.includes(currentQuestionIndex) ? 'Marquée' : 'Marquer'}
                            </span>
                        </button>
                    </div>

                    {/* Composant d'affichage de question */}
                    <QuestionDisplay
                        question={currentQuestion}
                        userAnswer={answers[currentQuestion.id]}
                        onAnswer={(answer) => handleAnswer(currentQuestion.id, answer)}
                    />

                    {/* Navigation */}
                    <div className="flex justify-between mt-8">
                        <button
                            onClick={goToPreviousQuestion}
                            disabled={currentQuestionIndex === 0}
                            className={`flex items-center px-4 py-2 rounded-md ${
                                currentQuestionIndex === 0
                                    ? 'text-gray-400 cursor-not-allowed'
                                    : 'text-gray-700 hover:bg-gray-100'
                            }`}
                        >
                            <ChevronLeft className="h-5 w-5 mr-1" />
                            Précédente
                        </button>

                        <button
                            onClick={goToNextQuestion}
                            disabled={currentQuestionIndex === exam.questions.length - 1}
                            className={`flex items-center px-4 py-2 rounded-md ${
                                currentQuestionIndex === exam.questions.length - 1
                                    ? 'text-gray-400 cursor-not-allowed'
                                    : 'text-gray-700 hover:bg-gray-100'
                            }`}
                        >
                            Suivante
                            <ChevronRight className="h-5 w-5 ml-1" />
                        </button>
                    </div>
                </div>

                {/* Barre de navigation des questions */}
                <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
                    <h3 className="font-medium text-gray-800 mb-3">Toutes les questions</h3>
                    <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2 mb-4">
                        {exam.questions.map((question, index) => {
                            const isAnswered = !!answers[question.id];
                            const isFlagged = flaggedQuestions.includes(index);
                            const isCurrent = index === currentQuestionIndex;

                            return (
                                <button
                                    key={question.id}
                                    onClick={() => goToQuestion(index)}
                                    className={`w-full h-10 rounded-md flex items-center justify-center relative
                                        ${isCurrent ? 'ring-2 ring-blue-500' : ''}
                                        ${isAnswered
                                        ? 'bg-green-100 text-green-800 border border-green-300'
                                        : 'bg-gray-50 text-gray-700 border border-gray-300 hover:bg-gray-100'
                                    }
                                    `}
                                >
                                    <span>{index + 1}</span>
                                    {isFlagged && (
                                        <div className="absolute -top-1 -right-1">
                                            <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* Légende */}
                    <div className="flex flex-wrap gap-4 text-xs text-gray-600 mb-4">
                        <div className="flex items-center">
                            <div className="w-3 h-3 bg-green-100 border border-green-300 rounded-sm mr-1"></div>
                            <span>Répondue</span>
                        </div>
                        <div className="flex items-center">
                            <div className="w-3 h-3 bg-gray-50 border border-gray-300 rounded-sm mr-1"></div>
                            <span>Non répondue</span>
                        </div>
                        <div className="flex items-center">
                            <div className="w-3 h-3 bg-white border-2 border-blue-500 rounded-sm mr-1"></div>
                            <span>Question actuelle</span>
                        </div>
                        <div className="flex items-center">
                            <div className="relative w-3 h-3 bg-gray-50 border border-gray-300 rounded-sm mr-1">
                                <div className="absolute -top-1 -right-1 w-2 h-2 bg-amber-500 rounded-full"></div>
                            </div>
                            <span>Marquée</span>
                        </div>
                    </div>

                    {/* Résumé et bouton de fin */}
                    <div className="flex flex-col sm:flex-row justify-between items-center border-t border-gray-200 pt-4">
                        <div className="text-sm text-gray-600 mb-4 sm:mb-0">
                            <p>Questions répondues: {Object.keys(answers).length} / {exam.questions.length}</p>
                            <p>Questions marquées: {flaggedQuestions.length}</p>
                        </div>

                        <button
                            onClick={() => setShowConfirmFinish(true)}
                            className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-6 rounded-md shadow-sm flex items-center justify-center"
                        >
                            <CheckCircle className="h-5 w-5 mr-2" />
                            Terminer l'examen
                        </button>
                    </div>
                </div>
            </div>

            {/* Modal de confirmation pour terminer l'examen */}
            {showConfirmFinish && (
                <ConfirmationModal
                    title="Terminer l'examen ?"
                    message={
                        <>
                            <p className="mb-2">
                                Êtes-vous sûr de vouloir terminer cet examen ? Vous ne pourrez plus modifier vos réponses après confirmation.
                            </p>
                            <div className="bg-blue-50 border-l-4 border-blue-400 p-3 text-sm text-blue-700 mt-2">
                                <p className="font-medium">Résumé de votre progression :</p>
                                <p>Questions répondues : {Object.keys(answers).length} sur {exam.questions.length}</p>
                                <p>Questions sans réponse : {exam.questions.length - Object.keys(answers).length}</p>
                            </div>
                        </>
                    }
                    confirmText="Terminer l'examen"
                    cancelText="Continuer l'examen"
                    onConfirm={finishExam}
                    onCancel={() => setShowConfirmFinish(false)}
                    confirmButtonClass="bg-green-600 hover:bg-green-700"
                    icon={<CheckCircle className="h-6 w-6 text-green-600" />}
                />
            )}

            {/* Modal de confirmation pour quitter l'examen */}
            {showConfirmQuit && (
                <ConfirmationModal
                    title="Quitter l'examen ?"
                    message="Êtes-vous sûr de vouloir quitter cet examen ? Votre progression sera sauvegardée et vous pourrez reprendre plus tard."
                    confirmText="Quitter et sauvegarder"
                    cancelText="Continuer l'examen"
                    onConfirm={quitExam}
                    onCancel={() => setShowConfirmQuit(false)}
                    confirmButtonClass="bg-blue-600 hover:bg-blue-700"
                    icon={<ArrowLeft className="h-6 w-6 text-blue-600" />}
                />
            )}
        </div>
    );
}
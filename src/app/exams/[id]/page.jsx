'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useExam } from '@/context/ExamContext';
import Link from 'next/link';
import {
    Clock, AlertCircle, ArrowLeft, BookOpen,
    CheckCircle, Book, Award, ChevronRight, AlertTriangle
} from 'lucide-react';
import ExamQuiz from '@/components/exam/ExamQuiz';

export default function ExamDetailPage({ params }) {
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    const {
        getExamById,
        startExam,
        isExamInProgress,
        isExamCompleted,
        getExistingResult
    } = useExam();

    const [exam, setExam] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [quizStarted, setQuizStarted] = useState(false);
    const [examCompleted, setExamCompleted] = useState(false);
    const [lastScore, setLastScore] = useState(null);

    const examId = params.id;

    // Redirection si non connecté
    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/auth/login');
        }
    }, [user, authLoading, router]);

    // Charger l'examen et vérifier son état
    useEffect(() => {
        if (!examId) return;

        const loadExam = async () => {
            setLoading(true);
            try {
                const examData = getExamById(examId);
                if (!examData) {
                    setError("Examen non trouvé");
                    setLoading(false);
                    return;
                }

                setExam(examData);

                // Vérifier si l'examen est déjà terminé
                const completed = isExamCompleted(examId);
                setExamCompleted(completed);

                if (completed) {
                    // Récupérer le résultat de l'examen
                    const result = getExistingResult(examId);
                    if (result) {
                        setLastScore(result);
                    }
                } else if (isExamInProgress(examId)) {
                    // Si l'examen est en cours, on démarre directement le quiz
                    setQuizStarted(true);
                }

            } catch (err) {
                console.error("Error loading exam:", err);
                setError("Impossible de charger les détails de l'examen.");
            } finally {
                setLoading(false);
            }
        };

        loadExam();
    }, [examId, getExamById, isExamCompleted, isExamInProgress, getExistingResult]);

    // Démarrer un examen
    const handleStartExam = () => {
        const { exam: startedExam, error: startError, completed } = startExam(examId);

        if (startError) {
            setError(startError);
            return;
        }

        if (completed) {
            setExamCompleted(true);
            return;
        }

        setQuizStarted(true);
    };

    // Retour en arrière (abandonner l'examen)
    const handleBackToDetail = () => {
        setQuizStarted(false);
    };

    if (authLoading || loading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-white">
                <div className="text-center p-4">
                    <div className="w-16 h-16 border-t-4 border-green-600 border-solid rounded-full animate-spin mx-auto"></div>
                    <p className="mt-4 text-gray-600 font-medium">Chargement de l'examen...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md mb-6">
                    <div className="flex">
                        <AlertCircle className="h-6 w-6 text-red-400 mr-3" />
                        <div>
                            <p className="text-red-700">{error}</p>
                            <p className="text-red-700 mt-1">
                                Veuillez réessayer ou retourner à la liste des examens.
                            </p>
                        </div>
                    </div>
                </div>
                <Link href="/exams" className="inline-flex items-center text-green-600 hover:text-green-800">
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Retour aux examens
                </Link>
            </div>
        );
    }

    if (!exam) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md mb-6">
                    <div className="flex">
                        <AlertCircle className="h-6 w-6 text-yellow-400 mr-3" />
                        <p className="text-yellow-700">Examen non trouvé.</p>
                    </div>
                </div>
                <Link href="/exams" className="inline-flex items-center text-green-600 hover:text-green-800">
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Retour aux examens
                </Link>
            </div>
        );
    }

    // Afficher l'interface de quiz si l'examen est démarré
    if (quizStarted) {
        return (
            <ExamQuiz
                exam={exam}
                onBack={handleBackToDetail}
            />
        );
    }

    // Si l'examen est déjà complété, afficher le résultat
    if (examCompleted) {
        return (
            <div className="container mx-auto px-4 py-8 max-w-4xl">
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md mb-6">
                    <div className="flex">
                        <AlertTriangle className="h-6 w-6 text-yellow-400 mr-3 flex-shrink-0" />
                        <div>
                            <p className="text-yellow-700 font-medium">Examen déjà complété</p>
                            <p className="text-yellow-700 mt-1">
                                Vous avez déjà passé cet examen. Chaque examen ne peut être passé qu'une seule fois.
                            </p>
                            {lastScore && (
                                <div className="mt-2">
                                    <p className="text-yellow-700">
                                        <span className="font-medium">Votre résultat :</span> {lastScore.score}/{lastScore.total} points ({Math.round((lastScore.score / lastScore.total) * 100)}%)
                                    </p>
                                    <p className="text-yellow-700">
                                        <span className="font-medium">Date :</span> {new Date(lastScore.date).toLocaleDateString()} à {new Date(lastScore.date).toLocaleTimeString()}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="bg-white shadow-sm rounded-lg p-6 mb-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800 mb-2">{exam.title}</h1>
                            <div className="flex items-center mb-1 text-gray-600">
                                <BookOpen className="h-4 w-4 mr-2" />
                                <span>{exam.subject?.name || "Matière générale"}</span>
                            </div>
                            <div className="flex items-center text-gray-600">
                                <Clock className="h-4 w-4 mr-2" />
                                <span>Durée: {exam.duration}</span>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 mb-2">
                                <Award className="w-3 h-3 mr-1" />
                                {exam.level || "Bac"}
                            </div>
                            {lastScore && (
                                <div className="mt-2">
                                    <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                        <CheckCircle className="w-3 h-3 mr-1" />
                                        Score: {Math.round((lastScore.score / lastScore.total) * 100)}%
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex gap-4 mt-6">
                    <Link
                        href="/exams"
                        className="flex items-center justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                    >
                        <ArrowLeft className="mr-2 h-5 w-5" />
                        Retour aux examens
                    </Link>

                    <Link
                        href="/dashboard"
                        className="flex items-center justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none"
                    >
                        <CheckCircle className="mr-2 h-5 w-5" />
                        Voir tous mes résultats
                    </Link>
                </div>
            </div>
        );
    }

    // Sinon, afficher la page de détails de l'examen
    return (
        <div className="container mx-auto px-4 py-6 max-w-4xl">
            {/* Breadcrumb */}
            <div className="flex items-center text-sm text-gray-600 mb-6">
                <Link href="/exams" className="hover:text-green-600">
                    Examens
                </Link>
                <ChevronRight className="h-4 w-4 mx-2" />
                <span className="text-gray-800 font-medium">{exam.title}</span>
            </div>

            {/* En-tête */}
            <div className="bg-white shadow-sm rounded-lg p-6 mb-6">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800 mb-2">{exam.title}</h1>
                        <div className="flex items-center mb-1 text-gray-600">
                            <BookOpen className="h-4 w-4 mr-2" />
                            <span>{exam.subject?.name || "Matière générale"}</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                            <Clock className="h-4 w-4 mr-2" />
                            <span>Durée: {exam.duration}</span>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 mb-2">
                            <Award className="w-3 h-3 mr-1" />
                            {exam.level || "Bac"}
                        </div>
                    </div>
                </div>
            </div>

            {/* Contenu principal */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                    {/* Description et informations */}
                    <div className="bg-white shadow-sm rounded-lg p-6 mb-6">
                        <h2 className="text-lg font-semibold mb-4">Description de l'examen</h2>
                        <p className="text-gray-700 mb-4">
                            {exam.description || "Cet examen vise à évaluer vos connaissances et compétences dans cette matière. Prenez le temps de bien lire chaque question et réfléchissez avant de répondre."}
                        </p>

                        <h3 className="text-md font-semibold mb-2">Structure de l'examen:</h3>
                        <ul className="list-disc pl-5 mb-4 text-gray-700">
                            <li>Nombre de questions: {exam.questionCount || "Variable"}</li>
                            <li>Types de questions: QCM, questions à réponse courte, etc.</li>
                            <li>Temps alloué: {exam.duration}</li>
                        </ul>

                        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md">
                            <h3 className="text-sm font-semibold text-yellow-800 mb-1">Important:</h3>
                            <ul className="text-sm text-yellow-700 space-y-1">
                                <li>• Vous ne pouvez passer cet examen qu'une seule fois</li>
                                <li>• Votre progression est automatiquement sauvegardée</li>
                                <li>• Lisez attentivement chaque question avant de répondre</li>
                                <li>• Une fois l'examen terminé, vous ne pourrez plus le modifier</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="md:col-span-1">
                    {/* Carte pour démarrer l'examen */}
                    <div className="bg-white shadow-sm rounded-lg p-6 mb-6">
                        <div className="text-center mb-4">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                <Book className="h-8 w-8 text-green-600" />
                            </div>
                            <h2 className="text-xl font-semibold text-gray-800">Prêt à commencer?</h2>
                            <p className="text-gray-600 text-sm mt-1">
                                Vous avez {exam.duration} pour compléter cet examen.
                            </p>
                        </div>

                        <button
                            onClick={handleStartExam}
                            className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none"
                        >
                            Commencer l'examen
                            <ChevronRight className="ml-1 h-5 w-5" />
                        </button>

                        <div className="mt-4 text-xs text-center text-gray-500">
                            Une fois commencé, vous ne pourrez pas redémarrer l'examen
                        </div>
                    </div>

                    {/* Conseils pour l'examen */}
                    <div className="bg-gray-50 rounded-lg p-4">
                        <h3 className="font-medium text-gray-700 mb-2">Conseils:</h3>
                        <ul className="text-sm text-gray-600 space-y-2">
                            <li className="flex items-start">
                                <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                                <span>Gérez bien votre temps pendant l'examen</span>
                            </li>
                            <li className="flex items-start">
                                <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                                <span>Répondez d'abord aux questions dont vous êtes sûr</span>
                            </li>
                            <li className="flex items-start">
                                <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                                <span>Utilisez la fonctionnalité de marquage pour les questions difficiles</span>
                            </li>
                            <li className="flex items-start">
                                <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                                <span>Vérifiez vos réponses avant de finaliser l'examen</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
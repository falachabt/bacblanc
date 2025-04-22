'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useExam } from '@/context/ExamContext';
import Link from 'next/link';
import {
    CheckCircle, XCircle, AlertCircle, Award, ArrowLeft,
    ChevronDown, ChevronUp, Eye, Clock, BarChart3, Book, Home
} from 'lucide-react';

export default function ExamResult({ examId }) {
    const router = useRouter();
    const { getExamById, getExistingResult } = useExam();

    const [exam, setExam] = useState(null);
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showDetails, setShowDetails] = useState(false);
    const [expandedSections, setExpandedSections] = useState({});

    // Charger l'examen et les résultats
    useEffect(() => {
        if (!examId) {
            setError("ID d'examen manquant");
            setLoading(false);
            return;
        }

        try {
            // Récupérer les informations de l'examen
            const examData = getExamById(examId);
            if (!examData) {
                setError("Examen non trouvé");
                setLoading(false);
                return;
            }

            setExam(examData);

            // Récupérer les résultats
            const resultData = getExistingResult(examId);
            if (!resultData) {
                setError("Résultats non disponibles");
                setLoading(false);
                return;
            }

            setResults(resultData);
        } catch (err) {
            console.error("Erreur lors du chargement des résultats:", err);
            setError("Impossible de charger les résultats");
        } finally {
            setLoading(false);
        }
    }, [examId, getExamById, getExistingResult]);

    // Affichage pendant le chargement
    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-white">
                <div className="text-center p-4">
                    <div className="w-16 h-16 border-t-4 border-green-600 border-solid rounded-full animate-spin mx-auto"></div>
                    <p className="mt-4 text-gray-600 font-medium">Chargement des résultats...</p>
                </div>
            </div>
        );
    }

    // Affichage en cas d'erreur
    if (error) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md mb-6">
                    <div className="flex">
                        <AlertCircle className="h-6 w-6 text-red-400 mr-3" />
                        <p className="text-red-700">{error}</p>
                    </div>
                </div>
                <Link href="/exams" className="inline-flex items-center text-green-600 hover:text-green-800">
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Retour aux examens
                </Link>
            </div>
        );
    }

    // Si pas de résultats ou d'examen
    if (!results || !exam) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md mb-6">
                    <div className="flex">
                        <AlertCircle className="h-6 w-6 text-yellow-400 mr-3" />
                        <p className="text-yellow-700">Résultats non disponibles pour cet examen.</p>
                    </div>
                </div>
                <Link href="/exams" className="inline-flex items-center text-green-600 hover:text-green-800">
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Retour aux examens
                </Link>
            </div>
        );
    }

    // Calcul du pourcentage de réussite
    const percentage = Math.round((results.score / results.total) * 100);

    // Déterminer la classe de couleur en fonction du pourcentage
    const getColorClass = () => {
        if (percentage >= 80) return 'text-green-600';
        if (percentage >= 60) return 'text-blue-600';
        if (percentage >= 50) return 'text-yellow-600';
        return 'text-red-600';
    };

    // Déterminer le message de réussite
    const getSuccessMessage = () => {
        if (percentage >= 80) return 'Excellent !';
        if (percentage >= 60) return 'Bon travail !';
        if (percentage >= 50) return 'Passable';
        return 'À améliorer';
    };

    // Convertir une date ISO en format lisible
    const formatDate = (isoDate) => {
        if (!isoDate) return 'Date inconnue';

        const date = new Date(isoDate);
        return date.toLocaleDateString() + ' à ' + date.toLocaleTimeString();
    };

    // Toggle l'affichage des détails
    const toggleDetails = () => {
        setShowDetails(!showDetails);
    };

    // Toggle l'expansion d'une section
    const toggleSection = (questionId) => {
        setExpandedSections(prev => ({
            ...prev,
            [questionId]: !prev[questionId]
        }));
    };

    return (
        <div className="bg-gray-50 min-h-screen py-8">
            <div className="container mx-auto px-4 max-w-4xl">
                {/* Carte principale des résultats */}
                <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
                    {/* En-tête */}
                    <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-6 text-center">
                        <h1 className="text-3xl font-bold mb-2">Résultats de l'examen</h1>
                        <p className="text-green-100">{exam.title}</p>
                    </div>

                    {/* Résumé du score */}
                    <div className="py-8 px-6 text-center border-b border-gray-200">
                        <div className="inline-block rounded-full bg-gray-100 p-4 mb-4">
                            <Award className="h-12 w-12 text-yellow-500" />
                        </div>
                        <div className="text-4xl font-bold mb-2 flex items-center justify-center">
                            <span className={getColorClass()}>{percentage}%</span>
                        </div>
                        <div className="text-xl font-semibold text-gray-700 mb-2">
                            {results.score} / {results.total} points
                        </div>
                        <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                            percentage >= 80 ? 'bg-green-100 text-green-800' :
                                percentage >= 60 ? 'bg-blue-100 text-blue-800' :
                                    percentage >= 50 ? 'bg-yellow-100 text-yellow-800' :
                                        'bg-red-100 text-red-800'
                        }`}>
                            {getSuccessMessage()}
                        </div>
                    </div>

                    {/* Statistiques détaillées */}
                    <div className="p-6">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">Statistiques</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                            <div className="bg-gray-50 rounded-lg p-4 flex items-center">
                                <div className="rounded-full bg-green-100 p-2 mr-3">
                                    <CheckCircle className="h-6 w-6 text-green-600" />
                                </div>
                                <div>
                                    <div className="text-sm text-gray-500">Réponses correctes</div>
                                    <div className="text-lg font-semibold">
                                        {results.correctCount || 0} / {results.totalQuestions || exam.questions.length}
                                        <span className="text-sm text-gray-500 ml-1">
                                            ({Math.round(((results.correctCount || 0) / (results.totalQuestions || exam.questions.length)) * 100)}%)
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-50 rounded-lg p-4 flex items-center">
                                <div className="rounded-full bg-red-100 p-2 mr-3">
                                    <XCircle className="h-6 w-6 text-red-600" />
                                </div>
                                <div>
                                    <div className="text-sm text-gray-500">Réponses incorrectes</div>
                                    <div className="text-lg font-semibold">
                                        {results.incorrectCount || 0} / {results.totalQuestions || exam.questions.length}
                                        <span className="text-sm text-gray-500 ml-1">
                                            ({Math.round(((results.incorrectCount || 0) / (results.totalQuestions || exam.questions.length)) * 100)}%)
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-50 rounded-lg p-4 flex items-center">
                                <div className="rounded-full bg-gray-100 p-2 mr-3">
                                    <AlertCircle className="h-6 w-6 text-gray-600" />
                                </div>
                                <div>
                                    <div className="text-sm text-gray-500">Sans réponse</div>
                                    <div className="text-lg font-semibold">
                                        {results.unansweredCount || 0} / {results.totalQuestions || exam.questions.length}
                                        <span className="text-sm text-gray-500 ml-1">
                                            ({Math.round(((results.unansweredCount || 0) / (results.totalQuestions || exam.questions.length)) * 100)}%)
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-50 rounded-lg p-4 flex items-center">
                                <div className="rounded-full bg-blue-100 p-2 mr-3">
                                    <Clock className="h-6 w-6 text-blue-600" />
                                </div>
                                <div>
                                    <div className="text-sm text-gray-500">Date de complétion</div>
                                    <div className="text-sm font-semibold">
                                        {formatDate(results.date)}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Sections par catégories si disponible */}
                        {results.sections && Object.keys(results.sections).length > 0 && (
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold text-gray-800 mb-3">Résultats par section</h3>
                                <div className="bg-gray-50 rounded-lg p-4 divide-y divide-gray-200">
                                    {Object.keys(results.sections).map((section, idx) => (
                                        <div key={idx} className="py-3 flex justify-between items-center">
                                            <span className="font-medium text-gray-700">{section}</span>
                                            <span className="font-semibold">
                                                {results.sections[section].score}/{results.sections[section].total}
                                                <span className="text-sm text-gray-500 ml-1">
                                                    ({Math.round((results.sections[section].score / results.sections[section].total) * 100)}%)
                                                </span>
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Détails des réponses (bouton toggle) */}
                        <button
                            onClick={toggleDetails}
                            className="w-full flex justify-between items-center p-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                        >
                            <div className="flex items-center">
                                <Eye className="h-5 w-5 mr-2" />
                                {showDetails ? "Masquer les détails des réponses" : "Voir les détails des réponses"}
                            </div>
                            {showDetails ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                        </button>

                        {/* Affichage des détails si showDetails est true */}
                        {showDetails && (
                            <div className="mt-4 border rounded-lg divide-y">
                                {/* En-tête du tableau de détails */}
                                <div className="bg-gray-50 p-3 flex font-medium text-gray-700">
                                    <div className="w-12 text-center">#</div>
                                    <div className="flex-1">Question</div>
                                    <div className="w-24 text-center">Statut</div>
                                </div>

                                {/* Liste des questions avec réponses */}
                                {exam.questions.map((question, index) => {
                                    // Récupérer l'état de la réponse si disponible, sinon simuler
                                    // Dans un vrai cas d'utilisation, ces informations viendraient de results.answers ou équivalent
                                    const questionResult = results.answers && results.answers[question.id]
                                        ? results.answers[question.id]
                                        : {
                                            // Simulation pour l'exemple
                                            status: index % 3 === 0 ? 'correct' : (index % 3 === 1 ? 'incorrect' : 'unanswered'),
                                            selectedOption: index % 3 === 0 ? question.correctAnswer :
                                                (index % 3 === 1 ? 'option-1' : null)
                                        };

                                    const isCorrect = questionResult.status === 'correct';
                                    const isIncorrect = questionResult.status === 'incorrect';
                                    const isUnanswered = questionResult.status === 'unanswered';

                                    return (
                                        <div key={question.id} className="divide-y">
                                            <div
                                                className="p-3 flex items-center hover:bg-gray-50 cursor-pointer"
                                                onClick={() => toggleSection(question.id)}
                                            >
                                                <div className="w-12 text-center text-gray-500">{index + 1}</div>
                                                <div className="flex-1 text-gray-800 line-clamp-1">{question.text}</div>
                                                <div className="w-24 flex justify-center">
                                                    {isCorrect && (
                                                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full flex items-center">
                                                            <CheckCircle className="h-3 w-3 mr-1" />
                                                            Correct
                                                        </span>
                                                    )}
                                                    {isIncorrect && (
                                                        <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full flex items-center">
                                                            <XCircle className="h-3 w-3 mr-1" />
                                                            Incorrect
                                                        </span>
                                                    )}
                                                    {isUnanswered && (
                                                        <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full flex items-center">
                                                            <AlertCircle className="h-3 w-3 mr-1" />
                                                            Sans réponse
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="ml-2">
                                                    {expandedSections[question.id] ?
                                                        <ChevronUp className="h-4 w-4 text-gray-500" /> :
                                                        <ChevronDown className="h-4 w-4 text-gray-500" />
                                                    }
                                                </div>
                                            </div>

                                            {/* Détails expandables de la question */}
                                            {expandedSections[question.id] && (
                                                <div className="p-4 bg-gray-50">
                                                    <p className="font-medium text-gray-800 mb-3">{question.text}</p>

                                                    {/* Afficher les options si applicable */}
                                                    {question.options && (
                                                        <div className="space-y-2 mb-3">
                                                            <p className="text-sm text-gray-600">Options :</p>
                                                            {question.options.map((option) => (
                                                                <div
                                                                    key={option.id}
                                                                    className={`p-2 rounded-md text-sm ${
                                                                        isCorrect && question.correctAnswer === option.id ?
                                                                            'bg-green-100 border border-green-300' :
                                                                            isIncorrect && question.correctAnswer === option.id ?
                                                                                'bg-green-100 border border-green-300' :
                                                                                isIncorrect && option.id === questionResult.selectedOption ?
                                                                                    'bg-red-100 border border-red-300' :
                                                                                    'bg-white border border-gray-200'
                                                                    }`}
                                                                >
                                                                    <div className="flex items-center">
                                                                        {isCorrect && question.correctAnswer === option.id && (
                                                                            <CheckCircle className="h-4 w-4 text-green-600 mr-2 flex-shrink-0" />
                                                                        )}
                                                                        {isIncorrect && question.correctAnswer === option.id && (
                                                                            <CheckCircle className="h-4 w-4 text-green-600 mr-2 flex-shrink-0" />
                                                                        )}
                                                                        {isIncorrect && option.id === questionResult.selectedOption && (
                                                                            <XCircle className="h-4 w-4 text-red-600 mr-2 flex-shrink-0" />
                                                                        )}
                                                                        <span>{option.text}</span>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}

                                                    {/* Explication */}
                                                    <div className="text-sm bg-blue-50 p-3 rounded-md text-blue-800 border border-blue-200">
                                                        <p className="font-medium mb-1">Explication :</p>
                                                        <p>
                                                            {isCorrect ?
                                                                (question.explanation || "Votre réponse est correcte ! Cette question portait sur les concepts fondamentaux de cette section.") :
                                                                isIncorrect ?
                                                                    (question.explanation || "Votre réponse est incorrecte. La bonne réponse s'appuie sur le théorème principal de cette section.") :
                                                                    (question.explanation || "Vous n'avez pas répondu à cette question. La réponse fait référence aux concepts clés du cours.")
                                                            }
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Message de résultat */}
                    <div className="p-6 bg-blue-50 border-t border-blue-100">
                        <div className="flex">
                            {percentage >= 50 ? (
                                <CheckCircle className="h-6 w-6 text-green-600 mr-3 flex-shrink-0" />
                            ) : (
                                <AlertCircle className="h-6 w-6 text-yellow-500 mr-3 flex-shrink-0" />
                            )}
                            <div>
                                <p className="font-medium text-gray-800">
                                    {percentage >= 50 ? 'Félicitations pour avoir réussi cet examen !' : 'Examen terminé'}
                                </p>
                                <p className="text-gray-600 mt-1">
                                    {percentage >= 80 ? "Excellent travail ! Vous maîtrisez très bien ce sujet." :
                                        percentage >= 60 ? "Bon travail ! Continuez vos efforts pour progresser." :
                                            percentage >= 50 ? "Vous avez obtenu un score satisfaisant. Continuez à vous améliorer." :
                                                "N'hésitez pas à revoir les concepts que vous n'avez pas bien maîtrisés."}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="p-6 bg-gray-50 border-t border-gray-200">
                        <div className="flex flex-col sm:flex-row justify-between gap-3">
                            <button
                                onClick={() => router.push(`/exams/${examId}`)}
                                className="flex-1 flex items-center justify-center py-2 px-4 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                            >
                                <ArrowLeft className="h-5 w-5 mr-2" />
                                Retour à l'examen
                            </button>
                            <button
                                onClick={() => router.push('/exams')}
                                className="flex-1 flex items-center justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none"
                            >
                                <Book className="h-5 w-5 mr-2" />
                                Tous les examens
                            </button>
                        </div>
                    </div>
                </div>

                {/* Défilement vers le haut */}
                <div className="text-center mb-4">
                    <button
                        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                        className="text-gray-500 hover:text-gray-700 text-sm"
                    >
                        Retour en haut
                    </button>
                </div>
            </div>
        </div>
    );
}
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    CheckCircle, XCircle, AlertCircle, Award, ArrowLeft,
    ChevronDown, ChevronUp, Eye, Clock, Book
} from 'lucide-react';

export default function ResultsScreen({ result, exam, onBackToDetail }) {
    const router = useRouter();
    const [showDetails, setShowDetails] = useState(false);
    const [expandedSections, setExpandedSections] = useState({});
    const [calculatedResults, setCalculatedResults] = useState({
        score: 0,
        total: 0,
        percentage: 0,
        correctCount: 0,
        incorrectCount: 0,
        unansweredCount: 0,
        questionResults: []
    });

    // Calculer les résultats au chargement
    useEffect(() => {
        if (exam && exam.questions && result && result.answers) {
            calculateResults();
        }
    }, [exam, result]);

    // Fonction pour calculer les résultats
    const calculateResults = () => {
        let score = 0;
        let total = 0;
        let correctCount = 0;
        let incorrectCount = 0;
        let unansweredCount = 0;
        let questionResults = [];

        exam.questions.forEach(question => {
            const userAnswer = result.answers[question.id];
            const points = question.points || 0;
            total += points;

            let isCorrect = false;

            if (!userAnswer) {
                unansweredCount++;
            } else {
                if (question.type === 'true-false') {
                    isCorrect = userAnswer === question.correct_answer;
                } else if (question.type === 'multiple') {
                    // Pour les questions à choix multiples
                    const correctAnswers = Array.isArray(question.correct_answer)
                        ? question.correct_answer
                        : JSON.parse(question.correct_answer);

                    const userAnswers = Array.isArray(userAnswer) ? userAnswer : [userAnswer];

                    // Vérifier si les réponses sont identiques (même contenu, peut-être ordre différent)
                    isCorrect =
                        correctAnswers.length === userAnswers.length &&
                        correctAnswers.every(ans => userAnswers.includes(ans)) &&
                        userAnswers.every(ans => correctAnswers.includes(ans));
                } else {
                    // Pour les questions à choix unique
                    isCorrect = userAnswer === question.correct_answer;
                }

                if (isCorrect) {
                    correctCount++;
                    score += points;
                } else {
                    incorrectCount++;
                }
            }

            questionResults.push({
                question,
                userAnswer,
                isCorrect,
                status: !userAnswer ? 'unanswered' : isCorrect ? 'correct' : 'incorrect'
            });
        });

        const percentage = total > 0 ? Math.round((score / total) * 100) : 0;

        setCalculatedResults({
            score,
            total,
            percentage,
            correctCount,
            incorrectCount,
            unansweredCount,
            questionResults
        });
    };

    // Si pas de résultat, afficher un message d'erreur
    if (!result || !exam) {
        return (
            <div className="container mx-auto px-4 py-8 max-w-4xl">
                <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md mb-6">
                    <div className="flex">
                        <AlertCircle className="h-6 w-6 text-red-400 mr-3" />
                        <p className="text-red-700">Aucun résultat n'est disponible.</p>
                    </div>
                </div>
                <button
                    onClick={onBackToDetail}
                    className="flex items-center text-green-600 hover:text-green-800"
                >
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Retour aux détails de l'examen
                </button>
            </div>
        );
    }

    // Déterminer la classe de couleur en fonction du pourcentage
    const getColorClass = () => {
        const { percentage } = calculatedResults;
        if (percentage >= 80) return 'text-green-600';
        if (percentage >= 60) return 'text-blue-600';
        if (percentage >= 50) return 'text-yellow-600';
        return 'text-red-600';
    };

    // Déterminer le message de réussite
    const getSuccessMessage = () => {
        const { percentage } = calculatedResults;
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

    // Retour à la liste des examens
    const goToExamList = () => {
        router.push('/exams');
    };

    // Toggle l'affichage des détails
    const toggleDetails = () => {
        setShowDetails(!showDetails);
    };

    // Toggle l'expansion d'une section
    const toggleSection = (sectionId) => {
        setExpandedSections(prev => ({
            ...prev,
            [sectionId]: !prev[sectionId]
        }));
    };

    // Obtenir les options d'une question
    const parseOptions = (question) => {
        if (!question.options) return [];

        try {
            return typeof question.options === 'string'
                ? JSON.parse(question.options)
                : question.options;
        } catch (e) {
            console.error("Erreur lors du parsing des options:", e);
            return [];
        }
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
                            <span className={getColorClass()}>{calculatedResults.percentage}%</span>
                        </div>
                        <div className="text-xl font-semibold text-gray-700 mb-2">
                            {calculatedResults.score} / {calculatedResults.total} points
                        </div>
                        <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                            calculatedResults.percentage >= 80 ? 'bg-green-100 text-green-800' :
                                calculatedResults.percentage >= 60 ? 'bg-blue-100 text-blue-800' :
                                    calculatedResults.percentage >= 50 ? 'bg-yellow-100 text-yellow-800' :
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
                                        {calculatedResults.correctCount} / {exam.questions.length}
                                        <span className="text-sm text-gray-500 ml-1">
                                            ({Math.round((calculatedResults.correctCount / exam.questions.length) * 100)}%)
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
                                        {calculatedResults.incorrectCount} / {exam.questions.length}
                                        <span className="text-sm text-gray-500 ml-1">
                                            ({Math.round((calculatedResults.incorrectCount / exam.questions.length) * 100)}%)
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
                                        {calculatedResults.unansweredCount} / {exam.questions.length}
                                        <span className="text-sm text-gray-500 ml-1">
                                            ({Math.round((calculatedResults.unansweredCount / exam.questions.length) * 100)}%)
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
                                        {formatDate(result.completed_at || result.completedAt)}
                                    </div>
                                </div>
                            </div>
                        </div>

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
                                {calculatedResults.questionResults.map((item, index) => {
                                    const { question, userAnswer, status } = item;

                                    return (
                                        <div key={question.id} className="divide-y">
                                            <div
                                                className="p-3 flex items-center hover:bg-gray-50 cursor-pointer"
                                                onClick={() => toggleSection(question.id)}
                                            >
                                                <div className="w-12 text-center text-gray-500">{index + 1}</div>
                                                <div className="flex-1 text-gray-800 line-clamp-1">{question.content}</div>
                                                <div className="w-24 flex justify-center">
                                                    {status === 'correct' && (
                                                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full flex items-center">
                                                            <CheckCircle className="h-3 w-3 mr-1" />
                                                            Correct
                                                        </span>
                                                    )}
                                                    {status === 'incorrect' && (
                                                        <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full flex items-center">
                                                            <XCircle className="h-3 w-3 mr-1" />
                                                            Incorrect
                                                        </span>
                                                    )}
                                                    {status === 'unanswered' && (
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
                                                    <p className="font-medium text-gray-800 mb-3">{question.content}</p>
                                                    <p className="text-sm text-gray-600 mb-2">
                                                        Type: {question.type === 'multiple' ? 'Choix multiple' :
                                                        question.type === 'single' ? 'Choix unique' :
                                                            'Vrai ou Faux'} •
                                                        Points: {question.points}
                                                    </p>

                                                    {/* Afficher les options pour les questions à choix */}
                                                    {(question.type === 'single' || question.type === 'multiple') && (
                                                        <div className="space-y-2 mb-3">
                                                            <p className="text-sm text-gray-600">Options :</p>
                                                            {parseOptions(question).map((option) => {
                                                                const correctAnswers = Array.isArray(question.correct_answer)
                                                                    ? question.correct_answer
                                                                    : question.correct_answer.startsWith('[')
                                                                        ? JSON.parse(question.correct_answer)
                                                                        : [question.correct_answer];

                                                                const userAnswers = Array.isArray(userAnswer)
                                                                    ? userAnswer
                                                                    : userAnswer ? [userAnswer] : [];

                                                                const isCorrectOption = correctAnswers.includes(option.id);
                                                                const isSelectedByUser = userAnswers.includes(option.id);

                                                                return (
                                                                    <div
                                                                        key={option.id}
                                                                        className={`p-2 rounded-md text-sm ${
                                                                            isCorrectOption && isSelectedByUser
                                                                                ? 'bg-green-100 border border-green-300'
                                                                                : isCorrectOption
                                                                                    ? 'bg-green-50 border border-green-200'
                                                                                    : isSelectedByUser
                                                                                        ? 'bg-red-100 border border-red-300'
                                                                                        : 'bg-white border border-gray-200'
                                                                        }`}
                                                                    >
                                                                        <div className="flex items-center">
                                                                            {isCorrectOption && isSelectedByUser && (
                                                                                <CheckCircle className="h-4 w-4 text-green-600 mr-2 flex-shrink-0" />
                                                                            )}
                                                                            {isCorrectOption && !isSelectedByUser && (
                                                                                <CheckCircle className="h-4 w-4 text-green-400 mr-2 flex-shrink-0" />
                                                                            )}
                                                                            {!isCorrectOption && isSelectedByUser && (
                                                                                <XCircle className="h-4 w-4 text-red-600 mr-2 flex-shrink-0" />
                                                                            )}
                                                                            <span>{option.text}</span>
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    )}

                                                    {/* Pour les questions vrai/faux */}
                                                    {question.type === 'true-false' && (
                                                        <div className="space-y-2 mb-3">
                                                            <p className="text-sm text-gray-600">Votre réponse :</p>
                                                            <div className={`p-2 rounded-md text-sm ${
                                                                userAnswer === question.correct_answer
                                                                    ? 'bg-green-100 border border-green-300'
                                                                    : userAnswer
                                                                        ? 'bg-red-100 border border-red-300'
                                                                        : 'bg-gray-100 border border-gray-300'
                                                            }`}>
                                                                {userAnswer === 'true' ? 'Vrai' :
                                                                    userAnswer === 'false' ? 'Faux' :
                                                                        'Sans réponse'}
                                                            </div>

                                                            <p className="text-sm text-gray-600 mt-2">Réponse correcte :</p>
                                                            <div className="p-2 rounded-md text-sm bg-green-100 border border-green-300">
                                                                {question.correct_answer === 'true' ? 'Vrai' : 'Faux'}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Explication */}
                                                    <div className="text-sm bg-blue-50 p-3 rounded-md text-blue-800 border border-blue-200">
                                                        <p className="font-medium mb-1">Explication :</p>
                                                        <p>
                                                            {status === 'correct'
                                                                ? "Votre réponse est correcte ! Vous avez bien compris ce concept."
                                                                : status === 'incorrect'
                                                                    ? `Votre réponse est incorrecte. La réponse correcte est ${
                                                                        question.type === 'true-false'
                                                                            ? question.correct_answer === 'true' ? 'Vrai' : 'Faux'
                                                                            : 'indiquée ci-dessus'
                                                                    }.`
                                                                    : "Vous n'avez pas répondu à cette question."
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

                    {/* Actions */}
                    <div className="p-6 bg-gray-50 border-t border-gray-200">
                        <div className="flex flex-col sm:flex-row justify-between gap-3">
                            <button
                                onClick={onBackToDetail}
                                className="flex-1 flex items-center justify-center py-2 px-4 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                            >
                                <ArrowLeft className="h-5 w-5 mr-2" />
                                Retour à l'examen
                            </button>
                            <button
                                onClick={goToExamList}
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
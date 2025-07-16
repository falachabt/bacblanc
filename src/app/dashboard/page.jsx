'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTokenAuth } from '@/context/TokenAuthContext';
import { useExam } from '@/context/ExamContext';
import Link from 'next/link';
import {
    Book, Clock, CheckCircle, BarChart3, Award, ArrowRight,
    Calendar, BookOpen, RefreshCw, Activity, FileText, List,
    ChevronRight, AlertCircle, Loader, PlusCircle, Bookmark
} from 'lucide-react';
import { formatDate, getAllCompletedExams, getAllExamsInProgress } from '@/utils/examUtils';

// Composant pour les statistiques en tuiles
const StatCard = ({ icon: Icon, title, value, color }) => (
    <div className={`bg-white border rounded-lg shadow-sm p-4 flex ${color || 'border-gray-200'}`}>
        <div className={`rounded-full p-3 mr-3 ${color ? `bg-${color}-100 text-${color}-600` : 'bg-gray-100 text-gray-600'}`}>
            <Icon size={20} />
        </div>
        <div>
            <p className="text-sm text-gray-500">{title}</p>
            <p className="text-2xl font-semibold text-gray-800">{value}</p>
        </div>
    </div>
);

// Composant pour les cartes d'examens récents
const RecentExamCard = ({ exam, result, onClick }) => {
    const date = new Date(result.date);
    const score = Math.round((result.score / result.total) * 100);

    // Déterminer la couleur en fonction du score
    const getColor = () => {
        if (score >= 80) return 'text-green-600 bg-green-50 border-green-200';
        if (score >= 60) return 'text-blue-600 bg-blue-50 border-blue-200';
        if (score >= 50) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
        return 'text-red-600 bg-red-50 border-red-200';
    };

    return (
        <div
            className="border rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-md transition-all cursor-pointer"
            onClick={onClick}
        >
            <div className="p-4">
                <div className="flex justify-between mb-2">
                    <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                        {exam.subject?.code || "N/A"}
                    </span>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded flex items-center ${getColor()}`}>
                        {score}%
                    </span>
                </div>

                <h3 className="font-medium mb-1 text-gray-800">{exam.title}</h3>

                <div className="text-xs text-gray-500 flex items-center mb-2">
                    <Calendar size={12} className="mr-1" />
                    {date.toLocaleDateString()}
                </div>

                <div className="flex justify-between text-sm">
                    <span className="text-gray-600 flex items-center">
                        <CheckCircle size={14} className="mr-1" />
                        {result.correctCount}/{result.totalQuestions}
                    </span>
                    <span className="text-gray-600">
                        {result.score}/{result.total} pts
                    </span>
                </div>
            </div>
        </div>
    );
};

// Composant pour les examens en cours
const InProgressCard = ({ exam, progress, onClick }) => {
    const answeredCount = progress.answers ? Object.keys(progress.answers).length : 0;
    const percentage = Math.round((answeredCount / exam.questions.length) * 100);

    return (
        <div
            className="border rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-md transition-all cursor-pointer"
            onClick={onClick}
        >
            <div className="p-4">
                <div className="flex justify-between mb-2">
                    <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                        {exam.subject?.code || "N/A"}
                    </span>
                    <span className="text-xs font-medium bg-blue-100 text-blue-800 px-2 py-0.5 rounded flex items-center">
                        <Clock size={12} className="mr-1" />
                        En cours
                    </span>
                </div>

                <h3 className="font-medium mb-1 text-gray-800">{exam.title}</h3>

                <div className="text-xs text-gray-500 flex items-center mb-1">
                    <Calendar size={12} className="mr-1" />
                    Commencé le {formatDate(new Date(progress.timestamp))}
                </div>

                {/* Barre de progression */}
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                    <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${percentage}%` }}
                    ></div>
                </div>

                <div className="flex justify-between text-sm">
                    <span className="text-gray-600 flex items-center">
                        <CheckCircle size={14} className="mr-1" />
                        {answeredCount}/{exam.questions.length}
                    </span>
                    <span className="text-blue-600 font-medium">
                        {percentage}% complété
                    </span>
                </div>
            </div>
        </div>
    );
};

export default function DashboardPage() {
    const router = useRouter();
    const { user, loading: authLoading } = useTokenAuth();
    const { exams, loading: examsLoading, getExamById } = useExam();

    const [completedExams, setCompletedExams] = useState([]);
    const [examProgress, setExamProgress] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalCompleted: 0,
        averageScore: 0,
        bestScore: 0,
        inProgress: 0
    });

    // Chargement des données au montage
    useEffect(() => {
        const loadData = () => {
            try {
                // Simulating a loading delay
                setTimeout(() => {
                    // Get completed exams
                    const completed = getAllCompletedExams();

                    // Get exams in progress
                    const inProgress = getAllExamsInProgress();

                    // Set data
                    setCompletedExams(completed);
                    setExamProgress(inProgress);

                    // Calculate stats
                    const totalCompleted = completed.length;
                    const scores = completed.map(result =>
                        result.score && result.total ? (result.score / result.total) * 100 : 0
                    );
                    const averageScore = scores.length > 0
                        ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
                        : 0;
                    const bestScore = scores.length > 0
                        ? Math.round(Math.max(...scores))
                        : 0;

                    setStats({
                        totalCompleted,
                        averageScore,
                        bestScore,
                        inProgress: inProgress.length
                    });

                    setLoading(false);
                }, 800);
            } catch (error) {
                console.error("Error loading dashboard data:", error);
                setLoading(false);
            }
        };

        if (!authLoading && !examsLoading) {
            loadData();
        }
    }, [authLoading, examsLoading]);

    // Navigation vers l'examen en cours
    const handleContinueExam = (examId) => {
        router.push(`/exams/${examId}`);
    };

    // Navigation vers les résultats d'un examen
    const handleViewResult = (examId) => {
        router.push(`/exams/${examId}`);
    };

    if (authLoading || examsLoading || loading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-white">
                <div className="text-center p-4">
                    <div className="w-16 h-16 border-t-4 border-green-600 border-solid rounded-full animate-spin mx-auto"></div>
                    <p className="mt-4 text-gray-600 font-medium">
                        Chargement de votre tableau de bord...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen py-8">
            <div className="container mx-auto px-4">
                {/* En-tête */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">Tableau de bord</h1>
                    <p className="text-gray-600">
                        Suivez votre progression et consultez vos résultats
                    </p>
                </div>

                {/* Statistiques */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <StatCard
                        icon={CheckCircle}
                        title="Examens terminés"
                        value={stats.totalCompleted}
                        color="green"
                    />
                    <StatCard
                        icon={Activity}
                        title="Note moyenne"
                        value={`${stats.averageScore}%`}
                        color="blue"
                    />
                    <StatCard
                        icon={Award}
                        title="Meilleur score"
                        value={`${stats.bestScore}%`}
                        color="yellow"
                    />
                    <StatCard
                        icon={Clock}
                        title="En cours"
                        value={stats.inProgress}
                        color="purple"
                    />
                </div>

                {/* Examens en cours */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                            <Clock className="mr-2 text-blue-600" size={20} />
                            Examens en cours
                        </h2>
                        <Link href="/exams" className="text-blue-600 hover:text-blue-800 text-sm flex items-center">
                            Voir tous les examens
                            <ChevronRight size={16} className="ml-1" />
                        </Link>
                    </div>

                    {examProgress.length === 0 ? (
                        <div className="text-center py-8">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <BookOpen size={24} className="text-gray-400" />
                            </div>
                            <p className="text-gray-600 mb-4">
                                Vous n'avez aucun examen en cours pour le moment.
                            </p>
                            <Link
                                href="/exams"
                                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                            >
                                <PlusCircle size={16} className="mr-2" />
                                Commencer un examen
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {examProgress.slice(0, 6).map(progress => {
                                const exam = getExamById(progress.examId);
                                if (!exam) return null;

                                return (
                                    <InProgressCard
                                        key={progress.examId}
                                        exam={exam}
                                        progress={progress}
                                        onClick={() => handleContinueExam(progress.examId)}
                                    />
                                );
                            })}
                        </div>
                    )}

                    {examProgress.length > 6 && (
                        <div className="mt-4 text-center">
                            <button
                                className="text-blue-600 hover:text-blue-800 text-sm flex items-center mx-auto"
                                onClick={() => router.push('/exams')}
                            >
                                Voir plus d'examens en cours
                                <ChevronRight size={16} className="ml-1" />
                            </button>
                        </div>
                    )}
                </div>

                {/* Examens récents */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                            <CheckCircle className="mr-2 text-green-600" size={20} />
                            Examens récemment complétés
                        </h2>
                        <button
                            className="text-green-600 hover:text-green-800 text-sm flex items-center"
                            onClick={() => router.push('/results')}
                        >
                            Voir tous les résultats
                            <ChevronRight size={16} className="ml-1" />
                        </button>
                    </div>

                    {completedExams.length === 0 ? (
                        <div className="text-center py-8">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FileText size={24} className="text-gray-400" />
                            </div>
                            <p className="text-gray-600 mb-4">
                                Vous n'avez pas encore terminé d'examen.
                            </p>
                            <Link
                                href="/exams"
                                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
                            >
                                <BookOpen size={16} className="mr-2" />
                                Explorer les examens
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {completedExams.slice(0, 6).map(result => {
                                const exam = getExamById(result.examId);
                                if (!exam) return null;

                                return (
                                    <RecentExamCard
                                        key={result.examId}
                                        exam={exam}
                                        result={result}
                                        onClick={() => handleViewResult(result.examId)}
                                    />
                                );
                            })}
                        </div>
                    )}

                    {completedExams.length > 6 && (
                        <div className="mt-4 text-center">
                            <button
                                className="text-green-600 hover:text-green-800 text-sm flex items-center mx-auto"
                                onClick={() => router.push('/results')}
                            >
                                Voir plus de résultats
                                <ChevronRight size={16} className="ml-1" />
                            </button>
                        </div>
                    )}
                </div>

                {/* Actions rapides */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                        <List className="mr-2 text-gray-600" size={20} />
                        Actions rapides
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Link
                            href="/exams"
                            className="border rounded-lg p-4 hover:bg-gray-50 transition-colors flex items-center"
                        >
                            <div className="rounded-full bg-blue-100 p-3 mr-3">
                                <BookOpen size={20} className="text-blue-600" />
                            </div>
                            <div>
                                <h3 className="font-medium text-gray-800">Parcourir les examens</h3>
                                <p className="text-sm text-gray-600">Découvrez les examens disponibles</p>
                            </div>
                            <ChevronRight size={16} className="ml-auto text-gray-400" />
                        </Link>

                        <Link
                            href="/exams"
                            className="border rounded-lg p-4 hover:bg-gray-50 transition-colors flex items-center"
                        >
                            <div className="rounded-full bg-green-100 p-3 mr-3">
                                <Bookmark size={20} className="text-green-600" />
                            </div>
                            <div>
                                <h3 className="font-medium text-gray-800">Examens favoris</h3>
                                <p className="text-sm text-gray-600">Consultez vos examens marqués</p>
                            </div>
                            <ChevronRight size={16} className="ml-auto text-gray-400" />
                        </Link>

                        <div
                            className="border rounded-lg p-4 hover:bg-gray-50 transition-colors flex items-center cursor-pointer"
                            onClick={() => {
                                window.localStorage.clear();
                                window.location.reload();
                            }}
                        >
                            <div className="rounded-full bg-red-100 p-3 mr-3">
                                <RefreshCw size={20} className="text-red-600" />
                            </div>
                            <div>
                                <h3 className="font-medium text-gray-800">Réinitialiser démo</h3>
                                <p className="text-sm text-gray-600">Effacer toutes les données de test</p>
                            </div>
                            <ChevronRight size={16} className="ml-auto text-gray-400" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTokenAuth } from '@/context/TokenAuthContext';
import { useExam } from '@/context/ExamContext'; // Import useExam context
import supabase from "@/lib/supabase";
import {
    BookOpen, Clock, Award, ChevronRight, Lock, Calendar, AlertCircle,
    RefreshCw, Check, Unlock, CreditCard, Loader, ShieldCheck, Home,
    ArrowLeft, FileText, Settings, BookX, Info, X,
    CheckCircle, AlertTriangle, PlayCircle  // Additional icons
} from 'lucide-react';

// Composant pour les cartes d'examen
const ExamCard = ({ exam, hasAccess }) => {
    const router = useRouter();
    const { isExamCompleted, isExamInProgress, getExistingResult } = useExam();
    const [examStatus, setExamStatus] = useState({
        isCompleted: false,
        inProgress: false,
        score: null,
        loading: true
    });

    // Vérifier le statut de l'examen
    useEffect(() => {
        const checkExamStatus = async () => {
            if (!hasAccess) {
                setExamStatus({ isCompleted: false, inProgress: false, score: null, loading: false });
                return;
            }

            try {
                // Vérifier si l'examen est complété
                const completed = await isExamCompleted(exam.id);
                let score = null;

                if (completed) {
                    // Récupérer le score si l'examen est complété
                    const result = await getExistingResult(exam.id);
                    if (result) {
                        // Use the percentage already calculated and stored in result
                        score = {
                            score: result.score,
                            totalPoints: result.total || exam.questions?.reduce((sum, a) => sum + (parseFloat(a.points) || 1), 0) || 100,
                            percentage: result.percentage || Math.round((result.score / (result.total || exam.questions?.reduce((sum, a) => sum + (parseFloat(a.points) || 1), 0) || 100)) * 100)
                        };
                    }
                }

                // Vérifier si l'examen est en cours
                const inProgress = !completed && await isExamInProgress(exam.id);

                setExamStatus({
                    isCompleted: completed,
                    inProgress: inProgress,
                    score: score,
                    loading: false
                });
            } catch (error) {
                console.error("Error checking exam status:", error);
                setExamStatus({ isCompleted: false, inProgress: false, score: null, loading: false });
            }
        };

        checkExamStatus();
    }, [exam.id, hasAccess, isExamCompleted, isExamInProgress, getExistingResult, exam.questions]);

    const handleExamClick = () => {
        if (!hasAccess) {
            // Redirection vers la page de paiement
            router.push('/payment?globalAccess=true');
            return;
        }

        // Rediriger vers la page de l'examen, qu'il soit complété, en cours ou disponible
        router.push(`/exams/${exam.id}`);
    };

    // Détermine si l'examen est disponible (date de disponibilité passée)
    const isAvailable = new Date(exam.available_at) <= new Date();
    // const isAvailable = true;

    // Détermine la couleur de l'arrière-plan de la carte en fonction du statut
    let cardBgClass = "bg-white";
    if (!isAvailable) {
        cardBgClass = "bg-white";
    } else if (!hasAccess) {
        cardBgClass = "bg-white";
    } else if (examStatus.isCompleted) {
        cardBgClass = "bg-white border-l-4 border-green-500";
    } else if (examStatus.inProgress) {
        cardBgClass = "bg-white border-l-4 border-yellow-500";
    }

    return (
        <div
            className={`border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow ${
                cardBgClass
            } ${isAvailable && hasAccess ? 'cursor-pointer' : ''}`}
            onClick={isAvailable && hasAccess ? handleExamClick : undefined}
        >
            <div className="p-3">
                {/* Badge pour le code du sujet et l'accès */}
                <div className="flex justify-between items-start mb-2">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-800">
                        <BookOpen size={12} className="mr-1" />
                        {exam.subject?.code || "N/A"}
                    </span>
                    {hasAccess ? (
                        examStatus.loading ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-600">
                                <Loader size={12} className="mr-1 animate-spin" />
                                Chargement...
                            </span>
                        ) : examStatus.isCompleted ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-green-100 text-green-800">
                                <CheckCircle size={12} className="mr-1" />
                                Complété
                            </span>
                        ) : examStatus.inProgress ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-yellow-100 text-yellow-800">
                                <PlayCircle size={12} className="mr-1" />
                                En cours
                            </span>
                        ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-green-100 text-green-800">
                                <Unlock size={12} className="mr-1" />
                                Accès
                            </span>
                        )
                    ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-700">
                            <Lock size={12} className="mr-1" />
                            Verrouillé
                        </span>
                    )}
                </div>

                <h3 className="font-semibold text-base mb-1 text-gray-900">{exam.title}</h3>

                {/* Afficher le nom du sujet */}
                <p className="text-xs text-gray-600 mb-1 flex items-center">
                    <BookOpen size={12} className="mr-1 text-gray-400" />
                    {exam.subject?.name || "Sujet non disponible"}
                </p>

                <div className="text-xs text-gray-600 mb-2 flex items-center">
                    <Clock size={12} className="mr-1 text-gray-400" />
                    Durée: {exam.duration ? `${exam.duration.split(':')[0]}h${exam.duration.split(':')[1]}m` : 'Non définie'}
                </div>

                {/* Afficher le score si l'examen est complété */}
                {hasAccess && examStatus.isCompleted && examStatus.score && (
                    <div className="mb-2">
                        <div className={`text-xs font-medium py-1 rounded flex items-center ${
                            examStatus.score.percentage >= 50
                                ? 'text-green-700'
                                : 'text-red-700'
                        }`}>
                            <Award size={12} className="mr-1" />
                            Score: {examStatus.score.percentage}%
                        </div>
                    </div>
                )}

                <div className="flex items-center justify-between mt-2">
                    {!isAvailable ? (
                        <div className="flex items-center text-xs font-medium px-2 py-1 rounded-full bg-yellow-100 text-yellow-800">
                            <Calendar size={12} className="mr-1" />
                            Bientôt disponible
                        </div>
                    ) : hasAccess ? (
                        examStatus.isCompleted ? (
                            <button className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded-full flex items-center">
                                <FileText size={12} className="mr-1" />
                                Voir résultats
                            </button>
                        ) : examStatus.inProgress ? (
                            <button className="text-xs bg-yellow-600 hover:bg-yellow-700 text-white px-2 py-1 rounded-full flex items-center">
                                <PlayCircle size={12} className="mr-1" />
                                Continuer
                            </button>
                        ) : (
                            <button className="text-xs bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded-full flex items-center">
                                Commencer
                                <ChevronRight size={12} className="ml-1" />
                            </button>
                        )
                    ) : (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                router.push('/payment?globalAccess=true');
                            }}
                            className="text-xs bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded-full flex items-center"
                        >
                            <Unlock size={12} className="mr-1" />
                            Débloquer
                        </button>
                    )}

                    {!isAvailable && (
                        <span className="text-xs text-gray-500 flex items-center">
                            <Calendar size={12} className="mr-1" />
                            {new Date(exam.available_at).toLocaleDateString()}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};
// Composant pour l'état vide ou erreur
const EmptyStateMessage = ({ type, message, actionText, actionHandler, icon: Icon }) => (
    <div className="text-center py-16 px-4">
        <div className="rounded-full bg-gray-100 w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <Icon size={24} className="text-gray-400" />
        </div>
        <p className="text-gray-600 text-lg font-medium">
            {message}
        </p>
        {actionText && (
            <button
                onClick={actionHandler}
                className="mt-6 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium shadow-sm transition-colors inline-flex items-center"
            >
                {type === 'refresh' && <RefreshCw size={14} className="mr-2" />}
                {type === 'redirect' && <ArrowLeft size={14} className="mr-2" />}
                {type === 'settings' && <Settings size={14} className="mr-2" />}
                {actionText}
            </button>
        )}
    </div>
);

export default function ExamsPage() {
    const router = useRouter();
    
    // Safely get auth context
    let user = null;
    let profile = null;
    let authLoading = true;
    
    try {
        const auth = useTokenAuth();
        user = auth.user;
        profile = auth.profile;
        authLoading = auth.loading;
    } catch (error) {
        console.warn('ExamsPage: TokenAuth context not available');
    }
    
    const [exams, setExams] = useState([]);
    const [hasAccessToAllExams, setHasAccessToAllExams] = useState(false);
    const [loadingData, setLoadingData] = useState(false);
    const [dataFetched, setDataFetched] = useState(false);
    const [error, setError] = useState(null);
    const [loadingTimeout, setLoadingTimeout] = useState(null);
    const [lastValidPayment, setLastValidPayment] = useState(null);
    const [noSubjectsForConcoursType, setNoSubjectsForConcoursType] = useState(false);

    // Prix fixe pour tous les examens
    const GLOBAL_ACCESS_PRICE = 200;

    // Fonction pour rediriger vers la page de paiement global
    const handleGlobalPayment = () => {
        router.push('/payment?globalAccess=true');
    };

    // Redirection si non connecté
    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/');
        }
    }, [user, authLoading, router]);

    // Chargement des examens et vérification de l'accès global
    useEffect(() => {
        // Clear any existing loading timeout when effect runs
        if (loadingTimeout) {
            clearTimeout(loadingTimeout);
        }

        const fetchData = async () => {
            console.log("user: ", user);
            if (!user) return;

            // Set a timeout to prevent infinite loading state
            const timeout = setTimeout(() => {
                // If still loading after 10 seconds, reset loading state
                setLoadingData(false);
                if (!dataFetched) {
                    setError('Le chargement a pris trop de temps. Veuillez rafraîchir la page.');
                }
            }, 10000);

            setLoadingTimeout(timeout);
            setLoadingData(true);
            // setNoSubjectsForBacSeries(false);

            try {
                console.log("user: ", user);
                // 1. D'abord, obtenir tous les sujets (subjects) qui correspondent à la série BAC de l'utilisateur
                const { data: subjectsData, error: subjectsError } = await supabase
                    .from('subjects')
                    .select('id, name, code')
                    .contains('concours_type', [user.concours_type]);

                if (subjectsError) throw subjectsError;

                if (!subjectsData || subjectsData.length === 0) {
                    setExams([]);
                    setHasAccessToAllExams(false);
                    setNoSubjectsForBacSeries(true);
                    setDataFetched(true);
                    setLoadingData(false);
                    clearTimeout(timeout);
                    return;
                }

                const subjectIds = subjectsData.map(subject => subject.id);

                // 2. Ensuite, charger les examens pour ces sujets
                const { data: examData, error: examError } = await supabase
                    .from('exams')
                    .select('*, subject:subject_id(name, code)')
                    .in('subject_id', subjectIds)
                    .order('available_at', { ascending: true });

                if (examError) throw examError;

                // 3. Vérifier si l'utilisateur a un paiement global valide
                const { data: paymentData, error: paymentError } = await supabase
                    .from('payments')
                    .select('*')
                    .eq('user_id', user.id)
                    .eq('status', 'complete')  // NotchPay utilise 'complete' et non 'completed'
                    .order('created_at', { ascending: false });

                if (paymentError && paymentError.code !== 'PGRST116') { // PGRST116 = not found
                    // throw paymentError;
                }

                // Si nous avons trouvé un paiement global valide
                if (paymentData && paymentData.length > 0) {
                    setHasAccessToAllExams(true);
                    setLastValidPayment(paymentData[0]);
                } else {
                    setHasAccessToAllExams(false);
                }

                setExams(examData || []);
                setDataFetched(true);
            } catch (error) {
                console.error('Error fetching data:', error.message);
                setError('Impossible de charger les examens. Veuillez réessayer.');
            } finally {
                setLoadingData(false);
                clearTimeout(timeout);
            }
        };

        // Reset when component mounts
        if (user) {
            fetchData();
        }

        // Clean up timeout on unmount
        return () => {
            if (loadingTimeout) {
                clearTimeout(loadingTimeout);
            }
        };
    }, [user]);

    // Fonction de rechargement explicite des données
    const refreshData = () => {
        setDataFetched(false);
        setError(null);
        setExams([]);
        // setNoSubjectsForBacSeries(false);
        // Trigger the useEffect to reload data
        const reloadTimeout = setTimeout(() => {
            clearTimeout(reloadTimeout);
        }, 100);
        setLoadingTimeout(reloadTimeout);
    };

    // Gérer les différents états d'affichage
    const handleBackToHome = () => {
        router.push('/');
    };

    const handleGoToSettings = () => {
        router.push('/profile');
    };

    // Don't show loading state if already have data
    const isInitialLoading = (authLoading || loadingData) && (!dataFetched || exams.length === 0);

    if (isInitialLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-white">
                <div className="text-center p-4">
                    <div className="w-16 h-16 border-t-4 border-green-600 border-solid rounded-full animate-spin mx-auto"></div>
                    <p className="mt-4 text-gray-600 font-medium">
                        {authLoading ? "Authentification en cours..." : "Chargement des examens..."}
                    </p>
                    {loadingData && !authLoading && (
                        <button
                            onClick={refreshData}
                            className="mt-6 text-sm text-green-700 flex items-center justify-center mx-auto"
                        >
                            <RefreshCw size={16} className="mr-1" />
                            Réinitialiser le chargement
                        </button>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white pb-28 md:pb-6">
            {/* En-tête avec introduction et statut - sans fond vert */}
            <div className="py-3 px-4 mb-4">
                <div className="container mx-auto">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-xl font-bold text-gray-800">Examens disponibles</h1>
                            <p className="text-sm text-gray-600 mt-1">
                                Préparation aux concours {profile?.concours_type === 'ingenieur' ? 'd\'Ingénieur' : 'de Médecine'}
                            </p>
                        </div>
                        {hasAccessToAllExams && (
                            <div className="flex items-center bg-green-100 text-green-800 px-3 py-1 rounded-full">
                                <ShieldCheck size={16} className="mr-1" />
                                <span className="text-sm">Premium</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4">
                {/* Bannière d'accès premium ou message d'accès actif */}
                {!hasAccessToAllExams && !noSubjectsForConcoursType && exams.length > 0 ? (
                    <div className="mb-4">
                        <div className="border border-orange-200 rounded-lg bg-orange-50 overflow-hidden">
                            <div className="p-3 flex items-center justify-between">
                                <div className="flex items-center">
                                    <div className="rounded-full bg-orange-100 p-1.5 mr-2 text-orange-600">
                                        <Award size={16} />
                                    </div>
                                    <div>
                                        <h2 className="font-medium text-orange-800 text-sm">Débloquer l'accès </h2>
                                        <div className="flex items-center space-x-3 mt-1">
                                            <div className="flex items-center text-xs text-orange-700">
                                      <X size={12} className="mr-1" /> Tous les examens
                                            </div>
                                            <div className="text-sm font-medium text-orange-700">{GLOBAL_ACCESS_PRICE} FCFA</div>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={handleGlobalPayment}
                                    className="bg-orange-600 hover:bg-orange-700 text-white px-3 py-1.5 rounded-md text-xs font-medium shadow-sm transition-colors flex items-center"
                                >
                                    <Unlock size={14} className="mr-1" />
                                    Débloquer
                                </button>
                            </div>
                        </div>
                    </div>
                ) : lastValidPayment && !noSubjectsForConcoursType && (
                    <div className="mb-4">
                        <div className="border border-green-200 rounded-lg bg-green-50 overflow-hidden">
                            <div className="p-3 flex items-center justify-between">
                                <div className="flex items-center">
                                    <div className="rounded-full bg-green-100 p-1.5 mr-2 text-green-600">
                                        <ShieldCheck size={16} />
                                    </div>
                                    <div>
                                        <h2 className="font-medium text-green-800 text-sm">Vous avez accès à tous les examens</h2>
                                        <p className="text-xs text-green-700 mt-1">
                                            Accès activé le {new Date(lastValidPayment.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Message d'erreur */}
                {error && (
                    <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4 rounded-md flex">
                        <AlertCircle size={20} className="text-red-500 mr-2 flex-shrink-0" />
                        <div>
                            <div className="text-sm text-red-700">{error}</div>
                            <button
                                onClick={refreshData}
                                className="mt-2 text-sm text-red-700 flex items-center"
                            >
                                <RefreshCw size={14} className="mr-1" />
                                Réessayer
                            </button>
                        </div>
                    </div>
                )}

                {/* Message spécifique pour aucun sujet trouvé pour cette série BAC */}
                {noSubjectsForConcoursType && (
                    <EmptyStateMessage
                        type="settings"
                        message={`Aucun sujet n'est disponible pour le concours ${profile?.concours_type === 'ingenieur' ? 'd\'Ingénieur' : 'de Médecine'}`}
                        actionText="Modifier mes paramètres"
                        actionHandler={handleGoToSettings}
                        icon={BookX}
                    />
                )}

                {/* Examens vides (mais sujets existants) */}
                {!noSubjectsForConcoursType && exams.length === 0 && !error && (
                    <EmptyStateMessage
                        type="refresh"
                        message="Aucun examen n'est disponible pour le moment"
                        actionText="Actualiser la page"
                        actionHandler={refreshData}
                        icon={BookOpen}
                    />
                )}

                {/* Liste des examens */}
                {!noSubjectsForConcoursType && exams.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {exams.map((exam) => (
                            <ExamCard
                                key={exam.id}
                                exam={exam}
                                hasAccess={hasAccessToAllExams}
                            />
                        ))}
                    </div>
                )}

                {/* Message informatif si pas d'examens mais que la série existe */}
                {!noSubjectsForConcoursType && exams.length === 0 && !error && (
                    <div className="mt-8 bg-blue-50 border-l-4 border-blue-400 p-4 rounded-md flex">
                        <Info size={20} className="text-blue-500 mr-2 flex-shrink-0" />
                        <div>
                            <div className="text-sm text-blue-700">
                                Nous préparons de nouveaux examens pour le concours {profile?.concours_type === 'ingenieur' ? 'd\'Ingénieur' : 'de Médecine'}.
                                Revenez bientôt pour découvrir les nouveaux contenus.
                            </div>
                            <button
                                onClick={handleBackToHome}
                                className="mt-2 text-sm text-blue-700 flex items-center"
                            >
                                <Home size={14} className="mr-1" />
                                Retour à l'accueil
                            </button>
                        </div>
                    </div>
                )}

                {/* Bouton de déblocage en bas (sur mobile) - uniquement si l'utilisateur n'a pas d'accès */}
                {!hasAccessToAllExams && exams.length > 1 && !noSubjectsForConcoursType && (
                    <div className="fixed bottom-16 left-0 right-0 px-3 py-2 bg-white border-t shadow-sm md:hidden z-10">
                        <button
                            onClick={handleGlobalPayment}
                            className="w-full py-2 px-3 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded-md shadow-sm transition-colors flex items-center justify-center"
                        >
                            <Unlock size={14} className="mr-1" />
                            Débloquer tous les examens ({GLOBAL_ACCESS_PRICE} FCFA)
                        </button>
                    </div>
                )}

                {/* Bouton de déblocage en bas (sur desktop) - uniquement si l'utilisateur n'a pas d'accès */}
                {!hasAccessToAllExams && exams.length > 0 && !noSubjectsForConcoursType && (
                    <div className="hidden md:block mt-8 text-center">
                        <button
                            onClick={handleGlobalPayment}
                            className="inline-flex items-center px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-md shadow-md transition-colors"
                        >
                            <Unlock size={18} className="mr-2" />
                            Débloquer tous les examens pour {GLOBAL_ACCESS_PRICE} FCFA
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
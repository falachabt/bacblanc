'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import supabase from '@/lib/supabase';
import { notchpay } from '@/lib/notchpay';
import {
    CreditCard, ShoppingBag, Phone, Clock, Award, ArrowRight,
    ChevronLeft, Loader, CheckCircle, XCircle, AlertTriangle,
    RefreshCw, Home
} from 'lucide-react';
import Link from 'next/link';

// Composant d'indicateur de statut
const StatusIndicator = ({ status }) => {
    const getStatusInfo = () => {
        switch (status) {
            case 'pending':
                return {
                    icon: <Clock className="w-6 h-6 text-yellow-500" />,
                    text: 'En attente',
                    description: 'Transaction initiée, en attente de complétion.',
                    color: 'text-yellow-700 bg-yellow-50 border-yellow-200'
                };
            case 'processing':
                return {
                    icon: <Loader className="w-6 h-6 text-blue-500 animate-spin" />,
                    text: 'En cours',
                    description: 'Paiement en cours de traitement.',
                    color: 'text-blue-700 bg-blue-50 border-blue-200'
                };
            case 'complete':
                return {
                    icon: <CheckCircle className="w-6 h-6 text-green-500" />,
                    text: 'Réussi',
                    description: 'Paiement complété avec succès!',
                    color: 'text-green-700 bg-green-50 border-green-200'
                };
            case 'failed':
                return {
                    icon: <XCircle className="w-6 h-6 text-red-500" />,
                    text: 'Échoué',
                    description: 'La transaction a échoué.',
                    color: 'text-red-700 bg-red-50 border-red-200'
                };
            case 'canceled':
                return {
                    icon: <XCircle className="w-6 h-6 text-gray-500" />,
                    text: 'Annulé',
                    description: 'La transaction a été annulée.',
                    color: 'text-gray-700 bg-gray-50 border-gray-200'
                };
            case 'rejected':
                return {
                    icon: <AlertTriangle className="w-6 h-6 text-red-500" />,
                    text: 'Rejeté',
                    description: 'La transaction a été rejetée.',
                    color: 'text-red-700 bg-red-50 border-red-200'
                };
            case 'abandoned':
                return {
                    icon: <XCircle className="w-6 h-6 text-gray-500" />,
                    text: 'Abandonné',
                    description: 'La transaction a été abandonnée.',
                    color: 'text-gray-700 bg-gray-50 border-gray-200'
                };
            case 'expired':
                return {
                    icon: <Clock className="w-6 h-6 text-red-500" />,
                    text: 'Expiré',
                    description: 'La transaction a expiré après 3 heures.',
                    color: 'text-red-700 bg-red-50 border-red-200'
                };
            case 'refunded':
                return {
                    icon: <RefreshCw className="w-6 h-6 text-purple-500" />,
                    text: 'Remboursé',
                    description: 'La transaction a été remboursée.',
                    color: 'text-purple-700 bg-purple-50 border-purple-200'
                };
            case 'partialy-refunded':
                return {
                    icon: <RefreshCw className="w-6 h-6 text-purple-500" />,
                    text: 'Partiellement remboursé',
                    description: 'La transaction a été partiellement remboursée.',
                    color: 'text-purple-700 bg-purple-50 border-purple-200'
                };
            case 'incomplete':
                return {
                    icon: <AlertTriangle className="w-6 h-6 text-yellow-500" />,
                    text: 'Incomplet',
                    description: 'Montant payé inférieur au montant requis.',
                    color: 'text-yellow-700 bg-yellow-50 border-yellow-200'
                };
            default:
                return {
                    icon: <Clock className="w-6 h-6 text-gray-500" />,
                    text: 'Inconnu',
                    description: 'Impossible de déterminer le statut.',
                    color: 'text-gray-700 bg-gray-50 border-gray-200'
                };
        }
    };

    const info = getStatusInfo();

    return (
        <div className={`border rounded-lg p-3 ${info.color} flex flex-col items-center text-center mb-4`}>
            <div className="mb-1">
                {info.icon}
            </div>
            <h3 className="font-bold mb-1">{info.text}</h3>
            <p className="text-xs">{info.description}</p>
        </div>
    );
};

export default function PaymentPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const examId = searchParams.get('examId');
    const isGlobalAccess = searchParams.get('globalAccess') === 'true';
    const paymentReference = searchParams.get('reference'); // Utilisé pour vérifier un paiement existant

    const { user, loading } = useAuth();

    const [exam, setExam] = useState(null);
    const [loadingData, setLoadingData] = useState(true);
    const [error, setError] = useState(null);
    const [phone, setPhone] = useState('');
    const [processingPayment, setProcessingPayment] = useState(false);
    const [paymentUrl, setPaymentUrl] = useState(null);

    // États pour le suivi du paiement
    const [paymentData, setPaymentData] = useState(null);
    const [paymentStatus, setPaymentStatus] = useState(null);
    const [isCheckingStatus, setIsCheckingStatus] = useState(false);
    const [checkCount, setCheckCount] = useState(0);
    const [currentReference, setCurrentReference] = useState(paymentReference);

    // Prix fixe pour l'accès global
    const GLOBAL_ACCESS_PRICE = 200;

    // Redirection si non connecté
    useEffect(() => {
        if (!loading && !user) {
            router.push('/auth/login');
        }
    }, [user, loading, router]);

    // Chargement des détails de l'examen si non global
    useEffect(() => {
        const fetchData = async () => {
            // Si on vérifie un paiement existant via l'URL, chercher d'abord ce paiement
            if (paymentReference) {
                try {
                    const { data, error } = await supabase
                        .from('payments')
                        .select('*')
                        .eq('reference', paymentReference)
                        .single();

                    if (error) throw error;

                    setPaymentData(data);
                    setPaymentStatus(data.status || 'pending');
                    setIsCheckingStatus(true);
                    setCurrentReference(paymentReference);
                    setLoadingData(false);
                    return;
                } catch (error) {
                    console.error('Error fetching payment:', error.message);
                    // Continuer à charger les détails d'examen si le paiement n'est pas trouvé
                }
            }

            // Vérifier si l'utilisateur a un paiement en cours (non terminé)
            if (user) {
                try {
                    const { data: existingPayments, error: paymentsError } = await supabase
                        .from('payments')
                        .select('*')
                        .eq('user_id', user.id)
                        .in('status', ['pending', 'processing'])
                        .order('created_at', { ascending: false })
                        .limit(1);

                    if (paymentsError) throw paymentsError;

                    // Si un paiement en cours est trouvé, passer en mode suivi
                    if (existingPayments && existingPayments.length > 0) {
                        const latestPayment = existingPayments[0];
                        setPaymentData(latestPayment);
                        setPaymentStatus(latestPayment.status);
                        setIsCheckingStatus(true);
                        setCurrentReference(latestPayment.reference);
                        setLoadingData(false);
                        return;
                    }
                } catch (error) {
                    console.error('Error checking existing payments:', error.message);
                    // Continuer même si la vérification échoue
                }
            }

            // Si c'est un accès global, pas besoin de charger les détails de l'examen
            if (isGlobalAccess) {
                setLoadingData(false);
                return;
            }

            if (!examId) {
                setError("Identifiant d'examen manquant");
                setLoadingData(false);
                return;
            }

            try {
                const { data, error } = await supabase
                    .from('exams')
                    .select('*, subject:subject_id(name, code)')
                    .eq('id', examId)
                    .single();

                if (error) throw error;

                setExam(data);
            } catch (error) {
                console.error('Error fetching exam:', error.message);
                setError('Impossible de charger les détails de l\'examen.');
            } finally {
                setLoadingData(false);
            }
        };

        fetchData();
    }, [examId, isGlobalAccess, paymentReference, user]);

    // Fonction pour vérifier le statut du paiement via l'API Notch Pay
    const checkPaymentStatus = async () => {
        if (!currentReference) return;

        setIsCheckingStatus(true);

        try {
            // Appel à l'API pour vérifier le statut
            const response = await fetch(`/api/payments/verify?reference=${currentReference}`);
            const data = await response.json();

            if (response.ok) {
                const newStatus = data.transaction?.status || 'pending';

                // Si le statut a changé, mettre à jour dans la base de données
                if (newStatus !== paymentStatus) {
                    setPaymentStatus(newStatus);
                    await updatePaymentStatusInDb(newStatus);
                }

                setPaymentData(data.payment);
            } else {
                throw new Error(data.message || 'Erreur lors de la vérification du paiement');
            }
        } catch (error) {
            console.error('Payment verification error:', error);
            setError('Impossible de vérifier le statut du paiement. Veuillez réessayer.');
        } finally {
            setIsCheckingStatus(false);
            setCheckCount(prevCount => prevCount + 1);
        }
    };

    // Mettre à jour le statut de paiement dans la base de données
    const updatePaymentStatusInDb = async (status) => {
        if (!currentReference) return;

        try {
            const { error } = await supabase
                .from('payments')
                .update({ status: status })
                .eq('reference', currentReference);

            if (error) throw error;
        } catch (error) {
            console.error('Error updating payment status:', error.message);
        }
    };

    // Vérifier périodiquement le statut si en attente ou en cours
    useEffect(() => {
        // Ne vérifier que si nous avons une référence et un statut transitoire
        if (currentReference &&
            (paymentStatus === 'pending' || paymentStatus === 'processing') &&
            checkCount < 30) {

            const intervalId = setInterval(() => {
                checkPaymentStatus();
            }, 10000); // Vérifier toutes les 10 secondes

            return () => clearInterval(intervalId);
        }
    }, [currentReference, paymentStatus, checkCount]);

    // Vérification initiale si nous avons une référence
    useEffect(() => {
        if (currentReference && paymentStatus) {
            checkPaymentStatus();
        }
    }, [currentReference]);

    const handlePayment = async (e) => {
        e.preventDefault();

        if (!phone || phone.length < 9) {
            setError('Veuillez entrer un numéro de téléphone valide.');
            return;
        }

        setProcessingPayment(true);
        setError(null);

        try {
            // Format phone number (remove Cameroon prefix if present)
            const formattedPhone = phone.replace(/^237/, '').replace(/\s/g, '');

            // Prepare payment params
            const paymentParams = {
                amount: isGlobalAccess ? GLOBAL_ACCESS_PRICE : exam.price,
                currency: 'XAF',
                email: user.email,
                description: isGlobalAccess
                    ? `Accès à tous les examens`
                    : `Paiement pour l'examen: ${exam.title}`,
                phone: formattedPhone,
                channel: 'cm.mobile',
                metadata: {
                    user_id: user.id,
                    exam_id: isGlobalAccess ? null : exam.id, // null pour accès global
                    is_global_access: isGlobalAccess
                }
            };

            // Initialize payment
            const { initResponse, chargeResponse, error: paymentError } = await notchpay.initiateDirectCharge(paymentParams);

            if (paymentError) {
                // If direct charge failed, but init succeeded, we have a checkout URL
                if (initResponse && initResponse.authorization_url) {
                    setPaymentUrl(initResponse.authorization_url);
                } else {
                    throw new Error(paymentError);
                }
            } else if (chargeResponse) {
                // Handle successful direct charge
                const reference = initResponse.transaction.reference;
                await createPaymentRecord(
                    isGlobalAccess ? null : exam?.id,
                    reference,
                    'pending',
                    isGlobalAccess ? GLOBAL_ACCESS_PRICE : exam?.price
                );

                // Mettre à jour l'interface pour suivre le statut
                setCurrentReference(reference);
                setPaymentStatus('pending');
                setIsCheckingStatus(true);
            }
        } catch (error) {
            console.error('Payment error:', error);
            setError('Une erreur est survenue lors du traitement du paiement.');
        } finally {
            setProcessingPayment(false);
        }
    };

    // Create a payment record in the database
    const createPaymentRecord = async (examId, reference, status, amount) => {
        try {
            const { data, error } = await supabase
                .from('payments')
                .insert([{
                    user_id: user.id,
                    exam_id: examId, // null pour un accès global
                    reference,
                    amount,
                    status
                }]);

            if (error) throw error;

            return data;
        } catch (error) {
            console.error('Error creating payment record:', error.message);
            throw error;
        }
    };

    // Fonction pour réessayer manuellement la vérification
    const handleRetryCheck = () => {
        checkPaymentStatus();
    };

    if (loading || loadingData) {
        return (
            <div className="bg-white h-screen pt-4 pb-20 flex flex-col justify-center items-center">
                <Loader className="w-10 h-10 text-green-600 animate-spin" />
                <p className="mt-4 text-gray-600 text-sm">Chargement...</p>
            </div>
        );
    }

    if (!isGlobalAccess && !exam && !paymentData) {
        return (
            <div className="bg-white h-screen pt-4 pb-20">
                <div className="px-4 py-8">
                    <div className="text-red-600 mb-6 text-center">
                        <AlertTriangle className="h-12 w-12 mx-auto mb-2" />
                        <p className="text-lg font-medium">Examen non trouvé ou inaccessible.</p>
                    </div>
                    <div className="flex justify-center">
                        <button
                            onClick={() => router.push('/exams')}
                            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md flex items-center"
                        >
                            <ChevronLeft className="mr-1" size={18} />
                            Retour aux examens
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Si nous avons une URL de paiement, afficher le bouton de redirection
    if (paymentUrl) {
        return (
            <div className="bg-white h-screen pt-4 pb-20">
                <div className="px-4">
                    {/* Petite icône en haut */}
                    <div className="mb-6 text-center">
                        <div className="rounded-full bg-green-100 w-16 h-16 mx-auto flex items-center justify-center">
                            <CreditCard className="w-8 h-8 text-green-600" />
                        </div>
                    </div>

                    <h2 className="text-xl font-bold text-center mb-2">Finaliser le paiement</h2>
                    <p className="text-center text-gray-600 mb-8">
                        Vous allez être redirigé vers la page de paiement sécurisée
                    </p>

                    <a
                        href={paymentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg text-center flex items-center justify-center"
                    >
                        Continuer vers le paiement
                        <ArrowRight className="ml-2" size={18} />
                    </a>

                    <button
                        onClick={() => router.push('/exams')}
                        className="mt-6 text-green-600 hover:text-green-800 flex items-center justify-center mx-auto"
                    >
                        <ChevronLeft className="mr-1" size={18} />
                        Annuler et retourner aux examens
                    </button>
                </div>
            </div>
        );
    }

    // Si nous suivons le statut d'un paiement
    if (paymentStatus) {
        // Actions possibles en fonction du statut
        const renderStatusActions = () => {
            const isTerminalStatus = ['complete', 'failed', 'canceled', 'rejected', 'abandoned', 'expired', 'refunded', 'partialy-refunded'].includes(paymentStatus);

            return (
                <div className="mt-4 space-y-3">
                    {['pending', 'processing'].includes(paymentStatus) && (
                        <button
                            onClick={handleRetryCheck}
                            disabled={isCheckingStatus}
                            className={`w-full flex items-center justify-center py-2 px-4 border border-green-300 rounded-lg text-green-700 bg-green-50 ${isCheckingStatus ? 'opacity-70 cursor-not-allowed' : 'hover:bg-green-100'}`}
                        >
                            {isCheckingStatus ? (
                                <>
                                    <Loader className="mr-2 h-4 w-4 animate-spin" />
                                    Vérification...
                                </>
                            ) : (
                                <>
                                    <RefreshCw className="mr-2 h-4 w-4" />
                                    Actualiser le statut
                                </>
                            )}
                        </button>
                    )}

                    {isTerminalStatus && paymentStatus === 'complete' && (
                        <Link
                            href="/exams"
                            className="w-full flex items-center justify-center py-3 px-4 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg"
                        >
                            Accéder aux examens
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                    )}

                    {isTerminalStatus && paymentStatus !== 'complete' && (
                        <button
                            onClick={() => {
                                // Réinitialiser l'état pour recommencer le paiement
                                setPaymentStatus(null);
                                setPaymentData(null);
                                setCurrentReference(null);
                            }}
                            className="w-full flex items-center justify-center py-3 px-4 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg"
                        >
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Réessayer le paiement
                        </button>
                    )}

                    <Link
                        href="/exams"
                        className="w-full flex items-center justify-center py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    >
                        <Home className="mr-2 h-4 w-4" />
                        Retour aux examens
                    </Link>
                </div>
            );
        };

        return (
            <div className="bg-white h-screen pt-4 pb-20">
                <div className="px-4">
                    {/* Petite icône en haut */}
                    <div className="mb-4 text-center">
                        <div className="rounded-full bg-green-100 w-16 h-16 mx-auto flex items-center justify-center">
                            <CreditCard className="w-8 h-8 text-green-600" />
                        </div>
                    </div>

                    {/* Titre et sous-titre */}
                    <h2 className="text-xl font-bold text-center mb-1">Statut du paiement</h2>
                    <p className="text-center text-gray-600 text-sm mb-6">
                        Suivi de votre transaction
                    </p>

                    {/* Indicateur de statut */}
                    <StatusIndicator status={paymentStatus} />

                    {/* Détails du paiement */}
                    {paymentData && (
                        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200 mb-4">
                            <h3 className="font-medium text-gray-800 mb-2 text-sm">Détails de la transaction</h3>

                            <div className="space-y-2 text-xs">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Référence:</span>
                                    <span className="font-medium">{currentReference}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Montant:</span>
                                    <span className="font-medium">{paymentData.amount} FCFA</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Date:</span>
                                    <span className="font-medium">
                                        {new Date().toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Actions disponibles */}
                    {renderStatusActions()}
                </div>
            </div>
        );
    }

    // Interface normale de paiement (quand on n'est pas en train de suivre un paiement)
    return (
        <div className="bg-white h-screen pt-4 pb-20">
            <div className="px-4">
                {/* Petite icône en haut */}
                <div className="mb-4 text-center">
                    <div className="rounded-full bg-green-100 w-16 h-16 mx-auto flex items-center justify-center">
                        {isGlobalAccess ? (
                            <Award className="w-8 h-8 text-green-600" />
                        ) : (
                            <ShoppingBag className="w-8 h-8 text-green-600" />
                        )}
                    </div>
                </div>

                {/* Titre et sous-titre */}
                <h2 className="text-xl font-bold text-center">
                    {isGlobalAccess ? 'Accès Premium' : 'Achat Examen'}
                </h2>
                <p className="text-center text-gray-600 text-sm mb-6">
                    {isGlobalAccess
                        ? 'Débloquez l\'accès à tous les examens'
                        : 'Procédez au paiement pour accéder à cet examen'}
                </p>

                {/* Détails du produit */}
                <div className="mb-6">
                    {isGlobalAccess ? (
                        <div className="bg-green-50 rounded-lg p-3 mb-4 border border-green-100">
                            <h3 className="text-base font-semibold mb-1 text-green-800 flex items-center">
                                <Award className="mr-2" size={16} />
                                Accès à tous les examens
                            </h3>
                            <p className="text-sm text-gray-600 mb-2">
                                Débloquez l'accès à tous les examens disponibles pour votre série BAC.
                            </p>
                            <div className="flex items-center justify-between text-green-700 font-medium">
                                <span>Prix total:</span>
                                <span className="text-lg">{GLOBAL_ACCESS_PRICE} FCFA</span>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-gray-50 rounded-lg p-3 mb-4 border border-gray-200">
                            <h3 className="text-base font-semibold mb-1 text-gray-800">
                                {exam.title}
                            </h3>
                            <div className="flex items-center text-gray-600 mb-1">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                <span className="text-sm">{exam.subject?.name || "Sujet non disponible"}</span>
                            </div>
                            <div className="flex items-center text-gray-600 mb-2">
                                <Clock className="h-4 w-4 mr-1" />
                                <span className="text-sm">Durée: {exam.duration.split(':')[0]}h{exam.duration.split(':')[1]}m</span>
                            </div>
                            <div className="flex items-center justify-between text-green-700 font-medium">
                                <span>Prix:</span>
                                <span className="text-lg">{exam.price} FCFA</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Message d'erreur */}
                {error && (
                    <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-3 rounded">
                        <div className="text-sm text-red-700">{error}</div>
                    </div>
                )}

                {/* Formulaire de paiement */}
                <form onSubmit={handlePayment} className="space-y-4">
                    <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                            Numéro de téléphone (Mobile Money)
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                <Phone size={16} />
                            </div>
                            <input
                                type="tel"
                                id="phone"
                                placeholder="6XXXXXXXX"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                                required
                            />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                            Format: 6XXXXXXXX (sans préfixe 237)
                        </p>
                    </div>

                    <button
                        type="submit"
                        disabled={processingPayment}
                        className={`w-full flex justify-center items-center py-3 px-4 rounded-lg text-white font-medium ${
                            processingPayment
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-green-600 hover:bg-green-700'
                        }`}
                    >
                        {processingPayment ? (
                            <>
                                <Loader className="w-5 h-5 animate-spin mr-2" />
                                Traitement en cours...
                            </>
                        ) : (
                            <>
                                Payer maintenant
                                <CreditCard className="ml-2" size={16} />
                            </>
                        )}
                    </button>
                </form>

                {/* Vérifier paiement précédent */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-600 text-center mb-3">
                        Vous avez déjà effectué un paiement ?
                    </p>
                    <button
                        onClick={async () => {
                            setLoadingData(true);

                            try {
                                const { data, error } = await supabase
                                    .from('payments')
                                    .select('*')
                                    .eq('user_id', user.id)
                                    .order('created_at', { ascending: false })
                                    .limit(1);

                                if (error) throw error;

                                if (data && data.length > 0) {
                                    setPaymentData(data[0]);
                                    setPaymentStatus(data[0].status);
                                    setIsCheckingStatus(true);
                                    setCurrentReference(data[0].reference);
                                } else {
                                    setError("Aucun paiement trouvé pour votre compte.");
                                }
                            } catch (error) {
                                console.error('Error fetching previous payments:', error);
                                setError("Impossible de récupérer vos paiements précédents.");
                            } finally {
                                setLoadingData(false);
                            }
                        }}
                        className="w-full flex justify-center items-center py-2 px-4 border border-green-300 rounded-lg text-green-700 bg-green-50 hover:bg-green-100"
                    >
                        <RefreshCw className="mr-2" size={16} />
                        Vérifier mon dernier paiement
                    </button>
                </div>

                {/* Bouton de retour et notification */}
                <div className="mt-6 text-center">
                    <Link
                        href="/exams"
                        className="text-green-600 hover:text-green-800 flex items-center justify-center"
                    >
                        <ChevronLeft className="mr-1" size={16} />
                        Retour aux examens
                    </Link>

                    {/* Message informatif */}
                    <p className="text-xs text-gray-500 mt-4">
                        Note: Si vous avez déjà un paiement en cours, il vous sera automatiquement présenté.
                    </p>
                </div>
            </div>
        </div>
    );
}
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import supabase from '@/lib/supabase';
import { notchpay } from '@/lib/notchpay';
import {
    CreditCard, ShoppingBag, Phone, Clock, Award, ArrowRight,
    ChevronLeft, Loader, CheckCircle, XCircle, AlertTriangle,
    RefreshCw, Home, List, ChevronDown, ChevronUp, PlusCircle
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
                    description: 'Paiement en cours de traitement. Cela peut prendre quelques minutes.',
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

// Nouveau composant pour afficher la liste des paiements précédents
const PaymentHistoryList = ({ payments, onSelect, onClose }) => {
    if (!payments || payments.length === 0) {
        return (
            <div className="text-center py-4">
                <p className="text-gray-500">Aucun paiement trouvé</p>
            </div>
        );
    }

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusBadge = (status) => {
        const statusColors = {
            complete: 'bg-green-100 text-green-800 border-green-200',
            pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
            processing: 'bg-blue-100 text-blue-800 border-blue-200',
            failed: 'bg-red-100 text-red-800 border-red-200',
            canceled: 'bg-gray-100 text-gray-800 border-gray-200',
            rejected: 'bg-red-100 text-red-800 border-red-200',
            abandoned: 'bg-gray-100 text-gray-800 border-gray-200',
            expired: 'bg-red-100 text-red-800 border-red-200',
            refunded: 'bg-purple-100 text-purple-800 border-purple-200',
            'partialy-refunded': 'bg-purple-100 text-purple-800 border-purple-200',
            incomplete: 'bg-yellow-100 text-yellow-800 border-yellow-200'
        };

        const color = statusColors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
        return <span className={`text-xs px-2 py-1 rounded-full border ${color}`}>{status}</span>;
    };

    return (
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 max-h-96 overflow-auto mb-4">
            <div className="flex justify-between items-center p-3 border-b">
                <h3 className="font-medium">Historique des paiements</h3>
                <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                    <XCircle size={18} />
                </button>
            </div>
            <ul className="divide-y divide-gray-200">
                {payments.map((payment) => (
                    <li
                        key={payment.id}
                        className="p-3 hover:bg-gray-50 cursor-pointer"
                        onClick={() => onSelect(payment)}
                    >
                        <div className="flex justify-between items-center mb-1">
                            <span className="font-medium text-sm truncate" style={{ maxWidth: '70%' }}>
                                {payment.reference}
                            </span>
                            {getStatusBadge(payment.status)}
                        </div>
                        <div className="flex justify-between text-xs text-gray-500">
                            <span>{payment.amount} FCFA</span>
                            <span>{formatDate(payment.created_at)}</span>
                        </div>
                    </li>
                ))}
            </ul>
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
    const [successMessage, setSuccessMessage] = useState(null);
    const [phone, setPhone] = useState('');
    const [processingPayment, setProcessingPayment] = useState(false);
    const [paymentUrl, setPaymentUrl] = useState(null);

    // États pour le suivi du paiement
    const [paymentData, setPaymentData] = useState(null);
    const [paymentStatus, setPaymentStatus] = useState(null);
    const [isCheckingStatus, setIsCheckingStatus] = useState(false);
    const [checkCount, setCheckCount] = useState(0);
    const [currentReference, setCurrentReference] = useState(paymentReference);

    // Nouvel état pour le mode d'affichage
    const [displayMode, setDisplayMode] = useState('form'); // 'form', 'status', 'history'

    // État pour l'historique des paiements
    const [paymentHistory, setPaymentHistory] = useState([]);
    const [loadingHistory, setLoadingHistory] = useState(false);
    const [showHistory, setShowHistory] = useState(false);

    // État pour suivre si l'utilisateur a déjà un paiement complet
    const [hasCompletePayment, setHasCompletePayment] = useState(false);

    // Prix fixe pour l'accès global
    const GLOBAL_ACCESS_PRICE = 200;

    // Redirection si non connecté
    useEffect(() => {
        if (!loading && !user) {
            router.push('/auth/login');
        }
    }, [user, loading, router]);

    // Vérifier si l'utilisateur a déjà un paiement complet
    const checkForCompletePayment = async () => {
        if (!user) return false;

        try {
            const { data, error } = await supabase
                .from('payments')
                .select('*')
                .eq('user_id', user.id)
                .eq('status', 'complete')
                .limit(1);

            if (error) throw error;

            if (data && data.length > 0) {
                setHasCompletePayment(true);
                return true;
            }

            return false;
        } catch (error) {
            console.error('Error checking for complete payment:', error.message);
            return false;
        }
    };

    // Chargement des détails de l'examen si non global
    useEffect(() => {
        const fetchData = async () => {
            // Vérifier si l'utilisateur a déjà un paiement complet
            const hasComplete = await checkForCompletePayment();

            // Si on vérifie un paiement existant via l'URL, chercher d'abord ce paiement
            if (paymentReference) {
                try {
                    const { data, error } = await supabase
                        .from('payments')
                        .select('*')
                        .eq('reference', paymentReference)
                        .single();

                    if (error) throw error;

                    // Vérifier le statut actuel via l'API avant d'afficher
                    const updatedStatus = await checkPaymentStatus(paymentReference);

                    setPaymentData(data);
                    setPaymentStatus(updatedStatus?.status || data.status || 'pending');
                    setIsCheckingStatus(true);
                    setCurrentReference(paymentReference);
                    setDisplayMode('status');
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

                    // Si un paiement en cours est trouvé, vérifier son statut actuel et passer en mode suivi
                    if (existingPayments && existingPayments.length > 0) {
                        const latestPayment = existingPayments[0];

                        // Vérifier le statut actuel via l'API
                        const updatedStatus = await checkPaymentStatus(latestPayment.reference);
                        const currentStatus = updatedStatus?.status || latestPayment.status;

                        setPaymentData(latestPayment);
                        setPaymentStatus(currentStatus);
                        setIsCheckingStatus(true);
                        setCurrentReference(latestPayment.reference);
                        setDisplayMode('status');
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

    // Fonction pour charger l'historique des paiements
    const fetchPaymentHistory = async () => {
        if (!user) return;

        setLoadingHistory(true);

        try {
            const { data, error } = await supabase
                .from('payments')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(20);

            if (error) throw error;

            setPaymentHistory(data || []);
            setShowHistory(true);

            // Réinitialiser les messages
            setError(null);
            setSuccessMessage(null);
        } catch (error) {
            console.error('Error fetching payment history:', error.message);
            setSuccessMessage(null);
            setError('Impossible de charger l\'historique des paiements.');
        } finally {
            setLoadingHistory(false);
        }
    };

    // Fonction pour vérifier le statut du paiement via l'API Notch Pay
    const checkPaymentStatus = async (reference = currentReference) => {
        if (!reference) return;

        setIsCheckingStatus(true);

        try {
            // Appel à l'API pour vérifier le statut
            const response = await fetch(`/api/payments/verify?reference=${reference}`);
            const data = await response.json();

            if (response.ok) {
                const newStatus = data.transaction?.status || 'pending';
                const paymentInfo = data.payment;

                // Si le statut a changé, mettre à jour dans la base de données
                if (newStatus !== paymentStatus) {
                    setPaymentStatus(newStatus);
                    await updatePaymentStatusInDb(reference, newStatus);

                    // Si le paiement est passé à "complet", l'utilisateur a un paiement complet
                    if (newStatus === 'complete') {
                        setHasCompletePayment(true);
                    }
                }

                setPaymentData(paymentInfo);
                setCurrentReference(reference);
                return { status: newStatus, payment: paymentInfo };
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

    // Nouvelle fonction pour vérifier tous les paiements en attente
    const checkAllPendingPayments = async () => {
        if (!user) return;

        setIsCheckingStatus(true);
        setError(null);

        try {
            // Récupérer tous les paiements en attente/en cours
            const { data: pendingPayments, error } = await supabase
                .from('payments')
                .select('*')
                .eq('user_id', user.id)
                .in('status', ['pending', 'processing'])
                .order('created_at', { ascending: false });

            if (error) throw error;

            if (!pendingPayments || pendingPayments.length === 0) {
                setError('Aucun paiement en attente trouvé.');
                return;
            }

            // Vérifier chaque paiement en attente
            const results = [];
            for (const payment of pendingPayments) {
                try {
                    const response = await fetch(`/api/payments/verify?reference=${payment.reference}`);
                    const data = await response.json();

                    if (response.ok) {
                        const newStatus = data.transaction?.status || 'pending';

                        // Mettre à jour dans la base de données si le statut a changé
                        if (newStatus !== payment.status) {
                            await updatePaymentStatusInDb(payment.reference, newStatus);

                            // Si un paiement est passé à "complete", l'utilisateur a un paiement complet
                            if (newStatus === 'complete') {
                                setHasCompletePayment(true);
                            }
                        }

                        results.push({
                            reference: payment.reference,
                            oldStatus: payment.status,
                            newStatus: newStatus,
                            updated: newStatus !== payment.status
                        });

                        // Si c'est le paiement actuellement affiché, mettre à jour l'interface
                        if (payment.reference === currentReference) {
                            setPaymentStatus(newStatus);
                            setPaymentData({...payment, status: newStatus});
                        }
                    }
                } catch (err) {
                    console.error(`Error checking payment ${payment.reference}:`, err);
                }
            }

            // Mettre à jour l'historique des paiements
            fetchPaymentHistory();

            // Afficher un message de succès si des statuts ont été mis à jour
            const updatedCount = results.filter(r => r.updated).length;
            if (updatedCount > 0) {
                setSuccessMessage(`${updatedCount} paiement(s) ont été mis à jour.`);
                setError(null);
            } else {
                setSuccessMessage('Tous les paiements sont à jour.');
                setError(null);
            }

            return results;
        } catch (error) {
            console.error('Bulk payment verification error:', error);
            setSuccessMessage(null);
            setError('Une erreur est survenue lors de la vérification des paiements.');
        } finally {
            setIsCheckingStatus(false);
        }
    };

    // Mettre à jour le statut de paiement dans la base de données
    const updatePaymentStatusInDb = async (reference, status) => {
        if (!reference) return;

        try {
            const { error } = await supabase
                .from('payments')
                .update({ status: status })
                .eq('reference', reference);

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

    // Vérification initiale si nous avons une référence et gestion du focus
    useEffect(() => {
        // Vérification initiale du paiement
        if (currentReference && paymentStatus && displayMode === 'status') {
            checkPaymentStatus();
        }

        // Fonction pour réinitialiser les états de chargement lors du changement de visibilité
        const handleVisibilityChange = () => {
            if (!document.hidden) {
                // Si la page regagne le focus
                setIsCheckingStatus(false);
                setLoadingHistory(false);
                setProcessingPayment(false);
            }
        };

        // Ajouter l'écouteur d'événement
        document.addEventListener('visibilitychange', handleVisibilityChange);

        // Nettoyage
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [currentReference, paymentStatus, displayMode]);

    const handlePayment = async (e) => {
        e.preventDefault();

        // Vérifier si l'utilisateur a déjà un paiement complet
        const hasComplete = await checkForCompletePayment();
        if (hasComplete) {
            setError('Vous avez déjà un paiement complété. Vous ne pouvez pas effectuer un nouveau paiement.');
            return;
        }

        if (!phone || phone.length < 9) {
            setError('Veuillez entrer un numéro de téléphone valide.');
            return;
        }

        setProcessingPayment(true);
        setError(null);
        setSuccessMessage(null);

        try {
            // Format phone number (remove Cameroon prefix if present)
            const formattedPhone = phone.replace(/^237/, '').replace(/\s/g, '');

            // Prepare payment params
            const paymentParams = {
                amount: isGlobalAccess ? GLOBAL_ACCESS_PRICE : exam.price,
                currency: 'XAF',
                email: user.email,
                description: isGlobalAccess
                    ? `Elearn prepa | Challenge Bac Blanc`
                    : `Paiement pour l'examen: ${exam.title}`,
                phone: formattedPhone,
                channel: 'cm.mobile',
                metadata: {
                    user_id: user.id,
                    is_global_access: isGlobalAccess
                }
            };

            // Initialize payment
            const { initResponse, chargeResponse, error: paymentError } = await notchpay.initiateDirectCharge(paymentParams);

            if (paymentError) {
                // If direct charge failed, but init succeeded, we have a checkout URL
                if (initResponse && initResponse.authorization_url) {
                    setPaymentUrl(initResponse.authorization_url);
                    createPaymentRecord(null, initResponse.transaction.reference, 'pending', isGlobalAccess ? GLOBAL_ACCESS_PRICE : exam.price);
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
                setDisplayMode('status');
            }
        } catch (error) {
            console.error('Payment error:', error);
            setSuccessMessage(null);
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

    // Fonction pour sélectionner un paiement dans l'historique
    const handleSelectPayment = async (payment) => {
        setShowHistory(false);

        // Vérifier le statut du paiement sélectionné
        const result = await checkPaymentStatus(payment.reference);

        if (result) {
            setPaymentData(result.payment);
            setPaymentStatus(result.status);
            setCurrentReference(payment.reference);
            setDisplayMode('status');
        }
    };

    // Fonction pour démarrer un nouveau paiement
    const startNewPayment = async () => {
        // Vérifier si l'utilisateur a déjà un paiement complet
        const hasComplete = await checkForCompletePayment();
        if (hasComplete) {
            setError('Vous avez déjà un paiement complété. Vous ne pouvez pas effectuer un nouveau paiement.');
            return;
        }

        setPaymentData(null);
        setPaymentStatus(null);
        setCurrentReference(null);
        setDisplayMode('form');
        setPhone('');
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
    if (displayMode === 'status') {
        // Actions possibles en fonction du statut
        const renderStatusActions = () => {
            const isTerminalStatus = ['complete', 'failed', 'canceled', 'rejected', 'abandoned', 'expired', 'refunded', 'partialy-refunded'].includes(paymentStatus);

            return (
                <div className="mt-4 space-y-3">
                    {isTerminalStatus && paymentStatus === 'complete' && (
                        <Link
                            href="/exams"
                            className="w-full flex items-center justify-center py-3 px-4 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg"
                        >
                            Accéder aux examens
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                    )}

                    {/* Bouton pour faire un nouveau paiement - disponible seulement si le statut n'est pas 'complete' */}
                    {paymentStatus !== 'complete' && !hasCompletePayment && (
                        <button
                            onClick={startNewPayment}
                            className="w-full flex items-center justify-center py-3 px-4 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg"
                        >
                            <PlusCircle className="mr-2 h-4 w-4" />
                            {isTerminalStatus ? 'Réessayer le paiement' : 'Nouveau paiement'}
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
                                        {new Date(paymentData.created_at || new Date()).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Messages de notification */}
                    {error && (
                        <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-3 rounded">
                            <div className="text-sm text-red-700">{error}</div>
                        </div>
                    )}

                    {successMessage && (
                        <div className="mb-4 bg-green-50 border-l-4 border-green-400 p-3 rounded">
                            <div className="text-sm text-green-700">{successMessage}</div>
                        </div>
                    )}

                    {/* Boutons pour voir l'historique et vérifier tous les paiements */}
                    <div className="flex space-x-2 mb-4">
                        <button
                            onClick={fetchPaymentHistory}
                            disabled={loadingHistory}
                            className="flex-1 flex items-center justify-center py-2 px-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                        >
                            {loadingHistory ? (
                                <Loader className="mr-1 h-4 w-4 animate-spin" />
                            ) : (
                                <List className="mr-1 h-4 w-4" />
                            )}
                            Voir mes paiements
                        </button>

                        <button
                            onClick={checkAllPendingPayments}
                            disabled={isCheckingStatus}
                            className="flex-1 flex items-center justify-center py-2 px-2 border border-green-300 rounded-lg text-green-700 bg-green-50 hover:bg-green-100"
                        >
                            {isCheckingStatus ? (
                                <Loader className="mr-1 h-4 w-4 animate-spin" />
                            ) : (
                                <RefreshCw className="mr-1 h-4 w-4" />
                            )}
                            Actualiser
                        </button>
                    </div>

                    {/* Affichage de l'historique des paiements */}
                    {showHistory && (
                        <PaymentHistoryList
                            payments={paymentHistory}
                            onSelect={handleSelectPayment}
                            onClose={() => setShowHistory(false)}
                        />
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

                {/* Messages de notification */}
                {error && (
                    <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-3 rounded">
                        <div className="text-sm text-red-700">{error}</div>
                    </div>
                )}

                {successMessage && (
                    <div className="mb-4 bg-green-50 border-l-4 border-green-400 p-3 rounded">
                        <div className="text-sm text-green-700">{successMessage}</div>
                    </div>
                )}

                {/* Afficher message si l'utilisateur a déjà un paiement complet */}
                {hasCompletePayment && (
                    <div className="mb-4 bg-green-50 border-l-4 border-green-400 p-3 rounded">
                        <div className="text-sm text-green-700">
                            Vous avez déjà un paiement complété. Vous pouvez accéder aux examens.
                            <div className="mt-2">
                                <Link
                                    href="/exams"
                                    className="flex items-center justify-center py-2 px-4 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg"
                                >
                                    Accéder aux examens
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </div>
                        </div>
                    </div>
                )}

                {/* Formulaire de paiement - caché si l'utilisateur a déjà un paiement complet */}
                {!hasCompletePayment && (
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
                )}

                {/* Voir les paiements précédents */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex space-x-2 mb-3">
                        <button
                            onClick={fetchPaymentHistory}
                            disabled={loadingHistory}
                            className="flex-1 flex justify-center items-center py-2 px-2 border border-green-300 rounded-lg text-green-700 bg-green-50 hover:bg-green-100"
                        >
                            {loadingHistory ? (
                                <>
                                    <Loader className="mr-1 h-4 w-4 animate-spin" />
                                    Chargement...
                                </>
                            ) : (
                                <>
                                    <List className="mr-1" size={16} />
                                    Mes paiements
                                </>
                            )}
                        </button>

                        <button
                            onClick={checkAllPendingPayments}
                            disabled={isCheckingStatus}
                            className="flex-1 flex justify-center items-center py-2 px-2 border border-blue-300 rounded-lg text-blue-700 bg-blue-50 hover:bg-blue-100"
                        >
                            {isCheckingStatus ? (
                                <>
                                    <Loader className="mr-1 h-4 w-4 animate-spin" />
                                    Vérification...
                                </>
                            ) : (
                                <>
                                    <RefreshCw className="mr-1" size={16} />
                                    Actualiser
                                </>
                            )}
                        </button>
                    </div>

                    {/* Affichage de l'historique des paiements */}
                    {showHistory && (
                        <PaymentHistoryList
                            payments={paymentHistory}
                            onSelect={handleSelectPayment}
                            onClose={() => setShowHistory(false)}
                        />
                    )}
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
                        Note: Vous pouvez consulter l'historique de vos paiements à tout moment.
                    </p>
                </div>
            </div>
        </div>
    );
}
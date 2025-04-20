// Composant de guide de paiement sous forme de modal
import { useState, useEffect } from 'react';
import {
    X, CreditCard, Phone, CheckCircle, Clock, ArrowRight,
    DollarSign, AlertCircle, Smartphone
} from 'lucide-react';

const PaymentGuideModal = ({ onClose }) => {
    const [currentStep, setCurrentStep] = useState(0);

    const steps = [
        {
            title: "Préparez votre paiement",
            description: "Assurez-vous d'avoir au moins 200 FCFA dans votre compte Orange Money ou MTN Mobile Money",
            icon: <DollarSign className="w-8 h-8 text-orange-500" />,
            illustration: (
                <div className="bg-orange-100 rounded-lg p-4 flex items-center justify-center">
                    <div className="flex items-center space-x-4">
                        <div className="relative flex flex-col items-center">
                            <div className="w-16 h-24 bg-orange-500 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold">OM</span>
                            </div>
                            <div className="absolute -right-2 -top-2 bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center">
                                <span className="text-xs font-bold">200</span>
                            </div>
                        </div>
                        <div className="relative flex flex-col items-center">
                            <div className="w-16 h-24 bg-yellow-500 rounded-lg flex items-center justify-center">
                                <span className="text-black font-bold">MTN</span>
                            </div>
                            <div className="absolute -right-2 -top-2 bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center">
                                <span className="text-xs font-bold">200</span>
                            </div>
                        </div>
                    </div>
                </div>
            )
        },
        {
            title: "Entrez votre numéro",
            description: "Renseignez votre numéro Orange Money ou MTN Mobile Money (ou celui de la personne qui va payer pour vous)",
            icon: <Phone className="w-8 h-8 text-orange-500" />,
            illustration: (
                <div className="bg-orange-100 rounded-lg p-4 flex items-center justify-center space-x-3">
                    <div className="flex flex-col items-center">
                        <div className="w-5 h-5 rounded-full bg-orange-500 mb-1"></div>
                        <div className="relative w-28 h-12 border-2 border-orange-300 rounded-lg flex items-center px-2 bg-white">
                            <Phone className="w-3 h-3 text-orange-400 mr-1" />
                            <span className="text-gray-800 text-xs">6XX XXX XXX</span>
                        </div>
                    </div>
                    <div className="flex flex-col items-center">
                        <div className="w-5 h-5 rounded-full bg-yellow-500 mb-1"></div>
                        <div className="relative w-28 h-12 border-2 border-yellow-300 rounded-lg flex items-center px-2 bg-white">
                            <Phone className="w-3 h-3 text-yellow-500 mr-1" />
                            <span className="text-gray-800 text-xs">6XX XXX XXX</span>
                        </div>
                    </div>
                </div>
            )
        },
        {
            title: "Validation sur téléphone",
            description: "La personne concernée recevra une notification sur son téléphone pour valider la transaction avec son code secret",
            icon: <Smartphone className="w-8 h-8 text-orange-500" />,
            illustration: (
                <div className="bg-orange-100 rounded-lg p-4 flex items-center justify-center space-x-4">
                    <div className="relative">
                        <div className="w-20 h-36 border-2 border-gray-700 rounded-lg bg-black">
                            <div className="absolute w-16 h-24 top-5 left-2 bg-white rounded-sm flex flex-col items-center justify-center p-1">
                                <div className="w-full bg-orange-500 text-white text-xs p-1 rounded text-center">Orange Money</div>
                                <div className="text-xs mt-1 font-bold text-center">Autoriser paiement?</div>
                                <div className="mt-2 flex space-x-2">
                                    <div className="bg-green-500 text-white text-xs px-2 py-1 rounded">Oui</div>
                                    <div className="bg-red-500 text-white text-xs px-2 py-1 rounded">Non</div>
                                </div>
                            </div>
                        </div>
                        <div className="absolute -right-2 -top-2 animate-ping bg-red-500 opacity-50 rounded-full w-4 h-4"></div>
                        <div className="absolute -right-2 -top-2 bg-red-500 rounded-full w-4 h-4"></div>
                    </div>

                    <div className="relative">
                        <div className="w-20 h-36 border-2 border-gray-700 rounded-lg bg-black">
                            <div className="absolute w-16 h-24 top-5 left-2 bg-white rounded-sm flex flex-col items-center justify-center p-1">
                                <div className="w-full bg-yellow-500 text-black text-xs p-1 rounded text-center">MTN MoMo</div>
                                <div className="text-xs mt-1 font-bold text-center">Confirmer transaction?</div>
                                <div className="mt-2 flex space-x-2">
                                    <div className="bg-green-500 text-white text-xs px-2 py-1 rounded">OK</div>
                                    <div className="bg-red-500 text-white text-xs px-2 py-1 rounded">Non</div>
                                </div>
                            </div>
                        </div>
                        <div className="absolute -right-2 -top-2 animate-ping bg-red-500 opacity-50 rounded-full w-4 h-4"></div>
                        <div className="absolute -right-2 -top-2 bg-red-500 rounded-full w-4 h-4"></div>
                    </div>
                </div>
            )
        },
        {
            title: "Patientez pendant la vérification",
            description: "Après validation, patientez sur cette page entre 2 à 5 minutes que nous vérifions la transaction",
            icon: <Clock className="w-8 h-8 text-orange-500" />,
            illustration: (
                <div className="bg-orange-100 rounded-lg p-4 flex items-center justify-center">
                    <div className="relative flex flex-col items-center">
                        <div className="w-20 h-20 rounded-full border-4 border-gray-200 flex items-center justify-center">
                            <div className="w-16 h-16 rounded-full border-t-4 border-orange-500 animate-spin"></div>
                            <Clock className="absolute w-8 h-8 text-orange-500" />
                        </div>
                        <div className="mt-2 font-semibold text-orange-600">2-5 minutes</div>
                    </div>
                </div>
            )
        },
        {
            title: "Paiement confirmé!",
            description: "Félicitations! Votre paiement est confirmé et vous avez désormais accès à tous les examens",
            icon: <CheckCircle className="w-8 h-8 text-green-500" />,
            illustration: (
                <div className="bg-green-100 rounded-lg p-4 flex items-center justify-center">
                    <div className="relative flex flex-col items-center">
                        <div className="w-20 h-20 rounded-full bg-green-100 border-4 border-green-200 flex items-center justify-center">
                            <CheckCircle className="w-12 h-12 text-green-500" />
                        </div>
                        <div className="mt-2 font-semibold text-green-600">Accès débloqué</div>
                    </div>
                </div>
            )
        }
    ];

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            onClose();
        }
    };

    const handlePrevious = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden relative animate-fade-in">
                {/* En-tête */}
                <div className="bg-gradient-to-r from-orange-500 to-yellow-600 text-white p-4 flex justify-between items-center">
                    <div className="flex items-center">
                        <CreditCard className="w-6 h-6 mr-2" />
                        <h2 className="text-lg font-bold">Guide de paiement Mobile Money</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="rounded-full bg-white bg-opacity-20 p-1 hover:bg-opacity-30 transition-all"
                    >
                        <X className="w-5 h-5 text-white" />
                    </button>
                </div>

                {/* Contenu principal */}
                <div className="p-6">
                    {/* Indicateur d'étapes */}
                    <div className="flex justify-between mb-6">
                        {steps.map((_, index) => (
                            <div
                                key={index}
                                className={`w-full h-1 rounded-full mx-0.5 ${
                                    index <= currentStep ? 'bg-orange-500' : 'bg-gray-200'
                                }`}
                            />
                        ))}
                    </div>

                    {/* Étape actuelle */}
                    <div className="text-center mb-6">
                        <div className="mb-4 flex justify-center">
                            {steps[currentStep].icon}
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">
                            {steps[currentStep].title}
                        </h3>
                        <p className="text-gray-600">
                            {steps[currentStep].description}
                        </p>
                    </div>

                    {/* Illustration */}
                    <div className="mb-6 flex justify-center">
                        {steps[currentStep].illustration}
                    </div>

                    {/* Note importante pour certaines étapes */}
                    {currentStep === 1 && (
                        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded mb-4 flex items-start">
                            <AlertCircle className="w-5 h-5 text-yellow-500 mr-2 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-yellow-700">
                                Assurez-vous d'entrer un numéro de téléphone valide connecté à Orange Money ou MTN Mobile Money.
                            </p>
                        </div>
                    )}

                    {currentStep === 2 && (
                        <div className="bg-blue-50 border-l-4 border-blue-400 p-3 rounded mb-4 flex items-start">
                            <AlertCircle className="w-5 h-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-blue-700">
                                La notification peut prendre jusqu'à 30 secondes pour apparaître sur le téléphone. Assurez-vous que le téléphone est allumé et a du réseau.
                            </p>
                        </div>
                    )}
                </div>

                {/* Barre de navigation en bas */}
                <div className="border-t border-gray-200 p-4 flex justify-between">
                    <button
                        onClick={handlePrevious}
                        disabled={currentStep === 0}
                        className={`px-4 py-2 rounded-lg ${
                            currentStep === 0
                                ? 'text-gray-400 cursor-not-allowed'
                                : 'text-gray-700 hover:bg-gray-100'
                        }`}
                    >
                        Précédent
                    </button>

                    <button
                        onClick={handleNext}
                        className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white px-4 py-2 rounded-lg flex items-center"
                    >
                        {currentStep === steps.length - 1 ? 'Terminer' : 'Suivant'}
                        <ArrowRight className="ml-1 w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PaymentGuideModal;
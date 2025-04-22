'use client';

import { useState, useEffect } from 'react';
import { Check, X } from 'lucide-react';

export default function QuestionDisplay({ question, userAnswer, onAnswer }) {
    const [answer, setAnswer] = useState(userAnswer || null);

    // Mise à jour de la réponse si la question change ou si userAnswer change
    useEffect(() => {
        setAnswer(userAnswer || null);
    }, [question.id, userAnswer]);

    // Soumettre la réponse au parent
    const submitAnswer = (newAnswer) => {
        setAnswer(newAnswer);
        onAnswer(newAnswer);
    };

    // Afficher différents types de questions
    const renderQuestionInput = () => {
        switch (question.type) {
            case 'multiple':
                return renderMultipleChoiceQuestion();
            case 'single':
                return renderSingleChoiceQuestion();
            case 'true-false':
                return renderTrueFalseQuestion();
            case 'text':
                return renderTextQuestion();
            default:
                return <p className="text-red-500">Type de question non supporté</p>;
        }
    };

    // Question à choix multiple
    const renderMultipleChoiceQuestion = () => {
        const selectedOptions = answer || [];

        const toggleOption = (optionId) => {
            const newSelected = [...(selectedOptions || [])];

            if (newSelected.includes(optionId)) {
                // Désélectionner l'option
                const index = newSelected.indexOf(optionId);
                newSelected.splice(index, 1);
            } else {
                // Sélectionner l'option
                newSelected.push(optionId);
            }

            submitAnswer(newSelected);
        };

        return (
            <div className="space-y-3 mt-4">
                <p className="text-sm text-blue-600 font-medium mb-2">
                    Sélectionnez toutes les réponses correctes :
                </p>
                {question.options.map((option) => (
                    <div
                        key={option.id}
                        onClick={() => toggleOption(option.id)}
                        className={`p-3 rounded-lg border cursor-pointer transition-all ${
                            selectedOptions?.includes(option.id)
                                ? 'bg-blue-50 border-blue-300'
                                : 'bg-white border-gray-200 hover:border-gray-300'
                        }`}
                    >
                        <div className="flex items-center">
                            <div className={`w-5 h-5 border rounded flex items-center justify-center mr-3 ${
                                selectedOptions?.includes(option.id)
                                    ? 'bg-blue-500 border-blue-500 text-white'
                                    : 'border-gray-300'
                            }`}>
                                {selectedOptions?.includes(option.id) && (
                                    <Check className="w-4 h-4" />
                                )}
                            </div>
                            <div className="text-gray-800">{option.text}</div>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    // Question à choix unique
    const renderSingleChoiceQuestion = () => {
        return (
            <div className="space-y-3 mt-4">
                <p className="text-sm text-blue-600 font-medium mb-2">
                    Sélectionnez la bonne réponse :
                </p>
                {question.options.map((option) => (
                    <div
                        key={option.id}
                        onClick={() => submitAnswer(option.id)}
                        className={`p-3 rounded-lg border cursor-pointer transition-all ${
                            answer === option.id
                                ? 'bg-blue-50 border-blue-300'
                                : 'bg-white border-gray-200 hover:border-gray-300'
                        }`}
                    >
                        <div className="flex items-center">
                            <div className={`w-5 h-5 border rounded-full flex items-center justify-center mr-3 ${
                                answer === option.id
                                    ? 'border-blue-500'
                                    : 'border-gray-300'
                            }`}>
                                {answer === option.id && (
                                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                )}
                            </div>
                            <div className="text-gray-800">{option.text}</div>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    // Question vrai/faux
    const renderTrueFalseQuestion = () => {
        return (
            <div className="space-y-4 mt-4">
                <p className="text-sm text-blue-600 font-medium mb-2">
                    Cette affirmation est-elle vraie ou fausse ?
                </p>
                <div className="flex space-x-4">
                    <div
                        onClick={() => submitAnswer('true')}
                        className={`flex-1 p-4 rounded-lg border cursor-pointer transition-all flex flex-col items-center ${
                            answer === 'true'
                                ? 'bg-green-50 border-green-300'
                                : 'bg-white border-gray-200 hover:border-gray-300'
                        }`}
                    >
                        <Check className={`w-8 h-8 mb-2 ${answer === 'true' ? 'text-green-500' : 'text-gray-400'}`} />
                        <span className={answer === 'true' ? 'font-medium text-green-700' : 'text-gray-700'}>
                            Vrai
                        </span>
                    </div>
                    <div
                        onClick={() => submitAnswer('false')}
                        className={`flex-1 p-4 rounded-lg border cursor-pointer transition-all flex flex-col items-center ${
                            answer === 'false'
                                ? 'bg-red-50 border-red-300'
                                : 'bg-white border-gray-200 hover:border-gray-300'
                        }`}
                    >
                        <X className={`w-8 h-8 mb-2 ${answer === 'false' ? 'text-red-500' : 'text-gray-400'}`} />
                        <span className={answer === 'false' ? 'font-medium text-red-700' : 'text-gray-700'}>
                            Faux
                        </span>
                    </div>
                </div>
            </div>
        );
    };

    // Question à réponse textuelle
    const renderTextQuestion = () => {
        return (
            <div className="mt-4">
                <p className="text-sm text-blue-600 font-medium mb-2">
                    Entrez votre réponse :
                </p>
                <textarea
                    value={answer || ''}
                    onChange={(e) => submitAnswer(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={4}
                    placeholder="Écrivez votre réponse ici..."
                />
            </div>
        );
    };

    return (
        <div className="question-display">
            <div className="mb-6">
                <p className="text-gray-800 text-base mb-2">{question.text}</p>
            </div>
            {renderQuestionInput()}
        </div>
    );
}
'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export default function ConfirmationModal({
                                              title,
                                              message,
                                              confirmText = 'Confirmer',
                                              cancelText = 'Annuler',
                                              onConfirm,
                                              onCancel,
                                              confirmButtonClass = 'bg-blue-600 hover:bg-blue-700',
                                              icon = null
                                          }) {
    // Pour fermer le modal avec la touche Escape
    useEffect(() => {
        const handleEsc = (event) => {
            if (event.key === 'Escape') {
                onCancel();
            }
        };

        window.addEventListener('keydown', handleEsc);

        // Empêcher le défilement du body quand le modal est ouvert
        document.body.style.overflow = 'hidden';

        return () => {
            window.removeEventListener('keydown', handleEsc);
            document.body.style.overflow = 'auto';
        };
    }, [onCancel]);

    // Empêcher la propagation des clics à l'intérieur du modal
    const handleContentClick = (e) => {
        e.stopPropagation();
    };

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={onCancel}
        >
            <div
                className="bg-white rounded-lg shadow-xl max-w-md w-full overflow-hidden animate-fade-in"
                onClick={handleContentClick}
            >
                <div className="flex justify-between items-start p-5 border-b border-gray-200">
                    {icon && <div className="mr-3">{icon}</div>}
                    <h3 className="text-lg font-medium text-gray-900 flex-1">{title}</h3>
                    <button
                        onClick={onCancel}
                        className="text-gray-400 hover:text-gray-500"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="px-5 py-4">
                    <div className="text-gray-700">{message}</div>
                </div>

                <div className="px-5 py-4 bg-gray-50 flex justify-end space-x-3">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`px-4 py-2 border border-transparent rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${confirmButtonClass}`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}
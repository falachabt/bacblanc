'use client';

import { Suspense } from 'react';
import ExamResult from '@/components/exam/ExamResult';

export default function ExamResultPage({ params }) {
    const examId = params.id;

    return (
        <Suspense fallback={
            <div className="flex justify-center items-center min-h-screen bg-white">
                <div className="text-center p-4">
                    <div className="w-16 h-16 border-t-4 border-green-600 border-solid rounded-full animate-spin mx-auto"></div>
                    <p className="mt-4 text-gray-600 font-medium">Chargement des résultats...</p>
                </div>
            </div>
        }>
            <ExamResult examId={examId} />
        </Suspense>
    );
}
'use client';

import { Suspense } from 'react';
import PaymentPageContent from "@/app/payment/content/Payment";

export default function PaymentPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <PaymentPageContent />
        </Suspense>
    );
}
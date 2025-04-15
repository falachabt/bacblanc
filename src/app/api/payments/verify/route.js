// /app/api/payments/verify/route.js
import { NextResponse } from 'next/server';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const reference = searchParams.get('reference');

    if (!reference) {
        return NextResponse.json(
            { message: "Référence de paiement manquante" },
            { status: 400 }
        );
    }

    try {
        // Appel à l'API NotchPay
        const notchpayApiUrl = `https://api.notchpay.co/payments/${reference}`;

        // Récupérer la clé API depuis les variables d'environnement
        const apiKey = process.env.NOTCHPAY_API_KEY;

        if (!apiKey) {
            throw new Error('Clé API NotchPay non configurée');
        }

        const response = await fetch(notchpayApiUrl, {
            method: 'GET',
            headers: {
                'Authorization': apiKey,
                'Content-Type': 'application/json',
            },
        });

        const data = await response.json();

        console.log('Response from NotchPay:', data);

        if (!response.ok) {
            throw new Error(data.message || 'Erreur lors de la vérification du paiement');
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Error verifying payment:', error);

        return NextResponse.json(
            { message: error.message || "Une erreur s'est produite lors de la vérification du paiement" },
            { status: 500 }
        );
    }
}
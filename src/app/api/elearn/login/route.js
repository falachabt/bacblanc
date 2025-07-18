import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request) {
    try {
        const body = await request.json();

        // Forward the request to elearnprepa.com
        const response = await fetch('https://elearnprepa.com/api/external/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            return NextResponse.json(
                { error: errorData.message || 'Login failed' },
                { status: response.status }
            );
        }

        const data = await response.json();
        const token = data.access_token || data.token;

        // If we have a token, store it in a cookie
        if (token) {
            // Set the token in a cookie that will be available for API routes
            cookies().set({
                name: 'authToken',
                value: token,
                httpOnly: true,
                path: '/',
                secure: process.env.NODE_ENV === 'production',
                maxAge: 60 * 60 * 24 * 7, // 1 week
                sameSite: 'strict'
            });

            console.log('Login route - Token stored in cookie');
        }

        return NextResponse.json(data);

    } catch (error) {
        console.error('Login proxy error:', error);

        // Check if it's a network/DNS error
        if (error.code === 'EAI_AGAIN' || error.code === 'ENOTFOUND' || error.message?.includes('fetch failed')) {
            return NextResponse.json(
                { 
                    error: 'Unable to connect to elearnprepa.com API. Please check your network connection or try again later.',
                    details: 'This may be due to network restrictions in the current environment.'
                },
                { status: 503 }
            );
        }

        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

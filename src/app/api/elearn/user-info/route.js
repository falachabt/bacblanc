import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(request) {
    try {
        // Try to get authorization from different sources
        let authToken = null;

        // 1. Try to get from headers
        const authHeader = request.headers.get('authorization');
        console.log('Request headers:', request.headers);
        console.log('Authorization header:', authHeader);

        if (authHeader) {
            authToken = authHeader;
        } else {
            // 2. Try to get from request body
            const body = await request.json().catch(() => ({}));
            console.log('Request body:', body);

            if (body && body.token) {
                authToken = `Bearer ${body.token}`;
            } else {
                // 3. Try to get from cookies
                const cookies = request.cookies;
                const tokenFromCookie = cookies.get('authToken')?.value;
                console.log('Token from cookie:', tokenFromCookie);

                if (tokenFromCookie) {
                    authToken = `Bearer ${tokenFromCookie}`;
                }
            }
        }

        if (!authToken) {
            return NextResponse.json(
                { error: 'Authorization token is required (in header, body, or cookie)' },
                { status: 401 }
            );
        }

        // Forward the request to elearnprepa.com
        const response = await fetch('https://www.elearnprepa.com/api/external/user-info', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': authToken
            }
        });
        console.log('Response status from elearnprepa.com:', response);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            return NextResponse.json(
                { error: errorData.message || 'Failed to fetch user info' },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data);

    } catch (error) {
        console.error('User info proxy error:', error);

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

import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        const authHeader = request.headers.get('authorization');
        const customTokenHeader = request.headers.get('x-elearn-token');
        
        console.log('User-info API - Authorization header received:', authHeader);
        console.log('User-info API - Custom token header received:', customTokenHeader);
        console.log('User-info API - All headers:', Object.fromEntries(request.headers.entries()));
        
        // Prefer custom token header over authorization header to avoid Supabase interference
        let tokenToUse = authHeader;
        if (customTokenHeader) {
            tokenToUse = `Bearer ${customTokenHeader}`;
            console.log('User-info API - Using custom token header');
        }
        
        if (!tokenToUse && !customTokenHeader) {
            console.log('User-info API - No authorization header or custom token provided');
            return NextResponse.json(
                { error: 'Authorization header or custom token is required' },
                { status: 401 }
            );
        }
        
        // Forward the request to elearnprepa.com
        console.log('User-info API - Forwarding request to elearnprepa.com with token:', tokenToUse);
        const response = await fetch('https://elearnprepa.com/api/external/user-info', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': tokenToUse
            }
        });
        
        console.log('User-info API - Response status from elearnprepa.com:', response.status);
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.log('User-info API - Error response from elearnprepa.com:', errorData);
            return NextResponse.json(
                { error: errorData.message || 'Failed to fetch user info' },
                { status: response.status }
            );
        }
        
        const data = await response.json();
        console.log('User-info API - Success response from elearnprepa.com:', data);
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
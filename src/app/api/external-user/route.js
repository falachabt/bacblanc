// Mock external API endpoint for token authentication
// This simulates the external server that validates tokens and returns user info

export async function GET(request) {
    try {
        // Try to get authorization from different sources
        let token = null;

        // 1. Try to get from headers
        const authHeader = request.headers.get('Authorization');

        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.split(' ')[1];
        } else {
            // 2. Try to get from query parameters
            const url = new URL(request.url);
            const tokenFromQuery = url.searchParams.get('token');

            if (tokenFromQuery) {
                token = tokenFromQuery;
            } else {
                // 3. Try to get from cookies
                const cookies = request.cookies;
                const tokenFromCookie = cookies.get('authToken')?.value;

                if (tokenFromCookie) {
                    token = tokenFromCookie;
                }
            }
        }

        if (!token) {
            return Response.json(
                { error: 'Authorization token is required (in header, query parameter, or cookie)' },
                { status: 401 }
            );
        }

        // Mock token validation - In production, this would validate against your auth service
        // For demo purposes, we'll accept any token and return mock user data
        if (!token || token.length < 10) {
            return Response.json(
                { error: 'Invalid token' },
                { status: 401 }
            );
        }

        // Mock user data based on token
        // In production, this would be fetched from your auth service
        const mockUserData = {
            id: `user_${token.substring(0, 8)}`, // Generate consistent ID from token
            firstname: token.includes('admin') ? 'Admin User' : 'Test User',
            email: `user_${token.substring(0, 8)}@example.com`,
            verified: true
        };

        return Response.json(mockUserData, { status: 200 });

    } catch (error) {
        console.error('Error in external-user API:', error);
        return Response.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

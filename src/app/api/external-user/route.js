// Mock external API endpoint for token authentication
// This simulates the external server that validates tokens and returns user info

export async function GET(request) {
    try {
        // Get the Authorization header
        const authHeader = request.headers.get('Authorization');
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return Response.json(
                { error: 'Authorization header missing or invalid' },
                { status: 401 }
            );
        }

        const token = authHeader.split(' ')[1];

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
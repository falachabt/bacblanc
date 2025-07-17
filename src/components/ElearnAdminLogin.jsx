'use client';

import { useState } from 'react';
import { Loader, AlertCircle, Lock, Mail } from 'lucide-react';

export default function ElearnAdminLogin({ onAuth }) {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error when user starts typing
        if (error) setError(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // Step 1: Login to obtain access token via our proxy
            const loginResponse = await fetch('/api/elearn/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password
                })
            });

            if (!loginResponse.ok) {
                const errorData = await loginResponse.json().catch(() => ({}));
                throw new Error(errorData.error || 'Login failed');
            }

            const loginData = await loginResponse.json();
            const accessToken = loginData.access_token || loginData.token;

            if (!accessToken) {
                throw new Error('No access token received');
            }

            console.log('ElearnAdminLogin - Access token received:', accessToken);

            // Step 2: Fetch user info using the access token via our proxy
            console.log('ElearnAdminLogin - Making user-info request with token:', accessToken);
            
            // Use a custom fetch to ensure no interference from Supabase or other libraries
            const userInfoResponse = await fetch('/api/elearn/user-info', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                    // Add a custom header to help identify our requests
                    'X-Elearn-Token': accessToken
                },
                // Disable credentials to prevent automatic auth header injection
                credentials: 'omit'
            });

            if (!userInfoResponse.ok) {
                const errorData = await userInfoResponse.json().catch(() => ({}));
                throw new Error(errorData.error || 'Failed to fetch user info');
            }

            const userInfo = await userInfoResponse.json().user;

            // Pass authentication data to parent component
            onAuth({
                token: accessToken,
                user: userInfo,
                isAuthenticated: true
            });

        } catch (err) {
            console.error('Authentication error:', err);
            setError(err.message || 'Authentication failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-sm border p-6">
            <div className="text-center mb-6">
                <div className="p-3 bg-green-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <Lock className="h-8 w-8 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Admin Login</h2>
                <p className="text-gray-600 mt-2">Sign in with your elearnprepa.com credentials</p>
            </div>

            {error && (
                <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center">
                        <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                        <span className="text-red-800 text-sm">{error}</span>
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                    </label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                            disabled={loading}
                            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 disabled:bg-gray-50 disabled:text-gray-500 text-gray-900 placeholder-gray-400 bg-white"
                            placeholder="Enter your email"
                        />
                    </div>
                </div>

                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                        Password
                    </label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            required
                            disabled={loading}
                            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 disabled:bg-gray-50 disabled:text-gray-500 text-gray-900 placeholder-gray-400 bg-white"
                            placeholder="Enter your password"
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading || !formData.email || !formData.password}
                    className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 focus:ring-4 focus:ring-green-200 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                    {loading ? (
                        <>
                            <Loader className="h-5 w-5 animate-spin" />
                            <span>Signing in...</span>
                        </>
                    ) : (
                        <span>Sign In</span>
                    )}
                </button>
            </form>
        </div>
    );
}
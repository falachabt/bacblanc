'use client';

import { useState } from 'react';
import ElearnAdminLogin from '@/components/ElearnAdminLogin';
import { User, Shield, LogOut, UserCheck, Calendar, Mail } from 'lucide-react';

export default function AdminPanel() {
    const [authData, setAuthData] = useState(null);

    const handleAuth = (data) => {
        setAuthData(data);
    };

    const handleLogout = () => {
        setAuthData(null);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Not specified';
        try {
            return new Date(dateString).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return dateString;
        }
    };

    if (!authData || !authData.isAuthenticated) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="w-full max-w-md">
                    <ElearnAdminLogin onAuth={handleAuth} />
                </div>
            </div>
        );
    }

    const { user, token } = authData;

    return (
        <div className="min-h-screen bg-gray-50 p-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="p-3 bg-green-100 rounded-full">
                                <Shield className="h-8 w-8 text-green-600" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
                                <p className="text-gray-600">Welcome back, {user?.firstname || user?.name || 'Admin'}</p>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                            <LogOut className="h-4 w-4" />
                            <span>Logout</span>
                        </button>
                    </div>
                </div>

                {/* User Information Card */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <div className="flex items-center space-x-2 mb-4">
                        <User className="h-5 w-5 text-green-600" />
                        <h2 className="text-lg font-semibold text-gray-900">User Information</h2>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                            <div className="flex items-center space-x-3">
                                <UserCheck className="h-4 w-4 text-gray-400" />
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Name</label>
                                    <p className="text-gray-900">
                                        {user?.firstname && user?.lastname 
                                            ? `${user.firstname} ${user.lastname}`
                                            : user?.name || user?.firstname || 'Not specified'
                                        }
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-3">
                                <Mail className="h-4 w-4 text-gray-400" />
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Email</label>
                                    <p className="text-gray-900">{user?.email || 'Not specified'}</p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-3">
                                <Shield className="h-4 w-4 text-gray-400" />
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Role</label>
                                    <p className="text-gray-900">{user?.role || 'Admin'}</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center space-x-3">
                                <Calendar className="h-4 w-4 text-gray-400" />
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Created At</label>
                                    <p className="text-gray-900">{formatDate(user?.created_at)}</p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-3">
                                <Calendar className="h-4 w-4 text-gray-400" />
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Last Updated</label>
                                    <p className="text-gray-900">{formatDate(user?.updated_at)}</p>
                                </div>
                            </div>

                            {user?.id && (
                                <div className="flex items-center space-x-3">
                                    <UserCheck className="h-4 w-4 text-gray-400" />
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">User ID</label>
                                        <p className="text-gray-900">{user.id}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Authentication Token Info */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <div className="flex items-center space-x-2 mb-4">
                        <Shield className="h-5 w-5 text-green-600" />
                        <h2 className="text-lg font-semibold text-gray-900">Authentication Status</h2>
                    </div>
                    
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-2">
                            <UserCheck className="h-4 w-4 text-green-600" />
                            <span className="text-green-800 font-medium">Successfully Authenticated</span>
                        </div>
                        <p className="text-green-700 text-sm">
                            Connected to elearnprepa.com API
                        </p>
                        <div className="mt-3">
                            <label className="text-xs font-medium text-green-600">Access Token (truncated)</label>
                            <p className="text-xs text-green-700 font-mono bg-green-100 p-1 rounded">
                                {token ? `${token.substring(0, 20)}...` : 'No token'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Additional Information */}
                {user && Object.keys(user).length > 0 && (
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <div className="flex items-center space-x-2 mb-4">
                            <User className="h-5 w-5 text-green-600" />
                            <h2 className="text-lg font-semibold text-gray-900">Raw User Data</h2>
                        </div>
                        
                        <div className="bg-gray-50 rounded-lg p-4 overflow-auto">
                            <pre className="text-sm text-gray-700">
                                {JSON.stringify(user, null, 2)}
                            </pre>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
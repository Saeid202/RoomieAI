import React from 'react';

export default function SeekerProfileTestPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-6">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-xl shadow-lg p-8">
                    <h1 className="text-3xl font-bold text-purple-900 mb-4">Profile Test Page</h1>
                    <p className="text-gray-600">This is a test to see if the page loads correctly.</p>
                    
                    <div className="mt-8 p-4 bg-purple-50 rounded-lg">
                        <p className="text-purple-800">✅ Page is loading correctly!</p>
                        <p className="text-purple-600 text-sm mt-2">If you can see this, the basic React rendering is working.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

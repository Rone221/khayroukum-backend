import React from 'react';

const ComingSoonPage: React.FC<{ title: string; description: string }> = ({ title, description }) => {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="max-w-md mx-auto text-center px-4">
                <div className="mb-8">
                    <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.78 0-2.678-2.153-1.415-3.414l5-5A2 2 0 009 11.172V5L8 4z" />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">{title}</h1>
                    <p className="text-lg text-gray-600 mb-8">{description}</p>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <p className="text-yellow-800 text-sm">
                            🚧 Cette section est en cours de développement et sera bientôt disponible.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ComingSoonPage;

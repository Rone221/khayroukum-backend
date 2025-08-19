import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

const PublicLayout: React.FC = () => {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header Navigation */}
            <header className="bg-white shadow-sm">
                <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        {/* Logo */}
                        <div className="flex items-center">
                            <Link to="/" className="flex items-center space-x-2">
                                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                                    <span className="text-white font-bold text-sm">K</span>
                                </div>
                                <span className="text-xl font-bold text-gray-900">Khayroukum</span>
                            </Link>
                        </div>

                        {/* Navigation Menu */}
                        <div className="hidden md:flex items-center space-x-8">
                            <Link to="/" className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium">
                                Accueil
                            </Link>
                            <Link to="/projets" className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium">
                                Nos Projets
                            </Link>
                            <Link to="/villages" className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium">
                                Villages
                            </Link>
                            <Link to="/a-propos" className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium">
                                À propos
                            </Link>
                            <Link to="/contact" className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium">
                                Contact
                            </Link>

                            {/* Se connecter Button */}
                            <Link
                                to="/login"
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                            >
                                Se connecter
                            </Link>
                        </div>

                        {/* Mobile menu button */}
                        <div className="md:hidden flex items-center">
                            <Link
                                to="/login"
                                className="bg-blue-600 text-white px-3 py-1.5 rounded text-sm font-medium"
                            >
                                Se connecter
                            </Link>
                        </div>
                    </div>
                </nav>
            </header>

            {/* Main Content */}
            <main className="min-h-screen">
                <Outlet />
            </main>

            {/* Footer */}
            <footer className="bg-gray-900 text-white">
                <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div>
                            <h3 className="text-lg font-semibold mb-4">Khayroukum</h3>
                            <p className="text-gray-400">
                                Améliorer l'accès à l'eau potable dans les villages ruraux grâce à des projets hydrauliques durables.
                            </p>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold mb-4">Liens utiles</h3>
                            <ul className="space-y-2 text-gray-400">
                                <li><Link to="/projets" className="hover:text-white">Nos projets</Link></li>
                                <li><Link to="/blog" className="hover:text-white">Blog</Link></li>
                                <li><Link to="/contact" className="hover:text-white">Contact</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold mb-4">Contact</h3>
                            <div className="text-gray-400">
                                <p>Email: contact@khayroukum.org</p>
                                <p>Téléphone: +XXX XXX XXX XXX</p>
                            </div>
                        </div>
                    </div>
                    <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400">
                        <p>&copy; 2025 Khayroukum. Tous droits réservés.</p>
                    </div>
                </div>
            </footer>

            <Toaster position="top-right" />
        </div>
    );
};

export default PublicLayout;

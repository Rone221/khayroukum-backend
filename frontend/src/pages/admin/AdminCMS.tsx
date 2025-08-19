import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import {
    Edit,
    Save,
    Globe,
    Settings,
    Image,
    FileText,
    Eye,
    EyeOff,
    Plus,
    Trash2,
    Palette,
    Type,
    Link2,
    Mail,
    Phone,
    MapPin,
    Clock,
    Facebook,
    Twitter,
    Linkedin,
    Youtube
} from 'lucide-react';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import api from '../../lib/api';

interface ContentItem {
    id: number;
    section: string;
    key: string;
    value: any;
    description: string;
    is_published: boolean;
    updated_at: string;
}

interface Setting {
    id: number;
    key: string;
    value: any;
    type: string;
    group: string;
    label: string;
    description: string;
    is_public: boolean;
    updated_at: string;
}

const AdminCMS: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'content' | 'settings' | 'preview'>('content');
    const [content, setContent] = useState<{ [section: string]: ContentItem[] }>({});
    const [settings, setSettings] = useState<{ [group: string]: Setting[] }>({});
    const [editingContent, setEditingContent] = useState<number | null>(null);
    const [editingSetting, setEditingSetting] = useState<number | null>(null);
    const [previewData, setPreviewData] = useState<any>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [contentResponse, settingsResponse] = await Promise.all([
                api.get('/admin/content'),
                api.get('/admin/settings')
            ]);

            setContent(contentResponse.data.data);
            setSettings(settingsResponse.data.data);
        } catch (error) {
            console.error('Erreur lors du chargement des données:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadPreview = async () => {
        try {
            const response = await api.get('/public/homepage');
            setPreviewData(response.data.data);
        } catch (error) {
            console.error('Erreur lors du chargement de l\'aperçu:', error);
        }
    };

    const updateContent = async (id: number, newValue: any) => {
        try {
            const item = Object.values(content).flat().find(c => c.id === id);
            if (!item) return;

            await api.put(`/admin/content/${id}`, {
                section: item.section,
                key: item.key,
                value: newValue,
                description: item.description,
                is_published: item.is_published
            });

            await loadData();
            setEditingContent(null);
        } catch (error) {
            console.error('Erreur lors de la mise à jour du contenu:', error);
        }
    };

    const updateSetting = async (id: number, newValue: any) => {
        try {
            const item = Object.values(settings).flat().find(s => s.id === id);
            if (!item) return;

            await api.put(`/admin/settings/${id}`, {
                key: item.key,
                value: newValue,
                group: item.group,
                type: item.type,
                label: item.label,
                description: item.description,
                is_public: item.is_public
            });

            await loadData();
            setEditingSetting(null);
        } catch (error) {
            console.error('Erreur lors de la mise à jour du paramètre:', error);
        }
    };

    const togglePublish = async (id: number) => {
        try {
            await api.patch(`/admin/content/${id}/toggle-publish`);
            await loadData();
        } catch (error) {
            console.error('Erreur lors du changement de statut:', error);
        }
    };

    const renderContentValue = (item: ContentItem) => {
        if (typeof item.value === 'object') {
            return JSON.stringify(item.value, null, 2);
        }
        return String(item.value);
    };

    const renderSettingValue = (setting: Setting) => {
        if (typeof setting.value === 'object') {
            return JSON.stringify(setting.value, null, 2);
        }
        return String(setting.value);
    };

    const getSettingIcon = (type: string) => {
        switch (type) {
            case 'color': return <Palette className="w-4 h-4" />;
            case 'text': case 'textarea': return <Type className="w-4 h-4" />;
            case 'url': return <Link2 className="w-4 h-4" />;
            case 'email': return <Mail className="w-4 h-4" />;
            case 'phone': return <Phone className="w-4 h-4" />;
            default: return <Settings className="w-4 h-4" />;
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-96">
                <LoadingSpinner />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Gestion du Site Vitrine</h1>
                    <p className="text-gray-600 mt-1">
                        Modifiez le contenu et les paramètres du site public
                    </p>
                </div>
            </div>

            {/* Tabs Navigation */}
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                    <button
                        onClick={() => setActiveTab('content')}
                        className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'content'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                    >
                        <FileText className="w-4 h-4 inline mr-2" />
                        Contenu
                    </button>
                    <button
                        onClick={() => setActiveTab('settings')}
                        className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'settings'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                    >
                        <Settings className="w-4 h-4 inline mr-2" />
                        Paramètres
                    </button>
                    <button
                        onClick={() => {
                            setActiveTab('preview');
                            loadPreview();
                        }}
                        className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'preview'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                    >
                        <Eye className="w-4 h-4 inline mr-2" />
                        Aperçu
                    </button>
                </nav>
            </div>

            {/* Content Tab */}
            {activeTab === 'content' && (
                <div className="space-y-6">
                    {Object.entries(content).map(([section, items]) => (
                        <Card key={section}>
                            <CardHeader>
                                <CardTitle className="flex items-center capitalize">
                                    <FileText className="w-5 h-5 mr-2" />
                                    Section: {section}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {items.map((item) => (
                                        <div key={item.id} className="border rounded-lg p-4">
                                            <div className="flex justify-between items-start mb-3">
                                                <div>
                                                    <h4 className="font-medium text-gray-900">{item.key}</h4>
                                                    {item.description && (
                                                        <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                                                    )}
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <button
                                                        onClick={() => togglePublish(item.id)}
                                                        className={`p-1 rounded ${item.is_published
                                                                ? 'text-green-600 hover:bg-green-50'
                                                                : 'text-gray-400 hover:bg-gray-50'
                                                            }`}
                                                        title={item.is_published ? 'Publié' : 'Brouillon'}
                                                    >
                                                        {item.is_published ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                                    </button>
                                                    <button
                                                        onClick={() => setEditingContent(item.id)}
                                                        className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                                                        title="Modifier"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>

                                            {editingContent === item.id ? (
                                                <div className="space-y-3">
                                                    <textarea
                                                        className="w-full p-3 border border-gray-300 rounded-md font-mono text-sm"
                                                        rows={6}
                                                        defaultValue={renderContentValue(item)}
                                                        onChange={(e) => {
                                                            try {
                                                                const value = e.target.value.startsWith('{') || e.target.value.startsWith('[')
                                                                    ? JSON.parse(e.target.value)
                                                                    : e.target.value;
                                                                (e.target as any).parsedValue = value;
                                                            } catch {
                                                                (e.target as any).parsedValue = e.target.value;
                                                            }
                                                        }}
                                                    />
                                                    <div className="flex space-x-2">
                                                        <button
                                                            onClick={(e) => {
                                                                const textarea = e.currentTarget.parentElement?.previousElementSibling as HTMLTextAreaElement;
                                                                const value = (textarea as any).parsedValue || textarea.value;
                                                                updateContent(item.id, value);
                                                            }}
                                                            className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                                                        >
                                                            <Save className="w-3 h-3 inline mr-1" />
                                                            Sauvegarder
                                                        </button>
                                                        <button
                                                            onClick={() => setEditingContent(null)}
                                                            className="px-3 py-1 bg-gray-300 text-gray-700 text-sm rounded hover:bg-gray-400"
                                                        >
                                                            Annuler
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="bg-gray-50 p-3 rounded border">
                                                    <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                                                        {renderContentValue(item)}
                                                    </pre>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
                <div className="space-y-6">
                    {Object.entries(settings).map(([group, items]) => (
                        <Card key={group}>
                            <CardHeader>
                                <CardTitle className="flex items-center capitalize">
                                    <Settings className="w-5 h-5 mr-2" />
                                    Groupe: {group}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {items.map((setting) => (
                                        <div key={setting.id} className="border rounded-lg p-4">
                                            <div className="flex justify-between items-start mb-3">
                                                <div>
                                                    <h4 className="font-medium text-gray-900 flex items-center">
                                                        {getSettingIcon(setting.type)}
                                                        <span className="ml-2">{setting.label}</span>
                                                    </h4>
                                                    {setting.description && (
                                                        <p className="text-sm text-gray-500 mt-1">{setting.description}</p>
                                                    )}
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 mt-2">
                                                        {setting.type} {setting.is_public && '• Public'}
                                                    </span>
                                                </div>
                                                <button
                                                    onClick={() => setEditingSetting(setting.id)}
                                                    className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                                                    title="Modifier"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                            </div>

                                            {editingSetting === setting.id ? (
                                                <div className="space-y-3">
                                                    {setting.type === 'textarea' ? (
                                                        <textarea
                                                            className="w-full p-2 border border-gray-300 rounded-md text-sm"
                                                            rows={3}
                                                            defaultValue={renderSettingValue(setting)}
                                                            onChange={(e) => (e.target as any).parsedValue = e.target.value}
                                                        />
                                                    ) : setting.type === 'color' ? (
                                                        <input
                                                            type="color"
                                                            className="w-full h-10 border border-gray-300 rounded-md"
                                                            defaultValue={typeof setting.value === 'object' ? setting.value.color : setting.value}
                                                            onChange={(e) => (e.target as any).parsedValue = { color: e.target.value }}
                                                        />
                                                    ) : (
                                                        <input
                                                            type="text"
                                                            className="w-full p-2 border border-gray-300 rounded-md text-sm"
                                                            defaultValue={renderSettingValue(setting)}
                                                            onChange={(e) => (e.target as any).parsedValue = e.target.value}
                                                        />
                                                    )}
                                                    <div className="flex space-x-2">
                                                        <button
                                                            onClick={(e) => {
                                                                const input = e.currentTarget.parentElement?.previousElementSibling as HTMLInputElement | HTMLTextAreaElement;
                                                                const value = (input as any).parsedValue || input.value;
                                                                updateSetting(setting.id, value);
                                                            }}
                                                            className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                                                        >
                                                            <Save className="w-3 h-3 inline mr-1" />
                                                            Sauvegarder
                                                        </button>
                                                        <button
                                                            onClick={() => setEditingSetting(null)}
                                                            className="px-3 py-1 bg-gray-300 text-gray-700 text-sm rounded hover:bg-gray-400"
                                                        >
                                                            Annuler
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="bg-gray-50 p-2 rounded border">
                                                    {setting.type === 'color' ? (
                                                        <div className="flex items-center space-x-2">
                                                            <div
                                                                className="w-6 h-6 rounded border"
                                                                style={{
                                                                    backgroundColor: typeof setting.value === 'object' ? setting.value.color : setting.value
                                                                }}
                                                            />
                                                            <span className="text-sm text-gray-700 font-mono">
                                                                {typeof setting.value === 'object' ? setting.value.color : setting.value}
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                                                            {renderSettingValue(setting)}
                                                        </pre>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Preview Tab */}
            {activeTab === 'preview' && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <Eye className="w-5 h-5 mr-2" />
                            Aperçu de la Homepage
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {previewData ? (
                            <div className="space-y-6 bg-gray-50 p-6 rounded-lg">
                                {/* Hero Section Preview */}
                                <div className="bg-white p-6 rounded-lg shadow-sm">
                                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                        {previewData.hero?.title?.text || previewData.hero?.title}
                                    </h2>
                                    <p className="text-gray-600 mb-4">
                                        {previewData.hero?.subtitle?.text || previewData.hero?.subtitle}
                                    </p>
                                    <div className="flex space-x-4">
                                        {previewData.hero?.cta_primary && (
                                            <div className="px-4 py-2 bg-blue-600 text-white rounded text-sm">
                                                {previewData.hero.cta_primary.text}
                                            </div>
                                        )}
                                        {previewData.hero?.cta_secondary && (
                                            <div className="px-4 py-2 border border-gray-300 text-gray-700 rounded text-sm">
                                                {previewData.hero.cta_secondary.text}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Stats Preview */}
                                <div className="bg-white p-6 rounded-lg shadow-sm">
                                    <h3 className="text-lg font-semibold mb-4">Statistiques</h3>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-blue-600">{previewData.stats?.villages_served || 0}</div>
                                            <div className="text-sm text-gray-600">Villages</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-green-600">{previewData.stats?.projects_completed || 0}</div>
                                            <div className="text-sm text-gray-600">Projets</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-yellow-600">{previewData.stats?.beneficiaires || 0}</div>
                                            <div className="text-sm text-gray-600">Bénéficiaires</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-purple-600">
                                                {Math.round((previewData.stats?.total_investment || 0) / 1000000)}M€
                                            </div>
                                            <div className="text-sm text-gray-600">Investis</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Settings Preview */}
                                <div className="bg-white p-6 rounded-lg shadow-sm">
                                    <h3 className="text-lg font-semibold mb-4">Paramètres du site</h3>
                                    <div className="space-y-2 text-sm">
                                        <div><strong>Nom:</strong> {previewData.settings?.site_name?.text}</div>
                                        <div><strong>Slogan:</strong> {previewData.settings?.site_tagline?.text}</div>
                                        <div className="flex items-center space-x-4">
                                            <div className="flex items-center space-x-2">
                                                <span><strong>Couleur primaire:</strong></span>
                                                <div
                                                    className="w-6 h-6 rounded border"
                                                    style={{ backgroundColor: previewData.settings?.primary_color?.color }}
                                                />
                                                <span className="font-mono">{previewData.settings?.primary_color?.color}</span>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <span><strong>Couleur secondaire:</strong></span>
                                                <div
                                                    className="w-6 h-6 rounded border"
                                                    style={{ backgroundColor: previewData.settings?.secondary_color?.color }}
                                                />
                                                <span className="font-mono">{previewData.settings?.secondary_color?.color}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <LoadingSpinner />
                                <p className="mt-2 text-gray-500">Chargement de l'aperçu...</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default AdminCMS;

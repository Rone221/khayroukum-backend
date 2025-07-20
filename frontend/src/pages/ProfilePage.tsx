import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { useAuth } from '../contexts/AuthContext';
import api from '../lib/api';
import { User } from '../types';

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<User | null>(user);
  const [loading, setLoading] = useState(!user);

  useEffect(() => {
    api.get('/me')
      .then(res => setProfile(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  const [stats, setStats] = useState<any>(null);
  const [activity, setActivity] = useState<any[]>([]);
  const [preferences, setPreferences] = useState<any[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingActivity, setLoadingActivity] = useState(true);
  const [loadingPrefs, setLoadingPrefs] = useState(true);
  const [errorStats, setErrorStats] = useState<string | null>(null);
  const [errorActivity, setErrorActivity] = useState<string | null>(null);
  const [errorPrefs, setErrorPrefs] = useState<string | null>(null);

  useEffect(() => {
    api.get('/me/stats')
      .then(res => setStats(res.data))
      .catch(() => setErrorStats("Impossible de charger les statistiques."))
      .finally(() => setLoadingStats(false));
    api.get('/me/activity')
      .then(res => setActivity(res.data))
      .catch(() => setErrorActivity("Impossible de charger l'activité récente."))
      .finally(() => setLoadingActivity(false));
    api.get('/me/preferences')
      .then(res => setPreferences(res.data))
      .catch(() => setErrorPrefs("Impossible de charger les préférences."))
      .finally(() => setLoadingPrefs(false));
  }, []);

  return (
    <div className="max-w-6xl mx-auto py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-8">
        <div className="flex-shrink-0 w-32 h-32 rounded-full bg-gray-200 overflow-hidden border-4 border-white shadow-lg" />
        <div className="flex-1">
          <h2 className="text-3xl font-bold text-gray-900 mb-1">{profile.prenom} {profile.nom}</h2>
          <p className="text-lg text-gray-600 mb-2">Ingénieur en informatique</p>
          <span className="inline-block px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-full font-semibold mr-2">Donateur Vérifié</span>
          <button className="ml-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg border hover:bg-gray-200">Modifier</button>
        </div>
      </div>

      {/* Stats dynamiques */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        {loadingStats ? (
          <div className="col-span-4 flex justify-center"><LoadingSpinner size="md" /></div>
        ) : errorStats ? (
          <div className="col-span-4 text-red-600 text-center">{errorStats}</div>
        ) : stats && Array.isArray(stats) ? (
          stats.map((stat: any, idx: number) => (
            <div key={idx} className="bg-white rounded-lg shadow p-6 text-center">
              <p className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</p>
              <p className="text-gray-600 text-sm">{stat.label}</p>
            </div>
          ))
        ) : null}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Informations personnelles */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold mb-4">Informations personnelles</h3>
          <div className="space-y-2">
            <div className="flex justify-between"><span className="font-medium">Prénom</span><span>{profile.prenom}</span></div>
            <div className="flex justify-between"><span className="font-medium">Nom</span><span>{profile.nom}</span></div>
            <div className="flex justify-between"><span className="font-medium">Email</span><span>{profile.email}</span></div>
            <div className="flex justify-between"><span className="font-medium">Téléphone</span><span>+221 77 123 45 67</span></div>
            <div className="flex justify-between"><span className="font-medium">Adresse</span><span>Dakar, Sénégal</span></div>
            <div className="flex justify-between"><span className="font-medium">Date de naissance</span><span>15/03/1985</span></div>
            <div className="flex justify-between"><span className="font-medium">Profession</span><span>Ingénieur en informatique</span></div>
          </div>
          <div className="mt-4 text-gray-700 text-sm">
            <span className="font-semibold">À propos de moi</span><br />
            Passionné par le développement durable et l'accès à l'eau potable pour tous. Je contribue aux projets hydrauliques pour améliorer les conditions de vie des communautés rurales.
          </div>
        </div>

        {/* Activité récente dynamique */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold mb-4">Activité récente</h3>
          {loadingActivity ? (
            <div className="flex justify-center"><LoadingSpinner size="md" /></div>
          ) : errorActivity ? (
            <div className="text-red-600 text-center">{errorActivity}</div>
          ) : (
            <ul className="space-y-3">
              {activity.map((act: any, idx: number) => (
                <li key={idx} className="flex items-center space-x-2">
                  <span className={`w-3 h-3 rounded-full bg-${act.color || 'gray'}-500 inline-block`} />
                  <span className="font-medium">{act.type}</span>
                  <span className="text-gray-600">{act.detail}</span>
                  <span className="text-xs text-gray-400 ml-auto">{act.date}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Préférences dynamiques */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold mb-4">Mes préférences</h3>
          {loadingPrefs ? (
            <div className="flex justify-center"><LoadingSpinner size="md" /></div>
          ) : errorPrefs ? (
            <div className="text-red-600 text-center">{errorPrefs}</div>
          ) : (
            <ul className="space-y-2">
              {preferences.map((pref: any, idx: number) => (
                <li key={idx} className="flex justify-between items-center">
                  <span>{pref.label}</span>
                  <span className="px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold">{pref.value}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;

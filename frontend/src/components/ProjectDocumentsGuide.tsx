import React from 'react';

const ProjectDocumentsGuide: React.FC = () => {
  return (
    <div style={{
      maxWidth: '800px',
      margin: '2rem auto',
      padding: '2rem',
      backgroundColor: 'white',
      borderRadius: '16px',
      boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'
    }}>
      <div style={{
        textAlign: 'center',
        marginBottom: '2rem',
        background: 'linear-gradient(135deg, #667eea, #764ba2)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text'
      }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: '700', margin: 0 }}>
          📁 Gestion des Documents
        </h1>
        <p style={{ fontSize: '1.25rem', fontWeight: '500', margin: '0.5rem 0 0 0', color: '#6b7280' }}>
          Interface complète de gestion documentaire
        </p>
      </div>

      <div style={{
        display: 'grid',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        {/* Fonctionnalités */}
        <div style={{
          background: 'linear-gradient(135deg, #10b981, #059669)',
          borderRadius: '12px',
          padding: '1.5rem',
          color: 'white'
        }}>
          <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.25rem' }}>🎯 Fonctionnalités principales</h3>
          <ul style={{ margin: 0, paddingLeft: '1.25rem', lineHeight: '1.6' }}>
            <li>✅ Upload sécurisé de documents (PDF, images, Word)</li>
            <li>✅ Classification par type (Devis, Facture, Rapport, Photo)</li>
            <li>✅ Téléchargement et suppression</li>
            <li>✅ Interface responsive et moderne</li>
            <li>✅ Validation complète des fichiers</li>
          </ul>
        </div>

        {/* Navigation */}
        <div style={{
          background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
          borderRadius: '12px',
          padding: '1.5rem',
          color: 'white'
        }}>
          <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.25rem' }}>🧭 Comment y accéder</h3>
          <ol style={{ margin: 0, paddingLeft: '1.25rem', lineHeight: '1.6' }}>
            <li>Connectez-vous en tant que prestataire</li>
            <li>Allez dans "Mes Projets"</li>
            <li>Sélectionnez un projet</li>
            <li>Cliquez sur "Gérer les documents"</li>
          </ol>
        </div>

        {/* Interface */}
        <div style={{
          background: 'linear-gradient(135deg, #f59e0b, #d97706)',
          borderRadius: '12px',
          padding: '1.5rem',
          color: 'white'
        }}>
          <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.25rem' }}>🎨 Interface utilisateur</h3>
          <ul style={{ margin: 0, paddingLeft: '1.25rem', lineHeight: '1.6' }}>
            <li>🔘 Header avec informations du projet</li>
            <li>🔘 Modal d'upload avec formulaire intuitif</li>
            <li>🔘 Grille de documents avec animations</li>
            <li>🔘 Actions rapides (télécharger, supprimer)</li>
            <li>🔘 État vide avec call-to-action</li>
          </ul>
        </div>

        {/* Technique */}
        <div style={{
          background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
          borderRadius: '12px',
          padding: '1.5rem',
          color: 'white'
        }}>
          <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.25rem' }}>⚙️ Architecture technique</h3>
          <ul style={{ margin: 0, paddingLeft: '1.25rem', lineHeight: '1.6' }}>
            <li>🔧 Backend Laravel avec APIs RESTful</li>
            <li>🔧 Frontend React TypeScript</li>
            <li>🔧 Stockage sécurisé des fichiers</li>
            <li>🔧 Validation côté client et serveur</li>
            <li>🔧 Gestion des autorisations par projet</li>
          </ul>
        </div>
      </div>

      <div style={{
        background: 'linear-gradient(135deg, #f3f4f6, #e5e7eb)',
        borderRadius: '12px',
        padding: '1.5rem',
        border: '1px solid #d1d5db'
      }}>
        <h3 style={{ margin: '0 0 1rem 0', color: '#374151', fontSize: '1.25rem' }}>🧪 Tests suggérés</h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1rem',
          color: '#4b5563'
        }}>
          <div>
            <strong>Upload :</strong>
            <ul style={{ margin: '0.5rem 0 0 0', paddingLeft: '1rem', fontSize: '0.9rem' }}>
              <li>Différents formats</li>
              <li>Validation des tailles</li>
              <li>Noms de fichiers</li>
            </ul>
          </div>
          <div>
            <strong>Gestion :</strong>
            <ul style={{ margin: '0.5rem 0 0 0', paddingLeft: '1rem', fontSize: '0.9rem' }}>
              <li>Téléchargement</li>
              <li>Suppression</li>
              <li>Classification</li>
            </ul>
          </div>
          <div>
            <strong>Interface :</strong>
            <ul style={{ margin: '0.5rem 0 0 0', paddingLeft: '1rem', fontSize: '0.9rem' }}>
              <li>Responsivité</li>
              <li>Animations</li>
              <li>États d'erreur</li>
            </ul>
          </div>
        </div>
      </div>

      <div style={{
        marginTop: '2rem',
        padding: '1rem',
        background: 'linear-gradient(135deg, #065f46, #047857)',
        borderRadius: '12px',
        textAlign: 'center',
        color: 'white'
      }}>
        <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: '600' }}>
          🎉 Interface de gestion des documents complètement fonctionnelle !
        </p>
        <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.9rem', opacity: 0.9 }}>
          Frontend: localhost:8081 | Backend: localhost:8000
        </p>
      </div>
    </div>
  );
};

export default ProjectDocumentsGuide;

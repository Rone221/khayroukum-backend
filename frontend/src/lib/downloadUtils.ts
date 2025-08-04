import api from './api';

export const downloadDocument = async (documentId: string, documentName: string) => {
  try {
    const response = await api.get(`/documents/${documentId}/download`, {
      responseType: 'blob',
    });

    // Créer un URL temporaire pour le blob
    const url = window.URL.createObjectURL(new Blob([response.data]));
    
    // Créer un élément <a> temporaire pour déclencher le téléchargement
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', documentName);
    
    // Ajouter au DOM, cliquer et supprimer
    document.body.appendChild(link);
    link.click();
    
    // Nettoyer
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    return true;
  } catch (error) {
    console.error('Erreur lors du téléchargement:', error);
    return false;
  }
};

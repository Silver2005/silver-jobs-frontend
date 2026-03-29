import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import DashboardCandidat from './DashboardCandidat';
import DashboardRecruteur from './DashboardRecruteur';
import DashboardAdmin from './DashboardAdmin'; // Importation du dashboard Admin
import api from './api';

const Dashboard = () => {
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // --- 1. INITIALISATION DE L'UTILISATEUR ---
  useEffect(() => {
    const initUser = () => {
      try {
        const savedUser = localStorage.getItem('user');
        const token = localStorage.getItem('token');
        
        if (savedUser && token) {
          setUser(JSON.parse(savedUser));
        } else {
          // Si aucune session n'est trouvée, redirection vers le login
          navigate('/login');
        }
      } catch (error) {
        console.error("Erreur de lecture utilisateur :", error);
        localStorage.removeItem('user'); // Nettoyage si le JSON est corrompu
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };
    initUser();
  }, [navigate]);

  // --- 2. RÉCUPÉRATION DES NOTIFICATIONS (Mémoïsée) ---
  const fetchNotifications = useCallback(async () => {
    const token = localStorage.getItem('token');
    
    // On ne cherche pas de notifications si c'est un Admin (ou si pas de token/user)
    if (!token || !user || user.role === 'admin') return; 
    
    try {
      // Route backend : Route::get('/notifications/unread-count', ...)
      const res = await api.get('/notifications/unread-count');
      
      // On gère les formats res.data.count ou res.data.length
      const count = res.data.count !== undefined ? res.data.count : (res.data.length || 0);
      setUnreadCount(count);
    } catch (err) {
      if (err.response?.status === 401) {
        // Si le token a expiré côté serveur
        console.warn("Session expirée");
        localStorage.clear();
        navigate('/login');
      }
      console.error("Erreur notifications:", err);
    }
  }, [user, navigate]);

  // --- 3. SYNCHRONISATION (Intervalle de 60s) ---
  useEffect(() => {
    // L'intervalle ne tourne que pour les utilisateurs non-admin
    if (user && user.role !== 'admin') {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 60000); 
      return () => clearInterval(interval);
    }
  }, [user, fetchNotifications]);

  // --- 4. ÉCRAN DE CHARGEMENT SILVERJOBS ---
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8F9FB]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-blue-600 border-r-transparent"></div>
        <p className="mt-4 text-[10px] font-black uppercase tracking-widest text-gray-400">
          Synchronisation SilverJobs...
        </p>
      </div>
    );
  }

  // --- 5. SÉCURITÉ SI USER EST NULL ---
  if (!user) return null;

  // --- 6. RENDU FINAL (Orientation par Rôle) ---
  return (
    <div className="relative min-h-screen bg-[#F8F9FB]">
      {/* Ici on gère les 3 cas :
          1. Admin -> Redirection vers sa zone spécifique (ou affichage du composant)
          2. Recruteur -> DashboardRecruteur
          3. Candidat (par défaut) -> DashboardCandidat
      */}
      {user.role === 'admin' ? (
        <Navigate to="/admin/dashboard" replace />
      ) : user.role === 'recruteur' ? (
        <DashboardRecruteur user={user} unreadCount={unreadCount} />
      ) : (
        <DashboardCandidat user={user} unreadCount={unreadCount} />
      )}
    </div>
  );
};

export default Dashboard;
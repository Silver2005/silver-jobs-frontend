import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import supabase from './api'; // Ton client Supabase avec la clé anon

// Importation de tes composants
import Home from './Home';
import Login from './Login';
import Register from './Register';
import Dashboard from './Dashboard'; 
import DashboardAdmin from './DashboardAdmin'; 
import CreateJob from './CreateJob';
import JobDetails from './JobDetails';
import CompleteProfile from './CompleteProfile';
import ManageApplications from './ManageApplications'; 
import ApplicationDetails from './ApplicationDetails'; 
import EditProfile from './EditProfile'; 
import Notifications from './Notifications'; 
import PublicProfile from './PublicProfile'; 

/**
 * 🔒 ROUTE PRIVÉE (Utilise la session Supabase)
 */
const PrivateRoute = ({ children }) => {
  const [session, setSession] = useState(undefined);

  useEffect(() => {
    // Vérifie la session actuelle
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // Écoute les changements d'état (login/logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (session === undefined) return null; // Chargement silencieux
  return session ? children : <Navigate to="/login" replace />;
};

/**
 * 👑 ROUTE ADMIN (Vérifie le rôle dans la table profiles)
 */
const AdminRoute = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(undefined);

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsAdmin(false);
        return;
      }
      
      const { data } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      
      setIsAdmin(data?.role === 'admin');
    };
    checkAdmin();
  }, []);

  if (isAdmin === undefined) return null;
  return isAdmin ? children : <Navigate to="/dashboard" replace />;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* --- 1. PAGES PUBLIQUES --- */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/p/:username" element={<PublicProfile />} />

        {/* --- 2. ZONE ADMINISTRATION (SILVERCONTROL) --- */}
        <Route 
          path="/admin/dashboard" 
          element={
            <AdminRoute>
              <DashboardAdmin />
            </AdminRoute>
          } 
        />

        {/* --- 3. PAGES PROTÉGÉES (Connexion requise) --- */}
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/jobs" element={<PrivateRoute><Dashboard /></PrivateRoute>} /> 
        
        {/* SECTION CANDIDAT */}
        <Route path="/jobs/:id" element={<PrivateRoute><JobDetails /></PrivateRoute>} />
        <Route path="/my-applications" element={<PrivateRoute><ManageApplications /></PrivateRoute>} />
        <Route path="/notifications" element={<PrivateRoute><Notifications /></PrivateRoute>} />

        {/* SECTION RECRUTEUR */}
        <Route path="/create-job" element={<PrivateRoute><CreateJob /></PrivateRoute>} />
        <Route path="/manage-applications" element={<PrivateRoute><ManageApplications /></PrivateRoute>} />
        <Route path="/applications/:id" element={<PrivateRoute><ApplicationDetails /></PrivateRoute>} />

        {/* GESTION DU PROFIL */}
        <Route path="/profile" element={<PrivateRoute><EditProfile /></PrivateRoute>} />
        <Route path="/complete-profile" element={<PrivateRoute><CompleteProfile /></PrivateRoute>} />

        {/* --- 4. SÉCURITÉ & 404 --- */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
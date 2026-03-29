import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from './api'; // Import de ton instance client

const Login = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  /**
   * 1. EFFET DE REDIRECTION AUTOMATIQUE
   * Supabase gère la session dans le stockage local automatiquement.
   */
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        // Si session existe, on récupère le rôle dans la table profiles
        fetchUserRoleAndRedirect(session.user.id);
      }
    };
    checkSession();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  /**
   * 2. RÉCUPÉRATION DU RÔLE DEPUIS LA TABLE PROFILES
   */
  const fetchUserRoleAndRedirect = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();

      if (error) throw error;
      redirectByRole(data.role);
    } catch (err) {
      console.error("Erreur lors de la récupération du profil:", err);
      // Par défaut, si pas de profil trouvé, on va au dashboard
      navigate('/dashboard');
    }
  };

  const redirectByRole = (role) => {
    switch (role) {
      case 'admin':
        navigate('/admin/dashboard');
        break;
      default:
        navigate('/dashboard');
    }
  };

  /**
   * 3. SOUMISSION DU FORMULAIRE (SUPABASE AUTH)
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Connexion directe à Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) throw error;

      if (data.user) {
        // Une fois connecté, on cherche le rôle pour rediriger
        await fetchUserRoleAndRedirect(data.user.id);
      }

    } catch (error) {
      console.error('Erreur login:', error.message);
      alert(error.message || "Identifiants incorrects.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-blue-50 to-white flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl shadow-blue-100/50 p-10 border border-gray-50 animate-in slide-in-from-bottom-4 duration-500">
        
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg shadow-blue-200">
            <span className="text-white text-2xl font-black">S</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-800 tracking-tight italic uppercase">SilverJobs</h2>
          <p className="text-gray-400 mt-2 font-bold text-xs uppercase tracking-widest">Connectez-vous pour continuer</p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 ml-1 tracking-widest">Email</label>
            <input 
              name="email"
              type="email" 
              required
              value={formData.email}
              placeholder="votre@email.com"
              onChange={handleChange}
              className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all duration-300 font-bold text-sm"
            />
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 ml-1 tracking-widest">Mot de passe</label>
            <input 
              name="password"
              type="password" 
              required
              value={formData.password}
              placeholder="••••••••"
              onChange={handleChange}
              className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all duration-300 font-bold text-sm"
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className={`w-full py-5 bg-gray-900 text-white font-black uppercase italic tracking-widest rounded-2xl shadow-xl transition-all duration-300 flex items-center justify-center gap-2 ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-blue-600 hover:-translate-y-1 active:scale-95'}`}
          >
            {loading ? 'VÉRIFICATION...' : 'SE CONNECTER'}
          </button>
        </form>

        <div className="mt-10 text-center">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-tighter">
            Pas encore de compte ? <Link to="/register" className="text-blue-600 hover:underline">S'inscrire</Link>
          </p>
          <Link to="/" className="inline-block mt-6 text-[10px] font-black text-gray-300 hover:text-blue-500 transition-colors uppercase tracking-widest">
            ← Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
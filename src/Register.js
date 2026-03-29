import React, { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from './api'; 

const Register = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const role = searchParams.get('role') || 'candidat';

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    role: role,
    company_name: '', 
    specialty: ''    
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.password_confirmation) {
      return alert("Les mots de passe ne correspondent pas !");
    }

    setLoading(true);
    try {
      // 1. Inscription dans Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });

      if (authError) throw authError;

      if (authData.user) {
        // 2. Création manuelle du profil dans la table 'profiles'
        // C'est ici que tu lies l'utilisateur Auth à tes données métier
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              id: authData.user.id, // On utilise l'ID généré par l'auth
              full_name: formData.name,
              email: formData.email,
              role: formData.role,
              company_name: formData.role === 'recruteur' ? formData.company_name : null,
              specialty: formData.role === 'candidat' ? formData.specialty : null,
              avatar_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name)}&background=2563eb&color=fff`,
              created_at: new Date()
            }
          ]);

        if (profileError) throw profileError;

        alert('Félicitations ! Votre compte SilverJobs est prêt.');
        navigate('/dashboard'); 
      }
      
    } catch (error) {
      console.error('Erreur:', error.message);
      alert(error.message || 'Une erreur est survenue lors de l\'inscription');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-100 flex items-center justify-center p-4 font-sans">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl p-10 border border-gray-50 animate-in fade-in slide-in-from-bottom-6 duration-700">
        
        <div className="text-center mb-8">
          <div className={`w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg transition-colors duration-500 ${role === 'recruteur' ? 'bg-gray-900 shadow-gray-200' : 'bg-blue-600 shadow-blue-200'}`}>
            <span className="text-white text-2xl font-black italic">{role === 'recruteur' ? 'R' : 'C'}</span>
          </div>
          <h2 className="text-3xl font-black text-gray-800 uppercase italic tracking-tighter">
            Inscription {role === 'recruteur' ? 'Recruteur' : 'Candidat'}
          </h2>
          <p className="text-gray-400 mt-2 font-bold text-[10px] uppercase tracking-[0.2em]">
            {role === 'recruteur' ? "Bâtissez votre équipe de rêve." : "Décrochez le job de vos rêves."}
          </p>
        </div>

        <form className="grid grid-cols-1 md:grid-cols-2 gap-6" onSubmit={handleSubmit}>
          
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-gray-400 ml-1 tracking-widest">Nom complet</label>
            <input 
              name="name"
              type="text" 
              required
              placeholder="Ex: Abass Sinilon" 
              onChange={handleChange}
              className="w-full px-5 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-bold text-sm" 
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-gray-400 ml-1 tracking-widest">Email</label>
            <input 
              name="email"
              type="email" 
              required
              placeholder="contact@silver.bf" 
              onChange={handleChange}
              className="w-full px-5 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-bold text-sm" 
            />
          </div>

          {role === 'recruteur' && (
            <div className="md:col-span-2 space-y-2 animate-in fade-in duration-500">
              <label className="text-[10px] font-black uppercase text-gray-400 ml-1 tracking-widest">Nom de l'entreprise</label>
              <input 
                name="company_name"
                type="text" 
                required
                placeholder="SILVER'S DESIGN SARL" 
                onChange={handleChange}
                className="w-full px-5 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-4 focus:ring-gray-900/5 outline-none transition-all font-bold text-sm" 
              />
            </div>
          )}

          {role === 'candidat' && (
            <div className="md:col-span-2 space-y-2 animate-in fade-in duration-500">
              <label className="text-[10px] font-black uppercase text-gray-400 ml-1 tracking-widest">Spécialité / Poste</label>
              <input 
                name="specialty"
                type="text" 
                required
                placeholder="Ex: Software Engineer" 
                onChange={handleChange}
                className="w-full px-5 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-bold text-sm" 
              />
            </div>
          )}

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-gray-400 ml-1 tracking-widest">Mot de passe</label>
            <input 
              name="password"
              type="password" 
              required
              placeholder="••••••••" 
              onChange={handleChange}
              className="w-full px-5 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-bold text-sm" 
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-gray-400 ml-1 tracking-widest">Confirmer</label>
            <input 
              name="password_confirmation"
              type="password" 
              required
              placeholder="••••••••" 
              onChange={handleChange}
              className="w-full px-5 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-bold text-sm" 
            />
          </div>

          <div className="md:col-span-2 pt-4">
            <button 
              type="submit" 
              disabled={loading}
              className={`w-full py-5 text-white font-black uppercase tracking-[0.2em] italic rounded-2xl shadow-xl transition-all transform active:scale-95 ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:-translate-y-1'} ${role === 'recruteur' ? 'bg-gray-900 shadow-gray-200 hover:bg-black' : 'bg-blue-600 shadow-blue-200 hover:bg-blue-700'}`}
            >
              {loading ? 'TRAITEMENT...' : 'CRÉER MON COMPTE'}
            </button>
          </div>
        </form>

        <div className="mt-8 text-center border-t border-gray-100 pt-6">
          <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">
            Déjà inscrit ? <Link to="/login" className="text-blue-600 hover:underline">Se connecter</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
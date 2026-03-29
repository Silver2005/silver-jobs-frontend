import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from './api';

const EditProfile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    company_name: '',
    specialty: '',
    bio: '' // Petit ajout pour la personnalisation
  });

  const [role, setRole] = useState('');

  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem('user'));
    if (savedUser) {
      setFormData({
        name: savedUser.name || '',
        company_name: savedUser.company_name || '',
        specialty: savedUser.specialty || '',
        bio: savedUser.bio || ''
      });
      setRole(savedUser.role);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Utilisation d'un PUT ou PATCH selon tes préférences API
      const response = await api.put('/user/update', formData);
      
      // Mise à jour du localStorage avec les données fraîches du serveur
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      // Petit délai pour l'effet visuel avant redirection
      setTimeout(() => {
        navigate('/dashboard');
      }, 500);
    } catch (error) {
      console.error("Erreur de mise à jour:", error);
      alert("Erreur lors de la mise à jour des informations.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 font-sans">
      <div className="max-w-xl w-full bg-white rounded-[3rem] shadow-2xl p-12 border border-gray-100 relative overflow-hidden">
        
        {/* Décoration subtile type SILVER'S DESIGN */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-[5rem] -z-0 opacity-50"></div>

        <div className="relative z-10">
          <h2 className="text-4xl font-black text-gray-900 mb-2 tracking-tighter italic">Mon Profil</h2>
          <p className="text-gray-400 mb-10 font-bold uppercase text-xs tracking-widest">
            Configuration de votre espace <span className="text-blue-600">{role}</span>
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              
              {/* Champ Nom */}
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 ml-2 tracking-widest">Nom Complet</label>
                <input 
                  type="text"
                  className="w-full p-5 bg-gray-50 border-2 border-transparent rounded-[1.5rem] focus:bg-white focus:border-blue-600 outline-none transition-all font-bold text-gray-800"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>

              {/* Champ dynamique selon le rôle */}
              {role === 'recruteur' ? (
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 ml-2 tracking-widest">Nom de l'Entreprise</label>
                  <input 
                    type="text"
                    className="w-full p-5 bg-gray-50 border-2 border-transparent rounded-[1.5rem] focus:bg-white focus:border-blue-600 outline-none transition-all font-bold text-gray-800"
                    value={formData.company_name}
                    onChange={(e) => setFormData({...formData, company_name: e.target.value})}
                    placeholder="Ex: SILVER'S DESIGN"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 ml-2 tracking-widest">Spécialité / Expertise</label>
                  <input 
                    type="text"
                    className="w-full p-5 bg-gray-50 border-2 border-transparent rounded-[1.5rem] focus:bg-white focus:border-blue-600 outline-none transition-all font-bold text-gray-800"
                    value={formData.specialty}
                    onChange={(e) => setFormData({...formData, specialty: e.target.value})}
                    placeholder="Ex: UI/UX Designer"
                  />
                </div>
              )}

              {/* Champ Bio (Ajout pour le style) */}
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 ml-2 tracking-widest">Bio / Présentation</label>
                <textarea 
                  rows="3"
                  className="w-sm w-full p-5 bg-gray-50 border-2 border-transparent rounded-[1.5rem] focus:bg-white focus:border-blue-600 outline-none transition-all font-medium text-gray-600 resize-none"
                  value={formData.bio}
                  onChange={(e) => setFormData({...formData, bio: e.target.value})}
                  placeholder="Dites-en un peu plus sur vous..."
                />
              </div>
            </div>

            <div className="flex gap-4 pt-6">
              <button 
                type="button"
                onClick={() => navigate('/dashboard')}
                className="flex-1 py-5 bg-gray-100 text-gray-500 rounded-2xl font-black hover:bg-gray-200 transition-all text-sm"
              >
                IGNORER
              </button>
              <button 
                type="submit" 
                disabled={loading}
                className={`flex-[2] py-5 rounded-2xl font-black text-sm shadow-xl transition-all ${
                  loading 
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                  : 'bg-gray-900 text-white hover:bg-blue-600 shadow-blue-100'
                }`}
              >
                {loading ? 'SYNCHRONISATION...' : 'METTRE À JOUR LE PROFIL'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from './api';

const CreateJob = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    location: '',
    type: 'CDI',
    salary: '',
    description: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // On envoie vers la route protégée de Laravel
      await api.post('/jobs', formData);
      alert('Votre offre a été publiée avec succès !');
      navigate('/dashboard');
    } catch (error) {
      alert("Erreur lors de la publication. Vérifiez que vous êtes bien connecté.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-xl p-10 border border-gray-100">
        <h2 className="text-3xl font-black text-gray-800 mb-2">Publier une offre</h2>
        <p className="text-gray-500 mb-8 font-medium">Trouvez votre futur talent sur Silver-Jobs.</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 ml-1">Titre du poste</label>
            <input 
              name="title" 
              required 
              placeholder="ex: Développeur React / Designer UI"
              onChange={handleChange}
              className="w-full px-5 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 ml-1">Lieu</label>
              <input 
                name="location" 
                required 
                placeholder="ex: Ouagadougou / Télétravail"
                onChange={handleChange}
                className="w-full px-5 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 ml-1">Type de contrat</label>
              <select 
                name="type" 
                onChange={handleChange}
                className="w-full px-5 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none"
              >
                <option value="CDI">CDI</option>
                <option value="CDD">CDD</option>
                <option value="Freelance">Freelance</option>
                <option value="Stage">Stage</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 ml-1">Salaire (Optionnel)</label>
            <input 
              name="salary" 
              placeholder="ex: 300 000 FCFA - 500 000 FCFA"
              onChange={handleChange}
              className="w-full px-5 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 ml-1">Description du poste</label>
            <textarea 
              name="description" 
              required 
              rows="5"
              placeholder="Décrivez les missions et le profil recherché..."
              onChange={handleChange}
              className="w-full px-5 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-4 focus:ring-blue-500/10 outline-none transition-all resize-none"
            ></textarea>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-blue-600 text-white font-black rounded-2xl shadow-lg shadow-blue-200 hover:bg-blue-700 hover:-translate-y-1 transition-all disabled:opacity-50"
          >
            {loading ? "Publication en cours..." : "Mettre en ligne l'annonce"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateJob;
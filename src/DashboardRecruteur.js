import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from './api';

const DashboardRecruteur = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('offres'); 
  const [myJobs, setMyJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Récupération de l'utilisateur depuis le stockage local
  const user = JSON.parse(localStorage.getItem('user'));

  // Fonction pour transformer le nom en slug URL
  const getProfileSlug = (name) => {
    return name ? name.toLowerCase().trim().replace(/\s+/g, '-') : '';
  };

  const fetchData = useCallback(async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const [jobsRes, appsRes] = await Promise.all([
        api.get('/jobs'),
        api.get('/recruteur/applications')
      ]);
      
      const ownJobs = jobsRes.data.filter(job => job.user_id === user.id);
      setMyJobs(ownJobs);
      setApplications(appsRes.data);
    } catch (err) {
      console.error("Erreur de synchronisation Silver-Jobs:", err);
      setError("Erreur de connexion avec le serveur.");
    } finally {
      setLoading(false);
    }
  }, [user?.id, navigate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-20">
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        
        {/* HEADER DYNAMIQUE */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <div>
            <h2 className="text-4xl font-black text-gray-900 tracking-tighter italic uppercase">
              GESTION <span className="text-blue-600">RECRUTEUR</span>
            </h2>
            <div className="flex items-center gap-3 mt-2">
              <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">
                {user?.company_name || "Entreprise non définie"}
              </p>
              <span className="h-1 w-1 bg-gray-300 rounded-full"></span>
              <button onClick={handleLogout} className="text-red-500 font-black text-[10px] uppercase hover:underline">
                Déconnexion
              </button>
            </div>
          </div>
          <button 
            onClick={() => navigate('/create-job')}
            className="w-full md:w-auto bg-gray-900 text-white px-8 py-4 rounded-2xl font-black text-xs hover:bg-blue-600 transition-all shadow-2xl shadow-gray-200 uppercase"
          >
            + Créer une nouvelle annonce
          </button>
        </header>

        {/* NAVIGATION PAR ONGLETS */}
        <div className="flex flex-wrap gap-4 mb-10 bg-white p-2 rounded-[2rem] w-fit shadow-sm border border-gray-100">
          <button 
            onClick={() => setActiveTab('offres')}
            className={`px-8 py-4 rounded-[1.5rem] font-black text-xs transition-all ${
              activeTab === 'offres' ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'text-gray-400 hover:text-gray-800 hover:bg-gray-50'
            }`}
          >
            MES OFFRES ({myJobs.length})
          </button>
          <button 
            onClick={() => setActiveTab('candidatures')}
            className={`px-8 py-4 rounded-[1.5rem] font-black text-xs transition-all ${
              activeTab === 'candidatures' ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'text-gray-400 hover:text-gray-800 hover:bg-gray-50'
            }`}
          >
            CANDIDATURES REÇUES ({applications.length})
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-2xl font-bold text-center border border-red-100">
            {error} - Vérifie que ton serveur Laravel est bien lancé !
          </div>
        )}

        {loading ? (
          <div className="py-20 text-center flex flex-col items-center">
             <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-4"></div>
             <div className="font-black text-gray-300 tracking-widest uppercase text-xs">Synchronisation Silver-Jobs...</div>
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            
            {activeTab === 'offres' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {myJobs.length > 0 ? myJobs.map(job => (
                  <div key={job.id} className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all group">
                    <div className="flex justify-between items-start mb-4">
                        <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-black rounded-lg uppercase">{job.type}</span>
                        <span className="text-gray-300 font-black text-[10px] uppercase italic">ID: #{job.id}</span>
                    </div>
                    <h4 className="text-xl font-black mb-2 text-gray-900 group-hover:text-blue-600 transition-colors">{job.title}</h4>
                    <p className="text-gray-400 text-xs font-bold mb-8 flex items-center gap-2">📍 {job.location}</p>
                    <button 
                      onClick={() => setActiveTab('candidatures')}
                      className="w-full py-4 bg-gray-50 text-gray-900 rounded-2xl font-black text-[10px] uppercase hover:bg-gray-900 hover:text-white transition-all"
                    >
                      Voir les postulants
                    </button>
                  </div>
                )) : (
                  <div className="col-span-full bg-white border-2 border-dashed border-gray-200 rounded-[3rem] py-20 text-center">
                    <p className="text-gray-400 font-black uppercase italic tracking-widest">Vous n'avez pas encore publié d'offres.</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'candidatures' && (
              <div className="bg-white rounded-[3rem] border border-gray-100 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                        <th className="p-8 text-[10px] font-black uppercase text-gray-400">Candidat</th>
                        <th className="p-8 text-[10px] font-black uppercase text-gray-400">Poste ciblé</th>
                        <th className="p-8 text-[10px] font-black uppercase text-gray-400">Date</th>
                        <th className="p-8 text-[10px] font-black uppercase text-gray-400 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {applications.length > 0 ? applications.map(app => (
                        <tr key={app.id} className="hover:bg-blue-50/20 transition-colors group">
                            <td className="p-8 font-bold text-gray-800">
                                <div className="flex flex-col">
                                    <span>{app.user.name}</span>
                                    <span className="text-[10px] text-gray-400 font-normal lowercase italic">{app.user.email}</span>
                                </div>
                            </td>
                            <td className="p-8">
                            <span className="px-3 py-1 bg-gray-100 text-gray-500 text-[10px] font-black rounded-lg uppercase italic group-hover:bg-blue-100 group-hover:text-blue-600 transition-all">
                                {app.job?.title || "Poste supprimé"}
                            </span>
                            </td>
                            <td className="p-8 text-gray-400 text-xs font-bold">
                                {new Date(app.created_at).toLocaleDateString()}
                            </td>
                            <td className="p-8 text-right">
                              <div className="flex justify-end gap-2">
                                {/* BOUTON PROFIL PUBLIC AJOUTÉ ICI */}
                                <button 
                                    onClick={() => window.open(`/p/${getProfileSlug(app.user.name)}`, '_blank')}
                                    className="bg-blue-600 px-4 py-2 rounded-xl text-white font-black text-[10px] uppercase hover:bg-black transition-all shadow-lg shadow-blue-100"
                                >
                                    Profil Public
                                </button>
                                
                                <button 
                                    onClick={() => navigate(`/applications/${app.id}`)}
                                    className="bg-white border border-gray-200 px-4 py-2 rounded-xl text-blue-600 font-black text-[10px] uppercase hover:bg-blue-50 transition-all shadow-sm"
                                >
                                    Ouvrir le dossier
                                </button>
                              </div>
                            </td>
                        </tr>
                        )) : (
                        <tr><td colSpan="4" className="p-20 text-center text-gray-300 font-black uppercase italic tracking-tighter text-xl">Aucun CV reçu pour l'instant.</td></tr>
                        )}
                    </tbody>
                    </table>
                </div>
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardRecruteur;
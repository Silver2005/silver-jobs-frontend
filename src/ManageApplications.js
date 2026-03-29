import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from './api'; // Ton client Supabase
import { FiUser, FiEye, FiCheck, FiX, FiArrowLeft, FiSend, FiInbox } from 'react-icons/fi';

const ManageApplications = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUser(session.user);
        fetchApplications(session.user);
      } else {
        navigate('/login');
      }
    };
    getSession();
  }, [navigate]);

  const fetchApplications = async (currentUser) => {
    const isRecruteur = currentUser.user_metadata.role === 'recruteur';
    
    try {
      let query = supabase
        .from('applications')
        .select(`
          id,
          status,
          applied_at,
          job:jobs (
            id,
            title,
            company_name,
            location
          ),
          user:profiles!applications_user_id_fkey (
            id,
            full_name,
            username
          )
        `);

      // Filtre selon le rôle
      if (isRecruteur) {
        // Pour un recruteur, on filtre les jobs qui lui appartiennent (si tu as un champ user_id dans 'jobs')
        // Ici, on récupère tout pour l'exemple, à adapter selon ta logique de propriété des jobs
      } else {
        query = query.eq('user_id', currentUser.id);
      }

      const { data, error } = await query.order('applied_at', { ascending: false });

      if (error) throw error;
      setApplications(data);
    } catch (error) {
      console.error("Erreur chargement candidatures:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      const { error } = await supabase
        .from('applications')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;

      setApplications(applications.map(app => 
        app.id === id ? { ...app, status: newStatus } : app
      ));
    } catch (error) {
      alert("Erreur lors de la mise à jour : " + error.message);
    }
  };

  if (!user) return null;
  const isRecruteur = user.user_metadata.role === 'recruteur';

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans text-gray-900">
      <div className="max-w-7xl mx-auto">
        <button 
          onClick={() => navigate('/dashboard')}
          className="mb-8 flex items-center gap-2 text-gray-400 font-black text-xs tracking-widest hover:text-blue-600 transition-all uppercase"
        >
          <FiArrowLeft size={16} /> RETOUR AU DASHBOARD
        </button>

        <div className="flex justify-between items-end mb-10">
            <div>
                <h2 className="text-5xl font-black tracking-tighter uppercase italic">
                  {isRecruteur ? 'Candidatures' : 'Mes Postulations'}
                </h2>
                <p className="text-gray-500 font-medium mt-2">
                  {isRecruteur 
                    ? "Gérez les talents qui ont postulé à vos offres SilverJobs."
                    : "Suivez en temps réel l'état de vos candidatures envoyées."}
                </p>
            </div>
            <div className="bg-white px-6 py-3 rounded-2xl shadow-sm border border-gray-100">
                <span className="text-3xl font-black text-blue-600">{applications.length}</span>
                <span className="ml-2 text-xs font-bold text-gray-400 uppercase tracking-widest">Total</span>
            </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : applications.length > 0 ? (
          <div className="bg-white rounded-[2.5rem] shadow-xl shadow-blue-900/5 border border-gray-100 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="p-6 text-[10px] font-black uppercase text-gray-400 tracking-[0.2em]">
                    {isRecruteur ? 'Candidat' : 'Entreprise'}
                  </th>
                  <th className="p-6 text-[10px] font-black uppercase text-gray-400 tracking-[0.2em]">Poste visé</th>
                  {isRecruteur && <th className="p-6 text-[10px] font-black uppercase text-gray-400 tracking-[0.2em]">Profil</th>}
                  <th className="p-6 text-[10px] font-black uppercase text-gray-400 tracking-[0.2em]">Statut</th>
                  <th className="p-6 text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {applications.map((app) => (
                  <tr key={app.id} className="hover:bg-blue-50/20 transition-colors group">
                    <td className="p-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center font-black text-xs">
                            {isRecruteur ? app.user?.full_name?.charAt(0) : app.job?.company_name?.charAt(0)}
                        </div>
                        <div>
                            <p className="font-bold text-sm text-gray-900">
                              {isRecruteur ? app.user?.full_name : app.job?.company_name}
                            </p>
                            <p className="text-[11px] text-gray-400 font-medium">
                              {isRecruteur ? `@${app.user?.username}` : app.job?.location}
                            </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-6">
                      <span className="px-3 py-1 bg-white border border-gray-200 text-gray-600 text-[10px] font-black rounded-lg uppercase shadow-sm">
                        {app.job?.title}
                      </span>
                    </td>
                    {isRecruteur && (
                      <td className="p-6">
                        <button 
                          onClick={() => navigate(`/p/${app.user?.username}`)}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-[10px] font-black rounded-xl hover:bg-black transition-all shadow-lg shadow-blue-200 uppercase"
                        >
                          <FiEye size={14} /> Voir Profil
                        </button>
                      </td>
                    )}
                    <td className="p-6">
                      <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                        app.status === 'valide' ? 'bg-green-100 text-green-600' : 
                        app.status === 'rejeté' ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'
                      }`}>
                        {app.status || 'En attente'}
                      </span>
                    </td>
                    <td className="p-6">
                      <div className="flex gap-2 justify-end">
                        {isRecruteur ? (
                          <>
                            <button 
                              onClick={() => updateStatus(app.id, 'valide')}
                              className="p-2.5 bg-white border border-gray-100 text-green-500 rounded-xl hover:bg-green-500 hover:text-white transition-all shadow-sm"
                            >
                              <FiCheck size={18} />
                            </button>
                            <button 
                              onClick={() => updateStatus(app.id, 'rejeté')}
                              className="p-2.5 bg-white border border-gray-100 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm"
                            >
                              <FiX size={18} />
                            </button>
                          </>
                        ) : (
                          <button 
                            className="p-2.5 bg-white border border-gray-100 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                          >
                            <FiEye size={18} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-white p-20 rounded-[3rem] text-center border-2 border-dashed border-gray-100 shadow-inner">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-200">
                {isRecruteur ? <FiInbox size={40} /> : <FiSend size={40} />}
            </div>
            <p className="text-gray-400 font-black uppercase text-xs tracking-[0.2em]">
              {isRecruteur ? "Aucune candidature reçue." : "Vous n'avez pas encore postulé."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageApplications;
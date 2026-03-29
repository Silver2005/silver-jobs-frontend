import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from './api';
import { 
  FiUsers, FiBriefcase, FiCheckCircle, FiTrash2, 
  FiLogOut, FiTrendingUp, FiCreditCard, FiShield, FiInbox 
} from 'react-icons/fi';

const DashboardAdmin = () => {
  const navigate = useNavigate();
  // Initialisation avec des valeurs par défaut pour éviter les erreurs au premier rendu
  const [stats, setStats] = useState({ 
    counts: { users: 0, jobs_total: 0, jobs_pending: 0, carts_pending: 0 }, 
    revenue: 0, 
    recent_users: [] 
  });
  const [pendingJobs, setPendingJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // Utilisation de useCallback pour pouvoir rafraîchir les données après une action
  const fetchData = useCallback(async () => {
    try {
      const [resStats, resJobs] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/jobs/pending')
      ]);
      setStats(resStats.data);
      setPendingJobs(resJobs.data);
    } catch (err) {
      console.error("Erreur de synchronisation SilverControl:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const handleApprove = async (id) => {
    if(window.confirm("Valider cette annonce pour la plateforme SilverJobs ?")) {
      try {
        // On s'assure que la méthode correspond au contrôleur Laravel
        await api.patch(`/admin/jobs/${id}/approve`);
        fetchData(); // Rafraîchissement automatique
      } catch (err) {
        alert("Erreur lors de la validation. Vérifiez la console.");
      }
    }
  };

  if (loading) return (
    <div className="h-screen bg-[#0a0a0c] flex flex-col items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-blue-500 mb-4"></div>
      <p className="text-blue-500 font-bold tracking-widest animate-pulse">CHARGEMENT DU DASHBOARD...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-gray-100 font-sans flex">
      
      {/* SIDEBAR GAUCHE */}
      <div className="w-64 bg-[#0f0f12] border-r border-gray-800 p-6 flex flex-col fixed h-full">
        <div className="mb-10 text-2xl font-black italic tracking-tighter">
          SILVER<span className="text-blue-500">CONTROL</span>
          <p className="text-[10px] text-gray-500 not-italic tracking-widest uppercase">v2.0 Admin Engine</p>
        </div>

        <nav className="flex-1 space-y-2">
          <button 
            onClick={() => setActiveTab('overview')} 
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'overview' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' : 'hover:bg-gray-800 text-gray-400'}`}
          >
            <FiTrendingUp /> Vue d'ensemble
          </button>
          <button 
            onClick={() => setActiveTab('jobs')} 
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'jobs' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' : 'hover:bg-gray-800 text-gray-400'}`}
          >
            <FiBriefcase /> Modération 
            {pendingJobs.length > 0 && <span className="ml-auto bg-red-500 text-[10px] px-2 py-0.5 rounded-full animate-bounce">{pendingJobs.length}</span>}
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-800 text-gray-400 opacity-50 cursor-not-allowed">
            <FiUsers /> Utilisateurs
          </button>
        </nav>

        <button onClick={handleLogout} className="mt-auto flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-all font-bold">
          <FiLogOut /> Quitter la console
        </button>
      </div>

      {/* MAIN CONTENT (Décalé à cause de la sidebar fixed) */}
      <main className="flex-1 ml-64 p-10 overflow-y-auto">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h2 className="text-3xl font-black text-white capitalize">Content de vous revoir, Abass</h2>
            <p className="text-gray-500 text-sm">Gestion centralisée de SilverJobs.</p>
          </div>
          <div className="bg-gray-800/50 p-3 rounded-2xl border border-gray-700 flex items-center gap-3">
            <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs font-bold uppercase tracking-widest text-gray-300">Serveur Live</span>
          </div>
        </header>

        {activeTab === 'overview' ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
              <StatCard title="Utilisateurs" value={stats.counts?.users} icon={<FiUsers />} color="blue" />
              <StatCard title="Jobs Totaux" value={stats.counts?.jobs_total} icon={<FiBriefcase />} color="purple" />
              <StatCard title="Revenus (FCFA)" value={stats.revenue?.toLocaleString()} icon={<FiCreditCard />} color="green" />
              <StatCard title="Attente Paiement" value={stats.counts?.carts_pending} icon={<FiShield />} color="yellow" />
            </div>

            <div className="bg-[#0f0f12] border border-gray-800 rounded-3xl p-8 shadow-sm">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <FiUsers className="text-blue-500" /> Nouveaux inscrits
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-gray-500 text-xs uppercase tracking-widest border-b border-gray-800">
                      <th className="pb-4 px-2">Nom</th>
                      <th className="pb-4 px-2">Email</th>
                      <th className="pb-4 px-2">Rôle</th>
                      <th className="pb-4 px-2">Statut</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {stats.recent_users?.length > 0 ? stats.recent_users.map(user => (
                      <tr key={user.id} className="text-sm hover:bg-gray-800/30 transition-colors">
                        <td className="py-4 px-2 font-bold">{user.name}</td>
                        <td className="py-4 px-2 text-gray-400">{user.email}</td>
                        <td className="py-4 px-2">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${user.role === 'recruteur' ? 'bg-purple-500/10 text-purple-400' : 'bg-blue-500/10 text-blue-400'}`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="py-4 px-2">
                          <div className="flex items-center gap-2 text-green-400 text-xs">
                            <div className="h-1.5 w-1.5 bg-green-400 rounded-full"></div> Actif
                          </div>
                        </td>
                      </tr>
                    )) : (
                      <tr><td colSpan="4" className="py-10 text-center text-gray-600 italic">Aucun utilisateur inscrit récemment.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          <div className="space-y-6 animate-in fade-in duration-500">
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <FiBriefcase className="text-blue-500" /> Validation des annonces
            </h3>
            
            {pendingJobs.length > 0 ? pendingJobs.map(job => (
              <div key={job.id} className="bg-[#0f0f12] border border-gray-800 p-6 rounded-3xl flex justify-between items-center hover:border-blue-500/50 transition-all group">
                <div className="flex gap-6 items-center">
                  <div className="h-14 w-14 bg-gray-800 rounded-2xl flex items-center justify-center text-2xl font-black text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-all">
                    {job.title?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-black text-lg">{job.title}</h4>
                    <p className="text-sm text-gray-500">
                      Par <span className="text-gray-300">{job.user?.name || 'Recruteur inconnu'}</span> • {job.location}
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button 
                    onClick={() => handleApprove(job.id)} 
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all"
                  >
                    Approuver
                  </button>
                  <button className="bg-gray-800 hover:bg-red-500 text-gray-400 hover:text-white p-4 rounded-2xl transition-all">
                    <FiTrash2 />
                  </button>
                </div>
              </div>
            )) : (
              <div className="flex flex-col items-center justify-center py-20 bg-[#0f0f12] rounded-3xl border-2 border-dashed border-gray-800">
                <FiInbox className="text-6xl text-gray-800 mb-4" />
                <p className="text-gray-500 font-bold">Aucune annonce en attente de modération.</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

const StatCard = ({ title, value, icon, color }) => {
  const colors = {
    blue: 'text-blue-500 border-blue-500/20',
    purple: 'text-purple-500 border-purple-500/20',
    green: 'text-green-500 border-green-500/20',
    yellow: 'text-yellow-500 border-yellow-500/20',
  };

  return (
    <div className="bg-[#0f0f12] border border-gray-800 p-6 rounded-3xl relative overflow-hidden group hover:border-blue-500/50 transition-all">
      <div className={`absolute -right-4 -bottom-4 text-6xl opacity-5 transition-transform group-hover:scale-110 ${colors[color]}`}>
        {icon}
      </div>
      <div className="flex items-center gap-4 mb-4">
        <div className="p-3 rounded-2xl bg-gray-800 border border-gray-700 text-blue-500">
          {icon}
        </div>
        <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">{title}</p>
      </div>
      <p className="text-4xl font-black">{value ?? 0}</p>
    </div>
  );
};

export default DashboardAdmin;
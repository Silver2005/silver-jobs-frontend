import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiUser, FiMail, FiSearch, FiHome, FiChevronRight, 
  FiShoppingBag, FiEye, FiBookOpen, FiMapPin, FiLogOut 
} from 'react-icons/fi';
import supabase from './api'; // Import du client Supabase mis à jour
import ShareProfile from './ShareProfile';

const DashboardCandidat = () => {
  const [applications, setApplications] = useState([]);
  const [availableJobs, setAvailableJobs] = useState([]);
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cartCount, setCartCount] = useState(5);
  
  const navigate = useNavigate();
  
  // Récupération de l'utilisateur via Supabase Auth
  const [user, setUser] = useState(null);

  // --- LOGIQUE DE DÉCONNEXION ---
  const handleLogout = async () => {
    if (window.confirm("Voulez-vous vraiment vous déconnecter de SilverJobs ?")) {
      await supabase.auth.signOut();
      localStorage.clear(); 
      navigate('/login');
    }
  };

  // --- LOGIQUE DE SCORE SILVER ---
  const calculateMissingItems = (profile) => {
    if (!profile) return 5; 
    let missing = 0;
    
    // Vérification simplifiée pour Supabase (les champs sont souvent directement des objets/arrays)
    if (!profile.cv_url) missing++;
    if (!profile.avatar_url) missing++;
    if (!profile.education || profile.education.length === 0) missing++;
    if (!profile.projects || profile.projects.length === 0) missing++;
    if (!profile.skills || profile.skills.length === 0) missing++;
    
    return missing;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Récupérer la session utilisateur actuelle
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          navigate('/login');
          return;
        }
        setUser(session.user);

        // 2. Récupérations parallèles sur Supabase
        const [appsRes, jobsRes, profileRes] = await Promise.all([
          supabase.from('applications').select('*, job:jobs(*)').eq('user_id', session.user.id),
          supabase.from('jobs').select('*').limit(5).order('created_at', { ascending: false }),
          supabase.from('profiles').select('*').eq('id', session.user.id).single()
        ]);

        setApplications(appsRes.data || []);
        setAvailableJobs(jobsRes.data || []);
        
        if (profileRes.data) {
          setProfileData(profileRes.data);
          setCartCount(calculateMissingItems(profileRes.data));
        }
      } catch (err) {
        console.error("Erreur de chargement dashboard:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate]);

  const completionPercentage = ((5 - cartCount) / 5) * 100;
  const publicUsername = profileData?.username || user?.user_metadata?.full_name?.toLowerCase().trim().replace(/\s+/g, '-');

  const handleViewPublicProfile = () => {
    if (publicUsername) navigate(`/p/${publicUsername}`);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FB] pb-32 text-gray-900 font-sans">
      
      {/* --- TOP BAR --- */}
      <div className="bg-white px-6 pt-12 pb-6 flex justify-between items-center sticky top-0 z-50 shadow-sm border-b border-gray-50">
        <div>
          <h1 className="text-2xl font-black uppercase italic tracking-tighter">
            Silver<span className="text-blue-600">Jobs</span>
          </h1>
        </div>
        
        <div className="flex gap-2 items-center">
          <button onClick={handleViewPublicProfile} className="p-3 bg-gray-900 text-white rounded-2xl active:scale-90 transition-all shadow-lg shadow-gray-200">
            <FiEye size={18} />
          </button>

          <button onClick={() => navigate('/complete-profile')} className="relative p-3 bg-blue-50 text-blue-600 rounded-2xl">
            <FiShoppingBag size={20} />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[9px] font-black text-white border-2 border-white">
                {cartCount}
              </span>
            )}
          </button>

          <button onClick={handleLogout} className="p-3 bg-red-50 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all">
            <FiLogOut size={20} />
          </button>

          <img 
            src={profileData?.avatar_url || `https://ui-avatars.com/api/?name=${user?.user_metadata?.full_name || 'User'}&background=000&color=fff`} 
            alt="avatar" 
            className="ml-1 w-12 h-12 rounded-2xl border-2 border-white shadow-md object-cover cursor-pointer"
            onClick={() => navigate('/profile')}
          />
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-6 space-y-10">
        
        {/* --- WELCOME & STATS --- */}
        <section>
          <p className="text-gray-400 font-bold text-[10px] uppercase tracking-[0.2em]">Candidat Silver</p>
          <h2 className="text-3xl font-black mt-1 uppercase leading-none mb-8">
            Salut, <span className="text-blue-600">{(user?.user_metadata?.full_name || 'Ami')?.split(' ')[0]}</span>
          </h2>
          
          {cartCount === 0 ? (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <ShareProfile username={publicUsername} profile={profileData} user={user} />
            </div>
          ) : (
            <div 
              onClick={() => navigate('/complete-profile')}
              className="bg-blue-600 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-blue-200 flex justify-between items-center cursor-pointer relative overflow-hidden mb-8"
            >
               <div className="relative z-10 w-full">
                 <p className="text-[10px] font-black uppercase opacity-60 tracking-[0.2em] mb-1">Score de complétion</p>
                 <h4 className="font-bold text-lg mb-4">Ton profil est à {Math.round(completionPercentage)}%</h4>
                 <div className="h-2 w-full bg-white/20 rounded-full overflow-hidden">
                    <div className="h-full bg-white transition-all duration-1000 shadow-[0_0_15px_rgba(255,255,255,0.5)]" style={{ width: `${completionPercentage}%` }}></div>
                 </div>
               </div>
               <FiChevronRight size={24} className="ml-4 opacity-50" />
            </div>
          )}

          <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
            <StatMiniCard label="Postulés" value={applications.length} color="blue" />
            <StatMiniCard label="Réponses" value={applications.filter(a => a.status !== 'pending').length} color="orange" />
            <StatMiniCard label="À faire" value={cartCount} color="pink" />
          </div>
        </section>

        {/* --- SECTION OFFRES --- */}
        <section className="space-y-4">
          <div className="flex justify-between items-end px-2">
            <h3 className="font-black uppercase text-xs tracking-widest text-gray-400">Opportunités</h3>
            <button onClick={() => navigate('/jobs')} className="text-blue-600 font-black text-[10px] uppercase underline decoration-2 underline-offset-4">Tout voir</button>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
            {loading ? (
              [1, 2].map(i => <div key={i} className="min-w-[280px] h-40 bg-white border border-gray-100 animate-pulse rounded-[2.5rem]"></div>)
            ) : availableJobs.map(job => (
              <div 
                key={job.id}
                onClick={() => navigate(`/jobs/${job.id}`)}
                className="min-w-[280px] bg-gray-900 text-white p-6 rounded-[2.5rem] shadow-xl relative active:scale-95 transition-all cursor-pointer border border-white/5"
              >
                <div className="relative z-10 h-full flex flex-col justify-between">
                  <div>
                    <span className="px-2 py-1 bg-blue-600 text-[8px] font-black rounded-md uppercase mb-3 inline-block">Nouveau</span>
                    <h4 className="font-black uppercase text-sm truncate leading-tight">{job.title}</h4>
                    <p className="text-[10px] text-gray-400 font-bold uppercase mt-1 italic">{job.company_name}</p>
                  </div>
                  <div className="flex items-center justify-between mt-6">
                    <div className="flex items-center gap-1.5 text-blue-400">
                      <FiMapPin size={12} />
                      <span className="text-[10px] font-black uppercase">{job.location || 'Burkina'}</span>
                    </div>
                    <FiChevronRight className="opacity-50" size={14} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* --- SECTION ACTIVITÉ --- */}
        <section className="space-y-4">
          <h3 className="font-black uppercase text-xs tracking-widest text-gray-400 px-2">Dernières Activités</h3>
          {applications.length > 0 ? (
            <div className="space-y-3">
                {applications.slice(0, 3).map(app => (
                <div 
                    key={app.id}
                    onClick={() => navigate(`/applications/${app.id}`)}
                    className="bg-white p-5 rounded-[2rem] shadow-sm border border-gray-100 flex items-center justify-between hover:border-blue-100 transition-all cursor-pointer group"
                >
                    <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-50 text-gray-900 rounded-2xl flex items-center justify-center font-black italic text-sm shadow-inner uppercase border border-gray-100 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        {app.job?.title?.charAt(0)}
                    </div>
                    <div>
                        <h4 className="font-black uppercase text-[11px] leading-tight text-gray-800">{app.job?.title}</h4>
                        <div className="flex items-center gap-2 mt-1">
                            <span className={`h-1.5 w-1.5 rounded-full ${app.status === 'accepted' ? 'bg-green-500' : 'bg-blue-500'}`}></span>
                            <span className={`text-[9px] font-black uppercase tracking-tighter ${app.status === 'accepted' ? 'text-green-500' : 'text-blue-600'}`}>
                                {app.status || 'En attente'}
                            </span>
                        </div>
                    </div>
                    </div>
                    <FiChevronRight className="text-gray-300 group-hover:text-blue-600 transition-all" />
                </div>
                ))}
            </div>
          ) : (
              <div className="bg-white p-10 rounded-[3rem] text-center border-2 border-dashed border-gray-100">
                <FiSearch className="text-gray-200 mx-auto mb-4" size={32} />
                <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Aucune candidature</p>
                <button onClick={() => navigate('/jobs')} className="mt-3 text-blue-600 font-black text-[10px] uppercase underline">Trouver un job</button>
              </div>
          )}
        </section>
      </div>

      {/* --- BOTTOM NAV --- */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-gray-100 px-8 py-4 flex justify-between items-center shadow-[0_-10px_40px_rgba(0,0,0,0.03)] rounded-t-[2.5rem] z-50">
        <NavIcon icon={<FiHome/>} active={true} onClick={() => navigate('/dashboard')} />
        <NavIcon icon={<FiSearch/>} onClick={() => navigate('/jobs')} />
        
        <div 
          onClick={() => navigate('/complete-profile')} 
          className={`p-5 rounded-2xl text-white shadow-2xl -mt-14 active:scale-90 transition-all cursor-pointer border-4 border-white ${cartCount > 0 ? 'bg-blue-600 animate-bounce-subtle' : 'bg-gray-900'}`}
        >
           <FiBookOpen size={26} />
        </div>

        <NavIcon icon={<FiMail/>} onClick={() => navigate('/my-applications')} />
        <NavIcon icon={<FiUser/>} onClick={() => navigate('/profile')} />
      </nav>

      <style>{`
        @keyframes bounce-subtle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        .animate-bounce-subtle { animation: bounce-subtle 2.5s infinite ease-in-out; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
};

// --- COMPOSANTS INTERNES ---
const StatMiniCard = ({ label, value, color }) => {
  const colors = { blue: "bg-blue-600", orange: "bg-orange-500", pink: "bg-pink-500" };
  return (
    <div className={`${colors[color]} min-w-[130px] p-5 rounded-[2.2rem] text-white shadow-xl flex-shrink-0`}>
      <p className="text-[9px] font-black uppercase opacity-60 mb-1 tracking-widest">{label}</p>
      <p className="text-3xl font-black italic leading-none">{value}</p>
    </div>
  );
};

const NavIcon = ({ icon, active, onClick }) => (
  <button onClick={onClick} className={`p-2 transition-all flex flex-col items-center gap-1 ${active ? 'text-blue-600' : 'text-gray-300'}`}>
    {React.cloneElement(icon, { size: 22 })}
    {active && <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>}
  </button>
);

export default DashboardCandidat;
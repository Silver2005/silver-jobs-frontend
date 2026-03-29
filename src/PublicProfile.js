import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { 
  FiMapPin, FiBriefcase, FiDownload, FiExternalLink, 
  FiCheckCircle, FiAward, FiLayers
} from 'react-icons/fi';
import supabase from './api'; // Import du client Supabase

const PublicProfile = () => {
  const { username } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // 🚀 Recherche du profil par le champ 'username'
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('username', username)
          .single();

        if (error) throw error;
        setProfile(data);
      } catch (err) {
        console.error("Profil introuvable :", err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [username]);

  if (loading) return (
    <div className="flex flex-col justify-center items-center h-screen bg-slate-50">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-blue-600 mb-4"></div>
      <div className="font-black uppercase tracking-widest text-gray-400 animate-pulse">Chargement Profil Silver...</div>
    </div>
  );

  if (!profile) return (
    <div className="flex flex-col items-center mt-20 p-10">
      <h2 className="text-2xl font-black uppercase italic tracking-tighter mb-4">Silver<span className="text-blue-600">Jobs</span></h2>
      <p className="font-bold text-gray-500 text-center">Désolé, ce profil n'existe pas ou a été déplacé.</p>
      <button onClick={() => window.history.back()} className="mt-6 text-blue-600 font-black uppercase text-xs underline">Retour</button>
    </div>
  );

  // Fallback pour les images
  const photo_url = profile.avatar_url || `https://ui-avatars.com/api/?name=${username}&background=000&color=fff`;

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20">
      {/* HEADER / HERO SECTION */}
      <div className="bg-gray-900 h-64 relative">
        <div className="max-w-4xl mx-auto h-full flex items-end px-6 pb-8">
            <div className="flex flex-col md:flex-row items-center gap-6 translate-y-16 w-full">
                <img 
                  src={photo_url} 
                  className="w-32 h-32 md:w-40 md:h-40 rounded-[2.5rem] border-8 border-white shadow-2xl object-cover bg-white"
                  alt="Avatar"
                />
                <div className="text-center md:text-left flex-1">
                    <h1 className="text-3xl md:text-4xl font-black text-gray-900 md:text-white tracking-tighter uppercase italic drop-shadow-sm">
                        {profile.full_name || username}
                    </h1>
                    <p className="text-blue-500 font-bold flex items-center justify-center md:justify-start gap-2 mt-1 uppercase text-sm">
                        <FiBriefcase /> {profile.specialty || 'Talent Silver'}
                    </p>
                </div>
                <div className="flex gap-3">
                    {profile.cv_url && (
                        <a href={profile.cv_url} target="_blank" rel="noreferrer" 
                           className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase flex items-center gap-2 shadow-lg shadow-blue-200 active:scale-95 transition-all">
                            <FiDownload size={18} /> Mon CV (PDF)
                        </a>
                    )}
                </div>
            </div>
        </div>
      </div>

      {/* CONTENU PRINCIPAL */}
      <div className="max-w-4xl mx-auto mt-24 px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* COLONNE GAUCHE : INFOS & SKILLS */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
            <h3 className="text-[10px] font-black uppercase text-gray-400 mb-4 tracking-widest">Bio / À propos</h3>
            <p className="text-xs font-bold text-gray-600 leading-relaxed italic">
              {profile.bio || "Ce candidat préfère laisser ses projets parler pour lui."}
            </p>
          </div>

          <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
            <h3 className="text-[10px] font-black uppercase text-gray-400 mb-4 tracking-widest">Expertise Tech</h3>
            <div className="flex flex-wrap gap-2">
              {profile.skills && profile.skills.length > 0 ? profile.skills.map((skill, idx) => (
                <span key={`skill-${idx}`} className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase border border-blue-100">
                  {skill}
                </span>
              )) : <p className="text-[10px] text-gray-300 italic">Aucune compétence listée</p>}
            </div>
          </div>
        </div>

        {/* COLONNE DROITE : PARCOURS & PROJETS */}
        <div className="md:col-span-2 space-y-8">
          
          {/* Section Études */}
          {profile.education?.length > 0 && (
            <Section title="Parcours Académique" icon={<FiAward />}>
              {profile.education.map((edu, i) => (
                <Card key={`edu-${i}`} title={edu.degree} subtitle={edu.school} proof={edu.proof_url} />
              ))}
            </Section>
          )}

          {/* Section Projets */}
          {profile.projects?.length > 0 && (
            <Section title="Projets Phares" icon={<FiLayers />}>
              {profile.projects.map((proj, i) => (
                <Card key={`proj-${i}`} title={proj.name} subtitle={proj.tech || proj.description} proof={proj.proof_url} />
              ))}
            </Section>
          )}

          {/* Fallback si rien n'est rempli */}
          {!profile.education?.length && !profile.projects?.length && (
            <div className="bg-white p-10 rounded-[3rem] text-center border-2 border-dashed border-gray-100">
               <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Le parcours de ce candidat est en cours de validation.</p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

// --- SOUS-COMPOSANTS UI ---

const Section = ({ title, icon, children }) => (
  <div className="space-y-4">
    <div className="flex items-center gap-3">
      <div className="p-2 bg-gray-900 text-white rounded-xl shadow-lg shadow-gray-200">{icon}</div>
      <h2 className="font-black uppercase tracking-tighter text-gray-800">{title}</h2>
    </div>
    <div className="grid gap-3">{children}</div>
  </div>
);

const Card = ({ title, subtitle, proof, isCert }) => (
  <div className="bg-white p-5 rounded-[1.5rem] border border-gray-100 flex justify-between items-center group hover:border-blue-200 hover:shadow-md transition-all">
    <div className="flex-1 pr-4">
      <h4 className="font-bold text-gray-800 text-sm">{title}</h4>
      <p className="text-[10px] text-gray-400 font-medium uppercase mt-0.5">{subtitle}</p>
    </div>
    {proof && (
      <a href={proof} target="_blank" rel="noreferrer" 
         className="flex items-center gap-1 text-[9px] font-black uppercase text-blue-500 bg-blue-50 px-3 py-2 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-all whitespace-nowrap">
        {isCert ? "Vérifier" : "Voir"} <FiExternalLink size={12} />
      </a>
    )}
  </div>
);

export default PublicProfile;
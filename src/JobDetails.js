import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import supabase from './api'; // Ton client Supabase
import { FiArrowLeft, FiMapPin, FiCalendar, FiDollarSign, FiShield, FiArrowRight } from 'react-icons/fi';

const JobDetails = () => {
  const { id } = useParams(); 
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const { data, error } = await supabase
          .from('jobs')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        setJob(data);
      } catch (error) {
        console.error("Erreur lors de la récupération de l'offre:", error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [id]);

  const handleApply = async () => {
    setApplying(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        alert("Veuillez vous connecter pour postuler.");
        return navigate('/login');
      }

      // Vérification du profil (Panier Silver : CV ou Username manquant)
      const { data: profile } = await supabase
        .from('profiles')
        .select('cv_url, username')
        .eq('id', session.user.id)
        .single();

      if (!profile?.cv_url) {
        if (window.confirm("Action requise : Votre panier de formation est incomplet (CV manquant). Voulez-vous le compléter maintenant pour postuler ?")) {
          return navigate('/complete-profile'); 
        }
        return;
      }

      // Insertion de la candidature
      const { error: applyError } = await supabase
        .from('applications')
        .insert([
          { 
            job_id: id, 
            user_id: session.user.id,
            status: 'en attente' 
          }
        ]);

      if (applyError) {
        // Gestion du doublon (si tu as mis une contrainte unique sur job_id + user_id)
        if (applyError.code === '23505') {
          alert("Vous avez déjà postulé à cette offre.");
        } else {
          throw applyError;
        }
      } else {
        alert("Candidature transmise avec succès ! 🚀");
        navigate('/dashboard');
      }

    } catch (error) {
      alert("Une erreur est survenue lors de l'envoi de votre candidature.");
    } finally {
      setApplying(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );
  
  if (!job) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <h2 className="text-2xl font-black text-gray-800 uppercase italic">Offre introuvable.</h2>
      <button onClick={() => navigate('/dashboard')} className="mt-4 text-blue-600 font-bold underline">Retour au Dashboard</button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-12 font-sans">
      <div className="max-w-5xl mx-auto">
        {/* Navigation retour */}
        <button 
          onClick={() => navigate(-1)} 
          className="mb-10 flex items-center gap-3 text-gray-400 hover:text-blue-600 font-black transition-all group uppercase text-xs tracking-widest"
        >
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm group-hover:shadow-md transition-all">
            <FiArrowLeft size={18} />
          </div>
          RETOUR AUX OFFRES
        </button>

        <div className="bg-white rounded-[3.5rem] shadow-2xl shadow-blue-900/5 border border-gray-100 relative overflow-hidden">
          {/* Accent visuel Silver-Jobs */}
          <div className="absolute top-0 left-0 w-full h-3 bg-gradient-to-r from-blue-600 to-indigo-600"></div>

          <div className="p-8 md:p-16">
            <header className="flex flex-col md:flex-row md:justify-between md:items-start gap-6 mb-12">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-4">
                  <span className="px-4 py-1.5 bg-blue-50 text-blue-600 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] border border-blue-100">
                    {job.type || 'CDI'}
                  </span>
                  <span className="text-gray-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                    <FiCalendar /> Posté le {new Date(job.created_at).toLocaleDateString()}
                  </span>
                </div>
                <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4 leading-[1.1] tracking-tighter italic uppercase">
                  {job.title}
                </h1>
                <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-xl text-gray-500 font-bold">
                  <span className="text-blue-600 uppercase tracking-tight">{job.company_name}</span>
                  <span className="flex items-center gap-2">
                    <FiMapPin className="text-gray-300" />
                    {job.location}
                  </span>
                </div>
              </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              {/* Corps de l'offre */}
              <div className="lg:col-span-2 space-y-10">
                <section>
                  <h3 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-6 border-b border-blue-50 pb-2 inline-block">
                    Missions & Profil recherché
                  </h3>
                  <p className="text-gray-600 leading-relaxed text-lg whitespace-pre-line font-medium italic">
                    {job.description}
                  </p>
                </section>
              </div>

              {/* Sidebar Info */}
              <div className="space-y-6">
                <div className="bg-gray-50 p-8 rounded-[2.5rem] border border-gray-100">
                  <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <FiDollarSign /> Détails Financiers
                  </h3>
                  <p className="text-2xl font-black text-gray-900 mb-2 uppercase">{job.salary || 'A discuter'}</p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wide">Indication brute annuelle/mensuelle.</p>
                </div>

                <div className="p-8 rounded-[2.5rem] border-2 border-dashed border-gray-200">
                  <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <FiShield /> Sécurité Silver
                  </h3>
                  <p className="text-xs text-gray-500 leading-relaxed font-bold">
                    Cette offre respecte les standards de recrutement certifiés par **Silver-Jobs**. Vos données et documents sont chiffrés.
                  </p>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <div className="mt-16 pt-10 border-t border-gray-50">
              <button 
                onClick={handleApply}
                disabled={applying}
                className={`w-full py-6 rounded-[2rem] font-black text-xl transition-all shadow-2xl flex items-center justify-center gap-4 italic tracking-widest uppercase ${
                  applying 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-blue-600 text-white hover:bg-black hover:-translate-y-1 shadow-blue-200 active:scale-95'
                }`}
              >
                {applying ? 'ENVOI EN COURS...' : 'POSTULER AVEC MON PANIER'}
                {!applying && <FiArrowRight size={24} />}
              </button>
              <p className="text-center text-gray-400 text-[10px] mt-6 font-black uppercase tracking-[0.2em]">
                🚀 Votre CV et votre dossier seront transmis instantanément au recruteur.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetails;
import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from './api';

const ApplicationDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user')); 
  
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // États pour la messagerie
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const scrollRef = useRef();

  useEffect(() => {
    // 1. Fonction pour charger les données initiales
    const fetchData = async () => {
      try {
        const resApp = await api.get(`/applications/${id}`);
        setApplication(resApp.data);
        
        const resMsg = await api.get(`/applications/${id}/messages`);
        setMessages(resMsg.data);
      } catch (err) {
        console.error("Erreur de chargement:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // 2. MISE EN PLACE DU POLLING (Toutes les 5 secondes)
    const interval = setInterval(() => {
      api.get(`/applications/${id}/messages`)
        .then(res => {
          // On ne met à jour que si le nombre de messages a changé
          setMessages(res.data);
        })
        .catch(err => console.error("Erreur polling:", err));
    }, 5000);

    // 3. Nettoyage de l'intervalle au démontage du composant
    return () => clearInterval(interval);
  }, [id]);

  // Scroll automatique vers le dernier message à chaque nouveau message
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleStatusUpdate = async (newStatus) => {
    try {
      await api.patch(`/applications/${id}/status`, { status: newStatus });
      setApplication({ ...application, status: newStatus });
    } catch (err) { 
      alert("Erreur de mise à jour"); 
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    try {
      const res = await api.post(`/applications/${id}/messages`, { content: newMessage });
      setMessages([...messages, res.data]);
      setNewMessage("");
    } catch (err) { 
      console.error("Erreur d'envoi"); 
    }
  };

  const handleDownloadCV = () => {
    if (application?.user?.profile?.cv_path) {
      window.open(`http://localhost:8000/storage/${application.user.profile.cv_path}`, '_blank');
    } else {
      alert("Aucun CV disponible.");
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );

  if (!application || !application.user) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <p className="font-black text-gray-400 uppercase tracking-widest">Dossier introuvable</p>
      <button onClick={() => navigate('/dashboard')} className="mt-4 text-blue-600 font-bold underline">Retour</button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-12 text-gray-900">
      <div className="max-w-4xl mx-auto space-y-8">
        
        <button 
          onClick={() => navigate(-1)} 
          className="mb-4 flex items-center gap-2 text-gray-400 font-bold text-xs uppercase hover:text-gray-900 transition-colors"
        >
          ← Retour
        </button>

        <div className="bg-white rounded-[3rem] shadow-xl overflow-hidden border border-gray-100">
          {/* Header Profil */}
          <div className="bg-gray-900 p-10 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="text-4xl font-black uppercase italic tracking-tighter">{application.user.name}</h2>
              <p className="text-blue-400 font-bold uppercase text-sm tracking-widest">{application.job?.title}</p>
            </div>
            <span className={`px-6 py-2 rounded-full font-black text-[10px] uppercase shadow-lg border-2 ${
              application.status === 'accepte' ? 'bg-green-500 border-green-400' : 
              application.status === 'refuse' ? 'bg-red-500 border-red-400' : 'bg-orange-500 border-orange-400'
            }`}>
              {application.status || 'En attente'}
            </span>
          </div>

          <div className="p-10">
            {/* ACTIONS RECRUTEUR */}
            {user?.role === 'recruteur' && (
              <div className="flex flex-wrap gap-4 mb-10">
                <button 
                  onClick={() => handleStatusUpdate('accepte')} 
                  className="flex-1 bg-green-600 text-white py-4 rounded-2xl font-black uppercase text-xs hover:bg-green-700 transition-all shadow-md active:scale-95"
                >
                  Accepter le candidat
                </button>
                <button 
                  onClick={() => handleStatusUpdate('refuse')} 
                  className="flex-1 bg-red-600 text-white py-4 rounded-2xl font-black uppercase text-xs hover:bg-red-700 transition-all shadow-md active:scale-95"
                >
                  Refuser le dossier
                </button>
              </div>
            )}

            {/* Curriculum Vitae */}
            <div className="mb-10">
                <button 
                  onClick={handleDownloadCV}
                  className="w-full bg-gray-50 text-gray-900 py-5 rounded-2xl font-black uppercase text-xs hover:bg-blue-50 hover:text-blue-600 transition-all border-2 border-dashed border-gray-200 flex items-center justify-center gap-2"
                >
                  <span className="text-xl">📄</span> Voir le CV (PDF)
                </button>
            </div>

            {/* MESSAGERIE */}
            <div className="border-t border-gray-100 pt-10">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black uppercase tracking-tighter">Discussion directe</h3>
                <span className="flex items-center gap-2 text-[10px] font-bold text-green-500 uppercase">
                   <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> Mode temps réel actif
                </span>
              </div>
              
              <div className="bg-gray-50 rounded-[2rem] p-6 h-96 overflow-y-auto mb-6 flex flex-col gap-4 border border-gray-100">
                {messages.length > 0 ? messages.map((msg, index) => (
                  <div 
                    key={index} 
                    className={`max-w-[85%] p-4 rounded-2xl text-sm font-bold shadow-sm transition-all ${
                      msg.sender_id === user?.id 
                        ? 'bg-blue-600 text-white self-end rounded-tr-none' 
                        : 'bg-white text-gray-800 self-start rounded-tl-none border border-gray-200'
                    }`}
                  >
                    {msg.content}
                    <div className={`text-[9px] mt-2 font-black uppercase opacity-60 ${msg.sender_id === user?.id ? 'text-right' : 'text-left'}`}>
                      {new Date(msg.created_at).toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'})}
                    </div>
                  </div>
                )) : (
                  <div className="text-center text-gray-300 font-bold uppercase text-[10px] mt-20 tracking-widest">
                    Aucun échange pour le moment. Lancez la discussion !
                  </div>
                )}
                <div ref={scrollRef} />
              </div>

              <form onSubmit={sendMessage} className="flex gap-2">
                <input 
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Tapez votre message ici..."
                  className="flex-1 bg-white border-2 border-gray-200 p-4 rounded-2xl font-bold focus:border-blue-600 outline-none transition-all placeholder:text-gray-300 shadow-inner"
                />
                <button 
                  type="submit" 
                  disabled={!newMessage.trim()}
                  className="bg-gray-900 text-white px-10 rounded-2xl font-black uppercase text-xs hover:bg-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Envoyer
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicationDetails;
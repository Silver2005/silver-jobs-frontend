import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiCheckCircle, FiMessageCircle, FiInfo } from 'react-icons/fi';

const Notifications = () => {
  const navigate = useNavigate();

  // Simulation de données (À remplacer par un appel API plus tard)
  const notifications = [
    { id: 1, type: 'status', text: 'Votre candidature pour "Développeur React" a été acceptée !', time: 'Il y a 2h', icon: <FiCheckCircle className="text-green-500"/> },
    { id: 2, type: 'message', text: 'Nouveau message de la part de TechCorp.', time: 'Il y a 5h', icon: <FiMessageCircle className="text-blue-500"/> },
    { id: 3, type: 'info', text: 'Complétez votre profil pour attirer plus de recruteurs.', time: 'Hier', icon: <FiInfo className="text-orange-500"/> },
  ];

  return (
    <div className="min-h-screen bg-white p-6 pb-24">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate(-1)} className="p-2 bg-gray-100 rounded-full">
          <FiArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-black uppercase italic tracking-tighter">Notifications</h1>
      </div>

      <div className="space-y-4">
        {notifications.map((notif) => (
          <div key={notif.id} className="flex items-start gap-4 p-5 bg-gray-50 rounded-[2rem] border border-gray-100 active:scale-95 transition-transform">
            <div className="text-2xl mt-1">{notif.icon}</div>
            <div className="flex-1">
              <p className="text-sm font-bold text-gray-800 leading-tight">{notif.text}</p>
              <p className="text-[10px] font-black uppercase text-gray-400 mt-2 tracking-widest">{notif.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Notifications;
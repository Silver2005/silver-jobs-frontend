import React, { useState } from 'react';
import { FiShare2, FiCopy, FiCheck, FiExternalLink, FiMaximize2, FiX, FiFileText } from 'react-icons/fi';
import { QRCodeSVG } from 'qrcode.react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import SilverCVTemplate from './SilverCVTemplate';

const ShareProfile = ({ username, profile, user }) => {
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);
  
  const publicUrl = `${window.location.origin}/profile/public/${username}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative">
      {/* --- BANNIÈRE PRINCIPALE --- */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-800 p-6 rounded-[2.5rem] text-white shadow-xl shadow-blue-100 mb-8 overflow-hidden relative group">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 relative z-10">
          
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-lg font-black uppercase italic tracking-tighter flex items-center justify-center md:justify-start gap-2">
              <FiShare2 className="animate-pulse" /> Ton Profil Silver est Live !
            </h3>
            <p className="text-blue-100 text-[10px] font-bold uppercase opacity-80 tracking-widest">Digital CV & Portfolio</p>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            {/* BOUTON QR CODE */}
            <button 
              onClick={() => setShowQR(true)}
              className="p-4 bg-white/10 border border-white/20 rounded-2xl hover:bg-white/20 transition-all flex flex-col items-center gap-1 shadow-sm"
            >
              <FiMaximize2 size={18} />
              <span className="text-[8px] font-black uppercase tracking-tighter">Scan</span>
            </button>

            {/* BOUTON PDF (Génération dynamique) */}
            <PDFDownloadLink 
              document={<SilverCVTemplate profile={profile} user={user} username={username} />} 
              fileName={`CV_${username}_SilverJobs.pdf`}
              className="p-4 bg-orange-500 text-white rounded-2xl hover:bg-orange-600 transition-all flex flex-col items-center gap-1 shadow-lg shadow-orange-900/20"
            >
              {({ loading }) => (
                <>
                  <FiFileText size={18} />
                  <span className="text-[8px] font-black uppercase tracking-tighter">
                    {loading ? '...' : 'PDF'}
                  </span>
                </>
              )}
            </PDFDownloadLink>

            {/* BOUTON COPIER */}
            <button 
              onClick={copyToClipboard}
              className={`flex-1 md:flex-none p-4 rounded-2xl transition-all flex flex-col items-center gap-1 ${copied ? 'bg-green-500 text-white shadow-green-900/20' : 'bg-white text-blue-600 shadow-blue-900/20'}`}
            >
              {copied ? <FiCheck size={18} /> : <FiCopy size={18} />}
              <span className="text-[8px] font-black uppercase tracking-tighter">{copied ? 'Copié' : 'Lien'}</span>
            </button>

            {/* BOUTON VOIR EN LIGNE */}
            <a 
              href={publicUrl} 
              target="_blank" 
              rel="noreferrer" 
              className="p-4 bg-gray-900 text-white rounded-2xl hover:bg-black transition-all flex flex-col items-center gap-1 shadow-lg"
            >
              <FiExternalLink size={18} />
              <span className="text-[8px] font-black uppercase tracking-tighter">Voir</span>
            </a>
          </div>
        </div>

        {/* Décoration d'arrière-plan */}
        <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all"></div>
      </div>

      {/* --- MODAL QR CODE --- */}
      {showQR && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-gray-900/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white p-8 rounded-[3.5rem] max-w-sm w-full relative shadow-2xl text-center border border-gray-100">
            <button 
              onClick={() => setShowQR(false)}
              className="absolute top-6 right-6 p-2 bg-gray-50 rounded-full text-gray-400 hover:text-black hover:bg-gray-100 transition-all"
            >
              <FiX size={20} />
            </button>

            <h4 className="font-black uppercase italic tracking-tighter text-2xl mb-1">Silver<span className="text-blue-600">ID</span></h4>
            <p className="text-[10px] font-bold text-gray-400 uppercase mb-8 tracking-widest">Digital CV Quick Scan</p>

            <div className="bg-gray-50 p-6 rounded-[2.5rem] inline-block border-2 border-dashed border-gray-200 mb-8 shadow-inner">
              <QRCodeSVG 
                value={publicUrl} 
                size={180}
                level={"H"}
                fgColor="#111827"
              />
            </div>

            <p className="text-xs font-black text-gray-900 uppercase tracking-tight">
              {profile?.full_name || username}
            </p>
            <p className="text-[9px] font-bold text-blue-600 uppercase mt-1">
              {profile?.target_job || 'Membre SilverJobs'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShareProfile;
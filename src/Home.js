import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => (
  <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 font-sans">
    
    {/* Header avec une animation plus douce */}
    <div className="text-center mb-16 animate-in fade-in zoom-in duration-1000">
      <h1 className="text-6xl font-black text-gray-900 mb-4 tracking-tight">
        Silver-<span className="text-blue-600">Jobs</span>
      </h1>
      <p className="text-xl text-gray-600 font-medium max-w-lg mx-auto">
        Le pont direct entre les talents du Burkina et les meilleures opportunités.
      </p>
      <div className="w-24 h-1 bg-blue-600 mx-auto mt-6 rounded-full"></div>
    </div>

    {/* Section de sélection de profil */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl w-full">
      
      {/* Carte Candidat */}
      <Link to="/register?role=candidat" className="group">
        <div className="bg-white p-10 rounded-3xl shadow-xl border-2 border-transparent hover:border-blue-500 transition-all duration-300 transform hover:scale-105 h-full flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-blue-50 rounded-2xl mb-6 flex items-center justify-center group-hover:bg-blue-600 transition-colors duration-300 shadow-inner">
            <svg className="w-10 h-10 text-blue-600 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">Je cherche un Job</h3>
          <p className="text-gray-500 leading-relaxed">Créez votre profil, déposez votre CV et postulez en un clic.</p>
        </div>
      </Link>

      {/* Carte Recruteur */}
      <Link to="/register?role=recruteur" className="group">
        <div className="bg-white p-10 rounded-3xl shadow-xl border-2 border-transparent hover:border-blue-700 transition-all duration-300 transform hover:scale-105 h-full flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-blue-50 rounded-2xl mb-6 flex items-center justify-center group-hover:bg-blue-700 transition-colors duration-300 shadow-inner">
            <svg className="w-10 h-10 text-blue-700 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">Je recrute</h3>
          <p className="text-gray-500 leading-relaxed">Publiez vos offres et gérez les candidatures facilement.</p>
        </div>
      </Link>

    </div>

    {/* Section Connexion - Plus élégante */}
    <div className="mt-16 text-center">
      <p className="text-gray-500 mb-4">Déjà membre de la communauté ?</p>
      <Link to="/login" className="inline-flex items-center justify-center px-8 py-3 border-2 border-blue-600 text-blue-600 font-bold rounded-full hover:bg-blue-600 hover:text-white transition-all duration-300">
        Se connecter à mon espace
      </Link>
    </div>
  </div>
);

export default Home;
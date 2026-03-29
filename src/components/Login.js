import React from 'react';
import { Link } from 'react-router-dom';

const Login = () => {
  return (
    <div className="min-h-screen bg-gradient-to-tr from-blue-50 to-white flex items-center justify-center p-4">
      {/* Carte de connexion avec animation d'entrée */}
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl shadow-blue-100/50 p-10 border border-gray-50 transform transition-all animate-fadeIn">
        
        {/* Header du formulaire */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg shadow-blue-200">
            <span className="text-white text-2xl font-black">S</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-800">Bon retour !</h2>
          <p className="text-gray-400 mt-2">Connectez-vous à votre espace Silver-Jobs</p>
        </div>

        {/* Formulaire */}
        <form className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">Email</label>
            <input 
              type="email" 
              placeholder="votre@email.com"
              className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all duration-300 italic"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">Mot de passe</label>
            <input 
              type="password" 
              placeholder="••••••••"
              className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all duration-300"
            />
          </div>

          <div className="text-right">
            <a href="#" className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors">Mot de passe oublié ?</a>
          </div>

          <button 
            type="submit"
            className="w-full py-4 bg-blue-600 text-white font-bold rounded-2xl shadow-lg shadow-blue-500/30 hover:bg-blue-700 hover:-translate-y-1 active:scale-95 transition-all duration-300"
          >
            Se connecter
          </button>
        </form>

        {/* Footer du formulaire */}
        <div className="mt-10 text-center">
          <p className="text-gray-500">
            Pas encore de compte ?{' '}
            <Link to="/register" className="text-blue-600 font-bold hover:underline">Créer un compte</Link>
          </p>
          <Link to="/" className="inline-block mt-6 text-sm text-gray-400 hover:text-gray-600 transition-colors">
            ← Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
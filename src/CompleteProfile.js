import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiPlus, FiTrash2, FiArrowLeft, FiCloudLightning, 
  FiCheckCircle, FiUser, FiBriefcase, FiCamera, FiGlobe, FiAward, FiLayers, FiFileText 
} from 'react-icons/fi';
import { supabase } from './api'; // Ton client Supabase

const CompleteProfile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [userId, setUserId] = useState(null);

  const [formData, setFormData] = useState({
    full_name: '', 
    location: '', 
    target_job: '', 
    contract_type: 'Stage',
    educations: [{ id: Date.now(), degree: '', school: '', proof: null }],
    certifications: [{ id: Date.now() + 1, title: '', organization: '', proof: null }],
    projects: [{ id: Date.now() + 2, name: '', tech: '', proof: null }],
    skills: [],
    languages: [{ id: Date.now() + 3, lang: 'Français', level: 'Expert' }],
    cv_path: null, 
    photo: null
  });

  const [currentSkill, setCurrentSkill] = useState("");

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) navigate('/login');
      else setUserId(user.id);
    };
    checkUser();
  }, [navigate]);

  // --- LOGIQUE D'UPLOAD SUPABASE ---
  const uploadFile = async (file, bucket, folder) => {
    if (!file || typeof file === 'string') return file; // Déjà une URL ou vide
    
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-${Math.random()}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
    return data.publicUrl;
  };

  // --- SOUMISSION FINALE ---
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);

    try {
      // 1. Upload des fichiers principaux
      const photoUrl = await uploadFile(formData.photo, 'silver-documents', 'photos');
      const cvUrl = await uploadFile(formData.cv_path, 'silver-documents', 'cvs');

      // 2. Upload des preuves dans les tableaux (Map asynchrone)
      const uploadProofs = async (items, folder) => {
        return Promise.all(items.map(async (item) => ({
          ...item,
          proof: await uploadFile(item.proof, 'silver-documents', folder)
        })));
      };

      const finalEducations = await uploadProofs(formData.educations, 'proofs/education');
      const finalCertifs = await uploadProofs(formData.certifications, 'proofs/certifs');
      const finalProjects = await uploadProofs(formData.projects, 'proofs/projects');

      // 3. Mise à jour de la table profiles
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          location: formData.location,
          target_job: formData.target_job,
          contract_type: formData.contract_type,
          skills: formData.skills,
          languages: formData.languages,
          educations: finalEducations, // JSONB
          certifications: finalCertifs, // JSONB
          projects: finalProjects,     // JSONB
          photo_url: photoUrl,
          cv_url: cvUrl,
          profile_completed: true,
          updated_at: new Date()
        })
        .eq('id', userId);

      if (error) throw error;

      alert("Félicitations Abass ! Ton profil Silver est certifié sur la blockchain (presque) !");
      navigate('/dashboard');
    } catch (error) {
      console.error("Erreur critique:", error.message);
      alert(`Erreur : ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Les fonctions addEntry, removeEntry, updateEntry, addSkill restent identiques à ton code original...
  const addEntry = (field, template) => {
    setFormData({ ...formData, [field]: [...formData[field], { ...template, id: Date.now() }] });
  };
  const removeEntry = (field, id) => {
    if (formData[field].length > 1) {
      setFormData({ ...formData, [field]: formData[field].filter(item => item.id !== id) });
    }
  };
  const updateEntry = (field, id, key, value) => {
    const updated = formData[field].map(item => item.id === id ? { ...item, [key]: value } : item);
    setFormData({ ...formData, [field]: updated });
  };
  const addSkill = () => {
    if (currentSkill && !formData.skills.includes(currentSkill)) {
      setFormData({ ...formData, skills: [...formData.skills, currentSkill] });
      setCurrentSkill("");
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F2F5] p-4 md:p-10 font-sans">
      <div className="max-w-4xl mx-auto bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-gray-100">
        
        {/* Header Statut */}
        <div className="bg-gray-900 p-8 text-white text-center">
          <h2 className="text-2xl font-black uppercase italic tracking-tighter">Silver <span className="text-blue-500">Verified</span> Profile</h2>
          <div className="flex justify-center gap-2 mt-4">
            {[1, 2, 3].map(i => <div key={i} className={`h-1.5 w-12 rounded-full transition-all ${step >= i ? 'bg-blue-500' : 'bg-gray-700'}`}></div>)}
          </div>
        </div>

        <div className="p-8 md:p-12">
          {/* ÉTAPE 1 : IDENTITÉ */}
          {step === 1 && (
            <div className="space-y-8 animate-in fade-in duration-500">
              <SectionTitle title="1. Identité & Photo" icon={<FiUser className="text-blue-500"/>} />
              <div className="flex justify-center">
                <div className="relative group w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center border-2 border-dashed border-gray-300 hover:border-blue-400 transition-all cursor-pointer overflow-hidden">
                  {formData.photo ? 
                    <img 
                      src={formData.photo instanceof File ? URL.createObjectURL(formData.photo) : formData.photo} 
                      alt="preview" 
                      className="w-full h-full object-cover"
                    /> : 
                    <FiCamera className="text-gray-400 group-hover:text-blue-500 transition-colors" size={30}/>
                  }
                  <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" onChange={e => setFormData({...formData, photo: e.target.files[0]})} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input label="Nom Complet" value={formData.full_name} onChange={v => setFormData({...formData, full_name: v})} placeholder="Ex: Abass François Sinilon" />
                <Input label="Localisation" value={formData.location} onChange={v => setFormData({...formData, location: v})} placeholder="Ex: Bobo-Dioulasso, BF" />
                <Input label="Job Visé" value={formData.target_job} onChange={v => setFormData({...formData, target_job: v})} placeholder="Ex: Développeur Fullstack" />
                <Select label="Disponibilité" value={formData.contract_type} options={['Stage', 'CDI', 'CDD', 'Freelance']} onChange={v => setFormData({...formData, contract_type: v})} />
              </div>
              <button onClick={() => setStep(2)} className="w-full py-5 bg-gray-900 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-lg shadow-gray-200">Continuer →</button>
            </div>
          )}

          {/* ÉTAPE 2 : PREUVES ACADÉMIQUES */}
          {step === 2 && (
            <div className="space-y-10 animate-in slide-in-from-right duration-500">
              <div className="space-y-4">
                <SectionTitle title="Diplômes & Études" icon={<FiBriefcase className="text-blue-500"/>} />
                {formData.educations.map((edu) => (
                  <div key={edu.id} className="p-6 bg-gray-50 rounded-[2rem] relative group border border-transparent hover:border-blue-100 transition-all">
                    <button onClick={() => removeEntry('educations', edu.id)} className="absolute top-6 right-6 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"><FiTrash2/></button>
                    <input className="w-full bg-transparent font-black text-lg text-blue-600 outline-none mb-1 placeholder:text-gray-300" placeholder="Nom du Diplôme" value={edu.degree} onChange={e => updateEntry('educations', edu.id, 'degree', e.target.value)} />
                    <input className="w-full bg-transparent text-sm outline-none font-bold text-gray-400 mb-4" placeholder="Établissement" value={edu.school} onChange={e => updateEntry('educations', edu.id, 'school', e.target.value)} />
                    <ProofUpload label="du diplôme" file={edu.proof} onFileChange={(file) => updateEntry('educations', edu.id, 'proof', file)} />
                  </div>
                ))}
                <button onClick={() => addEntry('educations', { degree: '', school: '', proof: null })} className="text-[11px] font-black text-blue-600 uppercase flex items-center gap-2 hover:underline"><FiPlus/> Ajouter un cursus</button>
              </div>

              <div className="space-y-4">
                <SectionTitle title="Certifications" icon={<FiAward className="text-blue-500"/>} />
                {formData.certifications.map((cert) => (
                  <div key={cert.id} className="p-6 border-l-4 border-blue-500 bg-blue-50/20 rounded-r-[2rem] relative group">
                    <button onClick={() => removeEntry('certifications', cert.id)} className="absolute top-6 right-6 text-red-400 opacity-0 group-hover:opacity-100"><FiTrash2/></button>
                    <input className="w-full bg-transparent font-black text-gray-800 outline-none mb-3" placeholder="Nom du certificat" value={cert.title} onChange={e => updateEntry('certifications', cert.id, 'title', e.target.value)} />
                    <ProofUpload label="du certificat" file={cert.proof} onFileChange={(file) => updateEntry('certifications', cert.id, 'proof', file)} />
                  </div>
                ))}
                <button onClick={() => addEntry('certifications', { title: '', organization: '', proof: null })} className="text-[11px] font-black text-blue-600 uppercase flex items-center gap-2 hover:underline"><FiPlus/> Ajouter une certification</button>
              </div>

              <div className="flex gap-4">
                <button onClick={() => setStep(1)} className="flex-1 py-5 bg-gray-100 text-gray-500 rounded-2xl font-black uppercase tracking-tighter">Retour</button>
                <button onClick={() => setStep(3)} className="flex-[2] py-5 bg-gray-900 text-white rounded-2xl font-black uppercase tracking-widest">Dernière étape →</button>
              </div>
            </div>
          )}

          {/* ÉTAPE 3 : PROJETS & SKILLS */}
          {step === 3 && (
            <div className="space-y-10 animate-in slide-in-from-right duration-500">
              <div className="space-y-4">
                <SectionTitle title="Projets Majeurs" icon={<FiLayers className="text-blue-500"/>} />
                {formData.projects.map((proj) => (
                  <div key={proj.id} className="p-6 bg-gray-50 rounded-[2rem] relative group">
                    <button onClick={() => removeEntry('projects', proj.id)} className="absolute top-6 right-6 text-red-400 opacity-0 group-hover:opacity-100"><FiTrash2/></button>
                    <input className="w-full bg-transparent font-black text-blue-600 outline-none mb-1" placeholder="Titre du projet" value={proj.name} onChange={e => updateEntry('projects', proj.id, 'name', e.target.value)} />
                    <input className="w-full bg-transparent text-xs font-bold text-gray-400 mb-4 outline-none" placeholder="Stack technique" value={proj.tech} onChange={e => updateEntry('projects', proj.id, 'tech', e.target.value)} />
                    <ProofUpload label="démo / capture" file={proj.proof} onFileChange={(file) => updateEntry('projects', proj.id, 'proof', file)} />
                  </div>
                ))}
                <button onClick={() => addEntry('projects', { name: '', tech: '', proof: null })} className="text-[11px] font-black text-blue-600 uppercase flex items-center gap-2"><FiPlus/> Ajouter un projet</button>
              </div>

              <div className="space-y-4">
                <SectionTitle title="Skills Techniques" icon={<FiCloudLightning className="text-blue-500"/>} />
                <div className="flex flex-wrap gap-2 p-5 bg-gray-50 rounded-[2rem] border border-gray-100">
                  {formData.skills.map(skill => (
                    <span key={skill} className="px-4 py-2 bg-white rounded-full text-[10px] font-black uppercase flex items-center gap-2 shadow-sm animate-in zoom-in">
                      {skill} <FiTrash2 onClick={() => setFormData({...formData, skills: formData.skills.filter(s => s !== skill)})} className="text-red-400 cursor-pointer hover:scale-125 transition-transform"/>
                    </span>
                  ))}
                  <input 
                    className="bg-transparent outline-none text-xs font-black p-2 flex-1 uppercase placeholder:text-gray-300" 
                    placeholder="Taper un skill + Entrée" 
                    value={currentSkill} 
                    onChange={e => setCurrentSkill(e.target.value)} 
                    onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addSkill())} 
                  />
                </div>
              </div>

              <div className="group relative p-10 border-4 border-dashed border-gray-100 rounded-[3rem] text-center hover:border-blue-500 hover:bg-blue-50/30 transition-all cursor-pointer">
                <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept=".pdf" onChange={e => setFormData({...formData, cv_path: e.target.files[0]})} />
                <FiFileText className={`mx-auto mb-4 transition-colors ${formData.cv_path ? 'text-green-500' : 'text-gray-300 group-hover:text-blue-500'}`} size={40}/>
                <p className="text-[11px] font-black uppercase tracking-widest text-gray-500">
                  {formData.cv_path ? `✅ ${formData.cv_path.name || "CV prêt"}` : "Uploader le CV définitif (PDF uniquement)"}
                </p>
              </div>

              <div className="flex gap-4">
                <button onClick={() => setStep(2)} className="flex-1 py-6 bg-gray-100 text-gray-400 rounded-3xl font-black uppercase">Précédent</button>
                <button 
                  onClick={handleSubmit}
                  disabled={loading} 
                  className={`flex-[3] py-6 rounded-3xl font-black uppercase tracking-[0.2em] shadow-2xl transition-all active:scale-95 ${loading ? 'bg-gray-400' : 'bg-blue-600 text-white shadow-blue-200 hover:bg-blue-700'}`}
                >
                  {loading ? "Traitement des preuves..." : "Certifier mon Profil Silver"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Les sous-composants (ProofUpload, SectionTitle, Input, Select) restent inchangés...
const ProofUpload = ({ label, file, onFileChange }) => (
  <div className="flex items-center gap-3 mt-2">
    <label className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all cursor-pointer shadow-sm ${file ? 'bg-green-500 border-green-600 text-white' : 'bg-white border-gray-200 text-gray-600 hover:border-blue-500'}`}>
      <FiCamera size={14} />
      <span className="text-[9px] font-black uppercase">
        {file ? "Preuve OK" : `Scanner ${label}`}
      </span>
      <input type="file" className="hidden" onChange={e => onFileChange(e.target.files[0])} />
    </label>
    {file && (
      <span className="text-[9px] text-gray-400 font-bold italic truncate max-w-[120px]">
        {file instanceof File ? file.name : "Fichier existant"}
      </span>
    )}
  </div>
);

const SectionTitle = ({ title, icon }) => (
  <div className="flex items-center gap-3 mb-6">
    <div className="p-3 bg-blue-50 rounded-2xl shadow-sm">{icon}</div>
    <h3 className="font-black uppercase tracking-tighter text-md text-gray-800">{title}</h3>
  </div>
);

const Input = ({ label, value, onChange, placeholder }) => (
  <div className="space-y-2">
    <label className="text-[10px] font-black uppercase text-gray-400 ml-4 tracking-widest">{label}</label>
    <input className="w-full p-5 bg-gray-50 rounded-2xl outline-none focus:bg-white focus:ring-4 focus:ring-blue-50 transition-all font-bold text-sm shadow-inner" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} />
  </div>
);

const Select = ({ label, value, options, onChange }) => (
  <div className="space-y-2">
    <label className="text-[10px] font-black uppercase text-gray-400 ml-4 tracking-widest">{label}</label>
    <select className="w-full p-5 bg-gray-50 rounded-2xl outline-none font-bold text-sm shadow-inner cursor-pointer" value={value} onChange={e => onChange(e.target.value)}>
      {options.map(opt => <option key={opt}>{opt}</option>)}
    </select>
  </div>
);

export default CompleteProfile;
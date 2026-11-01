'use client';
import React, { useState } from 'react';
import { CollegeTenant } from '../lib/types';

interface AddCollegeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddCollege: (college: CollegeTenant) => void;
}

export default function AddCollegeModal({
  isOpen,
  onClose,
  onAddCollege,
}: AddCollegeModalProps) {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [city, setCity] = useState('');
  const [tagline, setTagline] = useState('');
  const [recognizedBy, setRecognizedBy] = useState('Affiliated with UHS & PMDC Recognized');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim() || !city.trim()) {
      setError('College Name, Code aur City darj karna zaroori hai.');
      return;
    }

    const newCollege: CollegeTenant = {
      id: `college_${code.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Date.now()}`,
      code: code.trim().toUpperCase(),
      name: name.trim(),
      city: city.trim(),
      tagline: tagline.trim() || 'Teaching Hospital & Health Sciences Academy',
      recognizedBy: recognizedBy.trim() || 'PMDC & HEC Recognized',
      establishedYear: new Date().getFullYear(),
    };

    onAddCollege(newCollege);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
        <div className="bg-gradient-to-r from-teal-800 to-slate-900 p-6 text-white flex items-center justify-between">
          <div>
            <span className="text-teal-300 text-xs font-bold uppercase tracking-wider">
              Multi-College SaaS Client Setup
            </span>
            <h2 className="text-xl font-black mt-1">
              ➕ Onboard New College / Institute
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-xl">
              ⚠️ {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              College / Institute Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Rawalpindi Medical University, Shifa College of Medicine"
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-600 focus:bg-white text-slate-900 font-semibold"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                College Code <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g. RMU-RWP, SCM-ISB"
                className="w-full px-3.5 py-2.5 text-sm font-mono font-bold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-600 focus:bg-white text-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                City / Location <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Rawalpindi, Karachi"
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-600 focus:bg-white text-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Tagline / Subtitle
            </label>
            <input
              type="text"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              placeholder="e.g. Teaching Hospital & Health Sciences Academy"
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-600 focus:bg-white text-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Affiliation / Recognized By
            </label>
            <input
              type="text"
              value={recognizedBy}
              onChange={(e) => setRecognizedBy(e.target.value)}
              placeholder="e.g. Affiliated with UHS & PMDC Recognized"
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-600 focus:bg-white text-slate-900"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 text-xs font-black text-white bg-teal-700 hover:bg-teal-800 rounded-xl shadow-md transition-all cursor-pointer"
            >
              + Create College Workspace
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

'use client';
import React, { useState } from 'react';
import { CollegeProgramFee } from '../lib/programsData';
import { EditIcon, TrashIcon, PlusIcon } from './Icons';

interface ManageProgramsModalProps {
  isOpen: boolean;
  onClose: () => void;
  programs: CollegeProgramFee[];
  onSavePrograms: (updated: CollegeProgramFee[]) => void;
  onResetToDefaults: () => void;
}

export default function ManageProgramsModal({
  isOpen,
  onClose,
  programs,
  onSavePrograms,
  onResetToDefaults,
}: ManageProgramsModalProps) {
  const [editingProgram, setEditingProgram] = useState<CollegeProgramFee | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [degreeType, setDegreeType] = useState('Undergraduate BS Degree');
  const [duration, setDuration] = useState('4 Years');
  const [monthlyFee, setMonthlyFee] = useState<number>(25000);
  const [annualFee, setAnnualFee] = useState<number>(300000);
  const [admissionFee, setAdmissionFee] = useState<number>(25000);
  const [featuresText, setFeaturesText] = useState('');
  const [colorTheme, setColorTheme] = useState<CollegeProgramFee['colorTheme']>('teal');

  if (!isOpen) return null;

  const handleStartAdd = () => {
    setEditingProgram(null);
    setIsAddingNew(true);
    setName('');
    setDegreeType('Undergraduate BS Degree');
    setDuration('4 Years');
    setMonthlyFee(25000);
    setAnnualFee(300000);
    setAdmissionFee(25000);
    setFeaturesText('Clinical Hospital Rotation\nPractical Diagnostic Laboratory\nPMDC / PNC / Regulatory Approved');
    setColorTheme('teal');
  };

  const handleStartEdit = (prog: CollegeProgramFee) => {
    setIsAddingNew(false);
    setEditingProgram(prog);
    setName(prog.name);
    setDegreeType(prog.degreeType || 'Degree');
    setDuration(prog.duration);
    setMonthlyFee(prog.monthlyFee);
    setAnnualFee(prog.annualFee || prog.monthlyFee * 12);
    setAdmissionFee(prog.admissionFee || 0);
    setFeaturesText((prog.features || []).join('\n'));
    setColorTheme(prog.colorTheme || 'teal');
  };

  const handleMonthlyChange = (val: number) => {
    setMonthlyFee(val);
    // Suggest annual fee automatically (12 months)
    setAnnualFee(val * 12);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Barahe karam Program / Course ka naam likhein!');
      return;
    }

    const featuresList = featuresText
      .split('\n')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    if (isAddingNew) {
      const newProgram: CollegeProgramFee = {
        id: `prog_${Date.now()}`,
        name: name.trim(),
        degreeType: degreeType.trim(),
        duration: duration.trim(),
        monthlyFee: Number(monthlyFee) || 0,
        annualFee: Number(annualFee) || 0,
        admissionFee: Number(admissionFee) || 0,
        features: featuresList,
        colorTheme,
      };
      onSavePrograms([...programs, newProgram]);
      setIsAddingNew(false);
      setEditingProgram(null);
    } else if (editingProgram) {
      const updatedList = programs.map((p) =>
        p.id === editingProgram.id
          ? {
              ...p,
              name: name.trim(),
              degreeType: degreeType.trim(),
              duration: duration.trim(),
              monthlyFee: Number(monthlyFee) || 0,
              annualFee: Number(annualFee) || 0,
              admissionFee: Number(admissionFee) || 0,
              features: featuresList,
              colorTheme,
            }
          : p
      );
      onSavePrograms(updatedList);
      setEditingProgram(null);
    }
  };

  const handleDelete = (id: string, progName: string) => {
    if (confirm(`Kya aap waqai "${progName}" ko programs list se remove karna chahte hain?`)) {
      onSavePrograms(programs.filter((p) => p.id !== id));
      if (editingProgram?.id === id) {
        setEditingProgram(null);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4.5 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">🎓</span>
            <div>
              <h2 className="text-base sm:text-lg font-black leading-tight">
                Manage Academic Programs & Fee Structures
              </h2>
              <p className="text-xs text-slate-300">
                Harmain College of Health Sciences • Add, Edit, ya Delete Degree Programs & Monthly Fees
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-sm font-bold cursor-pointer transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-slate-50/50">
          {/* Top Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="text-xs text-slate-600 font-semibold">
              Kul <b>{programs.length} Programs</b> active hain. Naya course shamil karein ya maujooda course ki fee badlein.
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onResetToDefaults}
                className="px-3 py-1.5 rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-100 text-xs font-bold transition-all cursor-pointer"
                title="Harmain College standard courses restore karein"
              >
                🔄 Restore Defaults
              </button>
              <button
                type="button"
                onClick={handleStartAdd}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-600/20 cursor-pointer transition-all"
              >
                <PlusIcon className="w-4 h-4" />
                <span>Naya Program Add Karein</span>
              </button>
            </div>
          </div>

          {/* Form Section (When Adding or Editing) */}
          {(isAddingNew || editingProgram) && (
            <div className="bg-white p-5 rounded-2xl border-2 border-indigo-500 shadow-md space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-extrabold text-sm text-indigo-950 flex items-center gap-2">
                  <span>{isAddingNew ? '➕ Naya Program / Course Shamil Karein' : '✏️ Program & Fee Structure Edit Karein'}</span>
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingNew(false);
                    setEditingProgram(null);
                  }}
                  className="text-xs font-bold text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  Cancel
                </button>
              </div>

              <form onSubmit={handleSaveForm} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {/* Name */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Program / Degree Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Doctor of Physical Therapy (DPT) ya BS Nursing"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600 text-slate-900 font-bold"
                    />
                  </div>

                  {/* Duration */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Duration (Muddat) *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 5 Years, 4 Years, 2 Years"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600 text-slate-900 font-semibold"
                    />
                  </div>

                  {/* Degree Type */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Degree / Program Level
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Undergraduate BS Degree, Diploma"
                      value={degreeType}
                      onChange={(e) => setDegreeType(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600 text-slate-900"
                    />
                  </div>

                  {/* Monthly Fee */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Monthly Tuition Fee (PKR) *
                    </label>
                    <input
                      type="number"
                      required
                      min={0}
                      step={500}
                      placeholder="e.g. 25000"
                      value={monthlyFee}
                      onChange={(e) => handleMonthlyChange(Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600 text-indigo-950 font-black font-mono"
                    />
                  </div>

                  {/* Annual Fee */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Annual Tuition Fee (PKR)
                    </label>
                    <input
                      type="number"
                      min={0}
                      step={1000}
                      placeholder="Auto (Monthly x 12)"
                      value={annualFee}
                      onChange={(e) => setAnnualFee(Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600 text-slate-800 font-bold font-mono"
                    />
                  </div>

                  {/* Admission Fee */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      One-Time Admission / Reg Fee (PKR)
                    </label>
                    <input
                      type="number"
                      min={0}
                      step={1000}
                      placeholder="e.g. 25000"
                      value={admissionFee}
                      onChange={(e) => setAdmissionFee(Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600 text-slate-800 font-mono"
                    />
                  </div>

                  {/* Color Theme */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Card Theme Color
                    </label>
                    <select
                      value={colorTheme}
                      onChange={(e) => setColorTheme(e.target.value as CollegeProgramFee['colorTheme'])}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600 font-bold text-slate-800"
                    >
                      <option value="teal">🟢 Teal / Health</option>
                      <option value="sky">🔵 Sky Blue</option>
                      <option value="purple">🟣 Royal Purple</option>
                      <option value="emerald">🌿 Emerald Green</option>
                      <option value="amber">🟠 Warm Amber</option>
                      <option value="rose">🔴 Rose Pink</option>
                    </select>
                  </div>
                </div>

                {/* Features / Bullets */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Key Features / Lab & Hospital Facilities (Aik line par aik point likhein)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Tuition & Hospital Clinical Duty&#10;Pathology Diagnostic Practical Lab&#10;Regulatory Council Registration"
                    value={featuresText}
                    onChange={(e) => setFeaturesText(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600 text-slate-800"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingNew(false);
                      setEditingProgram(null);
                    }}
                    className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-md shadow-emerald-600/25 cursor-pointer transition-all"
                  >
                    💾 Save Program & Fee Structure
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Current Programs Grid List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {programs.map((prog) => {
              const borderStyles =
                prog.colorTheme === 'purple'
                  ? 'border-purple-200 bg-purple-50/40 hover:border-purple-400'
                  : prog.colorTheme === 'emerald'
                  ? 'border-emerald-200 bg-emerald-50/40 hover:border-emerald-400'
                  : prog.colorTheme === 'sky'
                  ? 'border-sky-200 bg-sky-50/40 hover:border-sky-400'
                  : prog.colorTheme === 'amber'
                  ? 'border-amber-200 bg-amber-50/40 hover:border-amber-400'
                  : prog.colorTheme === 'rose'
                  ? 'border-rose-200 bg-rose-50/40 hover:border-rose-400'
                  : 'border-teal-200 bg-teal-50/40 hover:border-teal-400';

              const badgeStyles =
                prog.colorTheme === 'purple'
                  ? 'bg-purple-600 text-white'
                  : prog.colorTheme === 'emerald'
                  ? 'bg-emerald-600 text-white'
                  : prog.colorTheme === 'sky'
                  ? 'bg-sky-600 text-white'
                  : prog.colorTheme === 'amber'
                  ? 'bg-amber-600 text-white'
                  : prog.colorTheme === 'rose'
                  ? 'bg-rose-600 text-white'
                  : 'bg-teal-600 text-white';

              const textStyles =
                prog.colorTheme === 'purple'
                  ? 'text-purple-950'
                  : prog.colorTheme === 'emerald'
                  ? 'text-emerald-950'
                  : prog.colorTheme === 'sky'
                  ? 'text-sky-950'
                  : prog.colorTheme === 'amber'
                  ? 'text-amber-950'
                  : prog.colorTheme === 'rose'
                  ? 'text-rose-950'
                  : 'text-teal-950';

              return (
                <div
                  key={prog.id}
                  className={`p-4 rounded-2xl border transition-all shadow-xs flex flex-col justify-between ${borderStyles}`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className={`font-extrabold text-sm ${textStyles} leading-tight block`}>
                          {prog.name}
                        </span>
                        <span className="text-[10px] text-slate-500 font-semibold block mt-0.5">
                          {prog.degreeType}
                        </span>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black shrink-0 ${badgeStyles}`}>
                        {prog.duration}
                      </span>
                    </div>

                    <div className={`text-xl font-black mt-2.5 font-mono ${textStyles}`}>
                      Rs. {prog.monthlyFee.toLocaleString()} <span className="text-xs font-semibold">/ mo</span>
                    </div>
                    <div className="text-xs text-slate-600 mt-0.5 font-bold">
                      Annual: Rs. {prog.annualFee.toLocaleString()}
                      {prog.admissionFee ? ` • Reg: Rs. ${prog.admissionFee.toLocaleString()}` : ''}
                    </div>

                    <ul className="text-[11px] text-slate-600 mt-3 space-y-1 list-disc pl-4 border-t border-slate-200/60 pt-2.5">
                      {(prog.features || []).map((feat, idx) => (
                        <li key={idx}>{feat}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex items-center justify-end gap-1.5 mt-4 pt-2.5 border-t border-slate-200/60">
                    <button
                      type="button"
                      onClick={() => handleStartEdit(prog)}
                      className="px-2.5 py-1 bg-white hover:bg-slate-100 text-indigo-700 rounded-lg text-xs font-bold border border-slate-200 shadow-2xs flex items-center gap-1 cursor-pointer transition-all"
                    >
                      <EditIcon className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(prog.id, prog.name)}
                      className="p-1 bg-white hover:bg-rose-50 text-rose-600 rounded-lg text-xs font-bold border border-slate-200 shadow-2xs cursor-pointer transition-all"
                      title="Delete Course"
                    >
                      <TrashIcon className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-white border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-500 font-medium">
            💡 Kisi bhi program ki monthly fee badalne se sabhi naye admission forms aur calculations automatically update ho jayengi.
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors shadow-xs"
          >
            Band Karein (Close)
          </button>
        </div>
      </div>
    </div>
  );
}

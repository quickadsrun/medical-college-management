'use client';
import React, { useState } from 'react';

interface ManageFacultyCategoriesModalProps {
  isOpen: boolean;
  onClose: () => void;
  departments: string[];
  medicalTerms: string[];
  onAddDepartment: (name: string) => void;
  onEditDepartment: (oldName: string, newName: string) => void;
  onDeleteDepartment: (name: string) => void;
  onAddTerm: (name: string) => void;
  onEditTerm: (oldName: string, newName: string) => void;
  onDeleteTerm: (name: string) => void;
  onResetDepartments: () => void;
  onResetTerms: () => void;
  initialTab?: 'DEPTS' | 'TERMS';
}

export default function ManageFacultyCategoriesModal({
  isOpen,
  onClose,
  departments,
  medicalTerms,
  onAddDepartment,
  onEditDepartment,
  onDeleteDepartment,
  onAddTerm,
  onEditTerm,
  onDeleteTerm,
  onResetDepartments,
  onResetTerms,
  initialTab = 'DEPTS',
}: ManageFacultyCategoriesModalProps) {
  const [activeTab, setActiveTab] = useState<'DEPTS' | 'TERMS'>(initialTab);

  // New Item Inputs
  const [newDeptInput, setNewDeptInput] = useState('');
  const [newTermInput, setNewTermInput] = useState('');

  // Editing state
  const [editingDeptOld, setEditingDeptOld] = useState<string | null>(null);
  const [editingDeptValue, setEditingDeptValue] = useState('');

  const [editingTermOld, setEditingTermOld] = useState<string | null>(null);
  const [editingTermValue, setEditingTermValue] = useState('');

  // Search filter inside manager
  const [filterQuery, setFilterQuery] = useState('');

  if (!isOpen) return null;

  // Handlers for Department
  const handleAddDept = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newDeptInput.trim();
    if (!trimmed) return;
    if (departments.some((d) => d.toLowerCase() === trimmed.toLowerCase())) {
      alert(`⚠️ Department "${trimmed}" pehle se mojood hai!`);
      return;
    }
    onAddDepartment(trimmed);
    setNewDeptInput('');
  };

  const handleStartEditDept = (dept: string) => {
    setEditingDeptOld(dept);
    setEditingDeptValue(dept);
  };

  const handleSaveEditDept = () => {
    if (!editingDeptOld) return;
    const trimmed = editingDeptValue.trim();
    if (!trimmed) {
      alert('Department ka naam khali nahi ho sakta!');
      return;
    }
    onEditDepartment(editingDeptOld, trimmed);
    setEditingDeptOld(null);
    setEditingDeptValue('');
  };

  const handleDeleteDept = (dept: string) => {
    const confirmDel = window.confirm(
      `🗑️ Kya aap waqai Department "${dept}" ko list se delete karna chahte hain?`
    );
    if (confirmDel) {
      onDeleteDepartment(dept);
    }
  };

  // Handlers for Terms
  const handleAddTerm = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newTermInput.trim();
    if (!trimmed) return;
    if (medicalTerms.some((t) => t.toLowerCase() === trimmed.toLowerCase())) {
      alert(`⚠️ Medical Term / Class "${trimmed}" pehle se mojood hai!`);
      return;
    }
    onAddTerm(trimmed);
    setNewTermInput('');
  };

  const handleStartEditTerm = (term: string) => {
    setEditingTermOld(term);
    setEditingTermValue(term);
  };

  const handleSaveEditTerm = () => {
    if (!editingTermOld) return;
    const trimmed = editingTermValue.trim();
    if (!trimmed) {
      alert('Term ka naam khali nahi ho sakta!');
      return;
    }
    onEditTerm(editingTermOld, trimmed);
    setEditingTermOld(null);
    setEditingTermValue('');
  };

  const handleDeleteTerm = (term: string) => {
    const confirmDel = window.confirm(
      `🗑️ Kya aap waqai Medical Term / Class "${term}" ko list se delete karna chahte hain?`
    );
    if (confirmDel) {
      onDeleteTerm(term);
    }
  };

  // Filtered lists
  const filteredDepartments = departments.filter((d) =>
    d.toLowerCase().includes(filterQuery.toLowerCase())
  );

  const filteredTerms = medicalTerms.filter((t) =>
    t.toLowerCase().includes(filterQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/80 p-3 sm:p-5 backdrop-blur-xs animate-fadeIn overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[88vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden my-auto">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">⚙️</span>
              <h2 className="text-base font-extrabold">
                Customize Departments & Medical Terms / Classes
              </h2>
            </div>
            <p className="text-xs text-indigo-200 mt-0.5">
              Apne college ke hisab se naye departments aur classes add karein, aur faltu sab delete kar dein.
            </p>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="text-slate-400 hover:text-white text-lg font-bold p-1 cursor-pointer transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 bg-slate-50 text-xs font-bold">
          <button
            type="button"
            onClick={() => {
              setActiveTab('DEPTS');
              setFilterQuery('');
            }}
            className={`flex-1 py-3 px-4 text-center cursor-pointer transition-all border-b-2 flex items-center justify-center gap-2 ${
              activeTab === 'DEPTS'
                ? 'border-indigo-600 text-indigo-700 bg-white font-extrabold shadow-xs'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100'
            }`}
          >
            <span>🏢 Medical Departments (شعبہ جات)</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-indigo-100 text-indigo-800">
              {departments.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('TERMS');
              setFilterQuery('');
            }}
            className={`flex-1 py-3 px-4 text-center cursor-pointer transition-all border-b-2 flex items-center justify-center gap-2 ${
              activeTab === 'TERMS'
                ? 'border-indigo-600 text-indigo-700 bg-white font-extrabold shadow-xs'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100'
            }`}
          >
            <span>🎓 Medical Terms / Classes (کلاسز)</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-indigo-100 text-indigo-800">
              {medicalTerms.length}
            </span>
          </button>
        </div>

        {/* Tab 1: Departments */}
        {activeTab === 'DEPTS' && (
          <div className="p-5 flex-1 flex flex-col overflow-hidden space-y-4">
            {/* Add New Department Form */}
            <form onSubmit={handleAddDept} className="bg-indigo-50/70 p-3.5 rounded-xl border border-indigo-100 space-y-2">
              <label className="block text-xs font-bold text-indigo-950">
                ➕ Naya Department Add Karein:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. Cardiology, Neurology, Admin, Nephrology..."
                  value={newDeptInput}
                  onChange={(e) => setNewDeptInput(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs bg-white border border-indigo-200 rounded-xl font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
                <button
                  type="submit"
                  disabled={!newDeptInput.trim()}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl font-bold text-xs cursor-pointer transition-all shadow-xs flex items-center gap-1.5"
                >
                  <span>Add Department</span>
                </button>
              </div>
              <p className="text-[10px] text-indigo-700">
                💡 Tip: Aap naya department add karke bache hue faltu departments ko niche se delete kar sakte hain.
              </p>
            </form>

            {/* Search Filter & Header */}
            <div className="flex items-center justify-between gap-2 pt-1">
              <div className="text-xs font-bold text-slate-700">
                Mojooda Departments ({filteredDepartments.length} of {departments.length}):
              </div>
              <input
                type="text"
                placeholder="🔍 List mein search karein..."
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
                className="px-2.5 py-1 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-600 w-44"
              />
            </div>

            {/* Scrollable Department List */}
            <div className="flex-1 overflow-y-auto border border-slate-200 rounded-xl divide-y divide-slate-100 max-h-[300px]">
              {filteredDepartments.length === 0 ? (
                <div className="p-8 text-center text-slate-400">
                  <span className="text-2xl block mb-1">🏢</span>
                  <p className="text-xs font-semibold">Koi department nahi mila.</p>
                </div>
              ) : (
                filteredDepartments.map((dept, index) => {
                  const isEditing = editingDeptOld === dept;
                  return (
                    <div
                      key={dept}
                      className="px-3.5 py-2.5 flex items-center justify-between gap-2 hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <span className="font-mono text-[10px] font-bold text-slate-400 w-5">
                          {index + 1}.
                        </span>
                        {isEditing ? (
                          <div className="flex items-center gap-2 flex-1">
                            <input
                              type="text"
                              value={editingDeptValue}
                              onChange={(e) => setEditingDeptValue(e.target.value)}
                              className="px-2 py-1 text-xs border border-indigo-500 rounded-lg flex-1 font-bold text-indigo-900 bg-white"
                              autoFocus
                            />
                            <button
                              type="button"
                              onClick={handleSaveEditDept}
                              className="px-2.5 py-1 bg-emerald-600 text-white rounded-lg text-[11px] font-bold hover:bg-emerald-700 cursor-pointer"
                            >
                              Save
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingDeptOld(null);
                                setEditingDeptValue('');
                              }}
                              className="px-2 py-1 bg-slate-200 text-slate-700 rounded-lg text-[11px] font-bold hover:bg-slate-300 cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs font-bold text-slate-900 truncate">
                            {dept}
                          </span>
                        )}
                      </div>

                      {!isEditing && (
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleStartEditDept(dept)}
                            title="Edit / Rename Department"
                            className="px-2 py-1 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 rounded-lg text-[11px] font-bold cursor-pointer transition-colors border border-slate-200"
                          >
                            ✏️ Rename
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteDept(dept)}
                            title="Delete this department"
                            className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-[11px] font-bold cursor-pointer transition-colors border border-rose-200"
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
              <button
                type="button"
                onClick={() => {
                  if (confirm('Kya aap waqai standard medical college departments restore karna chahte hain?')) {
                    onResetDepartments();
                  }
                }}
                className="text-[11px] text-slate-500 hover:text-slate-800 underline cursor-pointer"
              >
                🔄 Restore Default Departments List
              </button>

              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-900 text-white font-bold rounded-xl text-xs hover:bg-slate-800 cursor-pointer"
              >
                Done (Save & Close)
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: Medical Terms / Classes */}
        {activeTab === 'TERMS' && (
          <div className="p-5 flex-1 flex flex-col overflow-hidden space-y-4">
            {/* Add New Term Form */}
            <form onSubmit={handleAddTerm} className="bg-sky-50/70 p-3.5 rounded-xl border border-sky-100 space-y-2">
              <label className="block text-xs font-bold text-sky-950">
                ➕ Nayi Medical Term / Class Add Karein:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. 1st Year MBBS, BDS 3rd Year, DPT 4th Year, Batch 2026..."
                  value={newTermInput}
                  onChange={(e) => setNewTermInput(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs bg-white border border-sky-200 rounded-xl font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-600"
                />
                <button
                  type="submit"
                  disabled={!newTermInput.trim()}
                  className="px-4 py-2 bg-sky-700 hover:bg-sky-800 disabled:opacity-50 text-white rounded-xl font-bold text-xs cursor-pointer transition-all shadow-xs flex items-center gap-1.5"
                >
                  <span>Add Term / Class</span>
                </button>
              </div>
              <p className="text-[10px] text-sky-700">
                💡 Tip: Jo classes ya terms aapke college mein nahi hain (e.g. BDS ya DPT), unhe niche se delete kar dein.
              </p>
            </form>

            {/* Search Filter & Header */}
            <div className="flex items-center justify-between gap-2 pt-1">
              <div className="text-xs font-bold text-slate-700">
                Mojooda Medical Terms / Classes ({filteredTerms.length} of {medicalTerms.length}):
              </div>
              <input
                type="text"
                placeholder="🔍 List mein search karein..."
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
                className="px-2.5 py-1 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-600 w-44"
              />
            </div>

            {/* Scrollable Terms List */}
            <div className="flex-1 overflow-y-auto border border-slate-200 rounded-xl divide-y divide-slate-100 max-h-[300px]">
              {filteredTerms.length === 0 ? (
                <div className="p-8 text-center text-slate-400">
                  <span className="text-2xl block mb-1">🎓</span>
                  <p className="text-xs font-semibold">Koi medical term / class nahi mili.</p>
                </div>
              ) : (
                filteredTerms.map((term, index) => {
                  const isEditing = editingTermOld === term;
                  return (
                    <div
                      key={term}
                      className="px-3.5 py-2.5 flex items-center justify-between gap-2 hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <span className="font-mono text-[10px] font-bold text-slate-400 w-5">
                          {index + 1}.
                        </span>
                        {isEditing ? (
                          <div className="flex items-center gap-2 flex-1">
                            <input
                              type="text"
                              value={editingTermValue}
                              onChange={(e) => setEditingTermValue(e.target.value)}
                              className="px-2 py-1 text-xs border border-sky-500 rounded-lg flex-1 font-bold text-sky-900 bg-white"
                              autoFocus
                            />
                            <button
                              type="button"
                              onClick={handleSaveEditTerm}
                              className="px-2.5 py-1 bg-emerald-600 text-white rounded-lg text-[11px] font-bold hover:bg-emerald-700 cursor-pointer"
                            >
                              Save
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingTermOld(null);
                                setEditingTermValue('');
                              }}
                              className="px-2 py-1 bg-slate-200 text-slate-700 rounded-lg text-[11px] font-bold hover:bg-slate-300 cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs font-bold text-slate-900 truncate">
                            {term}
                          </span>
                        )}
                      </div>

                      {!isEditing && (
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleStartEditTerm(term)}
                            title="Edit / Rename Class or Term"
                            className="px-2 py-1 bg-slate-100 hover:bg-sky-50 hover:text-sky-700 text-slate-600 rounded-lg text-[11px] font-bold cursor-pointer transition-colors border border-slate-200"
                          >
                            ✏️ Rename
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteTerm(term)}
                            title="Delete this class/term"
                            className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-[11px] font-bold cursor-pointer transition-colors border border-rose-200"
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
              <button
                type="button"
                onClick={() => {
                  if (confirm('Kya aap waqai standard medical classes / terms restore karna chahte hain?')) {
                    onResetTerms();
                  }
                }}
                className="text-[11px] text-slate-500 hover:text-slate-800 underline cursor-pointer"
              >
                🔄 Restore Default Medical Terms List
              </button>

              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-900 text-white font-bold rounded-xl text-xs hover:bg-slate-800 cursor-pointer"
              >
                Done (Save & Close)
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

'use client';
import React, { useState, useEffect, useRef } from 'react';
import { LockIcon, UnlockIcon, KeyIcon } from './Icons';

interface PrincipalLockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  targetTabLabel?: string;
  collegeId?: string;
  defaultPin?: string;
}

export default function PrincipalLockModal({
  isOpen,
  onClose,
  onSuccess,
  targetTabLabel,
  collegeId,
  defaultPin = '1234',
}: PrincipalLockModalProps) {
  const [pin, setPin] = useState(['', '', '', '']);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isShaking, setIsShaking] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [isChangingPin, setIsChangingPin] = useState(false);
  const [changeOldPin, setChangeOldPin] = useState('');
  const [changeNewPin, setChangeNewPin] = useState('');
  const [changeConfirmPin, setChangeConfirmPin] = useState('');
  const [changeSuccessMsg, setChangeSuccessMsg] = useState<string | null>(null);

  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setPin(['', '', '', '']);
      setErrorMsg(null);
      setIsShaking(false);
      setIsChangingPin(false);
      setChangeOldPin('');
      setChangeNewPin('');
      setChangeConfirmPin('');
      setChangeSuccessMsg(null);
      setTimeout(() => {
        inputRefs[0].current?.focus();
      }, 100);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const storageKey = `pmc_${collegeId || 'global'}_principal_pin_v2`;

  const getSavedPin = (): string => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(storageKey) || defaultPin || '1234';
    }
    return defaultPin || '1234';
  };

  const verifyPin = (enteredPinStr: string) => {
    const correctPin = getSavedPin();
    if (enteredPinStr === correctPin) {
      setErrorMsg(null);
      onSuccess();
    } else {
      setErrorMsg('Ghalat PIN code! Dobara koshish karein.');
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
      setPin(['', '', '', '']);
      inputRefs[0].current?.focus();
    }
  };

  const handleInputChange = (index: number, value: string) => {
    // Only accept numeric digits
    const cleaned = value.replace(/\D/g, '');
    if (!cleaned) {
      const nextPin = [...pin];
      nextPin[index] = '';
      setPin(nextPin);
      return;
    }

    // If pasted multiple digits
    if (cleaned.length > 1) {
      const digits = cleaned.slice(0, 4).split('');
      const nextPin = ['', '', '', ''];
      digits.forEach((d, i) => {
        nextPin[i] = d;
      });
      setPin(nextPin);
      if (digits.length === 4) {
        verifyPin(digits.join(''));
      } else {
        const nextIdx = Math.min(digits.length, 3);
        inputRefs[nextIdx].current?.focus();
      }
      return;
    }

    const nextPin = [...pin];
    nextPin[index] = cleaned[0];
    setPin(nextPin);
    setErrorMsg(null);

    // Auto move to next input
    if (index < 3) {
      inputRefs[index + 1].current?.focus();
    } else {
      // Last digit entered, auto submit
      const fullPin = [...nextPin.slice(0, 3), cleaned[0]].join('');
      if (fullPin.length === 4) {
        verifyPin(fullPin);
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  const handleNumpadClick = (num: string) => {
    const firstEmptyIndex = pin.findIndex((digit) => digit === '');
    if (firstEmptyIndex !== -1) {
      handleInputChange(firstEmptyIndex, num);
    }
  };

  const handleNumpadBackspace = () => {
    const lastFilledIndex = [...pin].reverse().findIndex((digit) => digit !== '');
    if (lastFilledIndex !== -1) {
      const actualIndex = 3 - lastFilledIndex;
      const nextPin = [...pin];
      nextPin[actualIndex] = '';
      setPin(nextPin);
      inputRefs[actualIndex].current?.focus();
    }
  };

  const handleNumpadClear = () => {
    setPin(['', '', '', '']);
    setErrorMsg(null);
    inputRefs[0].current?.focus();
  };

  const handleSaveNewPin = (e: React.FormEvent) => {
    e.preventDefault();
    const currentActualPin = getSavedPin();
    if (changeOldPin !== currentActualPin) {
      setErrorMsg('Mojuda (Old) PIN ghalat hai!');
      return;
    }
    if (!/^\d{4}$/.test(changeNewPin)) {
      setErrorMsg('Naya PIN 4 digits ka hona chahiye (e.g. 5678)!');
      return;
    }
    if (changeNewPin !== changeConfirmPin) {
      setErrorMsg('Naya PIN aur Confirm PIN match nahi ho rahe!');
      return;
    }

    localStorage.setItem(storageKey, changeNewPin);
    setChangeSuccessMsg('PIN kamyabi se tabdeel ho gaya! Naya PIN set hai.');
    setErrorMsg(null);
    setTimeout(() => {
      setIsChangingPin(false);
      setChangeSuccessMsg(null);
      setPin(['', '', '', '']);
      inputRefs[0].current?.focus();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div
        className={`relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden ${
          isShaking ? 'animate-bounce' : ''
        }`}
      >
        {/* Top Header Banner with Medical Executive theme */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-teal-950 px-6 py-6 text-white text-center relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
            title="Cancel"
          >
            ✕
          </button>
          
          <div className="mx-auto w-14 h-14 rounded-2xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-teal-300 shadow-inner mb-3">
            <LockIcon className="w-7 h-7" />
          </div>
          
          <h2 className="text-xl font-black tracking-wide text-white">
            Principal / Director Portal
          </h2>
          <p className="text-xs text-teal-200/90 mt-1 font-medium">
            {targetTabLabel
              ? `"${targetTabLabel}" access karne ke liye Security PIN enter karein.`
              : 'Financials, Salaries & Policies access karne ke liye PIN enter karein.'}
          </p>
        </div>

        {/* Change PIN Tab or PIN Input Screen */}
        {!isChangingPin ? (
          <div className="p-6 space-y-6">
            {/* PIN Input Boxes */}
            <div className="space-y-3">
              <div className="flex justify-between items-center px-2">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Enter 4-Digit Security PIN
                </label>
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="text-xs text-teal-700 hover:text-teal-800 font-bold transition-colors cursor-pointer"
                >
                  {showPin ? 'Hide PIN' : 'Show PIN'}
                </button>
              </div>

              <div className="flex justify-center items-center gap-3">
                {pin.map((digit, index) => (
                  <input
                    key={index}
                    ref={inputRefs[index]}
                    type={showPin ? 'text' : 'password'}
                    inputMode="numeric"
                    maxLength={4}
                    value={digit}
                    onChange={(e) => handleInputChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className={`w-14 h-14 text-center text-2xl font-black rounded-2xl border-2 transition-all outline-none ${
                      digit
                        ? 'border-teal-600 bg-teal-50/50 text-slate-900 shadow-sm'
                        : 'border-slate-300 bg-slate-50 text-slate-900 focus:border-teal-500 focus:bg-white'
                    }`}
                  />
                ))}
              </div>

              {errorMsg && (
                <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold text-center">
                  ⚠️ {errorMsg}
                </div>
              )}
            </div>

            {/* Virtual Numpad */}
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
              <div className="grid grid-cols-3 gap-2">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => handleNumpadClick(num)}
                    className="py-3 text-lg font-black text-slate-800 bg-white hover:bg-teal-50 hover:text-teal-900 rounded-xl border border-slate-200 shadow-2xs active:scale-95 transition-all cursor-pointer"
                  >
                    {num}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={handleNumpadClear}
                  className="py-3 text-xs font-bold text-slate-500 bg-slate-200/70 hover:bg-slate-300 rounded-xl active:scale-95 transition-all cursor-pointer"
                >
                  Clear
                </button>
                <button
                  type="button"
                  onClick={() => handleNumpadClick('0')}
                  className="py-3 text-lg font-black text-slate-800 bg-white hover:bg-teal-50 hover:text-teal-900 rounded-xl border border-slate-200 shadow-2xs active:scale-95 transition-all cursor-pointer"
                >
                  0
                </button>
                <button
                  type="button"
                  onClick={handleNumpadBackspace}
                  className="py-3 text-base font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl border border-rose-200 active:scale-95 transition-all cursor-pointer"
                  title="Backspace"
                >
                  ⌫
                </button>
              </div>
            </div>

            {/* Action Buttons & Helpers */}
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => verifyPin(pin.join(''))}
                disabled={pin.some((d) => d === '')}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-teal-700 to-slate-900 hover:from-teal-800 hover:to-slate-950 text-white font-black text-sm rounded-2xl shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
              >
                <UnlockIcon className="w-5 h-5 text-teal-300" />
                <span>Login / Unlock Principal Panel</span>
              </button>

              {/* Default PIN Helper & Quick Fill */}
              <div className="flex items-center justify-between px-1 text-xs">
                <span className="text-slate-500">
                  Default PIN: <strong className="text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">1234</strong>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    const defaultPin = ['1', '2', '3', '4'];
                    setPin(defaultPin);
                    verifyPin('1234');
                  }}
                  className="text-teal-700 hover:text-teal-900 font-bold underline cursor-pointer"
                >
                  Auto-Fill 1234
                </button>
              </div>

              {/* Options: Change PIN or Cancel */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setIsChangingPin(true);
                    setErrorMsg(null);
                  }}
                  className="text-slate-600 hover:text-slate-900 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <KeyIcon className="w-3.5 h-3.5 text-teal-700" />
                  <span>Change PIN</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="text-slate-500 hover:text-slate-800 font-bold cursor-pointer"
                >
                  Cancel (Stay at Receptionist Desk)
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Change PIN Form */
          <form onSubmit={handleSaveNewPin} className="p-6 space-y-4">
            <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
              <KeyIcon className="w-4 h-4 text-teal-700" />
              <span>Change Security PIN Code</span>
            </div>

            {errorMsg && (
              <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold text-center">
                ⚠️ {errorMsg}
              </div>
            )}

            {changeSuccessMsg && (
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold text-center">
                ✅ {changeSuccessMsg}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">
                Mojuda (Current) PIN
              </label>
              <input
                type="password"
                maxLength={4}
                value={changeOldPin}
                onChange={(e) => setChangeOldPin(e.target.value.replace(/\D/g, ''))}
                placeholder="Purana PIN (default: 1234)"
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-600"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">
                Naya 4-Digit PIN
              </label>
              <input
                type="password"
                maxLength={4}
                value={changeNewPin}
                onChange={(e) => setChangeNewPin(e.target.value.replace(/\D/g, ''))}
                placeholder="Naya 4-digit PIN enter karein"
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-600"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">
                Confirm Naya PIN
              </label>
              <input
                type="password"
                maxLength={4}
                value={changeConfirmPin}
                onChange={(e) => setChangeConfirmPin(e.target.value.replace(/\D/g, ''))}
                placeholder="Naya PIN dobara enter karein"
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-600"
                required
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                className="flex-1 py-2.5 bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer"
              >
                Save New PIN
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsChangingPin(false);
                  setErrorMsg(null);
                }}
                className="px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
              >
                Back
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

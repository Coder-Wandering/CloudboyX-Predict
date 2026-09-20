import React from 'react';
import { Eli6Explanation } from '../types';
import { X, Sparkles, CloudRain, Coins, ShieldCheck, HeartHandshake } from 'lucide-react';

interface Eli6ModalProps {
  isOpen: boolean;
  onClose: () => void;
  eli6: Eli6Explanation;
}

export const Eli6Modal: React.FC<Eli6ModalProps> = ({ isOpen, onClose, eli6 }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xl max-w-xl w-full p-6 space-y-5 overflow-y-auto max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#caf0f8] text-[#03045e] border border-[#90e0ef] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-[#03045e]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#03045e]">
                Say It Like I'm 6 Years Old
              </h3>
              <p className="text-xs text-stone-500">
                A simple playground story to understand Kalshi & prediction odds
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Story Analogy */}
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-[#caf0f8]/30 border border-[#90e0ef] space-y-2">
            <div className="flex items-center space-x-2 text-xs font-bold text-[#03045e] uppercase">
              <CloudRain className="w-4 h-4 text-[#0077b6]" />
              <span>{eli6.analogyTitle}</span>
            </div>
            <p className="text-xs sm:text-sm text-stone-800 leading-relaxed">
              {eli6.simpleStory}
            </p>
          </div>

          {/* Pennies & Tickets */}
          <div className="p-4 rounded-xl bg-[#caf0f8]/20 border border-[#00b4d8]/40 space-y-2">
            <div className="flex items-center space-x-2 text-xs font-bold text-[#03045e] uppercase">
              <Coins className="w-4 h-4 text-[#0077b6]" />
              <span>How The Penny Contracts Work</span>
            </div>
            <p className="text-xs sm:text-sm text-stone-800 leading-relaxed">
              {eli6.penniesExample}
            </p>
          </div>

          {/* Lottery vs Kalshi difference */}
          <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-2">
            <div className="flex items-center space-x-2 text-xs font-bold text-[#03045e] uppercase">
              <HeartHandshake className="w-4 h-4 text-[#0077b6]" />
              <span>Why It's Not a Lottery</span>
            </div>
            <p className="text-xs text-stone-700 leading-relaxed">
              In a lottery, all the money goes into one big pot and you hope your lucky number gets picked. On Kalshi, you are trading back and forth like toy cards. If you buy a ticket for 40 pennies and tomorrow dark rain clouds appear, your ticket is now worth 80 pennies! You don't even have to wait for the rain—you can sell it to someone else right away and keep your 40 pennies profit!
            </p>
          </div>

          {/* Golden rule */}
          <div className="p-3.5 rounded-xl bg-[#caf0f8]/50 border border-[#0077b6] flex items-start space-x-2.5">
            <ShieldCheck className="w-4 h-4 text-[#0077b6] mt-0.5 shrink-0" />
            <div className="text-xs text-[#03045e]">
              <strong className="block font-bold mb-0.5">The Golden Rule:</strong>
              {eli6.goldenRule}
            </div>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#03045e] hover:bg-[#0077b6] text-white transition-colors cursor-pointer shadow-xs"
          >
            Got it, makes total sense!
          </button>
        </div>
      </div>
    </div>
  );
};

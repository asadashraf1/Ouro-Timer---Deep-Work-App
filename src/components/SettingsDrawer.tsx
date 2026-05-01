/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTimer } from './TimerContext';

interface SettingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsDrawer({ isOpen, onClose }: SettingsDrawerProps) {
  const { state, dispatch } = useTimer();

  const handleToggle = (setting: any) => {
    dispatch({ type: 'TOGGLE_SETTING', setting });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black z-40"
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 w-full h-[85vh] md:h-[80vh] bg-black border-t border-white/20 z-50 px-6 md:px-12 py-12 md:py-16 flex flex-col items-start overflow-y-auto"
          >
            <div className="w-full max-w-4xl mx-auto">
              <header className="mb-24 flex justify-between items-center">
                <h2 className="text-[0.75rem] tracking-[0.5em] font-bold uppercase">CONFIGURATION</h2>
                <button onClick={onClose} className="text-[0.6rem] tracking-[0.3em] uppercase opacity-40 hover:opacity-100 transition-opacity">
                  [CLOSE]
                </button>
              </header>

              <div className="space-y-16 w-full">
                <div className="flex justify-between items-center border-b border-white/10 pb-8">
                  <div>
                    <h3 className="text-xl font-light tracking-tight mb-2">High Frequency Ticking</h3>
                    <p className="text-[0.6rem] tracking-widest uppercase opacity-40">Minimal audio feedback every second</p>
                  </div>
                  <button 
                    onClick={() => handleToggle('tickingSound')}
                    className={`text-[0.75rem] tracking-[0.2em] font-bold uppercase transition-colors ${state.settings.tickingSound ? 'text-white' : 'text-white/20'}`}
                  >
                    {state.settings.tickingSound ? '[ENABLE]' : '[DISABLE]'}
                  </button>
                </div>

                <div className="flex justify-between items-center border-b border-white/10 pb-8">
                  <div>
                    <h3 className="text-xl font-light tracking-tight mb-2">Auto-Void Mode</h3>
                    <p className="text-[0.6rem] tracking-widest uppercase opacity-40">Session resets if tab is inactive for 30s</p>
                  </div>
                   <button 
                    onClick={() => handleToggle('autoVoid')}
                    className={`text-[0.75rem] tracking-[0.2em] font-bold uppercase transition-colors ${state.settings.autoVoid ? 'text-white' : 'text-white/20'}`}
                  >
                    {state.settings.autoVoid ? '[ENABLE]' : '[DISABLE]'}
                  </button>
                </div>

                <div className="flex justify-between items-center border-b border-white/10 pb-8">
                  <div>
                    <h3 className="text-xl font-light tracking-tight mb-2">Visual Palette</h3>
                    <p className="text-[0.6rem] tracking-widest uppercase opacity-40">Toggle between OLED black and technical gray</p>
                  </div>
                   <div className="flex gap-4">
                     <button 
                      onClick={() => dispatch({ type: 'SET_VISUAL_MODE', mode: 'BLACK' })}
                      className={`text-[0.75rem] tracking-[0.2em] font-bold uppercase transition-colors ${state.settings.visualMode === 'BLACK' ? 'text-white' : 'text-white/20'}`}
                    >
                      P_BLACK
                    </button>
                    <button 
                      onClick={() => dispatch({ type: 'SET_VISUAL_MODE', mode: 'GRAY' })}
                      className={`text-[0.75rem] tracking-[0.2em] font-bold uppercase transition-colors ${state.settings.visualMode === 'GRAY' ? 'text-white' : 'text-white/20'}`}
                    >
                      D_GRAY
                    </button>
                   </div>
                </div>
              </div>

              <footer className="mt-32 opacity-10">
                 <p className="text-[0.5rem] tracking-[0.3em] uppercase">SYSTEM VERSION 2.0.4 // OURO_PROTOCOL</p>
              </footer>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

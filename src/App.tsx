/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import Timer from './components/Timer';
import TaskList from './components/TaskList';
import SettingsDrawer from './components/SettingsDrawer';
import { TaskProvider } from './components/TaskContext';
import { TimerProvider, useTimer } from './components/TimerContext';
import { motion } from 'motion/react';

function AppContent() {
  const { state } = useTimer();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <div className={`min-h-screen transition-editorial ${state.settings.visualMode === 'GRAY' ? 'bg-[#111111]' : 'bg-black'} text-white px-6 md:px-12 py-8 md:py-12 relative flex overflow-hidden`}>
      {/* Editorial Vertical Axis */}
      <div className="vertical-axis" />

      {/* Main Container */}
      <div className="w-full h-full flex flex-col lg:flex-row relative z-10 overflow-y-auto lg:overflow-hidden scrollbar-none">
        
        {/* Left Column: Huge Timer & Branding */}
        <div className="w-full lg:w-2/3 h-auto lg:h-full flex flex-col justify-between pr-0 lg:pr-24 mb-12 lg:mb-0">
          <header className={`transition-editorial ${state.status === 'RUNNING' ? 'opacity-5' : 'opacity-100'} hover:opacity-100 mb-8 lg:mb-0 text-center lg:text-left`}>
            <h1 className="text-[0.6rem] tracking-[0.8em] font-black uppercase mb-1">OURO</h1>
            <p className="text-[0.4rem] tracking-[0.3em] uppercase opacity-20">EST. 2026 / FLOW_STATE_PROTOCOL</p>
          </header>

          <main className="flex-1 flex items-start">
            <Timer />
          </main>

          <footer className={`transition-editorial ${state.status === 'RUNNING' ? 'opacity-0' : 'opacity-100'} mt-12 lg:mt-0 text-center lg:text-left`}>
            <button 
              onClick={() => setIsSettingsOpen(true)}
              className="text-[0.6rem] tracking-[0.4em] uppercase font-bold opacity-30 hover:opacity-100 transition-opacity"
            >
              [SET]
            </button>
          </footer>
        </div>

        {/* Right Column: Task Stack & Secondary Info */}
        <div className="w-full lg:w-1/3 h-auto lg:h-full lg:pl-12 flex flex-col pt-2 md:pt-4 border-t lg:border-t-0 border-white/10 lg:mt-0 mt-12">
           <TaskList />
        </div>
      </div>

      <SettingsDrawer isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </div>
  );
}

export default function App() {
  return (
    <TimerProvider>
      <TaskProvider>
        <AppContent />
      </TaskProvider>
    </TimerProvider>
  );
}


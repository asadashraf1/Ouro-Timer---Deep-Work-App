/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useReducer, useEffect, useRef } from 'react';

export type TimerStatus = 'IDLE' | 'RUNNING' | 'PAUSED' | 'COMPLETED';

interface TimerSettings {
  tickingSound: boolean;
  autoVoid: boolean;
  visualMode: 'BLACK' | 'GRAY';
}

interface TimerState {
  status: TimerStatus;
  timeLeft: number;
  duration: number;
  settings: TimerSettings;
  lastActive: number;
}

type TimerAction =
  | { type: 'SET_DURATION'; payload: number }
  | { type: 'START' }
  | { type: 'PAUSE' }
  | { type: 'RESUME' }
  | { type: 'VOID' }
  | { type: 'TICK' }
  | { type: 'TOGGLE_SETTING'; setting: keyof TimerSettings }
  | { type: 'SET_VISUAL_MODE'; mode: 'BLACK' | 'GRAY' }
  | { type: 'UPDATE_ACTIVITY' }
  | { type: 'COMPLETE' };

const initialState: TimerState = {
  status: 'IDLE',
  timeLeft: 25 * 60,
  duration: 25 * 60,
  settings: {
    tickingSound: false,
    autoVoid: true,
    visualMode: 'BLACK',
  },
  lastActive: Date.now(),
};

function timerReducer(state: TimerState, action: TimerAction): TimerState {
  switch (action.type) {
    case 'SET_DURATION':
      return { ...state, duration: action.payload, timeLeft: action.payload };
    case 'START':
      return { ...state, status: 'RUNNING', lastActive: Date.now() };
    case 'PAUSE':
      return { ...state, status: 'PAUSED' };
    case 'RESUME':
      return { ...state, status: 'RUNNING', lastActive: Date.now() };
    case 'VOID':
      return { ...state, status: 'IDLE', timeLeft: state.duration };
    case 'TICK':
      if (state.timeLeft <= 1) return { ...state, status: 'COMPLETED', timeLeft: 0 };
      return { ...state, timeLeft: state.timeLeft - 1 };
    case 'TOGGLE_SETTING':
      return { 
        ...state, 
        settings: { ...state.settings, [action.setting]: !state.settings[action.setting] } 
      };
    case 'SET_VISUAL_MODE':
      return { ...state, settings: { ...state.settings, visualMode: action.mode } };
    case 'UPDATE_ACTIVITY':
      return { ...state, lastActive: Date.now() };
    case 'COMPLETE':
      return { ...state, status: 'COMPLETED', timeLeft: 0 };
    default:
      return state;
  }
}

const TimerContext = createContext<{
  state: TimerState;
  dispatch: React.Dispatch<TimerAction>;
} | undefined>(undefined);

// Web Worker content for high-precision timing
const workerCode = `
  let timer = null;
  self.onmessage = function(e) {
    if (e.data === 'start') {
      if (timer) clearInterval(timer);
      timer = setInterval(() => self.postMessage('tick'), 1000);
    } else if (e.data === 'stop') {
      clearInterval(timer);
      timer = null;
    }
  };
`;

export function TimerProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(timerReducer, initialState);
  const workerRef = useRef<Worker | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Initialize Worker
  useEffect(() => {
    const blob = new Blob([workerCode], { type: 'application/javascript' });
    const worker = new Worker(URL.createObjectURL(blob));
    
    worker.onmessage = () => {
      dispatch({ type: 'TICK' });
    };

    workerRef.current = worker;
    return () => worker.terminate();
  }, []);

  // Control Worker based on status
  useEffect(() => {
    if (state.status === 'RUNNING') {
      workerRef.current?.postMessage('start');
    } else {
      workerRef.current?.postMessage('stop');
    }
  }, [state.status]);

  // Handle Ticking Sound
  useEffect(() => {
    if (state.status === 'RUNNING' && state.settings.tickingSound) {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      
      const playTick = () => {
        const osc = audioContextRef.current!.createOscillator();
        const gain = audioContextRef.current!.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1200, audioContextRef.current!.currentTime);
        gain.gain.setValueAtTime(0.02, audioContextRef.current!.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, audioContextRef.current!.currentTime + 0.05);
        osc.connect(gain);
        gain.connect(audioContextRef.current!.destination);
        osc.start();
        osc.stop(audioContextRef.current!.currentTime + 0.05);
      };

      playTick();
    }
  }, [state.timeLeft, state.status, state.settings.tickingSound]);

  // Handle Auto-Void (30s off-tab detection)
  useEffect(() => {
    if (state.status !== 'RUNNING' || !state.settings.autoVoid) return;

    const handleVisibility = () => {
      if (document.hidden) {
        // Start a timer to void if still hidden after 30s
        const voidTimeout = setTimeout(() => {
          if (document.hidden) dispatch({ type: 'VOID' });
        }, 30000);
        
        const cleanup = () => {
          clearTimeout(voidTimeout);
          document.removeEventListener('visibilitychange', cleanup);
        };
        document.addEventListener('visibilitychange', cleanup);
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [state.status, state.settings.autoVoid]);

  return (
    <TimerContext.Provider value={{ state, dispatch }}>
      {children}
    </TimerContext.Provider>
  );
}

export function useTimer() {
  const context = useContext(TimerContext);
  if (!context) throw new Error('useTimer must be used within a TimerProvider');
  return context;
}

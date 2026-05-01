/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, useAnimation } from 'motion/react';
import { useTimer } from './TimerContext';

export default function Timer() {
  const { state, dispatch } = useTimer();
  const [isEditing, setIsEditing] = useState(false);
  const [dragStart, setDragStart] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Drag-to-Set Logic
  const handleMouseDown = (e: React.MouseEvent) => {
    if (state.status !== 'IDLE') return;
    setDragStart(e.clientX);
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (dragStart === null) return;
    const delta = e.clientX - dragStart;
    const minutesDelta = Math.floor(delta / 10); // 10px per minute
    if (minutesDelta !== 0) {
      const currentMins = Math.floor(state.duration / 60);
      const newMins = Math.max(1, Math.min(180, currentMins + minutesDelta));
      if (newMins !== currentMins) {
        dispatch({ type: 'SET_DURATION', payload: newMins * 60 });
        setDragStart(e.clientX);
      }
    }
  }, [dragStart, state.duration, dispatch]);

  const handleMouseUp = useCallback(() => {
    setDragStart(null);
  }, []);

  useEffect(() => {
    if (dragStart !== null) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragStart, handleMouseMove, handleMouseUp]);

  // Long-press HALT Logic
  const startHold = () => {
    if (state.status !== 'RUNNING') return;
    setHoldProgress(0);
    holdIntervalRef.current = window.setInterval(() => {
      setHoldProgress(prev => {
        if (prev >= 100) {
          clearInterval(holdIntervalRef.current!);
          dispatch({ type: 'PAUSE' });
          return 100;
        }
        return prev + (100 / (1500 / 50)); // 1.5s total at 50ms intervals
      });
    }, 50);
  };

  const stopHold = () => {
    if (holdIntervalRef.current) {
      clearInterval(holdIntervalRef.current);
      setHoldProgress(0);
    }
  };

  const handleTimeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value);
    if (!isNaN(val) && val > 0 && val <= 999) {
      dispatch({ type: 'SET_DURATION', payload: val * 60 });
    }
  };

  const toggleInput = () => {
    if (state.status !== 'IDLE') return;
    setIsEditing(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  return (
    <div className="relative w-full h-[60vh] flex flex-col justify-start lg:items-start items-center text-center lg:text-left">
      {/* Huge Asymmetric Timer (Centered on Mobile) */}
      <div className="pt-12 md:pt-24 w-full">
        {isEditing ? (
          <input
            ref={inputRef}
            type="number"
            className="bg-transparent text-[clamp(6rem,30vw,16rem)] font-[100] tracking-tighter w-full outline-none border-none leading-none text-center lg:text-left"
            onBlur={() => setIsEditing(false)}
            onChange={handleTimeInput}
            defaultValue={Math.floor(state.duration / 60)}
          />
        ) : (
          <motion.div
            animate={{ 
              opacity: state.status === 'RUNNING' ? [1, 0.7, 1] : 1,
            }}
            transition={{ 
              duration: 4, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
            onMouseDown={handleMouseDown}
            onDoubleClick={toggleInput}
            className={`text-[clamp(6rem,35vw,16rem)] font-[100] tracking-tighter cursor-ew-resize select-none leading-[0.8] transition-editorial ${state.status === 'IDLE' ? 'hover:opacity-80' : ''}`}
          >
            {formatTime(state.timeLeft)}
          </motion.div>
        )}
        
        <div className="mt-6 flex flex-col gap-1 items-center lg:items-start">
          <p className="text-[0.5rem] md:text-[0.6rem] tracking-[0.4em] uppercase opacity-30 font-bold">
            {state.status === 'IDLE' ? 'DRAG TO SET / DBL CLICK TO EDIT' : 'ESTABLISHING FLOW'}
          </p>
        </div>
      </div>

      {/* Main Action Area */}
      <div className="absolute bottom-0 left-0 w-full flex flex-wrap items-end justify-center lg:justify-start gap-4 md:gap-12">
        {state.status === 'IDLE' ? (
          <button
            onClick={() => dispatch({ type: 'START' })}
            className="text-[0.7rem] md:text-[0.75rem] tracking-[0.4em] uppercase font-bold border border-white px-8 md:px-12 py-3 md:py-4 hover:bg-white hover:text-black transition-colors"
          >
             [START]
          </button>
        ) : state.status === 'RUNNING' ? (
          <button
            onClick={() => dispatch({ type: 'PAUSE' })}
            className="text-[0.7rem] md:text-[0.75rem] tracking-[0.4em] uppercase font-bold border border-white px-8 md:px-12 py-3 md:py-4 hover:bg-white hover:text-black transition-colors"
          >
             [HALT]
          </button>
        ) : state.status === 'PAUSED' ? (
          <div className="flex flex-wrap justify-center lg:justify-start gap-3 md:gap-4">
             <button
              onClick={() => dispatch({ type: 'RESUME' })}
              className="text-[0.7rem] md:text-[0.75rem] tracking-[0.4em] uppercase font-bold border border-white px-8 md:px-12 py-3 md:py-4 hover:bg-white hover:text-black transition-colors"
            >
               [RESUME]
            </button>
            <button
              onClick={() => dispatch({ type: 'VOID' })}
              className="text-[0.7rem] md:text-[0.75rem] tracking-[0.4em] uppercase font-bold border border-white/20 px-6 md:px-8 py-3 md:py-4 hover:border-white transition-colors"
            >
               [VOID SESSION]
            </button>
          </div>
        ) : (
          <button
            onClick={() => dispatch({ type: 'VOID' })}
            className="text-[0.7rem] md:text-[0.75rem] tracking-[0.4em] uppercase font-bold border border-white px-8 md:px-12 py-3 md:py-4 hover:bg-white hover:text-black transition-colors"
          >
             [CONCLUDE]
          </button>
        )}
      </div>
    </div>
  );
}

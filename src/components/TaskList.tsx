/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, memo } from 'react';
import { useTasks, Task } from './TaskContext';
import { motion, AnimatePresence } from 'motion/react';
import { useTimer } from './TimerContext';

const TaskItem = memo(({ task, isFocused, onToggle, onRemove }: { 
  task: Task, 
  isFocused: boolean, 
  onToggle: (id: string) => void,
  onRemove: (id: string) => void
}) => (
  <motion.div
    layout
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: task.completed ? 0.3 : (isFocused ? 1 : 0.6), x: 0 }}
    exit={{ opacity: 0, x: -20 }}
    onClick={() => task.completed ? onRemove(task.id) : onToggle(task.id)}
    className={`group cursor-pointer py-3 border-b border-white/5 transition-all transition-editorial hover:opacity-100 flex justify-between items-center ${task.completed ? 'line-through' : ''}`}
  >
    <div className="flex flex-col">
       <span className={`${isFocused ? 'text-lg font-bold' : 'text-sm font-light'} tracking-tight`}>
         {task.text}
       </span>
       {isFocused && !task.completed && (
         <span className="text-[0.5rem] tracking-[0.3em] uppercase opacity-30 mt-1">MAIN_OBJECTIVE</span>
       )}
    </div>
    <span className="text-[0.6rem] opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-widest font-bold">
      {task.completed ? '[DEL]' : '[DONE]'}
    </span>
  </motion.div>
));

export default function TaskList() {
  const { tasks, addTask, toggleTask, removeTask } = useTasks();
  const { state: timerState } = useTimer();
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      addTask(inputValue);
      setInputValue('');
    }
  };

  const isFlowActive = timerState.status === 'RUNNING';
  const incompleteTasks = tasks.filter(t => !t.completed);
  const completedTasks = tasks.filter(t => t.completed);

  return (
    <div 
      className={`w-full lg:max-w-sm flex flex-col h-full gap-8 md:gap-12 transition-editorial ${isFlowActive ? 'opacity-10 hover:opacity-100' : 'opacity-100'}`}
    >
      <form onSubmit={handleSubmit} className="w-full">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="[+ TASK]"
          className="w-full bg-transparent border-b border-white py-4 outline-none text-[0.7rem] tracking-[0.3em] uppercase font-bold placeholder:opacity-20"
        />
      </form>

      <div className="flex-1 overflow-y-auto space-y-12 pr-4 custom-scrollbar">
        <section>
          <h2 className="text-[0.5rem] tracking-[0.5em] font-bold uppercase opacity-20 mb-8 select-none">QUEUE</h2>
          <AnimatePresence mode="popLayout">
            {incompleteTasks.map((task, index) => (
              <TaskItem
                key={task.id}
                task={task}
                isFocused={index === 0}
                onToggle={toggleTask}
                onRemove={removeTask}
              />
            ))}
          </AnimatePresence>
          {incompleteTasks.length === 0 && (
            <p className="text-[0.6rem] tracking-widest opacity-20 italic">No tasks active.</p>
          )}
        </section>

        {completedTasks.length > 0 && (
          <section>
             <h2 className="text-[0.5rem] tracking-[0.5em] font-bold uppercase opacity-20 mb-8 select-none">HISTORY</h2>
             <div className="space-y-0">
               <AnimatePresence mode="popLayout">
                {completedTasks.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    isFocused={false}
                    onToggle={toggleTask}
                    onRemove={removeTask}
                  />
                ))}
              </AnimatePresence>
             </div>
          </section>
        )}
      </div>
    </div>
  );
}

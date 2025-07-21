"use client";

import React from 'react';
import type { Task } from '@/lib/types';
import TaskItem from './task-item';

type TaskListProps = {
  tasks: Task[];
  onToggleComplete: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onUpdateTask: (id: string, newDescription: string, newDueDate?: Date) => void;
};

const TaskList: React.FC<TaskListProps> = ({ tasks, onToggleComplete, onDeleteTask, onUpdateTask }) => {
  return (
    <div className="space-y-3">
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          onToggleComplete={onToggleComplete}
          onDeleteTask={onDeleteTask}
          onUpdateTask={onUpdateTask}
        />
      ))}
    </div>
  );
};

export default TaskList;

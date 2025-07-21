
"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import type { Task } from '@/lib/types';
import { estimateTaskCompletionTime } from '@/ai/flows/estimate-task-completion-time';
import { warnOverloadedSchedule } from '@/ai/flows/warn-overloaded-schedule';
import { useToast } from '@/hooks/use-toast';
import { useHasMounted } from '@/hooks/use-has-mounted';

import AddTaskForm from './add-task-form';
import TaskList from './task-list';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { CheckCircle2, Loader2 } from 'lucide-react';

const ClarityListPage: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const { toast } = useToast();
  const hasMounted = useHasMounted();

  useEffect(() => {
    if (hasMounted) {
      try {
        const storedTasks = localStorage.getItem('clarity-list-tasks');
        if (storedTasks) {
          setTasks(JSON.parse(storedTasks));
        }
      } catch (error) {
        console.error('Failed to load tasks from localStorage', error);
      }
    }
  }, [hasMounted]);

  useEffect(() => {
    if (hasMounted) {
      try {
        localStorage.setItem('clarity-list-tasks', JSON.stringify(tasks));
      } catch (error) {
        console.error('Failed to save tasks to localStorage', error);
      }
    }
  }, [tasks, hasMounted]);

  const sortedTasks = useMemo(() => {
    return [...tasks].sort((a, b) => {
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1;
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [tasks]);

  const handleAddTask = useCallback(async (description: string, dueDate?: Date) => {
    setIsAiLoading(true);
    try {
      const pastTasks = tasks
        .filter(t => t.completed && t.completionTimeMinutes)
        .map(t => ({
          description: t.description,
          completionTimeMinutes: t.completionTimeMinutes!,
        }));

      const { estimatedCompletionTimeMinutes } = await estimateTaskCompletionTime({
        taskDescription: description,
        pastTasks,
      });
      
      const newTask: Task = {
        id: crypto.randomUUID(),
        description,
        completed: false,
        createdAt: new Date().toISOString(),
        dueDate: dueDate ? dueDate.toISOString().split('T')[0] : undefined,
        estimatedTime: estimatedCompletionTimeMinutes,
      };

      const updatedTasks = [...tasks, newTask];
      setTasks(updatedTasks);
      
      toast({
        title: "Task Added",
        description: `Estimated time: ${estimatedCompletionTimeMinutes} minutes.`,
      });

      if (newTask.dueDate) {
        const tasksForDueDate = updatedTasks.filter(t => t.dueDate === newTask.dueDate);
        const historicalCompletionTimes = tasks
          .filter(t => t.completed && t.completionTimeMinutes)
          .map(t => t.completionTimeMinutes!);

        const { isOverloaded, warningMessage } = await warnOverloadedSchedule({
          tasks: tasksForDueDate.map(t => ({ description: t.description, dueDate: t.dueDate! })),
          historicalCompletionTimes,
        });

        if (isOverloaded) {
          toast({
            variant: "destructive",
            title: "Schedule Alert",
            description: warningMessage,
          });
        }
      }
    } catch (error) {
      console.error('AI operation failed', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not get AI-powered estimations. Task added with default values.',
      });
       const newTask: Task = {
        id: crypto.randomUUID(),
        description,
        completed: false,
        createdAt: new Date().toISOString(),
        dueDate: dueDate ? dueDate.toISOString().split('T')[0] : undefined,
      };
      setTasks(prev => [...prev, newTask]);
    } finally {
      setIsAiLoading(false);
    }
  }, [tasks, toast]);

  const handleToggleComplete = useCallback((id: string) => {
    setTasks(prevTasks =>
      prevTasks.map(task => {
        if (task.id === id) {
          const isCompleted = !task.completed;
          const completedAt = isCompleted ? new Date().toISOString() : undefined;
          const completionTimeMinutes = isCompleted
            ? Math.round((new Date(completedAt!).getTime() - new Date(task.createdAt).getTime()) / 60000)
            : undefined;
          
          return { ...task, completed: isCompleted, completedAt, completionTimeMinutes };
        }
        return task;
      })
    );
  }, []);

  const handleDeleteTask = useCallback((id: string) => {
    setTasks(prevTasks => prevTasks.filter(task => task.id !== id));
    toast({ title: "Task Deleted", description: "The task has been removed." });
  }, [toast]);

  const handleUpdateTask = useCallback((id:string, newDescription: string, newDueDate?: Date) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === id ? { 
          ...task, 
          description: newDescription,
          dueDate: newDueDate ? newDueDate.toISOString().split('T')[0] : undefined
        } : task
      )
    );
    toast({ title: "Task Updated", description: "Your changes have been saved." });
  }, [toast]);

  if (!hasMounted) {
    return (
       <div className="space-y-8 max-w-2xl mx-auto">
        <header className="text-center space-y-2">
          <h1 className="text-4xl font-headline font-bold text-gray-800">Clarity List</h1>
          <p className="text-muted-foreground">Your clean and intuitive to-do list.</p>
        </header>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline">Add New Task</CardTitle>
          </CardHeader>
          <CardContent>
             <AddTaskForm onAddTask={handleAddTask} isLoading={true} />
          </CardContent>
        </Card>
        
        <div className="text-center py-12 px-4 bg-background rounded-lg shadow-sm border border-dashed flex items-center justify-center">
            <Loader2 className="mr-2 h-6 w-6 animate-spin text-muted-foreground" />
            <p className="text-muted-foreground">Loading tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <header className="text-center space-y-2">
        <h1 className="text-4xl font-headline font-bold text-gray-800">Clarity List</h1>
        <p className="text-muted-foreground">Your clean and intuitive to-do list.</p>
      </header>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline">Add New Task</CardTitle>
        </CardHeader>
        <CardContent>
          <AddTaskForm onAddTask={handleAddTask} isLoading={isAiLoading} />
        </CardContent>
      </Card>
      
      {sortedTasks.length > 0 ? (
        <TaskList
          tasks={sortedTasks}
          onToggleComplete={handleToggleComplete}
          onDeleteTask={handleDeleteTask}
          onUpdateTask={handleUpdateTask}
        />
      ) : (
        <div className="text-center py-12 px-4 bg-background rounded-lg shadow-sm border border-dashed">
            <CheckCircle2 className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 font-headline">All clear!</h3>
            <p className="mt-1 text-sm text-muted-foreground">You have no pending tasks. Add one above to get started.</p>
        </div>
      )}
    </div>
  );
};

export default ClarityListPage;

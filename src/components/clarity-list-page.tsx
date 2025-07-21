"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import type { Task } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useHasMounted } from '@/hooks/use-has-mounted';

import AddTaskForm from './add-task-form';
import TaskList from './task-list';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { CheckCircle2, Loader2 } from 'lucide-react';

const ClarityListPage: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(false);
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
      if (a.dueDate && b.dueDate) {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      if (a.dueDate) return -1;
      if (b.dueDate) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [tasks]);

  const handleAddTask = useCallback(async (description: string, dueDate?: Date) => {
    setIsLoading(true);
    try {
      const newTask: Task = {
        id: crypto.randomUUID(),
        description,
        completed: false,
        createdAt: new Date().toISOString(),
        dueDate: dueDate ? dueDate.toISOString() : undefined,
      };

      const updatedTasks = [...tasks, newTask];
      setTasks(updatedTasks);
      
      toast({
        title: "Task Added",
        description: "Your new task has been added to the list.",
      });

    } catch (error) {
      console.error('Failed to add task', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not add the task. Please try again.',
      });
    } finally {
      setIsLoading(false);
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
          dueDate: newDueDate ? newDueDate.toISOString() : undefined
        } : task
      )
    );
    toast({ title: "Task Updated", description: "Your changes have been saved." });
  }, [toast]);
  
  const loadingState = (
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
           <div className="flex items-center justify-center h-24">
              <Loader2 className="mr-2 h-6 w-6 animate-spin text-muted-foreground" />
              <p className="text-muted-foreground">Loading form...</p>
           </div>
        </CardContent>
      </Card>
      <div className="text-center py-12 px-4 bg-background rounded-lg shadow-sm border border-dashed flex items-center justify-center">
          <Loader2 className="mr-2 h-6 w-6 animate-spin text-muted-foreground" />
          <p className="text-muted-foreground">Loading tasks...</p>
      </div>
    </div>
  );

  if (!hasMounted) {
    return loadingState;
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
           <AddTaskForm onAddTask={handleAddTask} isLoading={isLoading} />
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
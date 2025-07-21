"use client";

import React, { useState, useRef, useEffect } from 'react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import type { Task } from '@/lib/types';

import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { CalendarIcon, Clock, MoreVertical, Pencil, Save, Trash2, X } from 'lucide-react';
import { Popover, PopoverTrigger, PopoverContent } from './ui/popover';
import { Calendar } from './ui/calendar';

type TaskItemProps = {
  task: Task;
  onToggleComplete: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onUpdateTask: (id: string, newDescription: string, newDueDate?: Date) => void;
};

const TaskItem: React.FC<TaskItemProps> = ({ task, onToggleComplete, onDeleteTask, onUpdateTask }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedDescription, setEditedDescription] = useState(task.description);
  const [editedDueDate, setEditedDueDate] = useState<Date | undefined>(task.dueDate ? new Date(task.dueDate) : undefined);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);
  
  const handleUpdate = () => {
    if (editedDescription.trim()) {
      onUpdateTask(task.id, editedDescription, editedDueDate);
      setIsEditing(false);
    }
  };

  const handleCancelEdit = () => {
    setEditedDescription(task.description);
    setEditedDueDate(task.dueDate ? new Date(task.dueDate) : undefined);
    setIsEditing(false);
  }

  return (
    <>
      <div className={cn("flex items-center gap-4 p-4 bg-card rounded-lg shadow-sm transition-all duration-300", task.completed && "bg-gray-50")}>
        <Checkbox
          id={`task-${task.id}`}
          checked={task.completed}
          onCheckedChange={() => onToggleComplete(task.id)}
          className="h-5 w-5"
          aria-label={`Mark ${task.description} as ${task.completed ? 'incomplete' : 'complete'}`}
        />
        <div className="flex-1 space-y-1">
          {isEditing ? (
            <div className="flex items-center gap-2">
              <Input
                ref={inputRef}
                value={editedDescription}
                onChange={(e) => setEditedDescription(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleUpdate()}
                className="h-8"
              />
            </div>
          ) : (
            <p className={cn("font-medium", task.completed && "line-through text-muted-foreground")}>
              {task.description}
            </p>
          )}

          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            {isEditing ? (
                <Popover>
                  <PopoverTrigger asChild>
                      <Button variant="outline" size="sm" className="h-7 text-xs">
                        <CalendarIcon className="mr-1.5 h-3 w-3" />
                        {editedDueDate ? format(editedDueDate, "MMM d") : "Set date"}
                      </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={editedDueDate}
                      onSelect={setEditedDueDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
            ) : (
              task.dueDate && (
                <div className="flex items-center gap-1.5">
                  <CalendarIcon className="h-3 w-3" />
                  <span>{format(new Date(task.dueDate), "MMM d, yyyy")}</span>
                </div>
              )
            )}
            
            {task.estimatedTime && (
              <div className="flex items-center gap-1.5">
                <Clock className="h-3 w-3" />
                <span>{task.estimatedTime} min</span>
              </div>
            )}
          </div>
        </div>

        {isEditing ? (
          <div className="flex items-center gap-2">
              <Button size="icon" variant="ghost" className="h-8 w-8 text-green-600 hover:text-green-600" onClick={handleUpdate}><Save className="h-4 w-4"/></Button>
              <Button size="icon" variant="ghost" className="h-8 w-8 text-gray-500 hover:text-gray-500" onClick={handleCancelEdit}><X className="h-4 w-4"/></Button>
          </div>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">Task options</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setIsEditing(true)}>
                <Pencil className="mr-2 h-4 w-4" />
                <span>Edit</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowDeleteConfirm(true)} className="text-destructive focus:text-destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                <span>Delete</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the task "{task.description}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => onDeleteTask(task.id)} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default TaskItem;

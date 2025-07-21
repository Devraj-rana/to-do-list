export type Task = {
  id: string;
  description: string;
  completed: boolean;
  createdAt: string; // ISO string
  dueDate?: string; // ISO string
  estimatedTime?: number; // in minutes
  completedAt?: string; // ISO string
  completionTimeMinutes?: number; // duration in minutes
};

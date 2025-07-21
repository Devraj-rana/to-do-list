"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { format } from "date-fns";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, PlusCircle, Loader2 } from "lucide-react";

const formSchema = z.object({
  description: z.string().min(3, "Task description must be at least 3 characters."),
  dueDate: z.date().optional(),
  dueTime: z.string().optional(),
}).refine(data => {
  // If dueTime is provided, dueDate must also be provided.
  if (data.dueTime && !data.dueDate) {
    return false;
  }
  return true;
}, {
  message: "A date is required when a time is set.",
  path: ["dueDate"],
});

type AddTaskFormProps = {
  onAddTask: (description: string, dueDate?: Date) => Promise<void>;
  isLoading: boolean;
};

const AddTaskForm: React.FC<AddTaskFormProps> = ({ onAddTask, isLoading }) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: "",
      dueTime: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    let combinedDate: Date | undefined = undefined;
    if (values.dueDate) {
      combinedDate = new Date(values.dueDate);
      if (values.dueTime) {
        const [hours, minutes] = values.dueTime.split(':').map(Number);
        combinedDate.setHours(hours, minutes);
      }
    }
    await onAddTask(values.description, combinedDate);
    form.reset();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="sr-only">Task Description</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Finish project proposal" {...field} disabled={isLoading} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex gap-2 w-full">
            <FormField
              control={form.control}
              name="dueDate"
              render={({ field }) => (
                <FormItem className="flex flex-col flex-grow">
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                          disabled={isLoading}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date < new Date(new Date().setHours(0,0,0,0))}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="dueTime"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input type="time" {...field} disabled={isLoading || !form.watch('dueDate')} className="w-[120px]"/>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <Button type="submit" className="w-full sm:w-auto flex-shrink-0" disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <PlusCircle className="mr-2 h-4 w-4" />
            )}
            Add Task
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default AddTaskForm;

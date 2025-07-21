// src/ai/flows/warn-overloaded-schedule.ts
'use server';

/**
 * @fileOverview Warns the user if they are assigning too many tasks to a single day.
 *
 * - warnOverloadedSchedule - A function that warns the user if their schedule is overloaded.
 * - WarnOverloadedScheduleInput - The input type for the warnOverloadedSchedule function.
 * - WarnOverloadedScheduleOutput - The return type for the warnOverloadedSchedule function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const WarnOverloadedScheduleInputSchema = z.object({
  tasks: z
    .array(
      z.object({
        description: z.string().describe('The description of the task.'),
        dueDate: z.string().describe('The due date of the task (YYYY-MM-DD).'),
      })
    )
    .describe('The list of tasks to be scheduled.'),
  historicalCompletionTimes: z
    .array(z.number())
    .describe(
      'The historical completion times for tasks, in minutes.  Empty array if no data.'
    ),
});
export type WarnOverloadedScheduleInput = z.infer<typeof WarnOverloadedScheduleInputSchema>;

const WarnOverloadedScheduleOutputSchema = z.object({
  isOverloaded: z.boolean().describe('Whether the schedule is overloaded.'),
  estimatedCompletionTime: z
    .number() // time in minutes
    .describe(
      'The estimated time to complete all tasks, in minutes, or null if no tasks are provided.'
    ),
  warningMessage: z
    .string()
    .describe(
      'A warning message if the schedule is overloaded, or an empty string otherwise.'
    ),
});

export type WarnOverloadedScheduleOutput = z.infer<typeof WarnOverloadedScheduleOutputSchema>;

export async function warnOverloadedSchedule(input: WarnOverloadedScheduleInput): Promise<WarnOverloadedScheduleOutput> {
  return warnOverloadedScheduleFlow(input);
}

const prompt = ai.definePrompt({
  name: 'warnOverloadedSchedulePrompt',
  input: {schema: WarnOverloadedScheduleInputSchema},
  output: {schema: WarnOverloadedScheduleOutputSchema},
  prompt: `You are a scheduling assistant that helps users avoid overcommitting themselves.  You will review their schedule and their historical task completion times, and warn them if they are assigning too many tasks to a single day.

  Here is the list of tasks to be scheduled:

  {{#each tasks}}
  - {{dueDate}}: {{description}}
  {{/each}}

  Here are the historical completion times for tasks (in minutes): {{historicalCompletionTimes}}

  Based on this information, determine if the schedule is overloaded. If the historicalCompletionTimes array is empty, assume that each task will take 60 minutes to complete.

  Output whether the schedule is overloaded (isOverloaded), the estimated completion time for all tasks (estimatedCompletionTime), and a warning message (warningMessage). If isOverloaded is false, the warningMessage should be an empty string.

  The warning message should be friendly and helpful, for example: "Warning: You may be overcommitting yourself on this day. The estimated completion time for all tasks is X minutes, which is more than you have historically been able to complete."

  If there are no tasks, return isOverloaded: false, estimatedCompletionTime: 0, warningMessage: "".
`,
});

const warnOverloadedScheduleFlow = ai.defineFlow(
  {
    name: 'warnOverloadedScheduleFlow',
    inputSchema: WarnOverloadedScheduleInputSchema,
    outputSchema: WarnOverloadedScheduleOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);


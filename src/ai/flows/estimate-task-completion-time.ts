'use server';
/**
 * @fileOverview An AI agent for estimating task completion time based on past task history.
 *
 * - estimateTaskCompletionTime - A function that estimates the completion time for a given task.
 * - EstimateTaskCompletionTimeInput - The input type for the estimateTaskCompletionTime function.
 * - EstimateTaskCompletionTimeOutput - The return type for the estimateTaskCompletionTime function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EstimateTaskCompletionTimeInputSchema = z.object({
  taskDescription: z.string().describe('The description of the task to estimate completion time for.'),
  pastTasks: z.array(
    z.object({
      description: z.string().describe('Description of the past task.'),
      completionTimeMinutes: z.number().describe('Completion time in minutes for the past task.'),
    })
  ).describe('A list of past tasks with their descriptions and completion times.'),
});
export type EstimateTaskCompletionTimeInput = z.infer<typeof EstimateTaskCompletionTimeInputSchema>;

const EstimateTaskCompletionTimeOutputSchema = z.object({
  estimatedCompletionTimeMinutes: z.number().describe('The estimated completion time in minutes.'),
  reasoning: z.string().describe('The reasoning behind the estimated completion time.'),
});
export type EstimateTaskCompletionTimeOutput = z.infer<typeof EstimateTaskCompletionTimeOutputSchema>;

export async function estimateTaskCompletionTime(input: EstimateTaskCompletionTimeInput): Promise<EstimateTaskCompletionTimeOutput> {
  return estimateTaskCompletionTimeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'estimateTaskCompletionTimePrompt',
  input: {schema: EstimateTaskCompletionTimeInputSchema},
  output: {schema: EstimateTaskCompletionTimeOutputSchema},
  prompt: `You are a helpful assistant that estimates the completion time for a given task based on the user's past task history.

  Analyze the past tasks and their completion times to estimate how long the new task will take. Consider the similarity between the new task and the past tasks.
  If there are no past tasks, provide a reasonable estimate based on the task description.

  New Task Description: {{{taskDescription}}}

  Past Tasks:
  {{#each pastTasks}}
  - Description: {{{description}}}, Completion Time: {{{completionTimeMinutes}}} minutes
  {{/each}}

  Provide the estimated completion time in minutes and the reasoning behind your estimate.
  `,
});

const estimateTaskCompletionTimeFlow = ai.defineFlow(
  {
    name: 'estimateTaskCompletionTimeFlow',
    inputSchema: EstimateTaskCompletionTimeInputSchema,
    outputSchema: EstimateTaskCompletionTimeOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);


'use server';
/**
 * @fileOverview A class routine generation AI flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const TeacherAllocationSchema = z.record(z.string(), z.record(z.string(), z.array(z.string())));

export const GenerateRoutineInputSchema = z.object({
  teacherAllocations: TeacherAllocationSchema.describe("A mapping of teachers to the subjects and classes they are assigned to."),
});
export type GenerateRoutineInput = z.infer<typeof GenerateRoutineInputSchema>;


const RoutineSchema = z.record(z.string(), z.record(z.string(), z.array(z.string().nullable()).length(6)));
export const GenerateRoutineOutputSchema = z.object({
    routine: RoutineSchema.describe("The generated class routine. The format is { className: { dayOfWeek: [period1, period2, ...] } }. Days are 'রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার'. Periods are 6 per day. Cell format is 'Subject - Teacher'.")
});
export type GenerateRoutineOutput = z.infer<typeof GenerateRoutineOutputSchema>;


export async function generateRoutine(input: GenerateRoutineInput): Promise<GenerateRoutineOutput> {
  return generateRoutineFlow(input);
}

const prompt = ai.definePrompt({
    name: 'generateRoutinePrompt',
    input: { schema: GenerateRoutineInputSchema },
    output: { schema: GenerateRoutineOutputSchema },
    prompt: `You are an expert school administrator tasked with creating a weekly class routine for a high school in Bangladesh.

You will be given the teacher allocations, which specify which teacher is assigned to which subject for specific classes.

Your task is to generate a complete, balanced, and conflict-free routine for all classes (6, 7, 8, 9, and 10).

**Classes & Groups:**
- Classes 6, 7, 8 are general.
- Classes 9 and 10 have three groups each: Science (বিজ্ঞান), Arts (মানবিক), and Commerce (ব্যবসায় শিক্ষা).

**Routine Structure:**
- The week has 5 working days: রবিবার, সোমবার, মঙ্গলবার, বুধবার, বৃহস্পতিবার.
- Each day has 6 periods.
- There is a mandatory break after the 3rd period.
- Each class must have a total of 30 periods per week (6 periods/day * 5 days).

**Core Constraints (MUST be followed):**
1.  **Teacher Clash:** A teacher cannot be in two different classrooms at the same time.
2.  **Subject Distribution:** Distribute the subjects for each class as evenly as possible throughout the week. Try to avoid repeating the same subject on the same day for a class, with the exception of core language subjects like Bangla and English which may appear twice.
3.  **Teacher Workload:** Avoid assigning a teacher consecutive periods (e.g., 1st and 2nd) in the SAME class. Also, avoid assigning a teacher the period just before the break (3rd) and the one just after (4th) in the SAME class.
4.  **Correct Allocation:** Teachers must ONLY be assigned to subjects and classes as specified in the provided \`teacherAllocations\` data.
5.  **Combined Classes (9 & 10):** For classes 9 and 10, the routine for all three groups (Science, Arts, Commerce) must be represented in a single class row. If different groups have different subjects in the same period, combine them in the cell using a '/' separator.
    - Example: If Science has Physics and Arts has History in the same period, the cell should look like 'পদার্থ/বাংলাদেশের ইতিহাস ও বিশ্বসভ্যতা - TeacherForPhysics/TeacherForHistory'.
    - If a subject is common to all groups (like Bangla), just list it once.
6.  **Combined Teachers:** If a subject is taught by multiple teachers for the same class (e.g., Religion for class 7), represent it as 'ধর্ম - আনিছুর/নীলা'.

The output must be a JSON object matching the provided schema. The cells in the routine must be in the format "Subject - Teacher" or "Subject - Teacher1/Teacher2" or "Subject1/Subject2 - Teacher1/Teacher2". An empty string means no class.

**Input Data:**

**Teacher Allocations:**
\`\`\`json
{{{json teacherAllocations}}}
\`\`\`

Now, generate the complete, balanced, and conflict-free weekly routine.
`,
});

const generateRoutineFlow = ai.defineFlow(
  {
    name: 'generateRoutineFlow',
    inputSchema: GenerateRoutineInputSchema,
    outputSchema: GenerateRoutineOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error("Failed to generate routine.");
    }
    return output;
  }
);

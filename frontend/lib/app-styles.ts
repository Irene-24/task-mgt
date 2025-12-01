import { TaskStatus } from "./types/task.types";

export const FORM_STYLES = {
  auth_label: `font-light text-base`,
  auth_input: `py-2.5 h-unset min-h-9  `,
  auth_form: `bg-card text-card-foreground rounded-xl p-4 shadow-sm space-y-3 py-7 `,
  alt_action: `text-sm text-center text-muted-foreground mt-4`,
  submitBtn: `mx-auto max-w-[90%] py-2.5 mt-5! w-full block text-base  h-unset rounded-xl disabled:cursor-not-allowed!`,
};

export const TASK_STYLES = {
  header: `font-semibold text-base truncate`,
  description: "text-sm text-muted-foreground mb-4 flex-1",
  badges: {
    shared: `text-xs capitalize px-2 py-1 rounded-full`,
    [TaskStatus.COMPLETED]: `bg-chart-3/50`,
    [TaskStatus.PENDING]: `bg-accent`,
  },
  task: `w-full p-4 border rounded-md`,
};

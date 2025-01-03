export type StepType = "email_1" | "email_2" | "linkedin_connection" | "linkedin_message_1" | "linkedin_message_2";
export type DatabaseStepType = "email" | "linkedin";

export interface SequenceStep {
  id: string;
  step_number: number;
  step_type: StepType;
  message_template: string;
  delay_days: number;
  count?: number; // Added count as optional property
}

export interface DatabaseSequenceStep {
  id: string;
  sequence_id: string;
  step_number: number;
  step_type: DatabaseStepType;
  message_template: string | null;
  delay_days: number | null;
  preferred_time: string | null;
  created_at: string;
  count?: number;
}

export interface SequenceAssignment {
  id: string;
  status: string;
  current_step: number;
  prospect: {
    company_name: string;
    contact_email: string | null;
    contact_linkedin: string | null;
    contact_job_title: string | null;
  };
}

export interface Sequence {
  id: string;
  created_at: string;
  user_id: string;
  name: string;
  description: string | null;
  status: 'active' | 'paused' | 'completed';
  max_steps: number;
  sequence_steps?: SequenceStep[];
  sequence_assignments?: SequenceAssignment[];
}
export interface Question {
    id: string;
    question: string; // e.g., "Q1: How often do you exercise?"
    options: string[]; // e.g., ["Daily", "3-5 times/week", ...]
};

export interface SubmitPayload {
    chainId: string;
    account: string;
    answers: Record<string, string>;
    signature: string;
    timestamp: string
};

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}
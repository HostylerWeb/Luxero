export interface ContextualErrorAction {
  label: string;
  href: string;
  focus?: string;
  reason?: string;
}

export interface ContextualError {
  message: string;
  code?: string;
  action?: ContextualErrorAction;
}

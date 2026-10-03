export interface SubscriptionPlan {
  tier: string;
  label: string;
  name: string;
  price: number;
  description?: string;
  features?: string[];
  entriesPerCompetition: number;
}

export interface SubscriptionPlansResponse {
  providers: string[];
  plans: Record<string, SubscriptionPlan[]>;
}

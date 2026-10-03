import { Check } from "lucide-react";

interface Step {
  label: string;
}

interface CheckoutProgressProps {
  steps: Step[];
  currentStep: number;
}

export function CheckoutProgress({ steps, currentStep }: CheckoutProgressProps) {
  return (
    <div className="flex items-center justify-center">
      <div className="flex items-center">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isActive = stepNumber === currentStep;

          return (
            <div key={step.label} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`flex size-10 items-center justify-center rounded-full text-sm font-medium transition-colors ${
                    isCompleted
                      ? "bg-gold text-black"
                      : isActive
                        ? "bg-gold text-black"
                        : "bg-muted text-muted-foreground"
                  }`}
                >
                  {isCompleted ? <Check className="size-4" /> : stepNumber}
                </div>
                <span
                  className={`mt-2 text-xs font-medium ${
                    isActive
                      ? "text-gold"
                      : isCompleted
                        ? "text-foreground"
                        : "text-muted-foreground"
                  }`}
                >
                  {step.label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`mx-3 h-1 w-16 rounded transition-colors ${
                    stepNumber < currentStep ? "bg-gold" : "bg-muted"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

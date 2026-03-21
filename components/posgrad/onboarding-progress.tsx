interface OnboardingProgressProps {
  step: number;
  total: number;
}

export function OnboardingProgress({ step, total }: OnboardingProgressProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex gap-1.5">
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            className={`h-1.5 rounded-full transition-all ${
              i < step ? "w-8 bg-indigo-600" : "w-4 bg-gray-200"
            }`}
          />
        ))}
      </div>
      <span className="text-xs text-gray-400">
        {step} de {total}
      </span>
    </div>
  );
}

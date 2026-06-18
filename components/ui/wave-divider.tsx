type WaveDividerProps = {
  className?: string;
};

export function WaveDivider({ className = "" }: WaveDividerProps) {
  return (
    <div className={`w-full text-primary/20 ${className}`} aria-hidden>
      <svg viewBox="0 0 1200 48" preserveAspectRatio="none" className="h-6 w-full md:h-8">
        <path
          fill="currentColor"
          d="M0,24 C150,48 350,0 600,24 C850,48 1050,0 1200,24 L1200,48 L0,48 Z"
        />
      </svg>
    </div>
  );
}

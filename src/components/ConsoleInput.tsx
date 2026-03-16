import { forwardRef } from "react";

interface ConsoleInputProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  type?: string;
  placeholder?: string;
}

const ConsoleInput = forwardRef<HTMLInputElement, ConsoleInputProps>(
  ({ label, value, onChange, type = "text", placeholder }, ref) => {
    return (
      <div className="flex items-center gap-2 text-sm mb-2">
        <span className="text-primary shrink-0">{label}</span>
        <input
          ref={ref}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="bg-muted border border-console rounded px-2 py-1 text-foreground font-mono text-sm flex-1 outline-none focus:border-primary focus:ring-1 focus:ring-primary/30"
        />
      </div>
    );
  }
);
ConsoleInput.displayName = "ConsoleInput";

export default ConsoleInput;

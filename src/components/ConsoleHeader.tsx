interface ConsoleHeaderProps {
  breadcrumb?: string;
}

const ConsoleHeader = ({ breadcrumb }: ConsoleHeaderProps) => {
  return (
    <div className="mb-6">
      <pre className="text-primary glow-primary text-sm md:text-base leading-tight">
{`
 ╔══════════════════════════════════════════════════╗
 ║     MEDICAL INVENTORY & EXPIRY TRACKING SYSTEM   ║
 ║              Student Prototype v1.0               ║
 ╚══════════════════════════════════════════════════╝`}
      </pre>
      {breadcrumb && (
        <p className="text-muted-foreground mt-2 text-sm">
          {">"} {breadcrumb}
        </p>
      )}
    </div>
  );
};

export default ConsoleHeader;

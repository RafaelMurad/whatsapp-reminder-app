import { cn } from "@/lib/utils";

/**
 * ErrorAlert - Displays general error alert box
 *
 * Used for form-level errors (invalid credentials, network errors, etc.)
 *
 * @example
 * ```tsx
 * <ErrorAlert>Invalid email or password</ErrorAlert>
 * ```
 */
interface ErrorAlertProps {
  children: React.ReactNode;
  className?: string;
}

export function ErrorAlert({ children, className }: ErrorAlertProps) {
  return (
    <div
      role="alert"
      aria-live="assertive"
      className={cn(
        "rounded-md bg-destructive/10 p-3 text-sm text-destructive flex items-start gap-2",
        className
      )}
    >
      <span className="text-base mt-0.5" aria-hidden="true">
        ⚠
      </span>
      <p>{children}</p>
    </div>
  );
}

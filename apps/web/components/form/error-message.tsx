import { cn } from "@/lib/utils";

/**
 * ErrorMessage - Displays inline error text with warning icon
 *
 * Used for field-level errors (email invalid, password too short, etc.)
 *
 * @example
 * ```tsx
 * <ErrorMessage id="email-error">
 *   This email is already registered
 * </ErrorMessage>
 * ```
 */
interface ErrorMessageProps {
  id?: string;
  children: React.ReactNode;
  className?: string;
}

export function ErrorMessage({ id, children, className }: ErrorMessageProps) {
  return (
    <p
      id={id}
      className={cn(
        "text-sm text-destructive flex items-center gap-1",
        className
      )}
    >
      <span className="text-base" aria-hidden="true">
        ⚠
      </span>
      {children}
    </p>
  );
}

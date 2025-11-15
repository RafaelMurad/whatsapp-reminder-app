import { cloneElement, useId } from "react";
import { Label } from "@/components/ui/label";
import { ErrorMessage } from "./error-message";
import { cn } from "@/lib/utils";

/**
 * FormField - Accessible form field with label, input, and error handling
 *
 * Wraps any input-like component (Input, Textarea, Select) with:
 * - Label with required indicator
 * - Error message display
 * - Helper text (hint)
 * - Automatic ARIA attributes
 * - Error styling
 *
 * @example
 * ```tsx
 * <FormField
 *   label="Email"
 *   error={errors.email}
 *   hint="We'll never share your email"
 *   required
 * >
 *   <Input
 *     type="email"
 *     value={email}
 *     onChange={(e) => setEmail(e.target.value)}
 *   />
 * </FormField>
 * ```
 */
interface FormFieldProps {
  /** Field label text */
  label: string;
  /** Error message to display (replaces hint) */
  error?: string;
  /** Helper text shown below input when no error */
  hint?: string;
  /** Show required indicator (*) */
  required?: boolean;
  /** Single input element (Input, Textarea, etc.) */
  children: React.ReactElement;
  /** Optional class for wrapper div */
  className?: string;
}

export function FormField({
  label,
  error,
  hint,
  required,
  children,
  className,
}: FormFieldProps) {
  // Generate unique IDs for accessibility
  const generatedId = useId();
  const id = children.props.id || generatedId;
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;

  return (
    <div className={cn("space-y-2", className)}>
      {/* Label with required indicator */}
      <Label htmlFor={id}>
        {label}
        {required && (
          <span className="text-destructive ml-1" aria-label="required">
            *
          </span>
        )}
      </Label>

      {/* Clone input element and inject accessibility props */}
      {cloneElement(children, {
        id,
        "aria-invalid": !!error,
        "aria-describedby": error ? errorId : hint ? hintId : undefined,
        "aria-required": required,
        className: cn(
          children.props.className,
          error && "border-destructive focus-visible:ring-destructive"
        ),
      })}

      {/* Error message or hint */}
      {error ? (
        <ErrorMessage id={errorId}>{error}</ErrorMessage>
      ) : hint ? (
        <p id={hintId} className="text-xs text-muted-foreground">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

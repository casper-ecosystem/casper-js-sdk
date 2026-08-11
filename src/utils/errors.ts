/**
 * Normalizes an unknown caught value into an Error.
 *
 * Under `useUnknownInCatchVariables` a `catch` binding is `unknown`, which is
 * the truth: JavaScript permits `throw` of any value, and dependencies do it.
 * Every catch site in this SDK funnels through here so the coercion rule is in
 * one place rather than re-invented per call site.
 */
export function toError(value: unknown): Error {
  if (value instanceof Error) return value;
  if (typeof value === 'string') return new Error(value);
  return new Error(String(value));
}

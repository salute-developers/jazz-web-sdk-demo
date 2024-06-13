export function booleanAttribute(value: boolean | undefined): true | undefined {
  return value || undefined;
}

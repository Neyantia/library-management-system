export function sanitize(value: string): string {
  return value.trim();
}

export function normalize(value: string): string {
  return sanitize(value).toLowerCase();
}

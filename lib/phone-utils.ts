export function formatPhoneInput(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 15);
  const groups = digits.match(/.{1,3}/g) || [];
  return groups.join(' ');
}

export function stripPhoneFormat(value: string): string {
  return value.replace(/\D/g, '');
}

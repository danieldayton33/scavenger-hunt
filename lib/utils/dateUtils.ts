import { format } from 'date-fns';

export function toInputValue(date: Date) {
  return format(date, "yyyy-MM-dd'T'HH:mm");
}

export function fromInputValue(value: string) {
  return new Date(value);
}

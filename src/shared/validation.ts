import { DAYS, WeeklySchedule } from "./types";

const TIME_RE = /^(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d\.\d{3}$/;

export const DEFAULT_SCHEDULE: WeeklySchedule = {
  Monday: "00:00:01.000",
  Tuesday: "00:00:01.000",
  Wednesday: "00:00:01.000",
  Thursday: "00:00:01.000",
  Friday: "00:00:01.000",
  Saturday: "00:00:01.000",
  Sunday: "00:00:01.000"
};

export function validateSchedule(schedule: Partial<WeeklySchedule>) {
  const errors: string[] = [];
  for (const day of DAYS) {
    const value = schedule[day];
    if (!value) errors.push(`${day} is required`);
    else if (!TIME_RE.test(value)) errors.push(`${day} must be HH:mm:ss.SSS in UTC, e.g. 03:45:00.000`);
  }
  return { valid: errors.length === 0, errors };
}
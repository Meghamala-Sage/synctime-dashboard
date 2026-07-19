import type { SyncTimes, Weekday } from "./types";

export const WEEKDAYS: Weekday[] = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday"
];

export const DEFAULT_SYNC_TIMES: SyncTimes = {
  Monday: "00:00:01.000",
  Tuesday: "00:00:01.000",
  Wednesday: "00:00:01.000",
  Thursday: "00:00:01.000",
  Friday: "00:00:01.000",
  Saturday: "00:00:01.000",
  Sunday: "00:00:01.000"
};

export function isValidSyncTime(value: string): boolean {
  return /^([01]\d|2[0-3]):[0-5]\d:[0-5]\d\.\d{3}$/.test(value);
}

export function validateSyncTimes(syncTimes: SyncTimes): string[] {
  const errors: string[] = [];

  for (const day of WEEKDAYS) {
    if (!syncTimes[day]) errors.push(`${day} is required`);
    else if (!isValidSyncTime(syncTimes[day])) {
      errors.push(`${day} must be HH:mm:ss.SSS, e.g. 07:00:00.000`);
    }
  }

  return errors;
}
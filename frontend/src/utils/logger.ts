// Simple logger utility for controlling console output
// Set ENABLE_LOGS to false before submission to hide debug logs
const ENABLE_LOGS = false; // Set to false before submission

export const logger = {
  log: (...args: any[]) => ENABLE_LOGS && console.log(...args),
  warn: (...args: any[]) => ENABLE_LOGS && console.warn(...args),
  error: (...args: any[]) => console.error(...args), // always show errors
};

export function isDebugEnabled(): boolean {
  try {
    if (process.env.DEBUG_ENABLED === "true") return true;
  } catch {}
  return process.env.NODE_ENV !== "production";
}

type LogFn = (message: string, ...args: unknown[]) => void;

export interface Logger {
  debug: LogFn;
  info: LogFn;
  warn: LogFn;
  error: LogFn;
}

export function createLogger(namespace: string): Logger {
  const prefix = `[${namespace}]`;
  const debugOn = isDebugEnabled();

  return {
    debug: debugOn
      ? (message, ...args) => {
          console.log(`${prefix} ${message}`, ...args);
        }
      : () => {},
    info: (message, ...args) => {
      console.log(`${prefix} ${message}`, ...args);
    },
    warn: (message, ...args) => {
      console.warn(`${prefix} ${message}`, ...args);
    },
    error: (message, ...args) => {
      console.error(`${prefix} ${message}`, ...args);
    },
  };
}

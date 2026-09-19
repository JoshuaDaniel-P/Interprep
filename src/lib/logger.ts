type LogLevel = "debug" | "info" | "warn" | "error";

interface LogPayload {
  level: LogLevel;
  message: string;
  context?: string;
  data?: Record<string, any>;
  error?: {
    name?: string;
    message: string;
    stack?: string;
  };
  timestamp: string;
}

const SENSITIVE_KEYS = new Set([
  "password",
  "token",
  "secret",
  "authorization",
  "cookie",
  "apikey",
  "api_key",
  "credential",
  "credentials",
]);

function sanitizeData(obj: any, depth = 0): any {
  if (depth > 5 || obj === null || typeof obj !== "object") {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeData(item, depth + 1));
  }

  const sanitized: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (SENSITIVE_KEYS.has(key.toLowerCase())) {
      sanitized[key] = "[REDACTED]";
    } else {
      sanitized[key] = sanitizeData(value, depth + 1);
    }
  }
  return sanitized;
}

class Logger {
  private isProd = process.env.NODE_ENV === "production";

  private formatError(err: unknown): { name?: string; message: string; stack?: string } | undefined {
    if (!err) return undefined;
    if (err instanceof Error) {
      return {
        name: err.name,
        message: err.message,
        stack: this.isProd ? undefined : err.stack,
      };
    }
    return { message: String(err) };
  }

  private log(level: LogLevel, message: string, context?: string, data?: Record<string, any>, error?: unknown) {
    const payload: LogPayload = {
      level,
      message,
      context,
      timestamp: new Date().toISOString(),
      data: data ? sanitizeData(data) : undefined,
      error: this.formatError(error),
    };

    if (this.isProd) {
      // In production: Single-line JSON format ideal for Datadog / Google Cloud Logging / AWS CloudWatch
      const line = JSON.stringify(payload);
      if (level === "error") {
        process.stderr.write(line + "\n");
      } else {
        process.stdout.write(line + "\n");
      }
    } else {
      // In development: Clean readable output with clear level tags
      const prefix = `[${payload.timestamp.slice(11, 19)}] [${level.toUpperCase()}]${context ? ` [${context}]` : ""}:`;
      switch (level) {
        case "error":
          console.error(prefix, message, payload.data || "", payload.error || "");
          break;
        case "warn":
          console.warn(prefix, message, payload.data || "");
          break;
        case "debug":
          console.debug(prefix, message, payload.data || "");
          break;
        default:
          console.info(prefix, message, payload.data || "");
          break;
      }
    }
  }

  debug(message: string, context?: string, data?: Record<string, any>) {
    this.log("debug", message, context, data);
  }

  info(message: string, context?: string, data?: Record<string, any>) {
    this.log("info", message, context, data);
  }

  warn(message: string, context?: string, dataOrError?: unknown, error?: unknown) {
    if (dataOrError instanceof Error) {
      this.log("warn", message, context, undefined, dataOrError);
    } else if (typeof dataOrError === "object" && dataOrError !== null) {
      this.log("warn", message, context, dataOrError as Record<string, any>, error);
    } else {
      this.log("warn", message, context, undefined, dataOrError || error);
    }
  }

  error(message: string, context?: string, error?: unknown, data?: Record<string, any>) {
    this.log("error", message, context, data, error);
  }
}

export const logger = new Logger();

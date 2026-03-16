import * as Sentry from "@sentry/nextjs";

export function captureError(error: Error | unknown, context?: { [key: string]: any }) {
  Sentry.captureException(error, { extra: context });
}

export function captureMessage(message: string, level?: "fatal" | "error" | "warning" | "info" | "debug") {
  Sentry.captureMessage(message, level);
}

export function setUserId(userId: string) {
  Sentry.setUser({ id: userId });
}

export function addBreadcrumb(message: string, data?: Record<string, any>) {
  Sentry.addBreadcrumb({ message, data });
}

/**
 * Rate Limiter Hook for React Components
 * Prevents form submission spam and API request overload
 */

import { useState, useCallback, useRef } from "react";
import { rateLimiter } from "@/lib/rate-limiter";

interface RateLimitState {
  isLimited: boolean;
  remainingTime: number;
}

interface UseRateLimitOptions {
  operation: "signup" | "login" | "api_create" | "api_read" | "api_update" | "api_delete";
  onLimitExceeded?: (state: RateLimitState) => void;
}

/**
 * Hook to use rate limiting in components
 */
export function useRateLimit(options: UseRateLimitOptions) {
  const { operation, onLimitExceeded } = options;
  const [state, setState] = useState<RateLimitState>({
    isLimited: false,
    remainingTime: 0,
  });

  const countdownInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  /**
   * Check if operation is allowed
   */
  const checkLimit = useCallback(
    (identifier: string = "global"): boolean => {
      const isAllowed = rateLimiter.isAllowed(operation, identifier);

      if (!isAllowed) {
        const newState: RateLimitState = {
          isLimited: true,
          remainingTime: 60,
        };

        setState(newState);

        if (countdownInterval.current) {
          clearInterval(countdownInterval.current);
        }

        startCountdown(60);

        if (onLimitExceeded) {
          onLimitExceeded(newState);
        }

        return false;
      }

      setState({
        isLimited: false,
        remainingTime: 0,
      });

      return true;
    },
    [operation, onLimitExceeded]
  );

  /**
   * Start countdown timer
   */
  const startCountdown = (seconds: number) => {
    let remaining = seconds;

    countdownInterval.current = setInterval(() => {
      remaining--;
      setState((prev) => ({
        ...prev,
        remainingTime: remaining,
      }));

      if (remaining <= 0) {
        if (countdownInterval.current) {
          clearInterval(countdownInterval.current);
        }
        setState((prev) => ({
          ...prev,
          isLimited: false,
          remainingTime: 0,
        }));
      }
    }, 1000);
  };

  /**
   * Format remaining time for display
   */
  const formatRemainingTime = (seconds: number): string => {
    if (seconds <= 0) return "Ready";

    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;

    if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    }
    return `${secs}s`;
  };

  /**
   * Get error message
   */
  const getErrorMessage = (): string => {
    if (!state.isLimited) return "";

    const operationName = operation.charAt(0).toUpperCase() + operation.slice(1);
    return `${operationName} limit exceeded. Try again in ${formatRemainingTime(state.remainingTime)}`;
  };

  /**
   * Get remaining requests in current window
   */
  const getRemainingRequests = useCallback(
    (identifier: string = "global"): number => {
      return rateLimiter.getRemainingRequests(operation, identifier);
    },
    [operation]
  );

  /**
   * Get reset time in milliseconds
   */
  const getResetTime = useCallback(
    (identifier: string = "global"): number => {
      return rateLimiter.getResetTime(operation, identifier);
    },
    [operation]
  );

  /**
   * Reset the rate limit
   */
  const reset = useCallback(
    (identifier: string = "global"): void => {
      rateLimiter.reset(operation, identifier);
      setState({
        isLimited: false,
        remainingTime: 0,
      });

      if (countdownInterval.current) {
        clearInterval(countdownInterval.current);
      }
    },
    [operation]
  );

  return {
    isLimited: state.isLimited,
    remainingTime: state.remainingTime,
    checkLimit,
    reset,
    formatRemainingTime,
    getErrorMessage,
    getRemainingRequests,
    getResetTime,
  };
}

/**
 * Hook to use rate limiting with form submission
 */
export function useRateLimitedForm(operation: UseRateLimitOptions["operation"]) {
  const rateLimit = useRateLimit({ operation });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = useCallback(
    async (callback: () => Promise<void> | void): Promise<boolean> => {
      if (!rateLimit.checkLimit()) {
        return false;
      }

      try {
        setIsSubmitting(true);
        await callback();
        return true;
      } catch (error) {
        console.error("Form submission error:", error);
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [rateLimit]
  );

  return {
    ...rateLimit,
    isSubmitting,
    handleSubmit,
  };
}

/**
 * Hook to prevent double-submission
 */
export function usePreventDoubleSubmit(delay: number = 1000) {
  const [canSubmit, setCanSubmit] = useState(true);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const preventDoubleSubmit = useCallback(
    async (callback: () => Promise<void> | void) => {
      if (!canSubmit) return;

      setCanSubmit(false);

      try {
        await callback();
      } finally {
        timeoutRef.current = setTimeout(() => {
          setCanSubmit(true);
        }, delay);
      }
    },
    [canSubmit, delay]
  );

  const reset = useCallback(() => {
    setCanSubmit(true);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  return {
    canSubmit,
    preventDoubleSubmit,
    reset,
  };
}

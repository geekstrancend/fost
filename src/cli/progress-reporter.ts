/**
 * Progress Reporter
 * Displays progress with spinner and percentage
 * Provides visual feedback during long-running operations
 */

import type { ProgressReporter } from "./types";

export function createProgressReporter(): ProgressReporter {
  const spinnerFrames = ["|", "/", "-", "\\"];
  let currentFrame = 0;
  let isRunning = false;

  return {
    /**
     * Start progress tracking
     */
    start(): void {
      isRunning = true;
      currentFrame = 0;
    },

    /**
     * Update progress with message and percentage
     *
     * @param message - Progress message to display
     * @param percentage - Completion percentage (0-100)
     */
    update(message: string, percentage: number): void {
      if (!isRunning) return;

      const bar = createProgressBar(percentage);
      const frame = spinnerFrames[currentFrame % spinnerFrames.length];
      currentFrame++;

      // Clamp percentage to valid range
      const displayPercentage = Math.max(0, Math.min(100, percentage));

      // Clear line and print progress
      process.stdout.write(
        `\r ${frame} ${message.padEnd(30)} ${bar} ${displayPercentage}%`
      );
    },

    /**
     * Mark operation as complete with success message
     *
     * @param message - Success message to display
     */
    complete(message: string): void {
      isRunning = false;
      clearLine();
      console.log(`\n ✨ ${message}`);
    },

    /**
     * Mark operation as failed
     *
     * @param message - Optional error message
     */
    error(message?: string): void {
      isRunning = false;
      clearLine();
      const msg = message ? ` ${message}` : '';
      console.log(`\n ✗ Operation failed${msg}`);
    },

    /**
     * Stop progress tracking
     */
    stop(): void {
      isRunning = false;
      clearLine();
    },
  };
}

/**
 * Create a visual progress bar
 *
 * @param percentage - Completion percentage (0-100)
 * @returns Formatted progress bar
 */
function createProgressBar(percentage: number): string {
  const width = 20;
  const clampedPercentage = Math.max(0, Math.min(100, percentage));
  const filled = Math.round((width * clampedPercentage) / 100);
  const empty = width - filled;
  return "[" + "=".repeat(filled) + "-".repeat(empty) + "]";
}

/**
 * Clear current line in terminal
 */
function clearLine(): void {
  process.stdout.write("\r" + " ".repeat(80) + "\r");
}

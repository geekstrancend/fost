/**
 * Progress Reporter
 * Displays progress with spinner and percentage
 */

export interface ProgressReporter {
  start(): void;
  update(message: string, percentage: number): void;
  succeed(message: string): void;
  fail(): void;
  warn(message: string): void;
}

export function createProgressReporter(): ProgressReporter {
  const spinnerFrames = ["|", "/", "-", "\\"];
  let currentFrame = 0;
  let isRunning = false;

  return {
    start(): void {
      isRunning = true;
      currentFrame = 0;
    },

    update(message: string, percentage: number): void {
      if (!isRunning) return;

      const bar = createProgressBar(percentage);
      const frame = spinnerFrames[currentFrame % spinnerFrames.length];
      currentFrame++;

      // Clear line and print progress
      process.stdout.write(
        `\r ${frame} ${message.padEnd(30)} ${bar} ${percentage}%`
      );
    },

    succeed(message: string): void {
      isRunning = false;
      clearLine();
      console.log(`\n [OK] ${message}`);
    },

    fail(): void {
      isRunning = false;
      clearLine();
      console.log(`\n [FAILED]`);
    },

    warn(message: string): void {
      isRunning = false;
      clearLine();
      console.log(`\n [WARNING] ${message}`);
    },
  };
}

/**
 * Create progress bar
 */
function createProgressBar(percentage: number): string {
  const width = 20;
  const filled = Math.round((width * percentage) / 100);
  const empty = width - filled;
  return "[" + "=".repeat(filled) + "-".repeat(empty) + "]";
}

/**
 * Clear current line
 */
function clearLine(): void {
  process.stdout.write("\r" + " ".repeat(80) + "\r");
}

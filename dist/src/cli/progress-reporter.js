"use strict";
/**
 * Progress Reporter
 * Displays progress with spinner and percentage
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createProgressReporter = createProgressReporter;
function createProgressReporter() {
    const spinnerFrames = ["|", "/", "-", "\\"];
    let currentFrame = 0;
    let isRunning = false;
    return {
        start() {
            isRunning = true;
            currentFrame = 0;
        },
        update(message, percentage) {
            if (!isRunning)
                return;
            const bar = createProgressBar(percentage);
            const frame = spinnerFrames[currentFrame % spinnerFrames.length];
            currentFrame++;
            // Clear line and print progress
            process.stdout.write(`\r ${frame} ${message.padEnd(30)} ${bar} ${percentage}%`);
        },
        succeed(message) {
            isRunning = false;
            clearLine();
            console.log(`\n [OK] ${message}`);
        },
        fail() {
            isRunning = false;
            clearLine();
            console.log(`\n [FAILED]`);
        },
        warn(message) {
            isRunning = false;
            clearLine();
            console.log(`\n [WARNING] ${message}`);
        },
    };
}
/**
 * Create progress bar
 */
function createProgressBar(percentage) {
    const width = 20;
    const filled = Math.round((width * percentage) / 100);
    const empty = width - filled;
    return "[" + "=".repeat(filled) + "-".repeat(empty) + "]";
}
/**
 * Clear current line
 */
function clearLine() {
    process.stdout.write("\r" + " ".repeat(80) + "\r");
}
//# sourceMappingURL=progress-reporter.js.map
/**
 * Telegram Update Deduplication
 * In-memory store with TTL to prevent duplicate processing of updates
 */

// Map of update_id -> expiry timestamp (ms since epoch)
const processedUpdates = new Map<number, number>();

// Default TTL: 24 hours
const DEFAULT_TTL_MS = 24 * 60 * 60 * 1000;

/**
 * Check if update_id has been processed, and mark it as processed if new
 * @param updateId - Telegram update_id
 * @returns true if new (not processed), false if duplicate
 */
export function checkAndMarkProcessed(updateId: number): boolean {
  const now = Date.now();

  // Clean up expired entries
  for (const [id, expiry] of processedUpdates.entries()) {
    if (expiry < now) {
      processedUpdates.delete(id);
    }
  }

  // Check if already processed
  if (processedUpdates.has(updateId)) {
    return false; // Duplicate
  }

  // Mark as processed
  processedUpdates.set(updateId, now + DEFAULT_TTL_MS);
  return true; // New
}

/**
 * Manually clean up expired entries
 * Can be called periodically or on shutdown
 */
export function cleanup(): void {
  const now = Date.now();
  for (const [id, expiry] of processedUpdates.entries()) {
    if (expiry < now) {
      processedUpdates.delete(id);
    }
  }
}

/**
 * Get current count of tracked updates (for monitoring)
 */
export function getTrackedCount(): number {
  return processedUpdates.size;
}

/**
 * Check if an update_id is already tracked (without marking)
 */
export function isProcessed(updateId: number): boolean {
  const now = Date.now();
  const expiry = processedUpdates.get(updateId);
  if (expiry === undefined) return false;
  if (expiry < now) {
    processedUpdates.delete(updateId);
    return false;
  }
  return true;
}

/**
 * Clear all tracked updates (for testing)
 */
export function clear(): void {
  processedUpdates.clear();
}
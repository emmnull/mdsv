/**
 * Quickly assert things that are expected.
 *
 * @param {boolean} condition
 * @param {string} message
 * @returns {asserts condition}
 */
export function assert(condition, message) {
  if (!condition) {
    throw Error(message);
  }
}

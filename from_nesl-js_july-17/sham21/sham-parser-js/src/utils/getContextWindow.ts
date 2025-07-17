/**
 * Get context window around target line for error reporting
 * Returns context as a single string with newlines preserved
 */
export function getContextWindow(
  content: string, 
  targetLine: number, 
  windowSize: number = 5
): string {
  const lines = content.split('\n');
  // Convert to 0-based index
  const targetIndex = targetLine - 1;
  const totalLines = lines.length;
  
  // If file has fewer lines than window size, return entire file
  if (totalLines <= windowSize) {
    return lines.join('\n');
  }
  
  // Calculate ideal centered window
  const halfWindow = Math.floor(windowSize / 2);
  let start = targetIndex - halfWindow;
  let end = targetIndex + halfWindow;
  
  // Adjust bounds if they exceed file limits
  if (start < 0) {
    // Shift window right
    end = end - start;  // Add the negative start to end
    start = 0;
  } else if (end >= totalLines) {
    // Shift window left
    start = start - (end - totalLines + 1);
    end = totalLines - 1;
  }
  
  // Final bounds check
  start = Math.max(0, start);
  end = Math.min(totalLines - 1, end);
  
  return lines.slice(start, end + 1).join('\n');
}
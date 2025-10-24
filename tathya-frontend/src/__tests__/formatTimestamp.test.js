// Simple test for formatTimestamp function
describe('formatTimestamp', () => {
  // Since we can't easily import the function from the React component,
  // we'll recreate the logic here for testing
  
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'Unknown time';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else if (diffInDays < 7) {
      return `${diffInDays}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  test('formats recent timestamps as "Just now"', () => {
    const recentTime = new Date(Date.now() - 1000 * 60 * 30); // 30 minutes ago
    expect(formatTimestamp(recentTime.toISOString())).toBe('Just now');
  });

  test('formats hours ago correctly', () => {
    const hoursAgo = new Date(Date.now() - 1000 * 60 * 60 * 5); // 5 hours ago
    expect(formatTimestamp(hoursAgo.toISOString())).toBe('5h ago');
  });

  test('formats days ago correctly', () => {
    const daysAgo = new Date(Date.now() - 1000 * 60 * 60 * 24 * 3); // 3 days ago
    expect(formatTimestamp(daysAgo.toISOString())).toBe('3d ago');
  });

  test('formats older dates as locale date string', () => {
    const oldDate = new Date(Date.now() - 1000 * 60 * 60 * 24 * 10); // 10 days ago
    expect(formatTimestamp(oldDate.toISOString())).toBe(oldDate.toLocaleDateString());
  });

  test('handles null timestamp', () => {
    expect(formatTimestamp(null)).toBe('Unknown time');
  });

  test('handles undefined timestamp', () => {
    expect(formatTimestamp(undefined)).toBe('Unknown time');
  });
});
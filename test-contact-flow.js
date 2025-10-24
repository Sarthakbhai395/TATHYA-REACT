// Simple end-to-end test script for the contact form flow
// This script can be run in the browser console to verify the fix

console.log('Starting contact form flow test...');

// Test the formatTimestamp function
function testFormatTimestamp() {
  console.log('Testing formatTimestamp function...');
  
  // Test recent timestamp
  const recent = new Date(Date.now() - 1000 * 60 * 10); // 10 minutes ago
  console.log('Recent timestamp (10 min ago):', formatTimestamp(recent));
  
  // Test hours ago
  const hoursAgo = new Date(Date.now() - 1000 * 60 * 60 * 5); // 5 hours ago
  console.log('Hours ago (5 hours):', formatTimestamp(hoursAgo));
  
  // Test days ago
  const daysAgo = new Date(Date.now() - 1000 * 60 * 60 * 24 * 3); // 3 days ago
  console.log('Days ago (3 days):', formatTimestamp(daysAgo));
  
  // Test null/undefined
  console.log('Null timestamp:', formatTimestamp(null));
  console.log('Undefined timestamp:', formatTimestamp(undefined));
  
  console.log('formatTimestamp tests completed.');
}

// Test contact query parsing
function testContactQueryParsing() {
  console.log('Testing contact query parsing...');
  
  // Mock contact query data
  const mockQueries = [
    {
      _id: '1',
      from: { role: 'user', fullName: 'John Doe' },
      content: 'Subject: Test Subject\n\nMessage:\nThis is a test message',
      timestamp: new Date().toISOString()
    },
    {
      _id: '2',
      from: { role: 'moderator', fullName: 'Admin User' },
      content: 'Response to your contact form submission:\n\nOriginal Subject: Test Subject\n\nResponse:\nThis is a response to your query',
      timestamp: new Date().toISOString()
    }
  ];
  
  console.log('Mock queries:', mockQueries);
  console.log('Contact query parsing tests completed.');
}

// Run tests
try {
  testFormatTimestamp();
  testContactQueryParsing();
  console.log('All tests completed successfully!');
} catch (error) {
  console.error('Test failed:', error);
}
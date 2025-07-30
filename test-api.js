// Simple test script for the chat API
const API_BASE = 'http://localhost:3001/api';

async function testAPI() {
  console.log('🧪 Testing Portfolio Chat API...\n');

  try {
    // Test health endpoint
    console.log('1. Testing health endpoint...');
    const healthResponse = await fetch(`${API_BASE}/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health check:', healthData.status);
    console.log('   Timestamp:', healthData.timestamp);
    console.log('');

    // Test chat endpoint
    console.log('2. Testing chat endpoint...');
    const chatResponse = await fetch(`${API_BASE}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: 'What are your skills?'
      })
    });

    if (!chatResponse.ok) {
      throw new Error(`Chat API failed: ${chatResponse.status}`);
    }

    const chatData = await chatResponse.json();
    console.log('✅ Chat response received');
    console.log('   Conversation ID:', chatData.conversationId);
    console.log('   Messages count:', chatData.messages.length);
    console.log('   Last message:', chatData.lastMessage.text.substring(0, 100) + '...');
    console.log('');

    // Test conversation history
    console.log('3. Testing conversation history...');
    const historyResponse = await fetch(`${API_BASE}/chat/${chatData.conversationId}`);
    const historyData = await historyResponse.json();
    console.log('✅ Conversation history retrieved');
    console.log('   Messages in history:', historyData.messages.length);
    console.log('');

    console.log('🎉 All tests passed! The API is working correctly.');
    console.log('');
    console.log('📝 You can now:');
    console.log('   - Start your frontend development server');
    console.log('   - Test the chat widget in your browser');
    console.log('   - The chat will now use the real backend API');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('');
    console.log('🔧 Troubleshooting:');
    console.log('   1. Make sure the server is running: npm run dev');
    console.log('   2. Check if port 3001 is available');
    console.log('   3. Verify your .env configuration');
  }
}

// Run the test
testAPI(); 
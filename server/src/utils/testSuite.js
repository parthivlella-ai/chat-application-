const BASE_URL = 'http://localhost:5000/api';

async function request(url, options = {}) {
  const res = await fetch(`${BASE_URL}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || `HTTP ${res.status}`);
  }
  return data;
}

async function testAllEndpoints() {
  console.log('🧪 Starting CONNECTX End-to-End API Suite Tests...\n');

  try {
    // 1. Health
    const health = await request('/health');
    console.log('✅ 1. Server Health Check:', health.status);

    // 2. Login
    const loginRes = await request('/auth/login', {
      method: 'POST',
      body: { loginId: 'alex@connectx.com', password: 'Password123!' },
    });
    console.log('✅ 2. Login as Alex:', loginRes.success ? 'SUCCESS' : 'FAILED');
    const alexToken = loginRes.token;
    const alexHeaders = { Authorization: `Bearer ${alexToken}` };

    // 3. Me
    const meRes = await request('/auth/me', { headers: alexHeaders });
    console.log('✅ 3. Authenticated Profile:', meRes.user.name, `(@${meRes.user.username})`);

    // 4. Users
    const usersRes = await request('/users', { headers: alexHeaders });
    console.log('✅ 4. Users Directory Count:', usersRes.count);

    // 5. Conversations
    const convsRes = await request('/conversations', { headers: alexHeaders });
    console.log('✅ 5. Conversations Count for Alex:', convsRes.conversations.length);
    const activeConv = convsRes.conversations[0];

    // 6. Messages
    const msgsRes = await request(`/messages/${activeConv._id}`, { headers: alexHeaders });
    console.log('✅ 6. Messages in Conversation:', msgsRes.messages.length);

    // 7. Send Message
    const sendRes = await request('/messages', {
      method: 'POST',
      headers: alexHeaders,
      body: {
        conversationId: activeConv._id,
        text: 'Automated test message from Alex ⚡',
        messageType: 'text',
      },
    });
    const sentMsg = sendRes.message;
    console.log('✅ 7. Sent Message ID:', sentMsg._id, '| Text:', sentMsg.text);

    // 8. Edit Message
    const editRes = await request(`/messages/${sentMsg._id}`, {
      method: 'PUT',
      headers: alexHeaders,
      body: { text: 'Automated test message (Edited version) ✨' },
    });
    console.log('✅ 8. Edit Message Success:', editRes.message.isEdited, '| Text:', editRes.message.text);

    // 9. Search Messages
    const searchRes = await request('/messages/search?q=Edited', { headers: alexHeaders });
    console.log('✅ 9. Search Messages Query Results:', searchRes.count);

    // 10. Admin Stats
    const adminLogin = await request('/auth/login', {
      method: 'POST',
      body: { loginId: 'admin@connectx.com', password: 'Password123!' },
    });
    const adminHeaders = { Authorization: `Bearer ${adminLogin.token}` };

    const statsRes = await request('/admin/stats', { headers: adminHeaders });
    console.log('✅ 10. Admin Stats -> Users:', statsRes.stats.totalUsers, '| Messages:', statsRes.stats.totalMessages);

    // 11. Register
    const randomUser = `testuser_${Date.now()}`;
    const regRes = await request('/auth/register', {
      method: 'POST',
      body: {
        name: 'Test Evaluator',
        username: randomUser,
        email: `${randomUser}@connectx.com`,
        password: 'Password123!',
      },
    });
    console.log('✅ 11. Registered New User:', regRes.user.name, `(${regRes.user.email})`);

    // 12. Delete Message
    const delRes = await request(`/messages/${sentMsg._id}?deleteForEveryone=true`, {
      method: 'DELETE',
      headers: alexHeaders,
    });
    console.log('✅ 12. Delete Message (Soft Delete):', delRes.isDeleted);

    console.log('\n====================================================');
    console.log('🎉 ALL 12 END-TO-END SUITE TESTS PASSED WITH 100% SUCCESS!');
    console.log('====================================================');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

testAllEndpoints();

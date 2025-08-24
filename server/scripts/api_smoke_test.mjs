const baseURL = process.env.BASE_URL || 'http://localhost:8080/api/v1';

const cookieJar = new Map(); // name -> { value, attrs }

function setCookieFromHeader(setCookieStr) {
  if (!setCookieStr) return;
  const parts = setCookieStr.split(';').map((p) => p.trim());
  const [nameValue, ...attrs] = parts;
  const [name, value] = nameValue.split('=');
  if (!name) return;
  cookieJar.set(name, { value, attrs });
}

function mergeSetCookie(headers) {
  if (!headers) return;
  const getSetCookie = headers.getSetCookie?.bind(headers);
  if (typeof getSetCookie === 'function') {
    const cookies = getSetCookie();
    for (const c of cookies) setCookieFromHeader(c);
  } else {
    const single = headers.get('set-cookie');
    if (single) setCookieFromHeader(single);
  }
}

function buildCookieHeader() {
  if (cookieJar.size === 0) return '';
  return Array.from(cookieJar.entries()).map(([k, v]) => `${k}=${v.value}`).join('; ');
}

async function request(method, path, { headers = {}, body, authToken, withCookies = true } = {}) {
  const url = `${baseURL}${path}`;
  const cookieHeader = withCookies ? buildCookieHeader() : '';
  const init = { 
    method, 
    headers: { 
      'Content-Type': 'application/json', 
      ...(cookieHeader ? { Cookie: cookieHeader } : {}), 
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}), 
      ...headers 
    } 
  };
  if (body !== undefined) {
    init.body = typeof body === 'string' ? body : JSON.stringify(body);
  }
  const res = await fetch(url, init).catch((e) => ({ 
    ok: false, 
    status: 0, 
    headers: new Headers(), 
    text: async () => JSON.stringify({ error: e.message }) 
  }));
  mergeSetCookie(res.headers);
  let text;
  try {
    text = await res.text();
  } catch (_) {
    text = '';
  }
  let data;
  try {
    data = JSON.parse(text);
  } catch (_) {
    data = text;
  }
  return { status: res.status, ok: res.ok, data };
}

function logResult(name, result, expectedStatuses) {
  const okExpected = expectedStatuses.includes(result.status);
  const statusMark = okExpected ? '✅' : '❌';
  const brief = typeof result.data === 'string' ? result.data.slice(0, 160) : JSON.stringify(result.data).slice(0, 160);
  console.log(`${statusMark} ${name} -> ${result.status} ${brief}`);
  return okExpected;
}

async function run() {
  const email = `test+${Date.now()}@example.com`;
  const dummyId = '000000000000000000000000';
  let accessToken;
  let refreshToken;
  let csrfToken;
  let createdUserId;
  let createdRelayId;
  let createdConnectionId;
  let webhookTriggerId;
  let testResults = { passed: 0, failed: 0, total: 0 };

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  console.log('🚀 Starting RelayPoint API Smoke Tests\n');
  console.log(`Base URL: ${baseURL}\n`);

  const tests = [
    // ===== AUTHENTICATION TESTS =====
    { name: 'POST /users/register-email', fn: () => request('POST', '/users/register-email', { body: { email } }), expect: [200] },
    { name: 'OTP fetch and verify', fn: async () => {
        try {
          const { default: IORedis } = await import('ioredis');
          let redis;
          if (process.env.REDIS_URL) {
            redis = new IORedis(process.env.REDIS_URL);
          } else if (process.env.REDIS_HOST && process.env.REDIS_PORT) {
            redis = new IORedis({ host: process.env.REDIS_HOST, port: Number(process.env.REDIS_PORT), password: process.env.REDIS_PASSWORD || undefined });
          }
          if (!redis) throw new Error('Redis not configured for OTP fetch');
          const key = `email:verify:${email}`;
          const data = await redis.hgetall(key);
          await redis.quit();
          const otp = data?.otp || '000000';
          const res = await request('POST', '/users/verify-email-otp', { body: { email, otp } });
          const regToken = res?.data?.data?.registrationToken;
          if (regToken) {
            const reg = await request('POST', '/users/register-user', { body: { fullName: 'Smoke Test', password: 'SmokePass1!', registrationToken: regToken } });
            accessToken = reg?.data?.data?.accessToken || accessToken;
            refreshToken = reg?.data?.data?.refreshToken || refreshToken;
            csrfToken = Array.from(cookieJar.keys()).includes('csrf-token') ? cookieJar.get('csrf-token')?.value : csrfToken;
          }
          return res;
        } catch (e) {
          return { status: 500, ok: false, data: { error: e.message } };
        }
      }, expect: [200] },
    { name: 'POST /users/login', fn: async () => {
        const res = await request('POST', '/users/login', { body: { email, password: 'SmokePass1!' } });
        accessToken = res?.data?.data?.accessToken || accessToken;
        refreshToken = res?.data?.data?.refreshToken || refreshToken;
        csrfToken = cookieJar.get('csrf-token')?.value || csrfToken;
        return res;
      }, expect: [200] },
    { name: 'GET /users/current-user (auth)', fn: async () => {
        const res = await request('GET', '/users/current-user', { authToken: accessToken });
        createdUserId = res?.data?.data?._id || createdUserId;
        return res;
      }, expect: [200] },
    { name: 'GET /users/refresh-access-token', fn: async () => {
        const res = await request('GET', '/users/refresh-access-token', {});
        accessToken = res?.data?.data?.accessToken || accessToken;
        refreshToken = res?.data?.data?.refreshToken || refreshToken;
        csrfToken = cookieJar.get('csrf-token')?.value || csrfToken;
        return res;
      }, expect: [200] },

    // ===== CONNECTION MANAGEMENT TESTS =====
    { name: 'GET /connections (auth)', fn: () => request('GET', '/connections', { authToken: accessToken }), expect: [200] },
    { name: 'POST /connections (create test connection)', fn: async () => {
        const res = await request('POST', '/connections', { 
          authToken: accessToken, 
          body: { 
            service: 'test-service', 
            accountIdentifier: 'test@example.com',
            credentials: { apiKey: 'test-key-123' }
          } 
        });
        createdConnectionId = res?.data?.data?.connection?._id || createdConnectionId;
        return res;
      }, expect: [201] },
    { name: 'GET /connections/:id (auth)', fn: () => request('GET', `/connections/${createdConnectionId}`, { authToken: accessToken }), expect: [200] },
    { name: 'POST /connections/:id/test (auth)', fn: () => request('POST', `/connections/${createdConnectionId}/test`, { authToken: accessToken }), expect: [200] },
    { name: 'PUT /connections/:id (auth)', fn: () => request('PUT', `/connections/${createdConnectionId}`, { 
      authToken: accessToken, 
      body: { accountIdentifier: 'updated@example.com' } 
    }), expect: [200] },

    // ===== GOOGLE OAUTH TESTS =====
    { name: 'GET /connections/google/status (auth)', fn: () => request('GET', '/connections/google/status', { authToken: accessToken }), expect: [200] },
    { name: 'GET /connections/google/auth (auth)', fn: () => request('GET', '/connections/google/auth', { authToken: accessToken }), expect: [200, 302] },

    // ===== GMAIL TESTS =====
    { name: 'POST /gmail/test (auth)', fn: () => request('POST', '/gmail/test', { authToken: accessToken }), expect: [200] },

    // ===== GOOGLE SHEETS TESTS =====
    { name: 'POST /sheets/test (auth)', fn: () => request('POST', '/sheets/test', { authToken: accessToken }), expect: [200] },
    { name: 'POST /sheets/extract-id', fn: () => request('POST', '/sheets/extract-id', { 
      authToken: accessToken, 
      body: { url: 'https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit' } 
    }), expect: [200] },

    // ===== SOLANA TESTS =====
    { name: 'GET /solana/status (auth)', fn: () => request('GET', '/solana/status', { authToken: accessToken }), expect: [200] },
    { name: 'POST /solana/test-connection (auth)', fn: () => request('POST', '/solana/test-connection', { authToken: accessToken }), expect: [200] },
    { name: 'POST /solana/validate-address (auth)', fn: () => request('POST', '/solana/validate-address', { 
      authToken: accessToken, 
      body: { address: '11111111111111111111111111111112' } 
    }), expect: [200] },
    { name: 'GET /solana/network (auth)', fn: () => request('GET', '/solana/network', { authToken: accessToken }), expect: [200] },

    // ===== RELAY TESTS =====
    { name: 'POST /relays (auth)', fn: async () => {
        const body = {
          name: 'Smoke Test Relay',
          description: 'Created by api_smoke_test',
          trigger: { triggerId: 'INCOMING_WEBHOOK', name: 'Incoming Webhook', config: {} },
          actions: [
            { actionId: 'DELAY', name: 'Delay', order: 0, config: { ms: 10 } },
            { actionId: 'WEBHOOK_POST', name: 'Send Webhook', order: 1, config: { url: 'https://httpbin.org/post' } }
          ]
        };
        const res = await request('POST', '/relays', { authToken: accessToken, body });
        createdRelayId = res?.data?.data?.relay?._id || createdRelayId;
        return res;
      }, expect: [201] },
    { name: 'GET /relays (auth)', fn: () => request('GET', '/relays', { authToken: accessToken }), expect: [200] },
    { name: 'GET /relays/:id (auth)', fn: () => request('GET', `/relays/${createdRelayId}`, { authToken: accessToken }), expect: [200] },
    { name: 'PUT /relays/:id (auth)', fn: () => request('PUT', `/relays/${createdRelayId}`, { 
      authToken: accessToken, 
      body: { description: 'Updated by smoke test' } 
    }), expect: [200] },
    { name: 'PATCH /relays/:id/toggle (auth)', fn: () => request('PATCH', `/relays/${createdRelayId}/toggle`, { authToken: accessToken }), expect: [200] },
    { name: 'POST /relays/:id/test (auth)', fn: () => request('POST', `/relays/${createdRelayId}/test`, { authToken: accessToken, body: {} }), expect: [200] },
    { name: 'GET /relays/:id/runs (auth)', fn: () => request('GET', `/relays/${createdRelayId}/runs`, { authToken: accessToken }), expect: [200] },

    // ===== WEBHOOK TESTS =====
    { name: 'POST /webhooks/relay/:relayId/generate-url (auth)', fn: async () => {
        const res = await request('POST', `/webhooks/relay/${createdRelayId}/generate-url`, { authToken: accessToken });
        webhookTriggerId = res?.data?.data?.triggerId || webhookTriggerId;
        return res;
      }, expect: [200] },
    { name: 'GET /webhooks/trigger/:triggerId/info (auth)', fn: () => request('GET', `/webhooks/trigger/${webhookTriggerId}/info`, { authToken: accessToken }), expect: [200] },
    { name: 'POST /webhooks/trigger/:triggerId/test (auth)', fn: () => request('POST', `/webhooks/trigger/${webhookTriggerId}/test`, { 
      authToken: accessToken, 
      body: { test: 'data' } 
    }), expect: [200] },

    // ===== LEGACY WEBHOOK TESTS =====
    { name: 'GET /hooks/url/:relayId (auth)', fn: () => request('GET', `/hooks/url/${createdRelayId}`, { authToken: accessToken }), expect: [200] },
    { name: 'POST /hooks/catch/:userId/:relayId (public trigger)', fn: () => request('POST', `/hooks/catch/${createdUserId}/${createdRelayId}`, { 
      body: { event: 'test', payload: { hello: 'world' } } 
    }), expect: [200] },

    // ===== SUGGESTER TESTS =====
    { name: 'POST /suggester/suggest (auth)', fn: () => request('POST', '/suggester/suggest', { 
      authToken: accessToken, 
      body: { description: 'Automate something with Gmail and Sheets' } 
    }), expect: [200, 400] },

    // ===== HEALTH CHECK TESTS =====
    { name: 'GET /health/', fn: () => request('GET', '/health/', {}), expect: [200] },
    { name: 'GET /health/redis', fn: () => request('GET', '/health/redis', {}), expect: [200, 503] },
    { name: 'GET /health/mongodb', fn: () => request('GET', '/health/mongodb', {}), expect: [200, 503] },
    { name: 'GET /health/all', fn: () => request('GET', '/health/all', {}), expect: [200, 503] },

    // ===== ACTIONS & TRIGGERS TESTS =====
    { name: 'GET /actions/available', fn: () => request('GET', '/actions/available', {}), expect: [200] },
    { name: 'GET /actions/:id', fn: () => request('GET', `/actions/WEBHOOK_POST`, {}), expect: [200] },
    { name: 'GET /triggers/available', fn: () => request('GET', '/triggers/available', {}), expect: [200] },
    { name: 'GET /triggers/:id', fn: () => request('GET', `/triggers/INCOMING_WEBHOOK`, {}), expect: [200] },

    // ===== USER MANAGEMENT TESTS =====
    { name: 'POST /users/resend-verification', fn: () => request('POST', '/users/resend-verification', { 
      body: { email: `another+${Date.now()}@example.com` } 
    }), expect: [200, 409] },
    { name: 'POST /users/request-password-reset', fn: () => request('POST', '/users/request-password-reset', { body: { email } }), expect: [200] },
    { name: 'POST /users/reset-forgot-password', fn: async () => {
        await request('POST', '/users/request-password-reset', { body: { email } });
        return request('POST', '/users/reset-forgot-password', { 
          body: { email, unHashedToken: 'invalid', newPassword: 'NewPass123!' } 
        });
      }, expect: [404] },
    { name: 'POST /users/change-password (auth+csrf)', fn: () => request('POST', '/users/change-password', { 
      authToken: accessToken, 
      headers: csrfToken ? { 'x-csrf-token': csrfToken } : {}, 
      body: { oldPassword: 'SmokePass1!', newPassword: 'SmokePass1!' } 
    }), expect: [200, 409] },

    // ===== CLEANUP TESTS =====
    { name: 'DELETE /connections/:id (auth)', fn: () => request('DELETE', `/connections/${createdConnectionId}`, { authToken: accessToken }), expect: [200] },
    { name: 'DELETE /relays/:id (auth)', fn: () => request('DELETE', `/relays/${createdRelayId}`, { authToken: accessToken }), expect: [200] },
    { name: 'POST /users/logout (auth+csrf)', fn: () => request('POST', '/users/logout', { 
      authToken: accessToken, 
      headers: csrfToken ? { 'x-csrf-token': csrfToken } : {} 
    }), expect: [200] },
  ];

  console.log('Running tests...\n');

  for (const t of tests) {
    try {
      testResults.total++;
      const res = await t.fn();
      const passed = logResult(t.name, res, t.expect);
      if (passed) {
        testResults.passed++;
      } else {
        testResults.failed++;
      }
      
      if (res.status === 429) {
        console.log('⏳ Rate limited, waiting...');
        await sleep(1000);
        const retry = await t.fn();
        const retryPassed = logResult(`${t.name} (retry)`, retry, t.expect);
        if (retryPassed) {
          testResults.passed++;
          testResults.failed--;
        }
        await sleep(1000);
      }
    } catch (e) {
      testResults.failed++;
      console.log(`❌ ${t.name} -> exception ${e.message}`);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST RESULTS SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(`📈 Total:  ${testResults.total}`);
  console.log(`🎯 Success Rate: ${((testResults.passed / testResults.total) * 100).toFixed(1)}%`);
  console.log('='.repeat(60));

  if (testResults.failed > 0) {
    console.log('\n❌ Some tests failed. Please check the server logs and try again.');
    process.exit(1);
  } else {
    console.log('\n🎉 All tests passed! RelayPoint API is working correctly.');
    process.exit(0);
  }
}

run().catch((e) => {
  console.error('💥 Smoke test failed to run:', e);
  process.exit(1);
});
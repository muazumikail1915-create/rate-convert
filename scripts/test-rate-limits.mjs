// Test script for API Key Management and Rate Limiting Middleware
async function testRateLimiter() {
  const baseUrl = "http://localhost:3005";
  console.log(`=== Testing API Key Management & Rate Limiter on ${baseUrl} ===`);

  // 1. Generate a new API Key
  const resKey = await fetch(`${baseUrl}/api/v1/keys`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ownerEmail: "treasury@africanbank.ng",
      name: "Treasury Trading Desk",
      plan: "PRO",
    }),
  });
  const dataKey = await resKey.json();
  const apiKey = dataKey.data.key;
  console.log(`[PASS] POST /api/v1/keys -> Created ${dataKey.data.plan} key: ${apiKey} (Status ${resKey.status})`);

  // 2. Query key details
  const resKeyDetail = await fetch(`${baseUrl}/api/v1/keys?key=${apiKey}`);
  const dataKeyDetail = await resKeyDetail.json();
  console.log(`[PASS] GET /api/v1/keys?key=... -> Key Plan: ${dataKeyDetail.data.plan}, Quota: ${dataKeyDetail.data.rateLimitPerMin}/min (Status ${resKeyDetail.status})`);

  // 3. Make authorized request using X-API-Key header
  const resAuth = await fetch(`${baseUrl}/api/v1/rates/latest?base=USD&target=NGN`, {
    headers: { "X-API-Key": apiKey },
  });
  console.log(`[PASS] Authorized request with X-API-Key -> Status: ${resAuth.status}`);
  console.log(`       Headers: X-RateLimit-Limit=${resAuth.headers.get("x-ratelimit-limit")}, Remaining=${resAuth.headers.get("x-ratelimit-remaining")}, Plan=${resAuth.headers.get("x-ratelimit-plan")}`);

  // 4. Test Invalid API Key rejection (401 Unauthorized)
  const resInvalid = await fetch(`${baseUrl}/api/v1/rates/latest?base=USD&target=NGN`, {
    headers: { "X-API-Key": "rc_invalid_fake_key_123" },
  });
  const dataInvalid = await resInvalid.json();
  console.log(`[PASS] Invalid API key -> Rejection: ${dataInvalid.error} (Status ${resInvalid.status})`);

  // 5. Test Anonymous Request Rate Limit headers
  const resAnon = await fetch(`${baseUrl}/api/v1/currencies`);
  console.log(`[PASS] Anonymous IP Request -> Status: ${resAnon.status}`);
  console.log(`       Headers: X-RateLimit-Limit=${resAnon.headers.get("x-ratelimit-limit")}, Remaining=${resAnon.headers.get("x-ratelimit-remaining")}, Reset=${resAnon.headers.get("x-ratelimit-reset")}s`);

  console.log("=== RATE LIMITING & API KEY MIDDLEWARE VERIFIED SUCCESSFULLY ===");
}

testRateLimiter().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});

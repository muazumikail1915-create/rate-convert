// Integration test for Live FX Feed & Real-Time Sync Engine
async function runLiveFXTests() {
  const port = process.env.PORT || 3009;
  const baseUrl = `http://localhost:${port}`;
  console.log(`\n======================================================`);
  console.log(`    RateConvert Live FX Feed & Sync Verification      `);
  console.log(`    Base URL: ${baseUrl}                              `);
  console.log(`======================================================\n`);

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  [PASS] ${message}`);
      passed++;
    } else {
      console.error(`  [FAIL] ${message}`);
      failed++;
    }
  }

  try {
    // 1. Check Sync Engine Status
    console.log(`--- Step 1: Query Live FX Sync Engine Metadata ---`);
    const resStatus = await fetch(`${baseUrl}/api/v1/market/sync`);
    const statusData = await resStatus.json();
    assert(
      resStatus.status === 200 && statusData.success === true,
      `GET /api/v1/market/sync returns HTTP 200 OK`
    );
    assert(
      statusData.data?.trackedCurrencies >= 20,
      `Currently tracking ${statusData.data?.trackedCurrencies} institutional currency pairs`
    );

    // 2. Set an Alert to test Real-time threshold evaluation
    console.log(`\n--- Step 2: Set Rate Alert for Trigger Evaluation ---`);
    const testEmail = `fx_desk_${Date.now()}@lagosmarket.ng`;
    const resAlert = await fetch(`${baseUrl}/api/v1/alerts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userContact: testEmail,
        baseCurrency: "USD",
        targetCurrency: "NGN",
        targetRate: 1000.00, // Deliberately lower than market so it triggers on sync
        direction: "ABOVE",
      }),
    });
    const alertData = await resAlert.json();
    assert(
      resAlert.status === 201 && alertData.success === true,
      `Registered active threshold alert (USD/NGN ABOVE ₦1,000.00)`
    );

    // 3. Trigger Live FX Network Sync
    console.log(`\n--- Step 3: Trigger Live FX Feed Synchronization ---`);
    const resSync = await fetch(`${baseUrl}/api/v1/market/sync`, { method: "POST" });
    const syncData = await resSync.json();

    assert(
      resSync.status === 200 && syncData.success === true,
      `POST /api/v1/market/sync executed successfully`
    );
    assert(
      syncData.data?.cbnRate > 1000,
      `Live Official CBN/Interbank rate synced: ₦${syncData.data?.cbnRate}`
    );
    assert(
      syncData.data?.parallelMidRate > syncData.data?.cbnRate,
      `Live Parallel Market (BDC) rate: ₦${syncData.data?.parallelMidRate} (Spread: ${syncData.data?.spreadPercent}%)`
    );
    assert(
      syncData.data?.totalCurrenciesUpdated >= 20,
      `Synchronized ${syncData.data?.totalCurrenciesUpdated} cross-currency pairs`
    );
    assert(
      syncData.data?.alertsTriggered >= 1,
      `Real-time alert engine evaluated and triggered ${syncData.data?.alertsTriggered} alert(s)`
    );

    // 4. Verify Alert status updated to TRIGGERED
    console.log(`\n--- Step 4: Verify Triggered Alert Persistence ---`);
    const resGetAlerts = await fetch(`${baseUrl}/api/v1/alerts?userContact=${encodeURIComponent(testEmail)}`);
    const userAlertsData = await resGetAlerts.json();
    const triggeredAlert = userAlertsData.data?.[0];
    assert(
      triggeredAlert?.status === "TRIGGERED",
      `Alert state transitioned to 'TRIGGERED' with timestamp: ${triggeredAlert?.triggeredAt}`
    );

    // 5. Verify Latest Spot Rates use the live synced rates
    console.log(`\n--- Step 5: Verify Spot Rates Endpoint Consumes Live Feed ---`);
    const resLatest = await fetch(`${baseUrl}/api/v1/rates/latest?base=USD&target=NGN`);
    const latestData = await resLatest.json();
    const officialSource = latestData.data?.rates?.find((r) => r.sourceType === "official");
    assert(
      officialSource?.buyRate === syncData.data?.cbnRate,
      `Latest spot rate matches live synced CBN rate (₦${officialSource?.buyRate})`
    );

    console.log(`\n======================================================`);
    console.log(`  Live FX Test Summary: ${passed} Passed, ${failed} Failed`);
    console.log(`======================================================\n`);

    if (failed > 0) process.exit(1);
  } catch (err) {
    console.error("Live FX Test Error:", err);
    process.exit(1);
  }
}

runLiveFXTests();

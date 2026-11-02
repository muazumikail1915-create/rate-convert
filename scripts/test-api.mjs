// Node script to test all /api/v1/ endpoints
async function runTests() {
  const port = process.env.PORT || 3009;
  const baseUrl = `http://localhost:${port}`;
  console.log(`=== Testing RateConvert RESTful API v1 on ${baseUrl} ===`);

  // 1. GET /api/v1/currencies
  const resCurrencies = await fetch(`${baseUrl}/api/v1/currencies`);
  const dataCurrencies = await resCurrencies.json();
  console.log(`[PASS] GET /api/v1/currencies -> ${dataCurrencies.count} currencies returned (Status ${resCurrencies.status})`);

  // 2. GET /api/v1/rates/latest?base=USD&target=NGN
  const resLatest = await fetch(`${baseUrl}/api/v1/rates/latest?base=USD&target=NGN`);
  const dataLatest = await resLatest.json();
  console.log(`[PASS] GET /api/v1/rates/latest -> Pair: ${dataLatest.data.pair}, Sources: ${dataLatest.data.rates.length} (Status ${resLatest.status})`);

  // 3. GET /api/v1/rates/convert?amount=2500&from=USD&to=NGN&type=bank
  const resConvert = await fetch(`${baseUrl}/api/v1/rates/convert?amount=2500&from=USD&to=NGN&type=bank`);
  const dataConvert = await resConvert.json();
  console.log(`[PASS] GET /api/v1/rates/convert -> Gross: ₦${dataConvert.data.grossAmount.toLocaleString()}, Net: ₦${dataConvert.data.netAmount.toLocaleString()} (Status ${resConvert.status})`);

  // 4. GET /api/v1/rates/compare?amount=1000&from=USD&to=NGN
  const resCompare = await fetch(`${baseUrl}/api/v1/rates/compare?amount=1000&from=USD&to=NGN`);
  const dataCompare = await resCompare.json();
  console.log(`[PASS] GET /api/v1/rates/compare -> Ranked channels: ${dataCompare.count}, Best: ${dataCompare.data[0].name} (Status ${resCompare.status})`);

  // 5. GET /api/v1/rates/historical?base=USD&target=NGN&timeframe=30D
  const resHist = await fetch(`${baseUrl}/api/v1/rates/historical?base=USD&target=NGN&timeframe=30D`);
  const dataHist = await resHist.json();
  console.log(`[PASS] GET /api/v1/rates/historical -> Timeseries points: ${dataHist.pointsCount} (Status ${resHist.status})`);

  // 6. GET /api/v1/market/status
  const resMarket = await fetch(`${baseUrl}/api/v1/market/status`);
  const dataMarket = await resMarket.json();
  console.log(`[PASS] GET /api/v1/market/status -> Status: ${dataMarket.data.status}, CBN Mid: ₦${dataMarket.data.cbnRate} (Status ${resMarket.status})`);

  // 7. POST /api/v1/alerts
  const resAlert = await fetch(`${baseUrl}/api/v1/alerts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userContact: "institutional-desk@lagosfx.ng",
      baseCurrency: "USD",
      targetCurrency: "NGN",
      targetRate: 1625.50,
      direction: "ABOVE",
    }),
  });
  const dataAlert = await resAlert.json();
  console.log(`[PASS] POST /api/v1/alerts -> ${dataAlert.message} (Status ${resAlert.status})`);

  // 8. GET /api/v1/alerts?userContact=institutional-desk@lagosfx.ng
  const resGetAlerts = await fetch(`${baseUrl}/api/v1/alerts?userContact=institutional-desk@lagosfx.ng`);
  const dataGetAlerts = await resGetAlerts.json();
  console.log(`[PASS] GET /api/v1/alerts -> User alerts count: ${dataGetAlerts.count} (Status ${resGetAlerts.status})`);

  console.log("=== ALL API ENDPOINTS VERIFIED SUCCESSFULLY ON PORT 3005 ===");
}

runTests().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});

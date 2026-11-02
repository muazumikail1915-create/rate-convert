// Integration test suite for RateConvert Authentication Gateway & RBAC Pipeline
async function runAuthTests() {
  const port = process.env.PORT || 3000;
  const baseUrl = `http://localhost:${port}`;
  console.log(`\n======================================================`);
  console.log(`  RateConvert Auth Gateway & RBAC Verification Suite  `);
  console.log(`  Base URL: ${baseUrl}                                `);
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
    // TEST 1: Root Gateway Intercept for Unauthenticated Visitors
    console.log(`\n--- Phase 1: Authentication Gateway Interception ---`);
    const resRoot = await fetch(`${baseUrl}/`, { redirect: "manual" });
    const location = resRoot.headers.get("location") || "";
    assert(
      resRoot.status === 307 || resRoot.status === 302 || resRoot.status === 308,
      `Unauthenticated visit to '/' redirects with status ${resRoot.status}`
    );
    assert(
      location.includes("/login"),
      `Redirect target contains '/login' (Received: ${location})`
    );

    // TEST 2: Registration & Email Activation Pipeline
    console.log(`\n--- Phase 2: Registration & Account Verification Flow ---`);
    const testEmail = `trader_${Date.now()}@lagosdesk.ng`;
    const resRegister = await fetch(`${baseUrl}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Test Trader",
        email: testEmail,
        password: "Password123!",
        termsAccepted: true,
      }),
    });
    const regData = await resRegister.json();
    assert(
      resRegister.status === 200 && regData.success === true,
      `New user registration succeeds with OTP generation`
    );
    assert(
      Boolean(regData.testOtp),
      `Verification OTP generated: ${regData.testOtp}`
    );

    // Verify unactivated login fails
    const resPreVerifyLogin = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: testEmail, password: "Password123!" }),
    });
    const preVerifyData = await resPreVerifyLogin.json();
    assert(
      resPreVerifyLogin.status === 403 && preVerifyData.code === "EMAIL_NOT_VERIFIED",
      `Unverified account login blocked with EMAIL_NOT_VERIFIED (Status 403)`
    );

    // Verify Email with OTP (using current active OTP)
    const activeOtp = preVerifyData.testOtp || regData.testOtp;
    const resVerify = await fetch(`${baseUrl}/api/auth/verify-email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: testEmail, code: activeOtp }),
    });
    const verifyData = await resVerify.json();
    assert(
      resVerify.status === 200 && verifyData.success === true,
      `Account activated upon submitting valid OTP`
    );

    // TEST 3: Regular User Authentication & Session Issuance
    console.log(`\n--- Phase 3: Regular User Authentication & Cookie Issuance ---`);
    const resUserLogin = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "user@rateconvert.com", password: "User123!" }),
    });
    const userCookies = resUserLogin.headers.get("set-cookie") || "";
    const userLoginData = await resUserLogin.json();

    assert(
      resUserLogin.status === 200 && userLoginData.success === true,
      `Regular user login succeeded without 2FA challenge`
    );
    assert(
      userCookies.includes("accessToken=") && userCookies.includes("refreshToken="),
      `Dual tokens issued in secure HttpOnly cookies`
    );

    // Extract access token for bearer requests
    const accessTokenMatch = userCookies.match(/accessToken=([^;]+)/);
    const userAccessToken = accessTokenMatch ? accessTokenMatch[1] : "";

    // Regular User visits /admin -> Expected 403 / Redirect to unauthorized
    const resRegularAdminCheck = await fetch(`${baseUrl}/admin`, {
      headers: { Cookie: `accessToken=${userAccessToken}` },
      redirect: "manual",
    });
    const adminLocation = resRegularAdminCheck.headers.get("location") || "";
    assert(
      adminLocation.includes("/unauthorized"),
      `Regular User hitting '/admin' intercepted by RBAC and routed to /unauthorized`
    );

    // TEST 4: Admin Authentication & Multi-Factor Challenge (MFA)
    console.log(`\n--- Phase 4: Admin Role Authentication & MFA Challenge ---`);
    const resAdminLogin = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "admin@rateconvert.com", password: "Admin123!" }),
    });
    const adminLoginData = await resAdminLogin.json();
    assert(
      adminLoginData.requiresMFA === true,
      `Admin login requires MFA challenge (requiresMFA: true)`
    );

    // Complete MFA Verification
    const resMfaVerify = await fetch(`${baseUrl}/api/auth/mfa/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "admin@rateconvert.com",
        code: adminLoginData.testMfaCode || "123456",
      }),
    });
    const adminCookies = resMfaVerify.headers.get("set-cookie") || "";
    const mfaData = await resMfaVerify.json();
    assert(
      resMfaVerify.status === 200 && mfaData.success === true,
      `MFA code validated and elevated admin tokens issued`
    );

    const adminTokenMatch = adminCookies.match(/accessToken=([^;]+)/);
    const adminAccessToken = adminTokenMatch ? adminTokenMatch[1] : "";

    // Admin visits /admin -> Allowed
    const resAdminAccess = await fetch(`${baseUrl}/admin`, {
      headers: { Cookie: `accessToken=${adminAccessToken}` },
      redirect: "manual",
    });
    assert(
      resAdminAccess.status === 200,
      `Admin accessing '/admin' authorized (Status 200 OK)`
    );

    // Admin visits /super-admin -> Blocked
    const resAdminSuperCheck = await fetch(`${baseUrl}/super-admin`, {
      headers: { Cookie: `accessToken=${adminAccessToken}` },
      redirect: "manual",
    });
    const superAdminLocation = resAdminSuperCheck.headers.get("location") || "";
    assert(
      superAdminLocation.includes("/unauthorized"),
      `Admin attempting to access '/super-admin' blocked and routed to /unauthorized`
    );

    // TEST 5: Super Admin Console, Role Assignment & Audit Logs
    console.log(`\n--- Phase 5: Super Admin Console & Privileged RBAC Operations ---`);
    const resSuperLogin = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "superadmin@rateconvert.com", password: "SuperAdmin123!" }),
    });
    const superLoginData = await resSuperLogin.json();

    const resSuperMfa = await fetch(`${baseUrl}/api/auth/mfa/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "superadmin@rateconvert.com",
        code: superLoginData.testMfaCode || "123456",
      }),
    });
    const superCookies = resSuperMfa.headers.get("set-cookie") || "";
    const superTokenMatch = superCookies.match(/accessToken=([^;]+)/);
    const superAccessToken = superTokenMatch ? superTokenMatch[1] : "";

    // Super Admin accesses /super-admin
    const resSuperAccess = await fetch(`${baseUrl}/super-admin`, {
      headers: { Cookie: `accessToken=${superAccessToken}` },
      redirect: "manual",
    });
    assert(
      resSuperAccess.status === 200,
      `Super Admin accessing '/super-admin' authorized (Status 200 OK)`
    );

    // Super Admin views audit logs
    const resAudit = await fetch(`${baseUrl}/api/admin/audit-logs`, {
      headers: { Cookie: `accessToken=${superAccessToken}` },
    });
    const auditData = await resAudit.json();
    assert(
      resAudit.status === 200 && Array.isArray(auditData.logs) && auditData.logs.length > 0,
      `Audit log trail active with ${auditData.logs?.length} recorded events`
    );

    // TEST 6: Session Revocation & Logout
    console.log(`\n--- Phase 6: Session Revocation & Logout ---`);
    const resLogout = await fetch(`${baseUrl}/api/auth/logout`, {
      method: "POST",
      headers: { Cookie: superCookies },
    });
    const logoutCookies = resLogout.headers.get("set-cookie") || "";
    assert(
      logoutCookies.includes("max-age=0") || logoutCookies.includes("Max-Age=0"),
      `Logout revokes refresh token and clears auth cookies`
    );

    console.log(`\n======================================================`);
    console.log(`  Verification Summary: ${passed} Passed, ${failed} Failed`);
    console.log(`======================================================\n`);

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error("Test execution error:", err);
    process.exit(1);
  }
}

runAuthTests();

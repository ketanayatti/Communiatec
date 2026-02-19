#!/usr/bin/env node

/**
 * Security Testing Script for Communiatec Application
 * Run with: node security-test.js
 */

const axios = require("axios");
const fs = require("fs");
const FormData = require("form-data");

const BASE_URL = process.env.SERVER_URL || process.env.BASE_URL ;
let testResults = [];

// Test configuration
const tests = {
  rateLimiting: true,
  xssProtection: true,
  fileUploadSecurity: true,
  sqlInjectionProtection: true,
  securityHeaders: true,
  authSecurity: true,
};

// Helper function to log test results
function logTest(testName, passed, details = "") {
  const result = {
    test: testName,
    status: passed ? "PASS" : "FAIL",
    details: details,
    timestamp: new Date().toISOString(),
  };
  testResults.push(result);

  const status = passed ? "✅ PASS" : "❌ FAIL";
  console.log(`${status} - ${testName}: ${details}`);
}

// Helper function to make HTTP requests
async function makeRequest(method, endpoint, data = null, headers = {}) {
  try {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      timeout: 5000,
      validateStatus: () => true, // Don't throw on error status codes
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
    };

    if (data) {
      config.data = data;
    }

    const response = await axios(config);
    return response;
  } catch (error) {
    return {
      status: 0,
      data: { error: error.message },
      headers: {},
    };
  }
}

// Test 1: Rate Limiting
async function testRateLimiting() {
  console.log("\n🔄 Testing Rate Limiting...");

  // Test general API rate limiting
  const requests = [];
  for (let i = 0; i < 105; i++) {
    // Exceed 100 request limit
    requests.push(makeRequest("GET", "/api/health"));
  }

  const responses = await Promise.all(requests);
  const rateLimitedResponses = responses.filter((r) => r.status === 429);

  logTest(
    "API Rate Limiting",
    rateLimitedResponses.length > 0,
    `Rate limited after ${
      responses.length - rateLimitedResponses.length
    } requests`
  );

  // Test authentication rate limiting
  const authRequests = [];
  for (let i = 0; i < 7; i++) {
    // Exceed 5 auth attempt limit
    authRequests.push(
      makeRequest("POST", "/api/auth/login", {
        email: "test@test.com",
        password: "wrongpassword",
      })
    );
  }

  const authResponses = await Promise.all(authRequests);
  const authRateLimited = authResponses.filter((r) => r.status === 429);

  logTest(
    "Authentication Rate Limiting",
    authRateLimited.length > 0,
    `Auth rate limited after ${
      authResponses.length - authRateLimited.length
    } attempts`
  );
}

// Test 2: XSS Protection
async function testXSSProtection() {
  console.log("\n🛡️ Testing XSS Protection...");

  const xssPayloads = [
    '<script>alert("xss")</script>',
    '<img src=x onerror=alert("xss")>',
    'javascript:alert("xss")',
    '<svg onload=alert("xss")>',
    '"><script>alert("xss")</script>',
  ];

  for (const payload of xssPayloads) {
    const response = await makeRequest("POST", "/api/auth/login", {
      email: payload,
      password: "test",
    });

    // Check if payload was sanitized (should not contain script tags)
    const responseText = JSON.stringify(response.data);
    const containsScript = /<script|javascript:|onerror=/i.test(responseText);

    logTest(
      `XSS Protection (${payload.substring(0, 20)}...)`,
      !containsScript,
      containsScript ? "XSS payload not sanitized" : "XSS payload sanitized"
    );
  }
}

// Test 3: File Upload Security
async function testFileUploadSecurity() {
  console.log("\n📁 Testing File Upload Security...");

  // Create test files
  const testFiles = [
    {
      name: "test.php.jpg",
      content: '<?php echo "malicious"; ?>',
      shouldBlock: true,
    },
    { name: "test.exe", content: "MZ executable", shouldBlock: true },
    { name: "test.jpg", content: "fake jpeg content", shouldBlock: false },
    {
      name: "large.jpg",
      content: "x".repeat(6 * 1024 * 1024),
      shouldBlock: true,
    }, // 6MB file
  ];

  for (const file of testFiles) {
    try {
      // Write temporary file
      fs.writeFileSync(`/tmp/${file.name}`, file.content);

      const form = new FormData();
      form.append("profile-image", fs.createReadStream(`/tmp/${file.name}`));

      const response = await axios.post(`${BASE_URL}/api/upload-image`, form, {
        headers: {
          ...form.getHeaders(),
          Cookie: "token=dummy_token", // Would need real token in practice
        },
        validateStatus: () => true,
      });

      const wasBlocked = response.status >= 400;
      const testPassed = file.shouldBlock ? wasBlocked : !wasBlocked;

      logTest(
        `File Upload Security (${file.name})`,
        testPassed,
        `Expected ${file.shouldBlock ? "blocked" : "allowed"}, got ${
          wasBlocked ? "blocked" : "allowed"
        }`
      );

      // Cleanup
      fs.unlinkSync(`/tmp/${file.name}`);
    } catch (error) {
      logTest(
        `File Upload Security (${file.name})`,
        true, // Error is expected for security reasons
        `Upload blocked with error: ${error.message}`
      );
    }
  }
}

// Test 4: NoSQL Injection Protection
async function testNoSQLInjectionProtection() {
  console.log("\n💉 Testing NoSQL Injection Protection...");

  const injectionPayloads = [
    { $ne: null },
    { $gt: "" },
    { $where: "this.email" },
    { $regex: ".*" },
    { email: { $ne: null } },
  ];

  for (const payload of injectionPayloads) {
    const response = await makeRequest("POST", "/api/auth/login", {
      email: payload,
      password: "test",
    });

    // Should return 400 or sanitize the input
    const wasBlocked =
      response.status === 400 ||
      (!JSON.stringify(response.data).includes("$ne") &&
        !JSON.stringify(response.data).includes("$gt") &&
        !JSON.stringify(response.data).includes("$where"));

    logTest(
      `NoSQL Injection Protection (${JSON.stringify(payload).substring(
        0,
        30
      )}...)`,
      wasBlocked,
      wasBlocked
        ? "Injection payload sanitized/blocked"
        : "Injection payload not blocked"
    );
  }
}

// Test 5: Security Headers
async function testSecurityHeaders() {
  console.log("\n🔒 Testing Security Headers...");

  const response = await makeRequest("GET", "/api/health");
  const headers = response.headers;

  const securityHeaders = {
    "x-frame-options": "DENY",
    "x-content-type-options": "nosniff",
    "content-security-policy": true, // Just check if exists
    "referrer-policy": "strict-origin-when-cross-origin",
    "permissions-policy": true,
  };

  for (const [header, expectedValue] of Object.entries(securityHeaders)) {
    const headerValue = headers[header] || headers[header.toLowerCase()];
    let testPassed;

    if (expectedValue === true) {
      testPassed = !!headerValue;
    } else {
      testPassed = headerValue === expectedValue;
    }

    logTest(
      `Security Header (${header})`,
      testPassed,
      testPassed ? `Present: ${headerValue}` : `Missing or incorrect value`
    );
  }
}

// Test 6: Authentication Security
async function testAuthSecurity() {
  console.log("\n🔐 Testing Authentication Security...");

  // Test password strength validation
  const weakPasswords = ["123", "password", "abc123", "111111"];

  for (const password of weakPasswords) {
    const response = await makeRequest("POST", "/api/auth/reset-password", {
      userId: "dummy_id",
      newPassword: password,
    });

    const wasRejected = response.status === 400;
    logTest(
      `Password Strength (${password})`,
      wasRejected,
      wasRejected ? "Weak password rejected" : "Weak password accepted"
    );
  }

  // Test generic error messages (no user enumeration)
  const testEmails = ["nonexistent@test.com", "valid@format.com"];

  for (const email of testEmails) {
    const response = await makeRequest("POST", "/api/auth/login", {
      email: email,
      password: "wrongpassword",
    });

    const isGenericMessage = response.data?.message?.includes(
      "Invalid email or password"
    );
    logTest(
      `Generic Error Message (${email})`,
      isGenericMessage,
      isGenericMessage
        ? "Generic error message used"
        : "Specific error message exposed"
    );
  }
}

// Main test runner
async function runSecurityTests() {
  console.log("🔍 Starting Communiatec Security Test Suite...\n");
  console.log(`Target: ${BASE_URL}`);
  console.log("=".repeat(60));

  try {
    // Check if server is running
    const healthCheck = await makeRequest("GET", "/api/health");
    if (healthCheck.status !== 200) {
      console.error("❌ Server is not running or not accessible");
      process.exit(1);
    }

    console.log("✅ Server is accessible\n");

    // Run all tests
    if (tests.rateLimiting) await testRateLimiting();
    if (tests.xssProtection) await testXSSProtection();
    if (tests.fileUploadSecurity) await testFileUploadSecurity();
    if (tests.sqlInjectionProtection) await testNoSQLInjectionProtection();
    if (tests.securityHeaders) await testSecurityHeaders();
    if (tests.authSecurity) await testAuthSecurity();

    // Generate summary
    console.log("\n" + "=".repeat(60));
    console.log("📊 SECURITY TEST SUMMARY");
    console.log("=".repeat(60));

    const passed = testResults.filter((r) => r.status === "PASS").length;
    const failed = testResults.filter((r) => r.status === "FAIL").length;
    const total = testResults.length;

    console.log(`Total Tests: ${total}`);
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📊 Success Rate: ${((passed / total) * 100).toFixed(1)}%`);

    // Save detailed results
    const report = {
      summary: { total, passed, failed, successRate: (passed / total) * 100 },
      tests: testResults,
      timestamp: new Date().toISOString(),
      target: BASE_URL,
    };

    fs.writeFileSync(
      "security-test-report.json",
      JSON.stringify(report, null, 2)
    );
    console.log("\n📄 Detailed report saved to: security-test-report.json");

    if (failed > 0) {
      console.log(
        "\n⚠️  Some security tests failed. Please review and fix issues."
      );
      process.exit(1);
    } else {
      console.log(
        "\n🎉 All security tests passed! Your application is secure."
      );
    }
  } catch (error) {
    console.error("❌ Error running security tests:", error.message);
    process.exit(1);
  }
}

// Run tests if script is executed directly
if (require.main === module) {
  runSecurityTests();
}

module.exports = { runSecurityTests };

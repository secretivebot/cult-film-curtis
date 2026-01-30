/**
 * Test script for Cult Film Curtis
 * Run with: bun run test-agent.ts
 */

const BASE_URL = `http://localhost:${process.env.PORT || 8090}`;

interface TestResult {
  name: string;
  passed: boolean;
  response?: any;
  error?: string;
}

async function runTests(): Promise<void> {
  const results: TestResult[] = [];
  
  console.log("\n🎬 Testing Cult Film Curtis Agent\n");
  console.log("=".repeat(50));
  
  // Test 1: Agent Info (GET /)
  try {
    console.log("\n📋 Test 1: GET / (Agent Info)");
    const res = await fetch(`${BASE_URL}/`);
    const data = await res.json();
    
    const passed = data.name === "Cult Film Curtis" && 
                   data.payment?.protocol === "x402" &&
                   data.catalog_size > 0;
    
    results.push({ name: "Agent Info", passed, response: data });
    console.log(`   Status: ${res.status}`);
    console.log(`   Name: ${data.name}`);
    console.log(`   Catalog Size: ${data.catalog_size} films`);
    console.log(`   Price: ${data.endpoints?.main?.price?.amount} USDC`);
    console.log(`   ✅ ${passed ? "PASSED" : "FAILED"}`);
  } catch (error) {
    results.push({ name: "Agent Info", passed: false, error: String(error) });
    console.log(`   ❌ FAILED: ${error}`);
  }
  
  // Test 2: Health Check (GET /health)
  try {
    console.log("\n🏥 Test 2: GET /health (Health Check)");
    const res = await fetch(`${BASE_URL}/health`);
    const data = await res.json();
    
    const passed = data.status === "healthy" && data.timestamp;
    
    results.push({ name: "Health Check", passed, response: data });
    console.log(`   Status: ${res.status}`);
    console.log(`   Health: ${data.status}`);
    console.log(`   Timestamp: ${data.timestamp}`);
    console.log(`   ✅ ${passed ? "PASSED" : "FAILED"}`);
  } catch (error) {
    results.push({ name: "Health Check", passed: false, error: String(error) });
    console.log(`   ❌ FAILED: ${error}`);
  }
  
  // Test 3: Payment Capabilities (GET /x402/supported)
  try {
    console.log("\n💳 Test 3: GET /x402/supported (Payment Capabilities)");
    const res = await fetch(`${BASE_URL}/x402/supported`);
    const data = await res.json();
    
    const passed = data.supported === true && 
                   data.network === "base" &&
                   data.version === "v2";
    
    results.push({ name: "Payment Capabilities", passed, response: data });
    console.log(`   Status: ${res.status}`);
    console.log(`   Supported: ${data.supported}`);
    console.log(`   Network: ${data.network}`);
    console.log(`   Schemes: ${data.schemes?.join(", ")}`);
    console.log(`   ✅ ${passed ? "PASSED" : "FAILED"}`);
  } catch (error) {
    results.push({ name: "Payment Capabilities", passed: false, error: String(error) });
    console.log(`   ❌ FAILED: ${error}`);
  }
  
  // Test 4: Payment Required (POST /cultmovieidea without payment)
  try {
    console.log("\n🔒 Test 4: POST /cultmovieidea (Without Payment)");
    const res = await fetch(`${BASE_URL}/cultmovieidea`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    const data = await res.json();
    
    const passed = res.status === 402 && data.code === "PAYMENT_REQUIRED";
    
    results.push({ name: "Payment Required Response", passed, response: data });
    console.log(`   Status: ${res.status}`);
    console.log(`   Error Code: ${data.code}`);
    console.log(`   Message: ${data.details?.message}`);
    console.log(`   ✅ ${passed ? "PASSED" : "FAILED"}`);
  } catch (error) {
    results.push({ name: "Payment Required Response", passed: false, error: String(error) });
    console.log(`   ❌ FAILED: ${error}`);
  }
  
  // Test 5: Verify endpoint exists (POST /x402/verify)
  try {
    console.log("\n🔍 Test 5: POST /x402/verify (Endpoint Exists)");
    const res = await fetch(`${BASE_URL}/x402/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    const data = await res.json();
    
    // We expect it to fail validation but the endpoint should exist
    const passed = res.status === 200 && data.valid === false;
    
    results.push({ name: "Verify Endpoint", passed, response: data });
    console.log(`   Status: ${res.status}`);
    console.log(`   Valid: ${data.valid}`);
    console.log(`   Error: ${data.error || "N/A"}`);
    console.log(`   ✅ ${passed ? "PASSED" : "FAILED"}`);
  } catch (error) {
    results.push({ name: "Verify Endpoint", passed: false, error: String(error) });
    console.log(`   ❌ FAILED: ${error}`);
  }
  
  // Summary
  console.log("\n" + "=".repeat(50));
  console.log("📊 TEST SUMMARY\n");
  
  const passed = results.filter(r => r.passed).length;
  const total = results.length;
  
  results.forEach(r => {
    console.log(`   ${r.passed ? "✅" : "❌"} ${r.name}`);
  });
  
  console.log(`\n   Total: ${passed}/${total} tests passed`);
  
  if (passed === total) {
    console.log("\n🎉 All tests passed! Curtis is ready to recommend cult films.\n");
  } else {
    console.log("\n⚠️  Some tests failed. Check the output above for details.\n");
  }
  
  console.log("Note: Payment flow testing requires a funded wallet and xGate setup.");
  console.log("The agent correctly returns 402 Payment Required for the main endpoint.\n");
}

runTests().catch(console.error);

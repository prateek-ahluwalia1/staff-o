import { determineJobRegion } from "../src/utils/australianRegionClassifier.js";

async function simulateBuildPayload(formInput) {
  const regionRes = await determineJobRegion({
    coordinates: formInput.coordinates,
    postcode: formInput.postcode,
    address: formInput.address || formInput.location,
  });

  if (!regionRes.success || !regionRes.region) {
    throw new Error(regionRes.error || "Region determination failed");
  }

  // Shifts payload with region inside each shift
  const shiftsPayload = (formInput.shifts || []).map((shift) => ({
    start: shift.start,
    end: shift.end,
    numberOfGuards: shift.numberOfGuards,
    region: regionRes.region,
  }));

  // Simulated basePayload matching add-job.jsx
  const basePayload = {
    user_id: formInput.user_id || 912,
    title: (formInput.title || "").trim(),
    job_type: formInput.jobType || "static-security",
    job_level: formInput.job_level || 1,
    description: formInput.description || "",
    address: formInput.location || formInput.address,
    coordinates: formInput.coordinates || "",
    state: formInput.state || "queensland",
    shifts: shiftsPayload,
    job_location_state: formInput.state || "queensland",
    region: regionRes.region, // Top-level region
    financials: {
      amount_to_charge_today: 435.79,
    },
    payment_option: "full",
  };

  return basePayload;
}

function simulateHoldBody(payload, cardHolderName = "test", paymentMethodId = "pm_1UQ3FkDb535HMVUZQ2L01Fkj") {
  return {
    job_level: payload.job_level,
    region: payload.region,
    shifts: payload.shifts,
    user_id: Number(payload.user_id),
    card_holder_name: cardHolderName,
    payment_method_id: paymentMethodId,
    payment_option: payload.payment_option,
    amount_to_charge: payload.financials.amount_to_charge_today,
    requires_110_buffer: true,
  };
}

async function runTests() {
  console.log("=================================================");
  console.log("TESTING PAYLOAD & API/PAYMENT/HOLD WITH REGION");
  console.log("=================================================");

  // Test 1: User's illustrative example & api/payment/hold test
  const form1 = {
    user_id: 912,
    job_level: 1,
    address: "Qld National Ballet School, 57 Hayward St, Stafford QLD 4053, Australia",
    location: "Qld National Ballet School, 57 Hayward St, Stafford QLD 4053, Australia",
    coordinates: "-27.415003,153.0121998",
    state: "queensland",
    shifts: [
      {
        start: "2026-10-15T12:00",
        end: "2026-10-15T20:00",
        numberOfGuards: 1,
      },
    ],
  };

  const payload1 = await simulateBuildPayload(form1);
  const holdBody1 = simulateHoldBody(payload1);

  console.log("\nGenerated api/payment/hold Payload:");
  console.log(JSON.stringify(holdBody1, null, 2));

  // Assertions for holdBody
  if (holdBody1.region === "metro") {
    console.log("✓ PASS: holdBody contains top-level region: 'metro'");
  } else {
    console.error("✗ FAIL: holdBody missing top-level region!");
    process.exit(1);
  }

  // Assertions for each shift in shifts
  const shiftItem = holdBody1.shifts[0];
  if (
    shiftItem.start === "2026-10-15T12:00" &&
    shiftItem.end === "2026-10-15T20:00" &&
    shiftItem.numberOfGuards === 1 &&
    shiftItem.region === "metro"
  ) {
    console.log("✓ PASS: Shift item contains start, end, numberOfGuards, and region: 'metro'");
  } else {
    console.error("✗ FAIL: Shift item missing region!");
    process.exit(1);
  }

  // Test 2: Regional location (Cairns QLD 4870)
  const form2 = {
    user_id: 912,
    job_level: 1,
    address: "123 Cairns Esplanade, Cairns QLD 4870, Australia",
    coordinates: "-16.9203,145.7710",
    state: "queensland",
    shifts: [
      {
        start: "2026-10-16T08:00",
        end: "2026-10-16T16:00",
        numberOfGuards: 2,
      },
    ],
  };

  const payload2 = await simulateBuildPayload(form2);
  const holdBody2 = simulateHoldBody(payload2);

  if (holdBody2.region === "regional" && holdBody2.shifts[0].region === "regional") {
    console.log("✓ PASS: Cairns regional holdBody and shift both contain region: 'regional'");
  } else {
    console.error("✗ FAIL: Cairns regional test failed!");
    process.exit(1);
  }

  console.log("\n=================================================");
  console.log("ALL TESTS PASSED SUCCESSFULLY (100%)");
  console.log("=================================================");
}

runTests();

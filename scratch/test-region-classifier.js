import {
  classifyPostcode,
  validateCoordinates,
  extractPostcodeFromAddress,
  determineJobRegion,
  AUSTRALIA_BOUNDS,
} from "../src/utils/australianRegionClassifier.js";

let totalTests = 0;
let passedTests = 0;

function assert(condition, testName) {
  totalTests++;
  if (condition) {
    console.log(`  ✓ PASS: ${testName}`);
    passedTests++;
  } else {
    console.error(`  ✗ FAIL: ${testName}`);
  }
}

console.log("\n=======================================================");
console.log("TEST SUITE 1: VERIFIED METRO LOCATIONS ACROSS AUSTRALIA");
console.log("=======================================================");

// 1. User illustrative example: Stafford QLD 4053
const qldExample = classifyPostcode("4053");
assert(qldExample.isValid && qldExample.region === "metro" && qldExample.state === "qld", "Stafford QLD 4053 is Metro");

// 2. Sydney CBD NSW 2000
const nswMetro = classifyPostcode("2000");
assert(nswMetro.isValid && nswMetro.region === "metro" && nswMetro.state === "nsw", "Sydney CBD NSW 2000 is Metro");

// 3. Campbelltown / Camden NSW 2560 (Outer Sydney Metro)
const nswOuterMetro = classifyPostcode("2560");
assert(nswOuterMetro.isValid && nswOuterMetro.region === "metro", "Campbelltown NSW 2560 is Metro");

// 4. Penrith NSW 2750 (Western Sydney Metro)
const nswWestMetro = classifyPostcode("2750");
assert(nswWestMetro.isValid && nswWestMetro.region === "metro", "Penrith NSW 2750 is Metro");

// 5. Melbourne CBD VIC 3000
const vicMetro = classifyPostcode("3000");
assert(vicMetro.isValid && vicMetro.region === "metro" && vicMetro.state === "vic", "Melbourne CBD VIC 3000 is Metro");

// 6. Werribee VIC 3030 / Frankston VIC 3199
const vicOuterMetro = classifyPostcode("3030");
assert(vicOuterMetro.isValid && vicOuterMetro.region === "metro", "Werribee VIC 3030 is Metro");

// 7. Ipswich QLD 4305 (Ipswich Metro)
const qldIpswich = classifyPostcode("4305");
assert(qldIpswich.isValid && qldIpswich.region === "metro", "Ipswich QLD 4305 is Metro");

// 8. Perth CBD WA 6000
const waMetro = classifyPostcode("6000");
assert(waMetro.isValid && waMetro.region === "metro" && waMetro.state === "wa", "Perth CBD WA 6000 is Metro");

// 9. Mandurah WA 6210 (Peel/Perth Metro extension)
const waMandurah = classifyPostcode("6210");
assert(waMandurah.isValid && waMandurah.region === "metro", "Mandurah WA 6210 is Metro");

// 10. Adelaide CBD SA 5000
const saMetro = classifyPostcode("5000");
assert(saMetro.isValid && saMetro.region === "metro" && saMetro.state === "sa", "Adelaide CBD SA 5000 is Metro");

// 11. Canberra ACT 2600
const actMetro = classifyPostcode("2600");
assert(actMetro.isValid && actMetro.region === "metro" && actMetro.state === "act", "Canberra ACT 2600 is Metro");

// 12. Hobart TAS 7000
const tasMetro = classifyPostcode("7000");
assert(tasMetro.isValid && tasMetro.region === "metro" && tasMetro.state === "tas", "Hobart TAS 7000 is Metro");

// 13. Darwin NT 0800
const ntMetro = classifyPostcode("0800");
assert(ntMetro.isValid && ntMetro.region === "metro" && ntMetro.state === "nt", "Darwin NT 0800 is Metro");


console.log("\n=======================================================");
console.log("TEST SUITE 2: VERIFIED REGIONAL LOCATIONS ACROSS AUSTRALIA");
console.log("=======================================================");

// 1. Cairns QLD 4870
const qldRegional = classifyPostcode("4870");
assert(qldRegional.isValid && qldRegional.region === "regional", "Cairns QLD 4870 is Regional");

// 2. Gold Coast QLD 4217 (Regional)
const qldGoldCoast = classifyPostcode("4217");
assert(qldGoldCoast.isValid && qldGoldCoast.region === "regional", "Gold Coast QLD 4217 is Regional");

// 3. Toowoomba QLD 4350
const qldToowoomba = classifyPostcode("4350");
assert(qldToowoomba.isValid && qldToowoomba.region === "regional", "Toowoomba QLD 4350 is Regional");

// 4. Dubbo NSW 2830
const nswDubbo = classifyPostcode("2830");
assert(nswDubbo.isValid && nswDubbo.region === "regional", "Dubbo NSW 2830 is Regional");

// 5. Newcastle NSW 2300
const nswNewcastle = classifyPostcode("2300");
assert(nswNewcastle.isValid && nswNewcastle.region === "regional", "Newcastle NSW 2300 is Regional");

// 6. Wollongong NSW 2500
const nswWollongong = classifyPostcode("2500");
assert(nswWollongong.isValid && nswWollongong.region === "regional", "Wollongong NSW 2500 is Regional");

// 7. Bendigo VIC 3550
const vicBendigo = classifyPostcode("3550");
assert(vicBendigo.isValid && vicBendigo.region === "regional", "Bendigo VIC 3550 is Regional");

// 8. Geelong VIC 3220
const vicGeelong = classifyPostcode("3220");
assert(vicGeelong.isValid && vicGeelong.region === "regional", "Geelong VIC 3220 is Regional");

// 9. Ballarat VIC 3350
const vicBallarat = classifyPostcode("3350");
assert(vicBallarat.isValid && vicBallarat.region === "regional", "Ballarat VIC 3350 is Regional");

// 10. Broome WA 6725
const waBroome = classifyPostcode("6725");
assert(waBroome.isValid && waBroome.region === "regional", "Broome WA 6725 is Regional");

// 11. Bunbury WA 6230
const waBunbury = classifyPostcode("6230");
assert(waBunbury.isValid && waBunbury.region === "regional", "Bunbury WA 6230 is Regional");

// 12. Port Lincoln SA 5606
const saPortLincoln = classifyPostcode("5606");
assert(saPortLincoln.isValid && saPortLincoln.region === "regional", "Port Lincoln SA 5606 is Regional");

// 13. Mount Gambier SA 5290
const saMtGambier = classifyPostcode("5290");
assert(saMtGambier.isValid && saMtGambier.region === "regional", "Mount Gambier SA 5290 is Regional");

// 14. Launceston TAS 7250
const tasLaunceston = classifyPostcode("7250");
assert(tasLaunceston.isValid && tasLaunceston.region === "regional", "Launceston TAS 7250 is Regional");

// 15. Alice Springs NT 0870
const ntAliceSprings = classifyPostcode("0870");
assert(ntAliceSprings.isValid && ntAliceSprings.region === "regional", "Alice Springs NT 0870 is Regional");


console.log("\n=======================================================");
console.log("TEST SUITE 3: COORDINATE VALIDATION & ERROR HANDLING");
console.log("=======================================================");

// 1. Valid coordinates for Brisbane
const validBrisbane = validateCoordinates("-27.415003,153.0121998");
assert(validBrisbane.isValid && validBrisbane.lat === -27.415003 && validBrisbane.lng === 153.0121998, "Valid Brisbane coordinates accepted");

// 2. Valid coordinates object
const validObj = validateCoordinates({ lat: -33.8688, lng: 151.2093 });
assert(validObj.isValid, "Valid coordinate object accepted");

// 3. Missing coordinates
const missingCoords = validateCoordinates("");
assert(!missingCoords.isValid && missingCoords.error.includes("Missing"), "Missing coordinates correctly rejected");

// 4. Invalid coordinate string
const invalidFormat = validateCoordinates("invalid,coordinates");
assert(!invalidFormat.isValid && invalidFormat.error.includes("numeric"), "Non-numeric coordinates correctly rejected");

// 5. Coordinates outside Australia (London: 51.4925, -0.1486)
const londonCoords = validateCoordinates("51.4924955,-0.1486599");
assert(!londonCoords.isValid && londonCoords.outsideAustralia === true, "London coordinates correctly rejected as outside Australia");

// 6. Coordinates outside Australia (New York: 40.7128, -74.0060)
const nyCoords = validateCoordinates("40.7128,-74.0060");
assert(!nyCoords.isValid && nyCoords.outsideAustralia === true, "New York coordinates correctly rejected as outside Australia");


console.log("\n=======================================================");
console.log("TEST SUITE 4: POSTCODE EXTRACTION FROM ADDRESS");
console.log("=======================================================");

// 1. Illustrative example address
const addr1 = "Qld National Ballet School, 57 Hayward St, Stafford QLD 4053, Australia";
assert(extractPostcodeFromAddress(addr1) === "4053", "Extracted 4053 from illustrative example address");

// 2. Address with state prefix
const addr2 = "100 George St, Sydney NSW 2000, Australia";
assert(extractPostcodeFromAddress(addr2) === "2000", "Extracted 2000 from Sydney NSW address");

// 3. Address ending with postcode Australia
const addr3 = "Collins Street, Melbourne 3000 Australia";
assert(extractPostcodeFromAddress(addr3) === "3000", "Extracted 3000 from Melbourne address");

// 4. Address with no postcode
const addr4 = "Somewhere without a postcode";
assert(extractPostcodeFromAddress(addr4) === null, "No postcode returned when address lacks one");


console.log("\n=======================================================");
console.log("TEST SUITE 5: UNRECOGNIZED POSTCODES & SAFETY (NO SILENT DEFAULT)");
console.log("=======================================================");

// 1. Unrecognized postcode 99999
const unrec1 = classifyPostcode("99999");
assert(!unrec1.isValid && unrec1.region === undefined, "Postcode 99999 rejected without silent default");

// 2. Unrecognized postcode 0000
const unrec2 = classifyPostcode("0000");
assert(!unrec2.isValid && unrec2.region === undefined, "Postcode 0000 rejected without silent default");

// 3. Empty postcode
const unrec3 = classifyPostcode("");
assert(!unrec3.isValid && unrec3.region === undefined, "Empty postcode rejected without silent default");


console.log("\n=======================================================");
console.log("TEST SUITE 6: END-TO-END DETERMINE JOB REGION");
console.log("=======================================================");

// 1. User example: Stafford QLD 4053
const job1 = await determineJobRegion({
  address: "Qld National Ballet School, 57 Hayward St, Stafford QLD 4053, Australia",
  coordinates: "-27.415003,153.0121998",
});
assert(job1.success && job1.region === "metro" && job1.postcode === "4053", "E2E: User example resolved to 'metro'");

// 2. Cairns regional job
const job2 = await determineJobRegion({
  address: "123 Cairns Esplanade, Cairns QLD 4870, Australia",
  coordinates: "-16.9203,145.7710",
});
assert(job2.success && job2.region === "regional" && job2.postcode === "4870", "E2E: Cairns job resolved to 'regional'");

// 3. Missing coordinates failure
const job3 = await determineJobRegion({
  address: "57 Hayward St, Stafford QLD 4053",
  coordinates: "",
});
assert(!job3.success && job3.region === null, "E2E: Missing coordinates fails safely with no silent default");

// 4. Coordinates outside Australia failure
const job4 = await determineJobRegion({
  address: "London, UK",
  coordinates: "51.4924955,-0.1486599",
  postcode: "SW1A 1AA",
});
assert(!job4.success && job4.region === null, "E2E: Overseas location fails safely with no silent default");

// 5. Unrecognized postcode failure
const job5 = await determineJobRegion({
  address: "Unknown Postcode Road, 99999",
  coordinates: "-27.415003,153.0121998",
  postcode: "99999",
});
assert(!job5.success && job5.region === null, "E2E: Unrecognized postcode fails safely with no silent default");


console.log("\n=======================================================");
console.log(`TOTAL TESTS: ${totalTests}`);
console.log(`PASSED: ${passedTests}`);
console.log(`FAILED: ${totalTests - passedTests}`);
console.log("=======================================================");

if (totalTests === passedTests) {
  process.exit(0);
} else {
  process.exit(1);
}

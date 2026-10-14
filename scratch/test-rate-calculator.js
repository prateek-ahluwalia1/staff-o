import {
  isValidRegion,
  normalizeRegion,
  mapApiRates,
  computeShiftBreakdown,
  calculateJobPricing,
} from "../src/utils/rateCalculator.js";

// Sample Staffoo Level 1 Charge Rate Record from DB
const mockLevel1ChargeRate = {
  id: 1,
  level: "1",
  title: "Level 1 Charge Rate",
  // Metro rates
  def_metro_mon_to_fri_day_rate: "51.50",
  def_metro_mon_to_fri_night_rate: "58.63",
  def_metro_sat_day_rate: "69.95",
  def_metro_sat_night_rate: "69.95",
  def_metro_sun_day_rate: "80.50",
  def_metro_sun_night_rate: "80.50",
  def_metro_pub_holi_day_rate: "105.00",
  def_metro_pub_holi_night_rate: "105.00",
  // Regional rates (higher regional allowances)
  def_reg_mon_to_fri_day_rate: "56.50",
  def_reg_mon_to_fri_night_rate: "64.20",
  def_reg_sat_day_rate: "76.50",
  def_reg_sat_night_rate: "76.50",
  def_reg_sun_day_rate: "88.00",
  def_reg_sun_night_rate: "88.00",
  def_reg_pub_holi_day_rate: "115.00",
  def_reg_pub_holi_night_rate: "115.00",
};

let passed = 0;
let total = 0;

function assert(condition, testName) {
  total++;
  if (condition) {
    console.log(`  ✓ PASS: ${testName}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${testName}`);
  }
}

console.log("=================================================");
console.log("TEST SUITE 1: REGION VALIDATION");
console.log("=================================================");

assert(isValidRegion("metro") === true, "isValidRegion('metro') is true");
assert(isValidRegion("regional") === true, "isValidRegion('regional') is true");
assert(isValidRegion("Metro") === true, "isValidRegion('Metro') case-insensitive is true");
assert(isValidRegion("REGIONAL") === true, "isValidRegion('REGIONAL') case-insensitive is true");
assert(isValidRegion("def_metro") === true, "isValidRegion('def_metro') legacy prefix is true");
assert(isValidRegion("def_reg") === true, "isValidRegion('def_reg') legacy prefix is true");
assert(isValidRegion("") === false, "isValidRegion('') is false");
assert(isValidRegion("other") === false, "isValidRegion('other') is false");
assert(isValidRegion(null) === false, "isValidRegion(null) is false");
assert(isValidRegion(undefined) === false, "isValidRegion(undefined) is false");

assert(normalizeRegion("metro") === "metro", "normalizeRegion('metro') -> 'metro'");
assert(normalizeRegion("REGIONAL") === "regional", "normalizeRegion('REGIONAL') -> 'regional'");
assert(normalizeRegion("invalid") === null, "normalizeRegion('invalid') -> null");
assert(normalizeRegion(null) === null, "normalizeRegion(null) -> null");

console.log("\n=================================================");
console.log("TEST SUITE 2: RATE FIELD MAPPING (METRO VS REGIONAL)");
console.log("=================================================");

const metroRates = mapApiRates(mockLevel1ChargeRate, null, "metro");
assert(metroRates !== null, "Metro rates mapped successfully");
assert(metroRates.region === "metro", "Metro rates region is 'metro'");
assert(metroRates.charge.weekday.night === 58.63, "Metro Mon-Fri Night rate is $58.63");
assert(metroRates.charge.sat.day === 69.95, "Metro Saturday rate is $69.95");
assert(metroRates.charge.sun.day === 80.50, "Metro Sunday rate is $80.50");
assert(metroRates.charge.pub_holiday.day === 105.00, "Metro Public Holiday rate is $105.00");

const regRates = mapApiRates(mockLevel1ChargeRate, null, "regional");
assert(regRates !== null, "Regional rates mapped successfully");
assert(regRates.region === "regional", "Regional rates region is 'regional'");
assert(regRates.charge.weekday.night === 64.20, "Regional Mon-Fri Night rate is $64.20");
assert(regRates.charge.sat.day === 76.50, "Regional Saturday rate is $76.50");
assert(regRates.charge.sun.day === 88.00, "Regional Sunday rate is $88.00");
assert(regRates.charge.pub_holiday.day === 115.00, "Regional Public Holiday rate is $115.00");

// Safe handling of missing or invalid region: MUST NOT default to Metro
const invalidRates = mapApiRates(mockLevel1ChargeRate, null, "invalid_region");
assert(invalidRates === null, "Invalid region returns null (does NOT silently default to metro)");

const nullRates = mapApiRates(mockLevel1ChargeRate, null, null);
assert(nullRates === null, "Null region returns null (does NOT silently default to metro)");

console.log("\n=================================================");
console.log("TEST SUITE 3: USER SCENARIO (8.00 HRS: 6h Fri Night + 2h Sat)");
console.log("=================================================");

// Shift starting Friday 18:00 ending Saturday 02:00
const userScheduleDays = [
  {
    date: "2026-10-16", // Friday
    shifts: [
      {
        startTime: "18:00",
        endTime: "02:00",
        numGuards: 1,
      },
    ],
  },
];

// Metro breakdown
const metroBreakdown = computeShiftBreakdown(userScheduleDays, metroRates);
assert(metroBreakdown !== null, "Metro breakdown computed");
assert(metroBreakdown.totalHours === 8, "Total hours is 8.00");
assert(metroBreakdown.segments.length === 2, "Segments count is 2 (Mon-Fri Night + Saturday)");

const metroNightSeg = metroBreakdown.segments.find((s) => s.key === "weekday_night");
assert(metroNightSeg && metroNightSeg.hours === 6, "Mon-Fri Night hours is 6.00");
assert(metroNightSeg && metroNightSeg.chargeRate === 58.63, "Mon-Fri Night rate is $58.63");
assert(metroNightSeg && metroNightSeg.chargeAmount === 351.78, "Mon-Fri Night amount is $351.78");

const metroSatSeg = metroBreakdown.segments.find((s) => s.key === "sat_all");
assert(metroSatSeg && metroSatSeg.hours === 2, "Saturday hours is 2.00");
assert(metroSatSeg && metroSatSeg.chargeRate === 69.95, "Saturday rate is $69.95");
assert(metroSatSeg && metroSatSeg.chargeAmount === 139.90, "Saturday amount is $139.90");

assert(metroBreakdown.chargeTotal === 491.68, "Metro subtotal is $491.68");

// Financials with Pay in Full (5% discount)
const metroJobPayload = {
  region: "metro",
  payment_option: "full",
  scheduleDays: userScheduleDays,
};
const metroPricing = calculateJobPricing(metroJobPayload, mockLevel1ChargeRate);
assert(metroPricing.financials.subtotal === 491.68, "Subtotal is $491.68");
assert(metroPricing.financials.discount === 24.58, "Discount (5%) is $24.58");
assert(metroPricing.financials.discounted_subtotal === 467.10, "Discounted subtotal is $467.10");
assert(metroPricing.financials.gst === 46.71, "GST is $46.71");
assert(metroPricing.financials.total_inc_gst === 513.81, "Total is $513.81");
assert(metroPricing.financials.amount_due_today === 513.81, "Due today is $513.81");

console.log("\n  -> Metro Calculation exactly matches user current breakdown:");
console.log(`     Subtotal: $${metroPricing.financials.subtotal}, Discount: -$${metroPricing.financials.discount}, GST: $${metroPricing.financials.gst}, Total: $${metroPricing.financials.total_inc_gst}`);

// Regional breakdown for the exact same schedule
const regBreakdown = computeShiftBreakdown(userScheduleDays, regRates);
assert(regBreakdown !== null, "Regional breakdown computed");
assert(regBreakdown.totalHours === 8, "Total hours is 8.00");

const regNightSeg = regBreakdown.segments.find((s) => s.key === "weekday_night");
assert(regNightSeg && regNightSeg.hours === 6, "Regional Mon-Fri Night hours is 6.00");
assert(regNightSeg && regNightSeg.chargeRate === 64.20, "Regional Mon-Fri Night rate is $64.20");
assert(regNightSeg && regNightSeg.chargeAmount === 385.20, "Regional Mon-Fri Night amount is $385.20 (6 * 64.20)");

const regSatSeg = regBreakdown.segments.find((s) => s.key === "sat_all");
assert(regSatSeg && regSatSeg.hours === 2, "Regional Saturday hours is 2.00");
assert(regSatSeg && regSatSeg.chargeRate === 76.50, "Regional Saturday rate is $76.50");
assert(regSatSeg && regSatSeg.chargeAmount === 153.00, "Regional Saturday amount is $153.00 (2 * 76.50)");

assert(regBreakdown.chargeTotal === 538.20, "Regional subtotal is $538.20 (385.20 + 153.00)");

const regJobPayload = {
  region: "regional",
  payment_option: "full",
  scheduleDays: userScheduleDays,
};
const regPricing = calculateJobPricing(regJobPayload, mockLevel1ChargeRate);
assert(regPricing.financials.subtotal === 538.20, "Regional subtotal is $538.20");
assert(regPricing.financials.discount === 26.91, "Regional discount (5%) is $26.91 (538.20 * 0.05)");
assert(regPricing.financials.discounted_subtotal === 511.29, "Regional discounted subtotal is $511.29");
assert(regPricing.financials.gst === 51.13, "Regional GST is $51.13");
assert(regPricing.financials.total_inc_gst === 562.42, "Regional total is $562.42");
assert(regPricing.financials.amount_due_today === 562.42, "Regional due today is $562.42");

console.log("\n  -> Regional Calculation correctly updates with regional rates:");
console.log(`     Subtotal: $${regPricing.financials.subtotal}, Discount: -$${regPricing.financials.discount}, GST: $${regPricing.financials.gst}, Total: $${regPricing.financials.total_inc_gst}`);

console.log("\n=================================================");
console.log("TEST SUITE 4: PUBLIC HOLIDAY & SUNDAY SHIFTS");
console.log("=================================================");

// Sunday shift (4 hrs)
const sundaySchedule = [
  {
    date: "2026-10-18", // Sunday
    shifts: [{ startTime: "10:00", endTime: "14:00", numGuards: 1 }],
  },
];
const metroSunBreakdown = computeShiftBreakdown(sundaySchedule, metroRates);
assert(metroSunBreakdown.segments[0].chargeRate === 80.50, "Metro Sunday rate applied ($80.50)");
assert(metroSunBreakdown.chargeTotal === 322.00, "Metro Sunday total: $322.00 (4 * 80.50)");

const regSunBreakdown = computeShiftBreakdown(sundaySchedule, regRates);
assert(regSunBreakdown.segments[0].chargeRate === 88.00, "Regional Sunday rate applied ($88.00)");
assert(regSunBreakdown.chargeTotal === 352.00, "Regional Sunday total: $352.00 (4 * 88.00)");

// Public Holiday shift (8 hrs)
const phSchedule = [
  {
    date: "2026-12-25", // Christmas Day
    isPublicHoliday: true,
    shifts: [{ startTime: "08:00", endTime: "16:00", numGuards: 1 }],
  },
];
const metroPhBreakdown = computeShiftBreakdown(phSchedule, metroRates);
assert(metroPhBreakdown.segments[0].key === "pub_holiday_all", "Public Holiday segment key is pub_holiday_all");
assert(metroPhBreakdown.segments[0].label === "Public Holiday", "Public Holiday label is 'Public Holiday'");
assert(metroPhBreakdown.segments[0].chargeRate === 105.00, "Metro PH rate is $105.00");
assert(metroPhBreakdown.chargeTotal === 840.00, "Metro PH total: $840.00 (8 * 105.00)");

const regPhBreakdown = computeShiftBreakdown(phSchedule, regRates);
assert(regPhBreakdown.segments[0].chargeRate === 115.00, "Regional PH rate is $115.00");
assert(regPhBreakdown.chargeTotal === 920.00, "Regional PH total: $920.00 (8 * 115.00)");

console.log("\n=================================================");
console.log(`TEST RESULTS: ${passed}/${total} PASSED`);
console.log("=================================================");

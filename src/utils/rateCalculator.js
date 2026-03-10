/**
 * Shift price-breakdown calculator
 *
 * Day-type rules (based on the calendar date the hour falls on)
 * -------------------------------------------------------------
 * weekday  : Monday – Thursday  (getDay 1-4)
 * fri      : Friday             (getDay 5)
 * sat      : Saturday           (getDay 6)
 * sun      : Sunday             (getDay 0)
 *
 * Each day type has separate rates for day (06:00–18:00) and night (18:00–06:00).
 * The shift is split at midnight, 06:00, and 18:00 so each segment is billed
 * at the correct day-type + slot rate.
 *
 * Rates must always come from the API via mapApiRates().
 * computeShiftBreakdown() returns null when no rates are provided.
 */

// ─── helpers ────────────────────────────────────────────────────────────────

/** Return 'sun' | 'weekday' | 'fri' | 'sat' for a Date object */
export function getDayType(date) {
  const d = date.getDay(); // 0=Sun 1=Mon … 5=Fri 6=Sat
  if (d === 0) return "sun";
  if (d === 5) return "fri";
  if (d === 6) return "sat";
  return "weekday";
}

/** Return 'day' | 'night' for a given hour (0–23) */
export function getSlot(hour) {
  return hour >= 6 && hour < 18 ? "day" : "night";
}

/** Human-readable label for each dayType + slot combination */
const SEGMENT_LABELS = {
  weekday_day: "Mon–Thu (Day 06:00–18:00)",
  weekday_night: "Mon–Thu (Night 18:00–06:00)",
  fri_day: "Friday (Day 06:00–18:00)",
  fri_night: "Friday (Night 18:00–06:00)",
  sat_day: "Saturday (Day 06:00–18:00)",
  sat_night: "Saturday (Night 18:00–06:00)",
  sun_day: "Sunday (Day 06:00–18:00)",
  sun_night: "Sunday (Night 18:00–06:00)",
};

/**
 * Given a Date cursor `t`, return the next rate-boundary.
 * Splits at 06:00, 18:00, and midnight (calendar-day change).
 */
function nextBoundary(t) {
  const h = t.getHours();
  const next = new Date(t);
  next.setSeconds(0, 0);

  if (h < 6) {
    next.setHours(6, 0, 0, 0);
  } else if (h < 18) {
    next.setHours(18, 0, 0, 0);
  } else {
    // 18:00–23:59 → advance to midnight (new calendar day)
    next.setDate(next.getDate() + 1);
    next.setHours(0, 0, 0, 0);
  }

  return next;
}

// ─── API → rates mapper ────────────────────────────────────────────────────

/**
 * Convert the API chargerate/payrate response records into the rates object
 * expected by computeShiftBreakdown().
 *
 * @param {object} chargeRecord  One item from chargeratesData.data[]
 * @param {object} payRecord     The object at payrateData.data
 * @param {string} [prefix]      Rate-set prefix: 'def_metro' | 'def_reg' |
 *                                'eba_metro' | 'eba_reg'  (default: 'def_metro')
 * @returns {object|null}  { pay: {...}, charge: {...} }  or null when chargeRecord is absent
 */
export function mapApiRates(chargeRecord, payRecord = null, prefix = "def_metro") {
  if (!chargeRecord) return null;

  const r = (record, key) => (record ? parseFloat(record?.[key]) || 0 : 0);

  return {
    pay: {
      // API uses mon_to_fri; map to both weekday (Mon-Thu) and fri
      weekday: {
        day: r(payRecord, `${prefix}_mon_to_fri_day_rate`),
        night: r(payRecord, `${prefix}_mon_to_fri_night_rate`),
      },
      fri: {
        day: r(payRecord, `${prefix}_mon_to_fri_day_rate`),
        night: r(payRecord, `${prefix}_mon_to_fri_night_rate`),
      },
      sat: {
        day: r(payRecord, `${prefix}_sat_day_rate`),
        night: r(payRecord, `${prefix}_sat_night_rate`),
      },
      sun: {
        day: r(payRecord, `${prefix}_sun_day_rate`),
        night: r(payRecord, `${prefix}_sun_night_rate`),
      },
    },
    charge: {
      weekday: {
        day: r(chargeRecord, `${prefix}_mon_to_fri_day_rate`),
        night: r(chargeRecord, `${prefix}_mon_to_fri_night_rate`),
      },
      fri: {
        day: r(chargeRecord, `${prefix}_mon_to_fri_day_rate`),
        night: r(chargeRecord, `${prefix}_mon_to_fri_night_rate`),
      },
      sat: {
        day: r(chargeRecord, `${prefix}_sat_day_rate`),
        night: r(chargeRecord, `${prefix}_sat_night_rate`),
      },
      sun: {
        day: r(chargeRecord, `${prefix}_sun_day_rate`),
        night: r(chargeRecord, `${prefix}_sun_night_rate`),
      },
    },
  };
}

// ─── main export ────────────────────────────────────────────────────────────

/**
 * Compute the pay & charge cost breakdown for a shift.
 *
 * @param {string} startDate  "YYYY-MM-DD"
 * @param {string} startTime  "HH:MM"
 * @param {string} endDate    "YYYY-MM-DD"
 * @param {string} endTime    "HH:MM"
 * @param {number} numGuards
 * @param {object} rates      Rates from mapApiRates(). Returns null when not provided.
 *
 * @returns {object|null}  null when input is incomplete, rates are missing, or shift has no duration.
 *
 * Return shape:
 * {
 *   segments: [{ key, label, hours, payRate, chargeRate, payAmount, chargeAmount }],
 *   payTotal, chargeTotal,
 *   numGuards,
 *   totalHours
 * }
 * All `Amount` fields are already multiplied by numGuards.
 */
export function computeShiftBreakdown(
  startDate,
  startTime,
  endDate,
  endTime,
  numGuards = 1,
  rates = null,
) {
  // ── validation ──────────────────────────────────────────────────────────
  if (!startDate || !startTime || !endDate || !endTime || !rates) return null;

  const [sy, sm, sd] = startDate.split("-").map(Number);
  const [sh, smin] = startTime.split(":").map(Number);
  const [ey, em, ed] = endDate.split("-").map(Number);
  const [eh, emin] = endTime.split(":").map(Number);

  const start = new Date(sy, sm - 1, sd, sh, smin, 0, 0);
  const end = new Date(ey, em - 1, ed, eh, emin, 0, 0);

  const durationMs = end - start;
  if (isNaN(durationMs) || durationMs <= 0) return null;

  const guards = Math.max(1, Number(numGuards) || 1);

  // ── walk the shift in "rate-zone" segments ──────────────────────────────
  // accumulated hours per key, preserving insertion order
  const hoursMap = new Map(); // key → hours
  const keyOrder = [];

  let t = new Date(start);

  while (t < end) {
    const boundary = nextBoundary(t);
    const segEnd = boundary < end ? boundary : end;

    const dayType = getDayType(t);
    const slot = getSlot(t.getHours());
    const key = `${dayType}_${slot}`;

    const segHours = (segEnd - t) / 3_600_000;

    if (!hoursMap.has(key)) {
      hoursMap.set(key, 0);
      keyOrder.push(key);
    }
    hoursMap.set(key, hoursMap.get(key) + segHours);

    t = new Date(segEnd);
  }

  // ── build segment rows ─────────────────────────────────────────────────
  let paySubtotalPerGuard = 0;
  let chargeSubtotalPerGuard = 0;
  let totalHours = 0;

  const segments = keyOrder.map((key) => {
    const [dayType, slot] = key.split("_");
    const hours = Math.round(hoursMap.get(key) * 100) / 100;

    const payRate = rates.pay[dayType]?.[slot] ?? 0;
    const chargeRate = rates.charge[dayType]?.[slot] ?? 0;

    const payAmtPerGuard = payRate * hours;
    const chargeAmtPerGuard = chargeRate * hours;

    paySubtotalPerGuard += payAmtPerGuard;
    chargeSubtotalPerGuard += chargeAmtPerGuard;
    totalHours += hours;

    return {
      key,
      label: SEGMENT_LABELS[key] ?? key,
      hours,
      payRate,
      chargeRate,
      payAmount: payAmtPerGuard * guards,
      chargeAmount: chargeAmtPerGuard * guards,
    };
  });

  // ── totals ──────────────────────────────────────────────────────────────
  const payTotal = paySubtotalPerGuard * guards;
  const chargeTotal = chargeSubtotalPerGuard * guards;

  const GST_RATE = 0.1;
  const payGst = payTotal * GST_RATE;
  const chargeGst = chargeTotal * GST_RATE;
  const payTotalIncGst = payTotal + payGst;
  const chargeTotalIncGst = chargeTotal + chargeGst;

  return {
    segments,
    totalHours: Math.round(totalHours * 100) / 100,
    payTotal,
    chargeTotal,
    payGst,
    chargeGst,
    payTotalIncGst,
    chargeTotalIncGst,
    numGuards: guards,
  };
}

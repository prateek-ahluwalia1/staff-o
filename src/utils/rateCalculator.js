export function isValidRegion(region) {
  if (typeof region !== "string") return false;
  const clean = region.trim().toLowerCase();
  return (
    clean === "metro" ||
    clean === "regional" ||
    clean === "def_metro" ||
    clean === "def_reg" ||
    clean === "def_regional"
  );
}

export function normalizeRegion(region) {
  if (typeof region !== "string") return null;
  const clean = region.trim().toLowerCase();
  if (clean === "metro" || clean === "def_metro") return "metro";
  if (
    clean === "regional" ||
    clean === "def_reg" ||
    clean === "def_regional" ||
    clean === "reg"
  ) {
    return "regional";
  }
  return null;
}

export function getDayType(date, isHoliday = false) {
  if (isHoliday) return "pub_holiday";
  const d = date.getDay();
  if (d === 0) return "sun";
  if (d === 6) return "sat";
  return "weekday";
}

export function getSlot(hour) {
  return hour >= 6 && hour < 18 ? "day" : "night";
}

export const SEGMENT_LABELS = {
  weekday_day: "Mon–Fri (Day 06:00–18:00)",
  weekday_night: "Mon–Fri (Night 18:00–06:00)",
  sat_all: "Saturday",
  sat_day: "Saturday (Day)",
  sat_night: "Saturday (Night)",
  sun_all: "Sunday",
  sun_day: "Sunday (Day)",
  sun_night: "Sunday (Night)",
  pub_holiday_all: "Public Holiday",
  pub_holiday_day: "Public Holiday (Day)",
  pub_holiday_night: "Public Holiday (Night)",
};

export function nextBoundary(t) {
  const h = t.getHours();
  const next = new Date(t);
  next.setSeconds(0, 0);

  if (h < 6) {
    next.setHours(6, 0, 0, 0);
  } else if (h < 18) {
    next.setHours(18, 0, 0, 0);
  } else {
    next.setDate(next.getDate() + 1);
    next.setHours(0, 0, 0, 0);
  }
  return next;
}

// STRICT ROUNDING UTILITY
export const roundToTwo = (num) => Math.round((Number(num) + Number.EPSILON) * 100) / 100;

/**
 * Checks whether a given Date is a public holiday against provided holidays collection.
 */
export function isDateHoliday(date, holidays = null) {
  if (!holidays) return false;
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const dateKey = `${y}-${m}-${d}`;
  const dayKey = `${y}${m}${d}`;

  if (typeof holidays === "function") {
    return Boolean(holidays(date, dateKey));
  }
  if (holidays instanceof Set) {
    return holidays.has(dateKey) || holidays.has(dayKey);
  }
  if (Array.isArray(holidays)) {
    return holidays.some((h) => {
      if (!h) return false;
      if (typeof h === "string") {
        return h === dateKey || h === dayKey || h.replace(/-/g, "") === dayKey;
      }
      if (h instanceof Date) {
        return (
          h.getFullYear() === y &&
          h.getMonth() === date.getMonth() &&
          h.getDate() === date.getDate()
        );
      }
      if (typeof h === "object") {
        const raw = h.date || h.holiday_date;
        if (!raw) return false;
        if (typeof raw === "string") {
          return raw === dateKey || raw === dayKey || raw.replace(/-/g, "") === dayKey;
        }
      }
      return false;
    });
  }
  return false;
}

/**
 * Maps database/API rate records for Metro vs Regional rates.
 * 
 * Validates that region is strictly 'metro' or 'regional'.
 * Does not silently default an invalid or missing region to Metro.
 * 
 * @param {Object} chargeRecord - Charge rate record from Staffoo DB/API
 * @param {Object} [payRecord] - Pay rate record from Staffoo DB/API (optional)
 * @param {string} region - 'metro' or 'regional'
 */
export function mapApiRates(chargeRecord, payRecord = null, region = null) {
  if (!chargeRecord) return null;

  const validRegion = normalizeRegion(region);
  if (!validRegion) {
    return null;
  }

  const r = (record, keys) => {
    if (!record) return 0;
    for (const k of keys) {
      if (record[k] !== undefined && record[k] !== null && record[k] !== "") {
        const parsed = parseFloat(record[k]);
        if (!isNaN(parsed)) return parsed;
      }
    }
    return 0;
  };

  const isMetro = validRegion === "metro";

  const getCandidateKeys = (slotKey) => {
    if (isMetro) {
      return [
        `def_metro_${slotKey}`,
        `metro_${slotKey}`,
      ];
    } else {
      return [
        `def_reg_${slotKey}`,
        `reg_${slotKey}`,
        `def_regional_${slotKey}`,
        `regional_${slotKey}`,
      ];
    }
  };

  const payWeekdayDay = r(payRecord, getCandidateKeys("mon_to_fri_day_rate"));
  const payWeekdayNight = r(payRecord, getCandidateKeys("mon_to_fri_night_rate"));
  const paySatDay = r(payRecord, getCandidateKeys("sat_day_rate"));
  const paySatNight = r(payRecord, [
    ...getCandidateKeys("sat_night_rate"),
    ...getCandidateKeys("sat_day_rate"),
  ]);
  const paySunDay = r(payRecord, getCandidateKeys("sun_day_rate"));
  const paySunNight = r(payRecord, [
    ...getCandidateKeys("sun_night_rate"),
    ...getCandidateKeys("sun_day_rate"),
  ]);
  const payPubHoliDay = r(payRecord, [
    ...getCandidateKeys("pub_holi_day_rate"),
    ...getCandidateKeys("public_holiday_day_rate"),
  ]);
  const payPubHoliNight = r(payRecord, [
    ...getCandidateKeys("pub_holi_night_rate"),
    ...getCandidateKeys("pub_holi_day_rate"),
    ...getCandidateKeys("public_holiday_night_rate"),
  ]);

  const chargeWeekdayDay = r(chargeRecord, getCandidateKeys("mon_to_fri_day_rate"));
  const chargeWeekdayNight = r(chargeRecord, getCandidateKeys("mon_to_fri_night_rate"));
  const chargeSatDay = r(chargeRecord, getCandidateKeys("sat_day_rate"));
  const chargeSatNight = r(chargeRecord, [
    ...getCandidateKeys("sat_night_rate"),
    ...getCandidateKeys("sat_day_rate"),
  ]);
  const chargeSunDay = r(chargeRecord, getCandidateKeys("sun_day_rate"));
  const chargeSunNight = r(chargeRecord, [
    ...getCandidateKeys("sun_night_rate"),
    ...getCandidateKeys("sun_day_rate"),
  ]);
  const chargePubHoliDay = r(chargeRecord, [
    ...getCandidateKeys("pub_holi_day_rate"),
    ...getCandidateKeys("public_holiday_day_rate"),
  ]);
  const chargePubHoliNight = r(chargeRecord, [
    ...getCandidateKeys("pub_holi_night_rate"),
    ...getCandidateKeys("pub_holi_day_rate"),
    ...getCandidateKeys("public_holiday_night_rate"),
  ]);

  return {
    region: validRegion,
    pay: {
      weekday: { day: payWeekdayDay, night: payWeekdayNight },
      sat: { day: paySatDay, night: paySatNight },
      sun: { day: paySunDay, night: paySunNight },
      pub_holiday: { day: payPubHoliDay, night: payPubHoliNight },
    },
    charge: {
      weekday: { day: chargeWeekdayDay, night: chargeWeekdayNight },
      sat: { day: chargeSatDay, night: chargeSatNight },
      sun: { day: chargeSunDay, night: chargeSunNight },
      pub_holiday: { day: chargePubHoliDay, night: chargePubHoliNight },
    },
  };
}

/**
 * Normalizes either scheduleDays structure (day.date + shift.startTime)
 * or flat shifts payload structure (shift.start + shift.end).
 */
function extractShiftIntervals(scheduleDays) {
  if (!scheduleDays || !Array.isArray(scheduleDays) || scheduleDays.length === 0) return [];

  const intervals = [];

  for (const item of scheduleDays) {
    if (!item) continue;

    // Structure A: Day object with shifts array
    if (item.date && Array.isArray(item.shifts)) {
      const [sy, sm, sd] = item.date.split("-").map(Number);
      const isDayHoliday = Boolean(item.isPublicHoliday || item.isHoliday);

      for (const shift of item.shifts) {
        if (!shift || !shift.startTime || !shift.endTime) continue;
        const [sh, smin] = shift.startTime.split(":").map(Number);
        const [eh, emin] = shift.endTime.split(":").map(Number);

        let start = new Date(sy, sm - 1, sd, sh, smin, 0, 0);
        let end = new Date(sy, sm - 1, sd, eh, emin, 0, 0);

        if (end <= start) end.setDate(end.getDate() + 1);

        const guards = Math.max(1, Number(shift.numGuards || shift.numberOfGuards) || 1);
        const isShiftHoliday =
          isDayHoliday || Boolean(shift.isPublicHoliday || shift.isHoliday || shift.is_holiday);

        intervals.push({ start, end, guards, isHoliday: isShiftHoliday });
      }
    }
    // Structure B: Flat shift object with start & end (ISO or date string)
    else if (item.start && item.end) {
      const start = new Date(item.start);
      const end = new Date(item.end);
      if (isNaN(start.getTime()) || isNaN(end.getTime()) || end <= start) continue;
      const guards = Math.max(1, Number(item.numGuards || item.numberOfGuards) || 1);
      const isShiftHoliday = Boolean(
        item.isPublicHoliday || item.isHoliday || item.is_holiday
      );
      intervals.push({ start, end, guards, isHoliday: isShiftHoliday });
    }
  }

  return intervals;
}

/**
 * Computes shift breakdown with hours, rates, and amounts.
 * 
 * Supports:
 * - Monday to Friday daytime hours (06:00 - 18:00)
 * - Monday to Friday nighttime hours (18:00 - 06:00)
 * - Saturday hours
 * - Sunday hours
 * - Public holiday hours
 * 
 * @param {Array} scheduleDays - Array of schedule day objects or shift objects
 * @param {Object} rates - Rates object produced by mapApiRates
 * @param {Object} [options] - Options like public holiday dates { holidays: [...] }
 */
export function computeShiftBreakdown(scheduleDays, rates = null, options = {}) {
  if (!scheduleDays || !Array.isArray(scheduleDays) || scheduleDays.length === 0 || !rates) {
    return null;
  }

  const intervals = extractShiftIntervals(scheduleDays);
  if (intervals.length === 0) return null;

  const hoursMap = new Map();
  const keyOrder = [];

  for (const interval of intervals) {
    const { start, end, guards, isHoliday: intervalIsHoliday } = interval;
    const durationMs = end - start;
    if (isNaN(durationMs) || durationMs <= 0) continue;

    let t = new Date(start);

    while (t < end) {
      const boundary = nextBoundary(t);
      const segEnd = boundary < end ? boundary : end;

      const isHolidaySeg = intervalIsHoliday || isDateHoliday(t, options?.holidays);
      const dayType = getDayType(t, isHolidaySeg);

      // Weekends and public holidays use 'all' slot (standard daily rate)
      const slot =
        dayType === "sat" || dayType === "sun" || dayType === "pub_holiday"
          ? "all"
          : getSlot(t.getHours());
      const key = `${dayType}_${slot}`;

      const segHours = (segEnd - t) / 3_600_000;
      const billableHours = segHours * guards;

      if (!hoursMap.has(key)) {
        hoursMap.set(key, 0);
        keyOrder.push(key);
      }
      hoursMap.set(key, hoursMap.get(key) + billableHours);
      t = new Date(segEnd);
    }
  }

  if (keyOrder.length === 0) return null;

  let payTotal = 0;
  let chargeTotal = 0;
  let totalBillableHours = 0;

  const segments = keyOrder.map((key) => {
    const lastUnderscore = key.lastIndexOf("_");
    const dayType = lastUnderscore !== -1 ? key.slice(0, lastUnderscore) : key;
    const slot = lastUnderscore !== -1 ? key.slice(lastUnderscore + 1) : "all";
    const billableHours = roundToTwo(hoursMap.get(key));

    const actualSlot = slot === "all" ? "day" : slot;

    const payRate = rates.pay?.[dayType]?.[actualSlot] ?? rates.pay?.[dayType]?.day ?? 0;
    const chargeRate = rates.charge?.[dayType]?.[actualSlot] ?? rates.charge?.[dayType]?.day ?? 0;

    const payAmt = roundToTwo(payRate * billableHours);
    const chargeAmt = roundToTwo(chargeRate * billableHours);

    payTotal += payAmt;
    chargeTotal += chargeAmt;
    totalBillableHours += billableHours;

    return {
      key,
      label: SEGMENT_LABELS[key] ?? key,
      hours: billableHours,
      payRate,
      chargeRate,
      payAmount: payAmt,
      chargeAmount: chargeAmt,
    };
  });

  payTotal = roundToTwo(payTotal);
  chargeTotal = roundToTwo(chargeTotal);

  const GST_RATE = 0.1;
  const payGst = roundToTwo(payTotal * GST_RATE);
  const chargeGst = roundToTwo(chargeTotal * GST_RATE);

  return {
    region: rates.region || null,
    segments,
    totalHours: roundToTwo(totalBillableHours),
    payTotal,
    chargeTotal,
    payGst,
    chargeGst,
    payTotalIncGst: roundToTwo(payTotal + payGst),
    chargeTotalIncGst: roundToTwo(chargeTotal + chargeGst),
  };
}

/**
 * Calculates complete job amount and financial totals directly from a job payload
 * and charge rate record.
 * 
 * Integration Requirements satisfied:
 * 1. Reads `region` from job payload.
 * 2. Validates that value is strictly 'metro' or 'regional'.
 * 3. Selects corresponding rate fields based on region.
 * 4. Calculates job amount using applicable rates and shift breakdown.
 * 5. Integrates into job pricing flow before financial totals, discounts, GST, and payment amounts.
 * 6. Preserves existing discount, GST, and payment calculation.
 * 7. Does not hardcode rates or silently default invalid/missing region to Metro.
 */
export function calculateJobPricing(jobPayload, chargeRecord, options = {}) {
  if (!jobPayload) {
    throw new Error("Job payload is required for pricing calculation.");
  }
  if (!chargeRecord) {
    throw new Error("Charge rate record is required for pricing calculation.");
  }

  const rawRegion = jobPayload.region;
  if (!isValidRegion(rawRegion)) {
    throw new Error(
      `Invalid or missing region '${rawRegion}'. Region must be strictly 'metro' or 'regional'.`
    );
  }
  const region = normalizeRegion(rawRegion);

  const rates = mapApiRates(chargeRecord, null, region);
  if (!rates) {
    throw new Error(`Failed to map rates for region '${region}'.`);
  }

  const shiftsSource = jobPayload.scheduleDays || jobPayload.shifts;
  const breakdown = computeShiftBreakdown(shiftsSource, rates, options);
  if (!breakdown) {
    throw new Error("Failed to compute shift breakdown from the provided schedule.");
  }

  const GST_RATE = 0.1;
  const subTotal = breakdown.chargeTotal;
  const paymentOption = jobPayload.payment_option || jobPayload.paymentOption || "full";

  let discount = 0;
  let discountedSubtotal = subTotal;
  let gst = breakdown.chargeGst;
  let totalIncGst = breakdown.chargeTotalIncGst;
  let amountDueToday = totalIncGst;
  let balanceDeferred = 0;

  if (paymentOption === "full") {
    discount = roundToTwo(subTotal * 0.05);
    discountedSubtotal = roundToTwo(subTotal - discount);
    gst = roundToTwo(discountedSubtotal * GST_RATE);
    totalIncGst = roundToTwo(discountedSubtotal + gst);
    amountDueToday = totalIncGst;
  } else if (paymentOption === "split") {
    amountDueToday = roundToTwo(totalIncGst * 0.5);
    balanceDeferred = roundToTwo(totalIncGst - amountDueToday);
  }

  return {
    region,
    breakdown,
    financials: {
      subtotal: subTotal,
      discount,
      discounted_subtotal: discountedSubtotal,
      gst,
      total_inc_gst: totalIncGst,
      amount_due_today: amountDueToday,
      balance_deferred: balanceDeferred,
      payment_option: paymentOption,
    },
  };
}
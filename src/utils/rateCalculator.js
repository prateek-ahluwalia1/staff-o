export function getDayType(date) {
  const d = date.getDay();
  if (d === 0) return "sun";
  if (d === 6) return "sat";
  return "weekday";
}

export function getSlot(hour) {
  return hour >= 6 && hour < 18 ? "day" : "night";
}

const SEGMENT_LABELS = {
  weekday_day: "Mon–Fri (Day 06:00–18:00)",
  weekday_night: "Mon–Fri (Night 18:00–06:00)",
  sat_day: "Saturday (Day 06:00–18:00)",
  sat_night: "Saturday (Night 18:00–06:00)",
  sun_day: "Sunday (Day 06:00–18:00)",
  sun_night: "Sunday (Night 18:00–06:00)",
};

function nextBoundary(t) {
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

export function mapApiRates(chargeRecord, payRecord = null, prefix = "def_metro") {
  if (!chargeRecord) return null;
  const r = (record, key) => (record ? parseFloat(record?.[key]) || 0 : 0);

  return {
    pay: {
      weekday: { day: r(payRecord, `${prefix}_mon_to_fri_day_rate`), night: r(payRecord, `${prefix}_mon_to_fri_night_rate`) },
      sat: { day: r(payRecord, `${prefix}_sat_day_rate`), night: r(payRecord, `${prefix}_sat_night_rate`) },
      sun: { day: r(payRecord, `${prefix}_sun_day_rate`), night: r(payRecord, `${prefix}_sun_night_rate`) },
    },
    charge: {
      weekday: { day: r(chargeRecord, `${prefix}_mon_to_fri_day_rate`), night: r(chargeRecord, `${prefix}_mon_to_fri_night_rate`) },
      sat: { day: r(chargeRecord, `${prefix}_sat_day_rate`), night: r(chargeRecord, `${prefix}_sat_night_rate`) },
      sun: { day: r(chargeRecord, `${prefix}_sun_day_rate`), night: r(chargeRecord, `${prefix}_sun_night_rate`) },
    },
  };
}

// STRICT ROUNDING UTILITY
const roundToTwo = (num) => Math.round((num + Number.EPSILON) * 100) / 100;

export function computeShiftBreakdown(scheduleDays, rates = null) {
  if (!scheduleDays || !Array.isArray(scheduleDays) || scheduleDays.length === 0 || !rates) return null;

  const hoursMap = new Map();
  const keyOrder = [];

  for (const day of scheduleDays) {
    if (!day.date || !day.shifts) continue;
    const [sy, sm, sd] = day.date.split("-").map(Number);

    for (const shift of day.shifts) {
      if (!shift.startTime || !shift.endTime) continue;

      const [sh, smin] = shift.startTime.split(":").map(Number);
      const [eh, emin] = shift.endTime.split(":").map(Number);

      let start = new Date(sy, sm - 1, sd, sh, smin, 0, 0);
      let end = new Date(sy, sm - 1, sd, eh, emin, 0, 0);

      if (end <= start) end.setDate(end.getDate() + 1);

      const durationMs = end - start;
      if (isNaN(durationMs) || durationMs <= 0) continue;

      const guards = Math.max(1, Number(shift.numGuards) || 1);
      let t = new Date(start);

      while (t < end) {
        const boundary = nextBoundary(t);
        const segEnd = boundary < end ? boundary : end;
        const key = `${getDayType(t)}_${getSlot(t.getHours())}`;

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
  }

  if (keyOrder.length === 0) return null;

  let payTotal = 0;
  let chargeTotal = 0;
  let totalBillableHours = 0;

  const segments = keyOrder.map((key) => {
    const [dayType, slot] = key.split("_");

    // Apply strict rounding mathematically instead of string toFixed
    const billableHours = roundToTwo(hoursMap.get(key));
    const payRate = rates.pay[dayType]?.[slot] ?? 0;
    const chargeRate = rates.charge[dayType]?.[slot] ?? 0;

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
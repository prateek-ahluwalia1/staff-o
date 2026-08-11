import React, { useState, useEffect, useRef } from "react";

function parseStatValue(val) {
  if (typeof val === "number") {
    return { number: val, prefix: "", suffix: "", decimals: Number.isInteger(val) ? 0 : 1 };
  }
  const str = String(val || "");
  const match = str.match(/^([^0-9.]*)([0-9.]+)(.*)$/);
  if (match) {
    const num = parseFloat(match[2]);
    const dec = match[2].includes(".") ? match[2].split(".")[1].length : 0;
    return {
      prefix: match[1],
      number: isNaN(num) ? 0 : num,
      suffix: match[3],
      decimals: dec,
    };
  }
  return { prefix: "", number: 0, suffix: str, decimals: 0 };
}

function AnimatedStatNumber({ value }) {
  const { prefix, number, suffix, decimals } = parseStatValue(value);
  const [current, setCurrent] = useState(0);
  const elementRef = useRef(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          let startTimestamp = null;
          const duration = 1800; // 1.8s duration

          const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            // Ease out cubic
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            setCurrent(easeProgress * number);
            if (progress < 1) {
              requestAnimationFrame(step);
            } else {
              setCurrent(number);
            }
          };

          requestAnimationFrame(step);
        }
      },
      { threshold: 0.2 }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => observer.disconnect();
  }, [number]);

  const formattedNum = decimals > 0 ? current.toFixed(decimals) : Math.floor(current).toLocaleString();

  return (
    <b ref={elementRef}>
      {prefix}{formattedNum}{suffix}
    </b>
  );
}

const defaultStatsData = [
  { value: "180+", label: "licensed crowd controllers" },
  { value: "4.9★", label: "average guard rating" },
  { value: "3 hrs", label: "median time to first applicant" },
  { value: "640", label: "event shifts filled this month" },
];

export default function StatsBand({ stats = defaultStatsData }) {
  const items = Array.isArray(stats) && stats.length > 0 ? stats : defaultStatsData;

  return (
    <div className="stf-stats-band">
      <div className="stf-wrap">
        <div className="stf-stats-grid">
          {items.map((item, index) => (
            <div className="stf-stat" key={index}>
              <AnimatedStatNumber value={item.value} />
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export const apiURL = "https://apis.staffoo.com.au/";
export const STRIPE_PUBLISHABLE_KEY =
  "pk_test_51TBYBwDb535HMVUZHtQiPJGDYYZex0gIGvFWtuKR9FRage5WxqqzkLDvKBUpq4MfPkWhgDDM7z3WZrURpwWFBkbo005rxvV6q9";
export const REACT_APP_AGORA_APP_ID = "4c98656fc9a34bdb8ad5e34c1b356ef2";

export const TIME_KEYS = [
  "metro_mon_to_fri_day_rate",
  "reg_mon_to_fri_day_rate",
  "metro_mon_to_fri_night_rate",
  "reg_mon_to_fri_night_rate",

  "metro_sat_day_rate",
  "reg_sat_day_rate",
  "metro_sat_night_rate",
  "reg_sat_night_rate",

  "metro_sun_day_rate",
  "reg_sun_day_rate",
  "metro_sun_night_rate",
  "reg_sun_night_rate",

  "metro_pub_holi_day_rate",
  "reg_pub_holi_day_rate",
  "metro_pub_holi_night_rate",
  "reg_pub_holi_night_rate",
];

export const SLOT_ROWS = [
  {
    label: "Mon-Fri (Day 06:00 - 18:00)",
    metro: "metro_mon_to_fri_day_rate",
    reg: "reg_mon_to_fri_day_rate",
  },
  {
    label: "Mon-Fri (Night 18:00 - 06:00)",
    metro: "metro_mon_to_fri_night_rate",
    reg: "reg_mon_to_fri_night_rate",
  },
  {
    label: "Saturday (Day)",
    metro: "metro_sat_day_rate",
    reg: "reg_sat_day_rate",
  },
  {
    label: "Saturday (Night)",
    metro: "metro_sat_night_rate",
    reg: "reg_sat_night_rate",
  },
  {
    label: "Sunday (Day)",
    metro: "metro_sun_day_rate",
    reg: "reg_sun_day_rate",
  },
  {
    label: "Sunday (Night)",
    metro: "metro_sun_night_rate",
    reg: "reg_sun_night_rate",
  },
  {
    label: "Public Holiday (Day)",
    metro: "metro_pub_holi_day_rate",
    reg: "reg_pub_holi_day_rate",
  },
  {
    label: "Public Holiday (Night)",
    metro: "metro_pub_holi_night_rate",
    reg: "reg_pub_holi_night_rate",
  },
];

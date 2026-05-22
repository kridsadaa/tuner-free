export interface StringTarget {
  label: string;   // สาย 1 / สาย 2
  note: string;    // G3, D4 etc.
  hz: number;
}

export interface SaoUTuning {
  id: string;
  name: string;    // ทางเพียงออ
  strings: [StringTarget, StringTarget];
}

export const SAO_U_TUNINGS: SaoUTuning[] = [
  {
    id: 'piang-or',
    name: 'ทางเพียงออ',
    strings: [
      { label: 'สาย 1', note: 'G3', hz: 196.00 },
      { label: 'สาย 2', note: 'D4', hz: 293.66 },
    ],
  },
  {
    id: 'klang',
    name: 'ทางกลาง',
    strings: [
      { label: 'สาย 1', note: 'A3', hz: 220.00 },
      { label: 'สาย 2', note: 'E4', hz: 329.63 },
    ],
  },
  {
    id: 'nok',
    name: 'ทางนอก',
    strings: [
      { label: 'สาย 1', note: 'D4', hz: 293.66 },
      { label: 'สาย 2', note: 'A4', hz: 440.00 },
    ],
  },
  {
    id: 'nai',
    name: 'ทางใน',
    strings: [
      { label: 'สาย 1', note: 'F3', hz: 174.61 },
      { label: 'สาย 2', note: 'C4', hz: 261.63 },
    ],
  },
];

export interface ActiveString {
  index: 0 | 1;
  cents: number;   // deviation from target (-50..+50 range)
}

// Find which string the current frequency is closest to, return deviation in cents
export function matchString(hz: number, tuning: SaoUTuning): ActiveString {
  const cents0 = 1200 * Math.log2(hz / tuning.strings[0].hz);
  const cents1 = 1200 * Math.log2(hz / tuning.strings[1].hz);
  if (Math.abs(cents0) <= Math.abs(cents1)) {
    return { index: 0, cents: cents0 };
  }
  return { index: 1, cents: cents1 };
}

export interface StringTarget {
  label: string;
  note: string;
  hz: number;
}

export interface Tuning {
  id: string;
  name: string;
  strings: StringTarget[];
}

export interface Instrument {
  id: string;
  name: string;
  tunings: Tuning[];
}

export const INSTRUMENTS: Instrument[] = [
  {
    id: 'sao-u',
    name: 'ซออู้',
    tunings: [
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
    ],
  },
  {
    id: 'guitar',
    name: 'Guitar',
    tunings: [
      {
        id: 'guitar-std',
        name: 'Standard',
        strings: [
          { label: 'E', note: 'E2', hz: 82.41 },
          { label: 'A', note: 'A2', hz: 110.00 },
          { label: 'D', note: 'D3', hz: 146.83 },
          { label: 'G', note: 'G3', hz: 196.00 },
          { label: 'B', note: 'B3', hz: 246.94 },
          { label: 'E', note: 'E4', hz: 329.63 },
        ],
      },
      {
        id: 'guitar-drop-d',
        name: 'Drop D',
        strings: [
          { label: 'D', note: 'D2', hz: 73.42 },
          { label: 'A', note: 'A2', hz: 110.00 },
          { label: 'D', note: 'D3', hz: 146.83 },
          { label: 'G', note: 'G3', hz: 196.00 },
          { label: 'B', note: 'B3', hz: 246.94 },
          { label: 'E', note: 'E4', hz: 329.63 },
        ],
      },
    ],
  },
  {
    id: 'violin',
    name: 'Violin',
    tunings: [
      {
        id: 'violin-std',
        name: 'Standard',
        strings: [
          { label: 'G', note: 'G3', hz: 196.00 },
          { label: 'D', note: 'D4', hz: 293.66 },
          { label: 'A', note: 'A4', hz: 440.00 },
          { label: 'E', note: 'E5', hz: 659.25 },
        ],
      },
    ],
  },
  {
    id: 'bass',
    name: 'Bass',
    tunings: [
      {
        id: 'bass-std',
        name: 'Standard',
        strings: [
          { label: 'E', note: 'E1', hz: 41.20 },
          { label: 'A', note: 'A1', hz: 110.00 },
          { label: 'D', note: 'D2', hz: 73.42 },
          { label: 'G', note: 'G2', hz: 98.00 },
        ],
      },
    ],
  },
  {
    id: 'ukulele',
    name: 'Ukulele',
    tunings: [
      {
        id: 'uku-std',
        name: 'Standard (High G)',
        strings: [
          { label: 'G', note: 'G4', hz: 392.00 },
          { label: 'C', note: 'C4', hz: 261.63 },
          { label: 'E', note: 'E4', hz: 329.63 },
          { label: 'A', note: 'A4', hz: 440.00 },
        ],
      },
    ],
  },
];

export interface MatchResult {
  index: number;
  cents: number;
}

export function matchString(hz: number, tuning: Tuning): MatchResult {
  let closestIndex = 0;
  let minDiff = Infinity;
  let resultCents = 0;

  tuning.strings.forEach((s, i) => {
    const cents = 1200 * Math.log2(hz / s.hz);
    if (Math.abs(cents) < minDiff) {
      minDiff = Math.abs(cents);
      closestIndex = i;
      resultCents = cents;
    }
  });

  return { index: closestIndex, cents: resultCents };
}

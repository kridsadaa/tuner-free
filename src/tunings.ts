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
  category: 'thai' | 'international';
  tunings: Tuning[];
}

export const INSTRUMENTS: Instrument[] = [
  {
    id: 'sao-u',
    name: 'ซออู้',
    category: 'thai',
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
    id: 'sao-duang',
    name: 'ซอด้วง',
    category: 'thai',
    tunings: [
      {
        id: 'duang-std',
        name: 'Standard',
        strings: [
          { label: 'สาย 1', note: 'D4', hz: 293.66 },
          { label: 'สาย 2', note: 'A4', hz: 440.00 },
        ],
      },
    ],
  },
  {
    id: 'sao-sam-sai',
    name: 'ซอสามสาย',
    category: 'thai',
    tunings: [
      {
        id: 'sam-sai-std',
        name: 'Standard',
        strings: [
          { label: 'สาย 1', note: 'G2', hz: 98.00 },
          { label: 'สาย 2', note: 'D3', hz: 146.83 },
          { label: 'สาย 3', note: 'A3', hz: 220.00 },
        ],
      },
    ],
  },
  {
    id: 'guitar',
    name: 'Guitar',
    category: 'international',
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
    category: 'international',
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
    id: 'cello',
    name: 'Cello',
    category: 'international',
    tunings: [
      {
        id: 'cello-std',
        name: 'Standard',
        strings: [
          { label: 'C', note: 'C2', hz: 65.41 },
          { label: 'G', note: 'G2', hz: 98.00 },
          { label: 'D', note: 'D3', hz: 146.83 },
          { label: 'A', note: 'A3', hz: 220.00 },
        ],
      },
    ],
  },
  {
    id: 'bass',
    name: 'Bass',
    category: 'international',
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
    category: 'international',
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

  // ── Thai additions ────────────────────────────────────────────
  {
    id: 'jakhe',
    name: 'จะเข้',
    category: 'thai',
    tunings: [
      {
        id: 'jakhe-piang-or',
        name: 'ทางเพียงออ',
        strings: [
          { label: 'สาย 1', note: 'D3', hz: 146.83 },
          { label: 'สาย 2', note: 'A3', hz: 220.00 },
          { label: 'สาย 3', note: 'D4', hz: 293.66 },
        ],
      },
      {
        id: 'jakhe-klang',
        name: 'ทางกลาง',
        strings: [
          { label: 'สาย 1', note: 'E3', hz: 164.81 },
          { label: 'สาย 2', note: 'B3', hz: 246.94 },
          { label: 'สาย 3', note: 'E4', hz: 329.63 },
        ],
      },
      {
        id: 'jakhe-nai',
        name: 'ทางใน',
        strings: [
          { label: 'สาย 1', note: 'C3', hz: 130.81 },
          { label: 'สาย 2', note: 'G3', hz: 196.00 },
          { label: 'สาย 3', note: 'C4', hz: 261.63 },
        ],
      },
    ],
  },
  {
    id: 'phin',
    name: 'พิณ',
    category: 'thai',
    tunings: [
      {
        id: 'phin-std',
        name: 'Standard (อีสาน)',
        strings: [
          { label: 'สาย 1', note: 'E3', hz: 164.81 },
          { label: 'สาย 2', note: 'A3', hz: 220.00 },
          { label: 'สาย 3', note: 'E4', hz: 329.63 },
        ],
      },
      {
        id: 'phin-lanna',
        name: 'ซึง (ล้านนา)',
        strings: [
          { label: 'สาย 1', note: 'G2', hz: 98.00 },
          { label: 'สาย 2', note: 'C3', hz: 130.81 },
          { label: 'สาย 3', note: 'G3', hz: 196.00 },
          { label: 'สาย 4', note: 'C4', hz: 261.63 },
        ],
      },
    ],
  },
  {
    id: 'krajabpi',
    name: 'กระจับปี่',
    category: 'thai',
    tunings: [
      {
        id: 'krajabpi-std',
        name: 'Standard',
        strings: [
          { label: 'สาย 1', note: 'C3', hz: 130.81 },
          { label: 'สาย 2', note: 'G3', hz: 196.00 },
          { label: 'สาย 3', note: 'C4', hz: 261.63 },
          { label: 'สาย 4', note: 'G4', hz: 392.00 },
        ],
      },
    ],
  },

  // ── International additions ───────────────────────────────────
  {
    id: 'mandolin',
    name: 'Mandolin',
    category: 'international',
    tunings: [
      {
        id: 'mandolin-std',
        name: 'Standard (GDAE)',
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
    id: 'viola',
    name: 'Viola',
    category: 'international',
    tunings: [
      {
        id: 'viola-std',
        name: 'Standard (CGDA)',
        strings: [
          { label: 'C', note: 'C3', hz: 130.81 },
          { label: 'G', note: 'G3', hz: 196.00 },
          { label: 'D', note: 'D4', hz: 293.66 },
          { label: 'A', note: 'A4', hz: 440.00 },
        ],
      },
    ],
  },
  {
    id: 'banjo',
    name: 'Banjo',
    category: 'international',
    tunings: [
      {
        id: 'banjo-open-g',
        name: 'Open G',
        strings: [
          { label: '5th', note: 'G4', hz: 392.00 },
          { label: '4th', note: 'D3', hz: 146.83 },
          { label: '3rd', note: 'G3', hz: 196.00 },
          { label: '2nd', note: 'B3', hz: 246.94 },
          { label: '1st', note: 'D4', hz: 293.66 },
        ],
      },
      {
        id: 'banjo-double-c',
        name: 'Double C',
        strings: [
          { label: '5th', note: 'G4', hz: 392.00 },
          { label: '4th', note: 'C3', hz: 130.81 },
          { label: '3rd', note: 'G3', hz: 196.00 },
          { label: '2nd', note: 'C4', hz: 261.63 },
          { label: '1st', note: 'D4', hz: 293.66 },
        ],
      },
    ],
  },
  {
    id: 'double-bass',
    name: 'Double Bass',
    category: 'international',
    tunings: [
      {
        id: 'dbass-std',
        name: 'Standard (EADG)',
        strings: [
          { label: 'E', note: 'E1', hz: 41.20 },
          { label: 'A', note: 'A1', hz: 55.00 },
          { label: 'D', note: 'D2', hz: 73.42 },
          { label: 'G', note: 'G2', hz: 98.00 },
        ],
      },
      {
        id: 'dbass-5str',
        name: '5-String (BEADG)',
        strings: [
          { label: 'B', note: 'B0', hz: 30.87 },
          { label: 'E', note: 'E1', hz: 41.20 },
          { label: 'A', note: 'A1', hz: 55.00 },
          { label: 'D', note: 'D2', hz: 73.42 },
          { label: 'G', note: 'G2', hz: 98.00 },
        ],
      },
    ],
  },
  {
    id: 'guitar-7',
    name: 'Guitar 7-string',
    category: 'international',
    tunings: [
      {
        id: 'guitar7-std',
        name: 'Standard',
        strings: [
          { label: 'B', note: 'B1', hz: 61.74 },
          { label: 'E', note: 'E2', hz: 82.41 },
          { label: 'A', note: 'A2', hz: 110.00 },
          { label: 'D', note: 'D3', hz: 146.83 },
          { label: 'G', note: 'G3', hz: 196.00 },
          { label: 'B', note: 'B3', hz: 246.94 },
          { label: 'E', note: 'E4', hz: 329.63 },
        ],
      },
      {
        id: 'guitar7-drop-a',
        name: 'Drop A',
        strings: [
          { label: 'A', note: 'A1', hz: 55.00 },
          { label: 'E', note: 'E2', hz: 82.41 },
          { label: 'A', note: 'A2', hz: 110.00 },
          { label: 'D', note: 'D3', hz: 146.83 },
          { label: 'G', note: 'G3', hz: 196.00 },
          { label: 'B', note: 'B3', hz: 246.94 },
          { label: 'E', note: 'E4', hz: 329.63 },
        ],
      },
    ],
  },
];

export interface MatchResult {
  index: number;
  cents: number;
}

export function matchString(hz: number, tuning: Tuning, referenceA4: number = 440): MatchResult {
  let closestIndex = 0;
  let minDiff = Infinity;
  let resultCents = 0;

  tuning.strings.forEach((s, i) => {
    // Adjust the target frequency based on referenceA4
    const targetHz = s.hz * (referenceA4 / 440);
    const cents = 1200 * Math.log2(hz / targetHz);
    if (Math.abs(cents) < minDiff) {
      minDiff = Math.abs(cents);
      closestIndex = i;
      resultCents = cents;
    }
  });

  return { index: closestIndex, cents: resultCents };
}

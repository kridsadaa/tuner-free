# 🎵 Tuner Free

> Free online chromatic instrument tuner — no ads, no sign-up, no downloads.

**Live:** [https://tuner-free.kridsada-bun.com/](https://tuner-free.kridsada-bun.com/)

---

## Features

- 🎸 **Guitar** — Standard (E A D G B e), Drop D, and 7-String (Standard / Drop A) tunings
- 🎻 **Orchestral Strings** — Violin, Viola, Cello, Bass, and Double Bass (Standard / 5-string)
- 🇹🇭 **Thai instruments** — ซออู้ (4 tunings), ซอด้วง, ซอสามสาย, จะเข้ (3 tunings), พิณ (อีสาน/ซึง), กระจับปี่
- 🎵 **Other Instruments** — Ukulele, Mandolin, Banjo (Open G / Double C)
- 🎵 **Chromatic mode** — works for any instrument
- 🎛️ **Metronome** — 40–208 BPM
- 📊 **Pitch History Graph** — Rich canvas-based real-time tracking of note stability and frequency deviation
- 🖥️ **Stage Mode** — large display for live performance
- 🔒 **Privacy first** — all audio processed locally, nothing sent to any server
- ⚡ **Reference pitch calibration** & **Tuning Fork** generator — A4 from 410–450 Hz
- 📱 **PWA & Offline Ready** — Installable to desktop or mobile home screens, works offline
- 🚀 **SEO Prerendered** — Statically compiled dynamic instrument pages with custom titles and canonical tags for search crawlers

---

## Tech Stack

| Tool | Description |
|---|---|
| [React](https://react.dev/) | UI framework |
| [TypeScript](https://www.typescriptlang.org/) | Type safety |
| [Vite](https://vitejs.dev/) | Build tool & dev server |
| [Pitchy](https://github.com/ianprime0509/pitchy) | Pitch detection algorithm |
| [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API) | Real-time audio processing |
| [Vercel](https://vercel.com/) | Hosting & deployment |

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18+
- npm

### Installation

```bash
# Clone the repository
git clone https://github.com/kridsadaa/tuner-free.git
cd tuner-free

# Install dependencies
npm install

# Start the dev server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build

```bash
npm run build
```

---

## Project Structure

```
src/
├── App.tsx               # Main app component
├── App.css               # Global styles
├── useMicrophone.ts      # Microphone & pitch detection hook
├── tunings.ts            # Instrument tuning definitions
├── audioOutput.ts        # Tone & metronome audio output
├── Needle.tsx            # SVG tuner needle component
├── Waveform.tsx          # Real-time waveform visualizer
├── PitchHistoryGraph.tsx # Canvas-based pitch frequency and stability graph
├── PWAInstallBanner.tsx  # PWA app install prompt component
├── usePWAInstaller.ts    # PWA installer trigger hook
└── ChangelogModal.tsx    # App version changelog dialog modal
```

---

## Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you'd like to change.

---

## Author

**Kridsada** — [LinkedIn](https://www.linkedin.com/in/kridsada-bunta/)

---

## License

[MIT](LICENSE)


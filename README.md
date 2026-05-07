# Live Stream Proxy

A complete Node.js live-stream proxy application built to stream protected HLS (`.m3u8`) live streams securely within the browser. 

This proxy handles fetching secured playlists, rewriting internal segment URIs, and bypassing CORS/Referer protections by securely piping `.ts` segments through the backend, shielding your original source.

## Features
- **HLS Proxying**: Automatically fetches and rewrites `.m3u8` playlists and nested files.
- **Direct Segment Streaming**: Proxies `.ts` video chunks using Node's native streams (`pipeline()`) without buffering in memory.
- **Header Injection**: Appends required `Referer`, `Origin`, and `User-Agent` headers to bypass stream protections.
- **Frontend Player**: Includes a custom-built, modern "Industrial Brutalist" video player powered by `hls.js` and Tailwind CSS.
- **Security**: Built-in Express rate limiting.

## Tech Stack
- **Backend**: Node.js, Express.js
- **Frontend**: Vanilla HTML/JS, Tailwind CSS, HLS.js

## Getting Started

### Prerequisites
- Node.js (v18+) or [Bun](https://bun.sh/)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/raghavdwd/live-ipl.git
   cd live-ipl
   ```

2. Install dependencies:
   ```bash
   bun install
   # or npm install
   ```

3. Configure your environment variables:
   ```bash
   cp .env.example .env
   ```
   Open `.env` and fill in your stream's required `STREAM_SOURCE`, `STREAM_REFERER`, and `STREAM_ORIGIN`.

### Running the App

Start the development server:
```bash
bun dev
# or npm run dev
```

The application will start on `http://localhost:3000`. Navigate there in your browser to view the stream.

## Structure
- `/config` - Environment and Stream configuration.
- `/controllers` - Express route handlers.
- `/middleware` - Rate limiting and Error handling.
- `/public` - Frontend UI and logic.
- `/routes` - API routes (`/api/playlist`, `/api/segment`).
- `/services` - Core logic for proxying streams and rewriting HLS text.
- `/utils` - Helper functions (e.g., header generation).

## License
MIT

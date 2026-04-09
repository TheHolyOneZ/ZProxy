<div align="center">

<h1>ZProxy</h1>
<p><strong>Local HTTP/HTTPS request inspector — see exactly what your apps are sending.</strong></p>

[![License: MIT](https://img.shields.io/badge/License-MIT-purple.svg)](LICENSE)
[![Tauri](https://img.shields.io/badge/Tauri-v2-blue)](https://tauri.app)
[![Rust](https://img.shields.io/badge/Rust-1.77+-orange)](https://rustup.rs)
[![Platform](https://img.shields.io/badge/Platform-Windows%20%7C%20Linux-lightgrey)](#building)

</div>

---

## What is ZProxy?

ZProxy is a lightweight desktop app that acts as a **local HTTP/HTTPS forward proxy**. It sits between any client (your browser, your app, curl, Python scripts, etc.) and the internet, capturing every request and response so you can inspect them in real time.

Think Fiddler or Charles Proxy — but minimal, fast, and built with Tauri + Rust.

---

## What it's actually for

ZProxy does **not** monitor traffic coming in to your server. It monitors traffic going **out** from a client you configure.

```
Without ZProxy:
  Your App ─────────────────────────────→ api.example.com

With ZProxy:
  Your App → ZProxy (127.0.0.1:8080) → api.example.com
                  ↑
        you see everything here:
        headers, body, status, timing
```

### Common use cases

| Use case | How |
|----------|-----|
| Debug what your app is calling | Point your HTTP client's proxy setting at `127.0.0.1:8080` |
| Inspect browser traffic | Set browser proxy → Manual → `127.0.0.1:8080` |
| Reverse-engineer an API | Route the client app through ZProxy |
| Check auth tokens being sent | See the exact `Authorization` header in every request |
| Debug caching | See `If-None-Match` / `Cache-Control` headers |
| Monitor a mobile app | Set phone Wi-Fi proxy to your PC's IP on port 8080 |

---

## Features

- **HTTP + HTTPS interception** — full MITM via a local root CA (hudsucker + rcgen)
- **Real-time streaming** — requests appear instantly as they're proxied
- **Request/response inspection** — headers, body, status code, timing
- **JSON syntax highlighting** — keys, strings, numbers, booleans all color-coded
- **Filter by** method, status range (2xx/3xx/4xx/5xx), host
- **Search** URLs with substring match
- **Export as cURL** — copy any request as a ready-to-run curl command
- **CA management** — generate root CA and install it to the Windows trust store
- **Auto-scroll** — follow new requests as they arrive (toggleable)
- **Clear** all captured requests instantly

---

## How to use it

### 1. Start the proxy

Open ZProxy, set the port (default `8080`), click **Start**.

### 2. Point your client at it

**Browser (Chrome/Edge/Firefox)**
> Settings → System → Manual proxy → `127.0.0.1` port `8080`
> Or launch with: `chrome.exe --proxy-server="http://127.0.0.1:8080"`

**curl**
```bash
curl --proxy http://127.0.0.1:8080 https://api.example.com/endpoint
```

**Python (requests)**
```python
import requests
proxies = {"http": "http://127.0.0.1:8080", "https": "http://127.0.0.1:8080"}
r = requests.get("https://api.example.com/data", proxies=proxies)
```

**Node.js (axios)**
```js
const { HttpsProxyAgent } = require('https-proxy-agent');
axios.get('https://api.example.com', {
  httpsAgent: new HttpsProxyAgent('http://127.0.0.1:8080')
});
```

**Rust (reqwest)**
```rust
let client = reqwest::Client::builder()
    .proxy(reqwest::Proxy::all("http://127.0.0.1:8080")?)
    .build()?;
```

**PHP (Guzzle)**
```php
$client = new GuzzleHttp\Client(['proxy' => 'http://127.0.0.1:8080']);
$response = $client->get('https://api.example.com/v1/users');
```

**Environment variable (works for most CLIs)**
```bash
export HTTP_PROXY=http://127.0.0.1:8080
export HTTPS_PROXY=http://127.0.0.1:8080
# now curl, wget, pip, npm, etc. all go through ZProxy
```

### 3. For HTTPS: install the CA certificate

HTTPS interception requires your system to trust ZProxy's local CA.

1. Click **Generate CA** (first time only — creates a root certificate)
2. Click **Install CA** — a UAC prompt will appear, accept it
3. Your browser / OS now trusts the ZProxy CA and HTTPS traffic can be decrypted

> The CA private key never leaves your machine. It lives in the app's data directory and is unique to your installation.

### 4. Inspect requests

Click any row in the request list to open the detail panel:

- **Overview** — full URL, method, status code, duration, TLS version
- **Request** — request headers + body (JSON pretty-printed)
- **Response** — response headers + body
- **Timing** — visual duration bar

---

## Building

### Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| Rust + cargo | 1.77+ | https://rustup.rs |
| Node.js | 18+ | https://nodejs.org |
| Tauri CLI | v2 | `cargo install tauri-cli --version "^2"` |

**Windows only (for MSI):** Install [WiX Toolset v3](https://wixtoolset.org/releases/) and add it to `PATH`.

```bash
git clone https://github.com/TheHolyOneZ/ZProxy
cd ZProxy
npm install
```

### Development

```bash
npm run tauri dev
```

### Windows — MSI installer

```bash
npm run tauri build -- --target x86_64-pc-windows-msvc --bundles msi
# Output: src-tauri/target/release/bundle/msi/ZProxy_0.1.0_x64_en-US.msi
```

### Windows — NSIS installer (.exe)

```bash
npm run tauri build -- --target x86_64-pc-windows-msvc --bundles nsis
# Output: src-tauri/target/release/bundle/nsis/ZProxy_0.1.0_x64-setup.exe
```

### Windows — both at once

```bash
npm run tauri build -- --bundles msi,nsis
```

---

## Linux support

**Yes — fully compatible.** Tauri v2 targets Linux natively. The Rust proxy engine (hudsucker, tokio, rcgen) is cross-platform. The only Windows-specific code is `cert::install_ca_windows` which calls `certutil.exe` — on Linux you'd replace that with `update-ca-certificates` or `trust anchor`.

### Build AppImage

```bash
# On a Linux machine or in WSL2 with a Linux toolchain:
sudo apt install libgtk-3-dev libwebkit2gtk-4.1-dev libssl-dev \
                 libayatana-appindicator3-dev librsvg2-dev

npm install
npm run tauri build -- --bundles appimage
# Output: src-tauri/target/release/bundle/appimage/ZProxy_0.1.0_amd64.AppImage
```

### Build .deb package

```bash
npm run tauri build -- --bundles deb
# Output: src-tauri/target/release/bundle/deb/zproxy_0.1.0_amd64.deb

# Install it:
sudo dpkg -i src-tauri/target/release/bundle/deb/zproxy_0.1.0_amd64.deb
```

### Build both Linux formats

```bash
npm run tauri build -- --bundles appimage,deb
```

### Linux CA installation (replace the Windows-only command)

On Linux, `install_ca` needs a different backend. The CA cert path is returned by `generate_ca` — install it manually until a Linux implementation is added:

```bash
# Ubuntu/Debian
sudo cp /path/to/zproxy_ca.pem /usr/local/share/ca-certificates/zproxy.crt
sudo update-ca-certificates

# Arch
sudo trust anchor /path/to/zproxy_ca.pem

# Firefox (uses its own store — must add manually)
# Preferences → Privacy & Security → View Certificates → Import
```

---

## Project structure

```
ZProxy/
├── src/                        # React + TypeScript frontend
│   ├── App.tsx
│   ├── components/
│   │   ├── layout/             # Titlebar, Toolbar, StatusBar
│   │   ├── requests/           # RequestList, RequestRow, DetailPanel, tabs
│   │   └── ui/                 # SplitPane, Toast, Badge, Tabs
│   ├── store/
│   │   ├── proxyStore.ts       # proxy state, requests, filters
│   │   └── uiStore.ts          # selected request, split ratio, toasts
│   └── lib/
│       ├── tauri.ts            # invoke wrappers + event listeners
│       ├── types.ts            # shared TypeScript types
│       └── format.ts           # byte/duration formatting
└── src-tauri/                  # Rust backend
    └── src/
        ├── commands.rs         # all Tauri commands
        ├── models.rs           # CapturedRequest, RequestSummary
        ├── state.rs            # AppState (DashMaps, atomics)
        └── proxy/
            ├── engine.rs       # hudsucker proxy lifecycle
            ├── handler.rs      # request/response capture + events
            └── cert.rs         # CA generation and trust store
```

---

## Tech stack

| Layer | Technology |
|-------|-----------|
| Desktop shell | [Tauri v2](https://tauri.app) |
| UI | React 18 + TypeScript |
| State | Zustand v5 |
| Icons | Lucide React |
| Proxy engine | [hudsucker 0.21](https://github.com/omjadas/hudsucker) |
| TLS / certs | rustls + rcgen |
| Async | Tokio |
| Concurrent maps | DashMap |

---

## License

MIT © 2026 [TheHolyOneZ](https://github.com/TheHolyOneZ)

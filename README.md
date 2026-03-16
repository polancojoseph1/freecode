# FreeCode

[![GitHub Stars](https://img.shields.io/github/stars/polancojoseph1/freecode?style=flat-square)](https://github.com/polancojoseph1/freecode/stargazers)
[![GitHub Forks](https://img.shields.io/github/forks/polancojoseph1/freecode?style=flat-square)](https://github.com/polancojoseph1/freecode/network)
[![GitHub Issues](https://img.shields.io/github/issues/polancojoseph1/freecode?style=flat-square)](https://github.com/polancojoseph1/freecode/issues)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue?style=flat-square)](LICENSE)
[![Last Commit](https://img.shields.io/github/last-commit/polancojoseph1/freecode?style=flat-square)](https://github.com/polancojoseph1/freecode/commits/main)
[![GitHub Release](https://img.shields.io/github/v/release/polancojoseph1/freecode?style=flat-square)](https://github.com/polancojoseph1/freecode/releases)

**FreeCode** is a free, open-source fork of [opencode](https://github.com/sst/opencode) — the AI coding agent — pre-configured to route through free-tier AI providers so you can use a powerful coding agent at zero cost.

> Built on top of [opencode by SST](https://github.com/sst/opencode). Full credit to the original authors.

---

## What FreeCode Adds

OpenCode is a great tool but requires paid API keys out of the box. FreeCode adds pre-configured support for free-tier providers that rotate automatically when one hits a rate limit:

| Provider | Model | Free Limit |
|---|---|---|
| Groq | llama-3.3-70b | 14,400 req/day |
| Cerebras | llama-3.3-70b | Ultra-fast, generous free tier |
| SambaNova | llama-3.3-70b | 400 req/day |
| Google Gemini | gemini-2.0-flash | 1,500 req/day |
| OpenRouter | llama-3.3-70b:free | 20 RPM, no key required for some models |
| Together AI | llama-3.3-70b | Free credits on signup |
| Mistral | mistral-small | Free eval tier |
| Hugging Face | Various | Free inference API |
| NVIDIA NIM | Various | Free hosted credits |
| Ollama (local) | qwen2.5:7b | Unlimited — your machine |

---

## Quick Start

```bash
# Install (coming soon to npm)
npm install -g freecode-ai

# Or run from source
git clone https://github.com/polancojoseph1/freecode
cd freecode
bun install
bun run dev
```

### Configure Free Keys (optional — Ollama works with zero config)

Set any combination of these env vars and FreeCode will use them automatically:

```bash
export GROQ_API_KEY=...        # console.groq.com — free
export CEREBRAS_API_KEY=...    # cloud.cerebras.ai — free
export SAMBANOVA_API_KEY=...   # cloud.sambanova.ai — free
export GEMINI_API_KEY=...      # aistudio.google.com — free
export OPENROUTER_API_KEY=...  # openrouter.ai — free tier
export TOGETHER_API_KEY=...    # api.together.ai — free credits
export MISTRAL_API_KEY=...     # console.mistral.ai — free eval
export HF_API_KEY=...          # huggingface.co — free
export NVIDIA_API_KEY=...      # build.nvidia.com — free credits
```

---

## How It Works

FreeCode sits on top of opencode's provider infrastructure and adds a rotation layer. When a provider returns a 429 rate limit, FreeCode automatically switches to the next available provider. Ollama (local) is always the last fallback — unlimited and free.

---

## Used By

FreeCode powers the **Free Bot** in [BridgeBot](https://github.com/polancojoseph1/bridgebot) — a Telegram AI assistant that stays online 24/7 at zero cost using FreeCode's provider rotation.

---

## License

MIT — see [LICENSE](LICENSE).

Built on [opencode](https://github.com/sst/opencode) by SST, also MIT licensed.

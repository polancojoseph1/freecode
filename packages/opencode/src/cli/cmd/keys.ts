/**
 * freecode keys — manage API keys for free-tier providers.
 *
 * Keys are stored in ~/.config/freecode/keys.env and auto-loaded at startup.
 * Each key is a standard env var that the underlying AI SDK reads automatically.
 *
 * Usage:
 *   freecode keys list                       — show all configured providers
 *   freecode keys set <provider> <api-key>   — set a provider's API key
 *   freecode keys remove <provider>          — remove a provider's API key
 */

import type { CommandModule } from "yargs"
import fs from "fs"
import path from "path"
import os from "os"

const PROVIDER_ENV_MAP: Record<string, { envKey: string; label: string; url: string }> = {
  groq:        { envKey: "GROQ_API_KEY",        label: "Groq",         url: "console.groq.com" },
  cerebras:    { envKey: "CEREBRAS_API_KEY",    label: "Cerebras",     url: "cloud.cerebras.ai" },
  sambanova:   { envKey: "SAMBANOVA_API_KEY",   label: "SambaNova",    url: "cloud.sambanova.ai" },
  gemini:      { envKey: "GEMINI_API_KEY",      label: "Google Gemini",url: "aistudio.google.com" },
  openrouter:  { envKey: "OPENROUTER_API_KEY",  label: "OpenRouter",   url: "openrouter.ai" },
  together:    { envKey: "TOGETHER_API_KEY",    label: "Together AI",  url: "api.together.ai" },
  mistral:     { envKey: "MISTRAL_API_KEY",     label: "Mistral",      url: "console.mistral.ai" },
  huggingface: { envKey: "HF_API_KEY",          label: "Hugging Face", url: "huggingface.co/settings/tokens" },
  nvidia:      { envKey: "NVIDIA_API_KEY",      label: "NVIDIA NIM",   url: "build.nvidia.com" },
}

function keysEnvPath(): string {
  const configHome = process.env.XDG_CONFIG_HOME || path.join(os.homedir(), ".config")
  return path.join(configHome, "freecode", "keys.env")
}

function readKeys(): Record<string, string> {
  const file = keysEnvPath()
  if (!fs.existsSync(file)) return {}
  const result: Record<string, string> = {}
  for (const line of fs.readFileSync(file, "utf8").split("\n")) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith("#")) continue
    const eq = trimmed.indexOf("=")
    if (eq === -1) continue
    result[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim()
  }
  return result
}

function writeKeys(keys: Record<string, string>): void {
  const file = keysEnvPath()
  fs.mkdirSync(path.dirname(file), { recursive: true })
  const lines = [
    "# FreeCode API Keys — auto-loaded at startup",
    "# Edit this file or use: freecode keys set <provider> <key>",
    "",
    ...Object.entries(keys).map(([k, v]) => `${k}=${v}`),
  ]
  fs.writeFileSync(file, lines.join("\n") + "\n", { mode: 0o600 })
}

export const KeysCommand: CommandModule = {
  command: "keys",
  describe: "manage API keys for free-tier providers",
  builder: (yargs) =>
    yargs
      .command({
        command: "list",
        describe: "show all configured provider API keys",
        handler: () => {
          const stored = readKeys()
          console.log("\nFreeCode provider API keys\n")
          console.log(`  Config file: ${keysEnvPath()}\n`)
          for (const [name, info] of Object.entries(PROVIDER_ENV_MAP)) {
            const val = stored[info.envKey] || process.env[info.envKey]
            const status = val ? `\x1b[32m✓ configured\x1b[0m` : `\x1b[2mnot set\x1b[0m`
            console.log(`  ${info.label.padEnd(14)} ${status}  (${info.url})`)
          }
          console.log("\n  Usage: freecode keys set <provider> <api-key>")
          console.log("  Providers: " + Object.keys(PROVIDER_ENV_MAP).join(", ") + "\n")
        },
      })
      .command({
        command: "set <provider> <apikey>",
        describe: "set API key for a provider",
        handler: (argv) => {
          const provider = String(argv.provider).toLowerCase()
          const apikey = String(argv.apikey)
          const info = PROVIDER_ENV_MAP[provider]
          if (!info) {
            console.error(`\nUnknown provider: ${provider}`)
            console.error("  Valid providers: " + Object.keys(PROVIDER_ENV_MAP).join(", ") + "\n")
            process.exit(1)
          }
          const keys = readKeys()
          keys[info.envKey] = apikey
          writeKeys(keys)
          console.log(`\n\x1b[32m✓\x1b[0m ${info.label} API key saved to ${keysEnvPath()}\n`)
        },
      })
      .command({
        command: "remove <provider>",
        describe: "remove API key for a provider",
        handler: (argv) => {
          const provider = String(argv.provider).toLowerCase()
          const info = PROVIDER_ENV_MAP[provider]
          if (!info) {
            console.error(`\nUnknown provider: ${provider}`)
            process.exit(1)
          }
          const keys = readKeys()
          if (!(info.envKey in keys)) {
            console.log(`\n${info.label} key is not set in ${keysEnvPath()}\n`)
            return
          }
          delete keys[info.envKey]
          writeKeys(keys)
          console.log(`\n\x1b[33m–\x1b[0m ${info.label} API key removed\n`)
        },
      })
      .demandCommand(1, "Specify a subcommand: list, set, or remove"),
  handler: () => {},
}

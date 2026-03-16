/**
 * freecode keys — manage API keys for free-tier providers.
 *
 * Keys are stored in ~/.config/freecode/keys.env and auto-loaded at startup.
 * Each key is a standard env var that the underlying AI SDK reads automatically.
 *
 * Usage:
 *   freecode keys setup                      — interactive setup wizard (recommended)
 *   freecode keys list                       — show all providers + status
 *   freecode keys set <provider> <api-key>   — set a key directly
 *   freecode keys remove <provider>          — remove a key
 */

import type { CommandModule } from "yargs"
import fs from "fs"
import path from "path"
import os from "os"
import * as prompts from "@clack/prompts"
import { UI } from "../ui"

type ProviderInfo = {
  envKey: string
  label: string
  model: string
  free: string
  url: string
  badge?: string
  note?: string
}

const PROVIDERS: Record<string, ProviderInfo> = {
  groq: {
    envKey: "GROQ_API_KEY",
    label: "Groq",
    model: "llama-3.3-70b-versatile",
    free: "14,400 req/day • fastest free option",
    url: "https://console.groq.com",
    badge: "FASTEST",
  },
  cerebras: {
    envKey: "CEREBRAS_API_KEY",
    label: "Cerebras",
    model: "llama-3.3-70b",
    free: "~2,000 tokens/sec • ultra-fast inference",
    url: "https://cloud.cerebras.ai",
    badge: "ULTRA FAST",
  },
  sambanova: {
    envKey: "SAMBANOVA_API_KEY",
    label: "SambaNova",
    model: "Meta-Llama-3.3-70B-Instruct",
    free: "400 req/day • high quality output",
    url: "https://cloud.sambanova.ai",
  },
  gemini: {
    envKey: "GEMINI_API_KEY",
    label: "Google Gemini",
    model: "gemini-2.0-flash",
    free: "1,500 req/day • sign in with Google",
    url: "https://aistudio.google.com/apikey",
    badge: "EASIEST SIGNUP",
    note: "Sign in with Google — no credit card needed",
  },
  openrouter: {
    envKey: "OPENROUTER_API_KEY",
    label: "OpenRouter",
    model: "300+ free models",
    free: "free tier • aggregates many providers",
    url: "https://openrouter.ai/keys",
    note: "Some models require no key at all",
  },
  together: {
    envKey: "TOGETHER_API_KEY",
    label: "Together AI",
    model: "Llama-3.3-70B-Instruct-Turbo-Free",
    free: "free credits on signup",
    url: "https://api.together.ai",
  },
  mistral: {
    envKey: "MISTRAL_API_KEY",
    label: "Mistral",
    model: "mistral-small-latest",
    free: "free eval tier • EU-hosted",
    url: "https://console.mistral.ai",
  },
  huggingface: {
    envKey: "HF_API_KEY",
    label: "Hugging Face",
    model: "Llama-3.3-70B + hundreds more",
    free: "free inference API • huge model selection",
    url: "https://huggingface.co/settings/tokens",
  },
  nvidia: {
    envKey: "NVIDIA_API_KEY",
    label: "NVIDIA NIM",
    model: "llama-3.3-70b-instruct",
    free: "free hosted credits on signup",
    url: "https://build.nvidia.com",
  },
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
    "# Edit manually or use: freecode keys set <provider> <key>",
    "",
    ...Object.entries(keys).map(([k, v]) => `${k}=${v}`),
  ]
  fs.writeFileSync(file, lines.join("\n") + "\n", { mode: 0o600 })
}

function countConfigured(): number {
  const stored = readKeys()
  return Object.values(PROVIDERS).filter(
    (p) => stored[p.envKey] || process.env[p.envKey]
  ).length
}

async function runSetupWizard(onlyUnconfigured = false) {
  const stored = readKeys()
  const D = UI.Style.TEXT_DIM
  const H = UI.Style.TEXT_HIGHLIGHT
  const S = UI.Style.TEXT_SUCCESS
  const R = UI.Style.TEXT_NORMAL

  UI.empty()
  prompts.intro(
    `${H}FreeCode${R} — free provider setup`
  )

  prompts.log.info(
    `Add API keys for free-tier AI providers. More keys = more capacity.\n` +
    `${D}Keys are saved to: ${keysEnvPath()}${R}`
  )

  const newKeys: Record<string, string> = { ...stored }
  let added = 0

  for (const [id, info] of Object.entries(PROVIDERS)) {
    const alreadySet = !!(stored[info.envKey] || process.env[info.envKey])
    if (onlyUnconfigured && alreadySet) continue

    const badge = info.badge ? ` ${D}[${info.badge}]${R}` : ""
    const header = `${H}${info.label}${R}${badge}`
    const detail = [
      `  Model : ${info.model}`,
      `  Free  : ${info.free}`,
      `  Signup: ${info.url}`,
      info.note ? `  Note  : ${info.note}` : "",
    ].filter(Boolean).join("\n")

    prompts.log.step(`${header}\n${D}${detail}${R}`)

    const existing = stored[info.envKey]
    const masked = existing ? `${existing.slice(0, 8)}${"*".repeat(Math.max(0, existing.length - 8))}` : ""

    const input = await prompts.text({
      message: alreadySet
        ? `${info.label} key ${D}(current: ${masked} — press Enter to keep)${R}`
        : `${info.label} API key ${D}(press Enter to skip)${R}`,
      placeholder: `Paste your ${info.label} API key here…`,
      validate: () => undefined,
    })

    if (prompts.isCancel(input)) {
      prompts.cancel("Setup cancelled.")
      process.exit(0)
    }

    const trimmed = String(input ?? "").trim()
    if (trimmed) {
      newKeys[info.envKey] = trimmed
      added++
      prompts.log.success(`${info.label} key saved`)
    } else if (alreadySet) {
      prompts.log.info(`${info.label} key unchanged`)
    } else {
      prompts.log.warn(`${info.label} skipped`)
    }

    UI.empty()
  }

  writeKeys(newKeys)

  const total = countConfigured()
  const bar = total >= 6 ? `${S}●●●●●●${R}` :
              total >= 4 ? `${S}●●●●${R}${D}●●${R}` :
              total >= 2 ? `${S}●●${R}${D}●●●●${R}` :
                           `${D}●●●●●●${R}`

  prompts.note(
    `Configured: ${S}${total}${R} / ${Object.keys(PROVIDERS).length} providers  ${bar}\n\n` +
    (total === 0
      ? `${D}No providers configured. FreeCode won't work without at least one key.\nRun ${H}freecode keys setup${D} to add keys.${R}`
      : total < 3
      ? `${D}Tip: add more keys for better reliability and higher limits.${R}`
      : `${D}You're well covered. FreeCode will rotate between providers automatically.${R}`),
    "Summary"
  )

  if (added > 0) {
    prompts.outro(`${S}✓${R} ${added} key${added === 1 ? "" : "s"} saved — run ${H}freecode${R} to start`)
  } else {
    prompts.outro(`No changes made — run ${H}freecode keys setup${R} to add keys`)
  }
}

export const KeysCommand: CommandModule = {
  command: "keys",
  describe: "manage API keys for free-tier providers",
  builder: (yargs) =>
    yargs
      .command({
        command: "setup",
        describe: "interactive wizard to configure all free provider keys",
        builder: (y) =>
          y.option("only-missing", {
            describe: "only prompt for providers with no key set",
            type: "boolean",
            default: false,
          }),
        handler: async (argv) => {
          await runSetupWizard(argv["only-missing"] as boolean)
        },
      })
      .command({
        command: "list",
        aliases: ["ls"],
        describe: "show all free providers and their key status",
        handler: () => {
          const stored = readKeys()
          const D = UI.Style.TEXT_DIM
          const H = UI.Style.TEXT_HIGHLIGHT
          const S = UI.Style.TEXT_SUCCESS
          const W = UI.Style.TEXT_WARNING
          const R = UI.Style.TEXT_NORMAL

          UI.empty()
          prompts.intro(`${H}FreeCode${R} provider keys  ${D}${keysEnvPath()}${R}`)

          for (const [id, info] of Object.entries(PROVIDERS)) {
            const val = stored[info.envKey] || process.env[info.envKey]
            const status = val ? `${S}✓ configured${R}` : `${D}not set${R}`
            const badge = info.badge ? ` ${D}[${info.badge}]${R}` : ""
            prompts.log.info(
              `${info.label.padEnd(14)}${badge.padEnd(14)} ${status}  ${D}${info.url}${R}`
            )
          }

          const total = countConfigured()
          const suggestion = total === 0
            ? `\n${W}No providers configured!${R} Run ${H}freecode keys setup${R} to get started.`
            : total < 3
            ? `\n${W}${total}/${Object.keys(PROVIDERS).length} configured.${R} Run ${H}freecode keys setup --only-missing${R} to add more.`
            : `\n${S}${total}/${Object.keys(PROVIDERS).length} configured.${R}`

          prompts.outro(suggestion)
        },
      })
      .command({
        command: "set <provider> <apikey>",
        describe: "set API key for a provider",
        handler: (argv) => {
          const provider = String(argv.provider).toLowerCase()
          const apikey = String(argv.apikey)
          const info = PROVIDERS[provider]
          if (!info) {
            console.error(`\nUnknown provider: ${provider}`)
            console.error("  Valid providers: " + Object.keys(PROVIDERS).join(", ") + "\n")
            process.exit(1)
          }
          const keys = readKeys()
          keys[info.envKey] = apikey
          writeKeys(keys)
          console.log(`\n${UI.Style.TEXT_SUCCESS}✓${UI.Style.TEXT_NORMAL} ${info.label} key saved to ${keysEnvPath()}\n`)
        },
      })
      .command({
        command: "remove <provider>",
        aliases: ["rm"],
        describe: "remove API key for a provider",
        handler: (argv) => {
          const provider = String(argv.provider).toLowerCase()
          const info = PROVIDERS[provider]
          if (!info) {
            console.error(`\nUnknown provider: ${provider}`)
            console.error("  Valid providers: " + Object.keys(PROVIDERS).join(", ") + "\n")
            process.exit(1)
          }
          const keys = readKeys()
          if (!(info.envKey in keys)) {
            console.log(`\n${info.label} key is not set in ${keysEnvPath()}\n`)
            return
          }
          delete keys[info.envKey]
          writeKeys(keys)
          console.log(`\n${UI.Style.TEXT_WARNING}–${UI.Style.TEXT_NORMAL} ${info.label} key removed\n`)
        },
      })
      .demandCommand(1, `\nRun ${UI.Style.TEXT_HIGHLIGHT}freecode keys setup${UI.Style.TEXT_NORMAL} to configure free provider keys.\nOr: freecode keys list | set <provider> <key> | remove <provider>\n`),
  handler: () => {},
}

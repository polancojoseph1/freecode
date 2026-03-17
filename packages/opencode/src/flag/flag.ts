function truthy(key: string) {
  const value = process.env[key]?.toLowerCase()
  return value === "true" || value === "1"
}

function falsy(key: string) {
  const value = process.env[key]?.toLowerCase()
  return value === "false" || value === "0"
}

export namespace Flag {
  export const FREECODE_AUTO_SHARE = truthy("FREECODE_AUTO_SHARE")
  export const FREECODE_GIT_BASH_PATH = process.env["FREECODE_GIT_BASH_PATH"]
  export const FREECODE_CONFIG = process.env["FREECODE_CONFIG"]
  export declare const FREECODE_TUI_CONFIG: string | undefined
  export declare const FREECODE_CONFIG_DIR: string | undefined
  export const FREECODE_CONFIG_CONTENT = process.env["FREECODE_CONFIG_CONTENT"]
  export const FREECODE_DISABLE_AUTOUPDATE = truthy("FREECODE_DISABLE_AUTOUPDATE")
  export const FREECODE_DISABLE_PRUNE = truthy("FREECODE_DISABLE_PRUNE")
  export const FREECODE_DISABLE_TERMINAL_TITLE = truthy("FREECODE_DISABLE_TERMINAL_TITLE")
  export const FREECODE_PERMISSION = process.env["FREECODE_PERMISSION"]
  export const FREECODE_DISABLE_DEFAULT_PLUGINS = truthy("FREECODE_DISABLE_DEFAULT_PLUGINS")
  export const FREECODE_DISABLE_LSP_DOWNLOAD = truthy("FREECODE_DISABLE_LSP_DOWNLOAD")
  export const FREECODE_ENABLE_EXPERIMENTAL_MODELS = truthy("FREECODE_ENABLE_EXPERIMENTAL_MODELS")
  export const FREECODE_DISABLE_AUTOCOMPACT = truthy("FREECODE_DISABLE_AUTOCOMPACT")
  export const FREECODE_DISABLE_MODELS_FETCH = truthy("FREECODE_DISABLE_MODELS_FETCH")
  export const FREECODE_DISABLE_CLAUDE_CODE = truthy("FREECODE_DISABLE_CLAUDE_CODE")
  export const FREECODE_DISABLE_CLAUDE_CODE_PROMPT =
    FREECODE_DISABLE_CLAUDE_CODE || truthy("FREECODE_DISABLE_CLAUDE_CODE_PROMPT")
  export const FREECODE_DISABLE_CLAUDE_CODE_SKILLS =
    FREECODE_DISABLE_CLAUDE_CODE || truthy("FREECODE_DISABLE_CLAUDE_CODE_SKILLS")
  export const FREECODE_DISABLE_EXTERNAL_SKILLS =
    FREECODE_DISABLE_CLAUDE_CODE_SKILLS || truthy("FREECODE_DISABLE_EXTERNAL_SKILLS")
  export declare const FREECODE_DISABLE_PROJECT_CONFIG: boolean
  export const FREECODE_FAKE_VCS = process.env["FREECODE_FAKE_VCS"]
  export declare const FREECODE_CLIENT: string
  export const FREECODE_SERVER_PASSWORD = process.env["FREECODE_SERVER_PASSWORD"]
  export const FREECODE_SERVER_USERNAME = process.env["FREECODE_SERVER_USERNAME"]
  export const FREECODE_ENABLE_QUESTION_TOOL = truthy("FREECODE_ENABLE_QUESTION_TOOL")

  // Experimental
  export const FREECODE_EXPERIMENTAL = truthy("FREECODE_EXPERIMENTAL")
  export const FREECODE_EXPERIMENTAL_FILEWATCHER = truthy("FREECODE_EXPERIMENTAL_FILEWATCHER")
  export const FREECODE_EXPERIMENTAL_DISABLE_FILEWATCHER = truthy("FREECODE_EXPERIMENTAL_DISABLE_FILEWATCHER")
  export const FREECODE_EXPERIMENTAL_ICON_DISCOVERY =
    FREECODE_EXPERIMENTAL || truthy("FREECODE_EXPERIMENTAL_ICON_DISCOVERY")

  const copy = process.env["FREECODE_EXPERIMENTAL_DISABLE_COPY_ON_SELECT"]
  export const FREECODE_EXPERIMENTAL_DISABLE_COPY_ON_SELECT =
    copy === undefined ? process.platform === "win32" : truthy("FREECODE_EXPERIMENTAL_DISABLE_COPY_ON_SELECT")
  export const FREECODE_ENABLE_EXA =
    truthy("FREECODE_ENABLE_EXA") || FREECODE_EXPERIMENTAL || truthy("FREECODE_EXPERIMENTAL_EXA")
  export const FREECODE_EXPERIMENTAL_BASH_DEFAULT_TIMEOUT_MS = number("FREECODE_EXPERIMENTAL_BASH_DEFAULT_TIMEOUT_MS")
  export const FREECODE_EXPERIMENTAL_OUTPUT_TOKEN_MAX = number("FREECODE_EXPERIMENTAL_OUTPUT_TOKEN_MAX")
  export const FREECODE_EXPERIMENTAL_OXFMT = FREECODE_EXPERIMENTAL || truthy("FREECODE_EXPERIMENTAL_OXFMT")
  export const FREECODE_EXPERIMENTAL_LSP_TY = truthy("FREECODE_EXPERIMENTAL_LSP_TY")
  export const FREECODE_EXPERIMENTAL_LSP_TOOL = FREECODE_EXPERIMENTAL || truthy("FREECODE_EXPERIMENTAL_LSP_TOOL")
  export const FREECODE_DISABLE_FILETIME_CHECK = truthy("FREECODE_DISABLE_FILETIME_CHECK")
  export const FREECODE_EXPERIMENTAL_PLAN_MODE = FREECODE_EXPERIMENTAL || truthy("FREECODE_EXPERIMENTAL_PLAN_MODE")
  export const FREECODE_EXPERIMENTAL_WORKSPACES = FREECODE_EXPERIMENTAL || truthy("FREECODE_EXPERIMENTAL_WORKSPACES")
  export const FREECODE_EXPERIMENTAL_MARKDOWN = !falsy("FREECODE_EXPERIMENTAL_MARKDOWN")
  export const FREECODE_MODELS_URL = process.env["FREECODE_MODELS_URL"]
  export const FREECODE_MODELS_PATH = process.env["FREECODE_MODELS_PATH"]
  export const FREECODE_DISABLE_CHANNEL_DB = truthy("FREECODE_DISABLE_CHANNEL_DB")
  export const FREECODE_SKIP_MIGRATIONS = truthy("FREECODE_SKIP_MIGRATIONS")
  export const FREECODE_STRICT_CONFIG_DEPS = truthy("FREECODE_STRICT_CONFIG_DEPS")
  export const FREECODE_MAX_STEPS = number("FREECODE_MAX_STEPS")

  function number(key: string) {
    const value = process.env[key]
    if (!value) return undefined
    const parsed = Number(value)
    return Number.isInteger(parsed) && parsed > 0 ? parsed : undefined
  }
}

// Dynamic getter for FREECODE_DISABLE_PROJECT_CONFIG
// This must be evaluated at access time, not module load time,
// because external tooling may set this env var at runtime
Object.defineProperty(Flag, "FREECODE_DISABLE_PROJECT_CONFIG", {
  get() {
    return truthy("FREECODE_DISABLE_PROJECT_CONFIG")
  },
  enumerable: true,
  configurable: false,
})

// Dynamic getter for FREECODE_TUI_CONFIG
// This must be evaluated at access time, not module load time,
// because tests and external tooling may set this env var at runtime
Object.defineProperty(Flag, "FREECODE_TUI_CONFIG", {
  get() {
    return process.env["FREECODE_TUI_CONFIG"]
  },
  enumerable: true,
  configurable: false,
})

// Dynamic getter for FREECODE_CONFIG_DIR
// This must be evaluated at access time, not module load time,
// because external tooling may set this env var at runtime
Object.defineProperty(Flag, "FREECODE_CONFIG_DIR", {
  get() {
    return process.env["FREECODE_CONFIG_DIR"]
  },
  enumerable: true,
  configurable: false,
})

// Dynamic getter for FREECODE_CLIENT
// This must be evaluated at access time, not module load time,
// because some commands override the client at runtime
Object.defineProperty(Flag, "FREECODE_CLIENT", {
  get() {
    return process.env["FREECODE_CLIENT"] ?? "cli"
  },
  enumerable: true,
  configurable: false,
})

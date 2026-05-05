import { existsSync } from "fs"
import z from "zod"
import { mergeDeep, unique } from "remeda"
import { Config } from "./config"
import { ConfigPaths } from "./paths"
import { migrateTuiConfig } from "./migrate-tui-config"
import { TuiInfo } from "./tui-schema"
import { Instance } from "@/project/instance"
import { Flag } from "@/flag/flag"
import { Log } from "@/util/log"
import { Global } from "@/global"

export namespace TuiConfig {
  const log = Log.create({ service: "tui.config" })

  export const Info = TuiInfo

  export type Info = z.output<typeof Info>

  function mergeInfo(target: Info, source: Info): Info {
    return mergeDeep(target, source)
  }

  function customPath() {
    return Flag.FREECODE_TUI_CONFIG
  }

  const state = Instance.state(async () => {
    let projectFiles = Flag.FREECODE_DISABLE_PROJECT_CONFIG
      ? []
      : await ConfigPaths.projectFiles("tui", Instance.directory, Instance.worktree)
    const directories = await ConfigPaths.directories(Instance.directory, Instance.worktree)
    const custom = customPath()
    const managed = Config.managedConfigDir()
    await migrateTuiConfig({ directories, custom, managed })
    // Re-compute after migration since migrateTuiConfig may have created new tui.json files
    projectFiles = Flag.FREECODE_DISABLE_PROJECT_CONFIG
      ? []
      : await ConfigPaths.projectFiles("tui", Instance.directory, Instance.worktree)

    const globalPromises = ConfigPaths.fileInDirectory(Global.Path.config, "tui").map((file) => loadFile(file))
    const customPromise = custom ? loadFile(custom).then((info) => { log.debug("loaded custom tui config", { path: custom }); return info }) : Promise.resolve({})
    const projectPromises = projectFiles.map((file) => loadFile(file))
    const dirPromises = []
    for (const dir of unique(directories)) {
      if (!dir.endsWith(".freecode") && dir !== Flag.FREECODE_CONFIG_DIR) continue
      for (const file of ConfigPaths.fileInDirectory(dir, "tui")) {
        dirPromises.push(loadFile(file))
      }
    }
    const managedPromises = existsSync(managed) ? ConfigPaths.fileInDirectory(managed, "tui").map((file) => loadFile(file)) : []

    // ⚡ Bolt Performance Optimization:
    // Await all independent disk read/parse tasks concurrently rather than waiting sequentially,
    // reducing total blocking IO time.
    const [globalInfos, customInfo, projectInfos, dirInfos, managedInfos] = await Promise.all([
      Promise.all(globalPromises),
      customPromise,
      Promise.all(projectPromises),
      Promise.all(dirPromises),
      Promise.all(managedPromises)
    ])

    let result: Info = {}

    for (const info of globalInfos) {
      result = mergeInfo(result, info)
    }
    if (custom) {
      result = mergeInfo(result, customInfo)
    }
    for (const info of projectInfos) {
      result = mergeInfo(result, info)
    }
    for (const info of dirInfos) {
      result = mergeInfo(result, info)
    }
    for (const info of managedInfos) {
      result = mergeInfo(result, info)
    }

    result.keybinds = Config.Keybinds.parse(result.keybinds ?? {})

    return {
      config: result,
    }
  })

  export async function get() {
    return state().then((x) => x.config)
  }

  async function loadFile(filepath: string): Promise<Info> {
    const text = await ConfigPaths.readFile(filepath)
    if (!text) return {}
    return load(text, filepath).catch((error) => {
      log.warn("failed to load tui config", { path: filepath, error })
      return {}
    })
  }

  async function load(text: string, configFilepath: string): Promise<Info> {
    const data = await ConfigPaths.parseText(text, configFilepath, "empty")
    if (!data || typeof data !== "object" || Array.isArray(data)) return {}

    // Flatten a nested "tui" key so users who wrote `{ "tui": { ... } }` inside tui.json
    // (mirroring the old freecode.json shape) still get their settings applied.
    const normalized = (() => {
      const copy = { ...(data as Record<string, unknown>) }
      if (!("tui" in copy)) return copy
      if (!copy.tui || typeof copy.tui !== "object" || Array.isArray(copy.tui)) {
        delete copy.tui
        return copy
      }
      const tui = copy.tui as Record<string, unknown>
      delete copy.tui
      return {
        ...tui,
        ...copy,
      }
    })()

    const parsed = Info.safeParse(normalized)
    if (!parsed.success) {
      log.warn("invalid tui config", { path: configFilepath, issues: parsed.error.issues })
      return {}
    }

    return parsed.data
  }
}

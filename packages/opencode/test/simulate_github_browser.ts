import { spawn } from "child_process"

// Mock spawn
const mockSpawn = (bin, args) => {
  console.log(`Mock Spawn: ${bin} ${JSON.stringify(args)}`)
}

const platforms = ["darwin", "win32", "linux"]
const url = "https://example.com"

platforms.forEach(platform => {
  const [bin, args] =
    platform === "darwin"
      ? ["open", [url]]
      : platform === "win32"
        ? ["cmd", ["/c", "start", "", url]]
        : ["xdg-open", [url]]

  mockSpawn(bin, args)
})

// It could just be that "bun test" is literally being killed because github actions runner ran out of memory, or something else.
// I see I already skipped the plugin.auth-override test.
// Let's run `bun test packages/opencode/test/project/project.test.ts` to see if it hangs or takes a long time.

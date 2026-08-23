import { Identifier } from "./packages/opencode/src/id/id.ts";

const DAY_MS = 24 * 60 * 60 * 1000;
const RETENTION_MS = 7 * DAY_MS;

const now = Date.now();
const cutoff = Identifier.timestamp(Identifier.create("tool", false, now - RETENTION_MS));

const oldTimestamp = now - 8 * DAY_MS;
const oldId = Identifier.create("tool", false, oldTimestamp);
const oldExtract = Identifier.timestamp(oldId);

const recentTimestamp = now - 3 * DAY_MS;
const recentId = Identifier.create("tool", false, recentTimestamp);
const recentExtract = Identifier.timestamp(recentId);

console.log("Cutoff:", cutoff);
console.log("Old Extract:", oldExtract);
console.log("Recent Extract:", recentExtract);
console.log("Old >= cutoff:", oldExtract >= cutoff);
console.log("Recent >= cutoff:", recentExtract >= cutoff);

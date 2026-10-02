#!/usr/bin/env node
// Every command `kronika` accepts has a page on this site, or this refuses.
// The commands are the `command` union of the parsed arguments in the Kronika
// checkout (src/cli/arguments.ts); the pages are the command-tree links on
// docs/cli/index.html, each of which must resolve to an index.html here.
//
//   node tools/check-command-coverage.mjs [--kronika-root DIR]
//
// Exit 0 when every command has a page, 1 with the missing ones named, 2 for
// a wrong invocation or an unreadable argument parser.

import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const argv = process.argv.slice(2);
let kronikaRoot = resolve(root, "..", "kronika");
for (let index = 0; index < argv.length; index += 1) {
  if (argv[index] === "--kronika-root" && index + 1 < argv.length) {
    index += 1;
    kronikaRoot = resolve(argv[index]);
    continue;
  }
  console.error(`check-command-coverage: unknown argument ${argv[index]}`);
  process.exit(2);
}

const parserPath = resolve(kronikaRoot, "src/cli/arguments.ts");
let parser;
try {
  parser = readFileSync(parserPath, "utf8");
} catch (error) {
  console.error(`check-command-coverage: ${parserPath} cannot be read (${error.message}); name the Kronika checkout with --kronika-root`);
  process.exit(2);
}
const union = parser.match(/command:\s*((?:"[a-z-]+"\s*\|\s*)*"[a-z-]+")/);
if (!union) {
  console.error(`check-command-coverage: ${parserPath} declares no command union`);
  process.exit(2);
}
const commands = [...union[1].matchAll(/"([a-z-]+)"/g)].map((m) => m[1]).filter((c) => c !== "help");

const index = readFileSync(resolve(root, "docs/cli/index.html"), "utf8");
const tree = index.match(/<nav aria-label="Kronika CLI command tree">([\s\S]*?)<\/nav>/);
if (!tree) {
  console.error("check-command-coverage: docs/cli/index.html has no command tree");
  process.exit(2);
}
const linked = new Map();
for (const link of tree[1].matchAll(/<a href="(\/docs\/[a-z/-]+\/)"><code>kronika ([a-z-]+)<\/code>/g)) {
  linked.set(link[2], link[1]);
}

const missing = [];
for (const command of commands) {
  const href = linked.get(command);
  if (!href) {
    missing.push(`${command} (not in the command tree)`);
    continue;
  }
  if (!existsSync(resolve(root, `.${href}index.html`))) {
    missing.push(`${command} (${href} has no index.html)`);
  }
}
if (missing.length) {
  console.error(`check-command-coverage: ${missing.length} command(s) have no page: ${missing.join("; ")}`);
  process.exit(1);
}
console.log(`check-command-coverage: every one of ${commands.length} commands has a page`);

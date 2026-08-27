import assert from "node:assert/strict";
import test from "node:test";

const origin = "https://kronika.wisent.com";
const commands = [
  { route: "/docs/cli/sources/", invocation: "kronika sources [options]" },
  { route: "/docs/cli/check/", invocation: "kronika check --base <ref> [options]" },
  { route: "/docs/cli/write/", invocation: "kronika write [options]" },
  { route: "/docs/cli/sync/", invocation: "kronika sync [options]" },
];

const fetchPage = async (route) => {
  const expectedUrl = `${origin}${route}`;
  const response = await fetch(expectedUrl, { redirect: "follow" });
  assert.equal(response.status, 200, `${expectedUrl} must return 200`);
  assert.equal(response.url, expectedUrl, `${route} must resolve to its canonical URL`);
  return response.text();
};

test("every public Kronika command has a canonical production page", async () => {
  for (const command of commands) {
    const html = await fetchPage(command.route);
    assert.match(
      html,
      new RegExp(`<link\\s+rel=["']canonical["']\\s+href=["']${origin}${command.route}["']`),
      `${command.route} must declare its canonical URL`,
    );
    const decodedText = html
      .replace(/<[^>]+>/g, " ")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&amp;/g, "&")
      .replace(/\s+/g, " ");
    assert.ok(decodedText.includes(command.invocation), `${command.route} must show ${command.invocation}`);
  }
});

test("the CLI index links the complete public command tree", async () => {
  const html = await fetchPage("/docs/cli/");
  for (const command of commands) {
    assert.match(
      html,
      new RegExp(`href=["']${command.route}["']`),
      `/docs/cli/ must link ${command.route}`,
    );
  }
});

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const pkgPath = path.join(__dirname, "..", "package.json");
const desktopChangelogPath = path.join(__dirname, "..", "CHANGELOG.md");
const rootChangelogPath = path.join(__dirname, "..", "..", "CHANGELOG.md");

const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
const version = pkg.version || "0.0.0";
const productName = pkg.build?.productName || pkg.name || "App";
const outputDir = pkg.build?.directories?.output || "dist-installer";
const installerName = `${productName} Setup ${version}.exe`;
const installerPath = `desktop/${outputDir}/${installerName}`;
const date = new Date().toISOString().slice(0, 10);
let commitMessage = "Build created.";

try {
  const message = execSync("git log -1 --pretty=%s", {
    cwd: path.join(__dirname, ".."),
    stdio: ["ignore", "pipe", "ignore"],
  })
    .toString()
    .trim();
  if (message) commitMessage = message;
} catch {
  // ignore if git isn't available
}

function ensureChangelog(pathToFile) {
  let content = "";
  if (fs.existsSync(pathToFile)) {
    content = fs.readFileSync(pathToFile, "utf8");
  }

  if (!content.startsWith("# Changelog")) {
    content = "# Changelog\n\n" + content.trimStart();
  }
  return content;
}

const header = `## [${version}] - ${date}`;
const entry = `- .exe build generated: ${installerPath}\n- Commit: ${commitMessage}`;

for (const changelogPath of [desktopChangelogPath, rootChangelogPath]) {
  const changelog = ensureChangelog(changelogPath);
  const newContent = `${header}\n${entry}\n\n${changelog.trimStart()}`;
  fs.writeFileSync(changelogPath, newContent, "utf8");
  console.log(`Updated changelog at ${changelogPath} for ${version}`);
}

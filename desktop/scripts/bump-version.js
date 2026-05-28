const fs = require("fs");
const path = require("path");

const pkgPath = path.join(__dirname, "..", "package.json");
const pkgText = fs.readFileSync(pkgPath, "utf8");
const pkg = JSON.parse(pkgText);

const version = pkg.version || "0.0.0";
const match = /^([0-9]+)\.([0-9]+)\.([0-9]+)(?:-.+)?$/;
if (!match.test(version)) {
  console.error(`desktop/scripts/bump-version.js expected semver version, got '${version}'`);
  process.exit(1);
}

const [, major, minor, patch] = match.exec(version);
const nextVersion = `${major}.${minor}.${Number(patch) + 1}-alpha`;

pkg.version = nextVersion;
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n", "utf8");
console.log(`Bumped desktop version from ${version} to ${nextVersion}`);

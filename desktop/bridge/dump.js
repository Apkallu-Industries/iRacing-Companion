const { IRacingSDK } = require("irsdk-node");
const fs = require("fs");

const iracing = new IRacingSDK({ autoEnableTelemetry: true });
iracing.startSDK();

setTimeout(() => {
  if (iracing.sessionStatusOK) {
    const raw = iracing.getTelemetry();
    const keys = Object.keys(raw || {}).filter(k => /temp|wear|brake|press/i.test(k));
    fs.writeFileSync("keys_dump.json", JSON.stringify(keys, null, 2));
    console.log("Dumped keys to keys_dump.json");
  } else {
    console.log("iRacing not running or not in session.");
  }
  process.exit(0);
}, 2000);

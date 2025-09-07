const { spawn } = require("child_process");
const path = require("path");

// Start Lavalink Python config
const pyProcess = spawn("python", [path.join(__dirname, "lavalink_config.py")]);

pyProcess.stdout.on("data", data => {
  console.log(`[Python] ${data}`);
});

pyProcess.stderr.on("data", data => {
  console.error(`[Python Error] ${data}`);
});

pyProcess.on("close", code => {
  console.log(`[Python exited with code ${code}]`);
});

// Start Discord Bot
require("./index.js");

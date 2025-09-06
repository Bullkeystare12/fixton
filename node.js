const { spawn } = require("child_process");
const path = require("path");

// Start Python script to prepare lavalink nodes (writes lavalink/nodes.json)
const py = spawn("python3", [path.join(__dirname, "lavalink_config.py")]);
py.stdout.on("data", d => console.log(`[lavalink-config.py] ${d}`));
py.stderr.on("data", d => console.error(`[lavalink-config.py ERROR] ${d}`));
py.on("close", code => console.log(`lavalink_config.py exited with ${code}`));

// Then start the bot
require("./index.js");

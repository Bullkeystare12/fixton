// handlers/lavalinkHandler.js
// Erela.js Lavalink manager initializer + common event handlers.

const { Manager } = require("erela.js");
const fs = require("fs");
const path = require("path");

module.exports = (client) => {
  // Try to load nodes from lavalink/nodes.json first, then from config.json
  let nodes = [];
  try {
    const nodesPath = path.join(__dirname, "..", "lavalink", "nodes.json");
    if (fs.existsSync(nodesPath)) {
      const raw = fs.readFileSync(nodesPath, "utf8");
      nodes = JSON.parse(raw);
      console.log("[Lavalink] Loaded nodes from lavalink/nodes.json");
    }
  } catch (err) {
    console.warn("[Lavalink] Failed to read lavalink/nodes.json:", err);
  }

  // Fallback to config.json lavalink field if no nodes found
  if (!nodes || !nodes.length) {
    try {
      const config = require("../config.json");
      if (config.lavalink) nodes = [config.lavalink];
      console.log("[Lavalink] Using lavalink settings from config.json");
    } catch (err) {
      console.error("[Lavalink] Could not load lavalink config fallback:", err);
    }
  }

  if (!nodes || !nodes.length) {
    console.error("[Lavalink] No lavalink nodes configured. Please add nodes to lavalink/nodes.json or config.json");
    return;
  }

  // Create Manager
  client.manager = new Manager({
    nodes,
    // Default search function is built into erela.js; send helps with shards in sharded bots.
    send: (guildId, payload) => {
      const guild = client.guilds.cache.get(guildId);
      if (guild && guild.shard) guild.shard.send(payload);
    }
  });

  // Hook raw to Manager (required)
  client.on("raw", (d) => {
    try {
      client.manager.updateVoiceState(d);
    } catch (e) {
      // ignore
    }
  });

  // Init on ready
  client.once("ready", async () => {
    try {
      await client.manager.init(client.user.id);
      console.log(`[Lavalink] Manager initialized for ${client.user.tag}`);
    } catch (e) {
      console.error("[Lavalink] Manager failed to initialize:", e);
    }
  });

  // Manager events
  client.manager.on("nodeConnect", (node) => {
    console.log(`[Lavalink] Node connected: ${node.options.identifier || node.options.host}:${node.options.port}`);
  });

  client.manager.on("nodeError", (node, error) => {
    console.error("[Lavalink] Node error:", node.options, error);
  });

  client.manager.on("nodeDisconnect", (node) => {
    console.warn("[Lavalink] Node disconnected:", node.options);
  });

  // Player created
  client.manager.on("playerCreate", (player) => {
    console.log(`[Lavalink] Player created for guild ${player.guild}`);
  });

  // Track start - helpful for nowplaying/notifications
  client.manager.on("trackStart", (player, track) => {
    try {
      const textChannel = client.channels.cache.get(player.textChannel);
      if (textChannel) {
        textChannel.send(`▶️ Now playing: **${track.title}**`);
      }
    } catch (e) {
      // ignore send errors
    }
  });

  // Queue end - destroy player if queue finished
  client.manager.on("queueEnd", (player) => {
    try {
      const textChannel = client.channels.cache.get(player.textChannel);
      if (textChannel) textChannel.send("⏹️ Queue finished. Leaving voice channel.");
    } catch (e) {}
    try {
      player.destroy();
    } catch (e) {}
  });

  // Track stuck / error handlers
  client.manager.on("trackStuck", (player, track, payload) => {
    console.warn(`[Lavalink] Track stuck in guild ${player.guild}:`, track.title);
    try { player.stop(); } catch (e) {}
  });

  client.manager.on("trackError", (player, track, payload) => {
    console.error(`[Lavalink] Track error in guild ${player.guild}:`, payload);
  });

  // Graceful shutdown: destroy players
  const shutdown = async () => {
    try {
      if (client.manager && client.manager.players) {
        for (const p of client.manager.players.values()) {
          try { p.destroy(); } catch (e) {}
        }
      }
      console.log("[Lavalink] Players destroyed on shutdown.");
    } catch (e) {}
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
};

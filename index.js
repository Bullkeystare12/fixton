const { Client, GatewayIntentBits, Collection } = require("discord.js");
const fs = require("fs");
const path = require("path");
const config = require("./config.json");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMembers
  ]
});

client.config = config;
client.commands = new Collection();
client.commandList = []; // optional list for help

// Utilities
client.utils = {};
client.utils.emoji = require("./utils/emojiUtil");
client.utils.button = require("./utils/buttonFactory");

// Handlers
require("./handlers/commandHandler")(client);
require("./handlers/lavalinkHandler")(client);

// Events loader
const eventsPath = path.join(__dirname, "events");
fs.readdirSync(eventsPath).forEach(file => {
  if (!file.endsWith('.js')) return;
  const event = require(`./events/${file}`);
  if (event.once) client.once(event.name, (...args) => event.execute(client, ...args));
  else client.on(event.name, (...args) => event.execute(client, ...args));
});

client.login(config.token).catch(err => {
  console.error("Failed to login. Check token in config.json:", err);
});

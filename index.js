const { Client, GatewayIntentBits, Collection } = require("discord.js");
const fs = require("fs");
const path = require("path");
const logger = require("./utils/logger");

// Load emojis
const emojis = JSON.parse(fs.readFileSync("./emojis.json", "utf8"));

// Bot client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates
  ]
});

client.commands = new Collection();
client.prefix = "$";

// Load commands
const commandFiles = fs.readdirSync(path.join(__dirname, "commands"))
  .filter(file => file.endsWith(".js"));
for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.name, command);
}

// Load events
const eventFiles = fs.readdirSync(path.join(__dirname, "events"))
  .filter(file => file.endsWith(".js"));
for (const file of eventFiles) {
  const event = require(`./events/${file}`);
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args, client, emojis));
  } else {
    client.on(event.name, (...args) => event.execute(...args, client, emojis));
  }
}

client.login("YOUR_BOT_TOKEN");

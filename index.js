const { Client, GatewayIntentBits, Collection, REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
  ],
});

client.commands = new Collection();

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

const commands = [];
for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  client.commands.set(command.data.name, command);
  commands.push(command.data.toJSON());
}

async function registerCommands() {
  const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
  const guildId = process.env.DISCORD_GUILD_ID;

  try {
    //console.log('Clearing existing slash commands...');
    //await rest.put(Routes.applicationCommands(client.user.id), { body: [] });
    if (guildId) {
      //await rest.put(Routes.applicationGuildCommands(client.user.id, guildId), { body: [] });
      console.log('Registering slash commands to guild...');
      await rest.put(Routes.applicationGuildCommands(client.user.id, guildId), { body: commands });
      console.log(`Successfully registered ${commands.length} slash commands to guild`);
    } else {
      //await rest.put(Routes.applicationCommands(client.user.id), { body: [] });
      console.log('Registering slash commands globally...');
      await rest.put(Routes.applicationCommands(client.user.id), { body: commands });
      console.log(`Successfully registered ${commands.length} slash commands globally`);
    }
  } catch (error) {
    console.error('Error registering commands:', error);
  }
}

const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
  const filePath = path.join(eventsPath, file);
  const event = require(filePath);
  const eventName = event.name || file.replace('.js', '');
  if (event.once) {
    client.once(eventName, (...args) => event.execute(...args, client));
  } else {
    client.on(eventName, (...args) => event.execute(...args, client));
  }
}

const handlersPath = path.join(__dirname, 'handlers');
const handlerFiles = fs.readdirSync(handlersPath).filter(file => file.endsWith('.js'));

for (const file of handlerFiles) {
  const filePath = path.join(handlersPath, file);
  const handler = require(filePath);
  const handlerName = handler.name || file.replace('.js', '');
  if (handler.once) {
    client.once(handlerName, (...args) => handler.execute(...args, client));
  } else {
    client.on(handlerName, (...args) => handler.execute(...args, client));
  }
}

client.on('clientReady', (c) => {
  registerCommands();
});

client.login(process.env.DISCORD_TOKEN);
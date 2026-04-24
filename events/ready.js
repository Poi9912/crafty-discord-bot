const { Events, ActivityType } = require('discord.js');
const { getServerStatus } = require('../controllers/crafty');
const { updateBotPresence } = require('../utils/precense');

module.exports = {
  name: Events.ClientReady,
  once: true,
  execute(client) {
    console.log(`Ready! Logged in as ${client.user.tag}`);
    updateBotPresence(client);
    setInterval(() => updateBotPresence(client), 30000);
  },
};
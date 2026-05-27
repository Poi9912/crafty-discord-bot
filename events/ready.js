const { Events } = require('discord.js');
const { updateBotPresence } = require('../utils/precense');

module.exports = {
  name: Events.ClientReady,
  once: true,
  async execute(client) {
    console.log(`Ready! Logged in as ${client.user.tag}`);

    try {
      await updateBotPresence(client);
    } catch (error) {
      console.log('Error updating bot presence', error);
    }

    setInterval(async () => {
      try {
        await updateBotPresence(client);
      } catch (error) {
        console.log('Error updating bot presence', error);
      }
    }, 60000);
  },
};
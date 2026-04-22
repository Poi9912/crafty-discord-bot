const { Client, ActivityType } = require('discord.js');
const { getServerStatus } = require('../controllers/crafty');

async function updateBotPresence(client) {

  const stats = await getServerStatus();
  const isRunning = stats && (stats.online || stats.server_status?.running === true);

  if (!isRunning) {
    client.user.setPresence({
      activities: [{ name: 'Server Offline 🔴', type: ActivityType.Watching }],
      status: 'dnd',
    });
    return;
  }

  const isEmpty = stats.empty || false;
  const onlinePlayers = stats.desc?.players || stats.players;

  if(isEmpty){
    client.user.setPresence({
      activities: [{
        name: `No players online`,
        type: ActivityType.Playing
      }],
      status: 'online',
    });
  } else {
    client.user.setPresence({
      activities: [{
        name: `${onlinePlayers} players online`,
        type: ActivityType.Playing
      }],
      status: 'online',
    });
  }
}

module.exports = {
  updateBotPresence,
};
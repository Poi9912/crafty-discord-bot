const { Client, ActivityType } = require('discord.js');
const { getServerStatus } = require('../controllers/crafty');

async function updateBotPresence(client) {
  let stats;

  try {
    stats = await getServerStatus();
  } catch (error) {
    console.error('Failed to fetch server status for presence update:', error);
    await client.user.setPresence({
      activities: [{ name: 'Status unavailable', type: ActivityType.Watching }],
      status: 'idle',
    });
    return;
  }

  const isRunning = stats && (stats.online || stats.server_status?.running === true);

  if (!isRunning) {
    await client.user.setPresence({
      activities: [{ name: 'Server Offline 🔴', type: ActivityType.Watching }],
      status: 'dnd',
    });
    return;
  }

  const isEmpty = stats.empty || false;
  const onlinePlayers = stats.desc?.players || stats.players;

  if (isEmpty) {
    await client.user.setPresence({
      activities: [{
        name: `No players online`,
        type: ActivityType.Playing
      }],
      status: 'online',
    });
  } else {
    await client.user.setPresence({
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
const { EmbedBuilder } = require('discord.js');

const pingEmbed = (latency) => {
  return new EmbedBuilder()
    .setColor('#00ff00')
    .setTitle('🏓 Pong!')
    .setDescription(`Latency: ${latency}ms`)
    .setTimestamp();
};

const statusEmbed = (client) => {
  return new EmbedBuilder()
    .setColor('#0099ff')
    .setTitle('Bot Status')
    .addFields(
      { name: 'Uptime', value: `${Math.floor(client.uptime / 1000)}s`, inline: true },
      { name: 'Servers', value: `${client.guilds.cache.size}`, inline: true },
      { name: 'Users', value: `${client.users.cache.size}`, inline: true }
    )
    .setTimestamp();
};

const mcStatusEmbed = (status) => {
  return new EmbedBuilder()
    .setColor(status.online ? '#00ff00' : '#ff0000')
    .setTitle('Minecraft Server Status')
    .addFields(
      { name: 'Status', value: status.online ? '🟢 Online' : '🔴 Offline', inline: true },
      { name: 'Players', value: `👥 ${status.players}`, inline: true },
      { name: 'Version', value: `⚙️ ${status.version}`, inline: true }
    )
    .setTimestamp();
};

const standardEmbed = (color, title, description, fields) => {
  const embed = new EmbedBuilder()
    .setColor(color)
    .setTitle(title)
    .setDescription(description)
    .addFields(fields)
    .setTimestamp();
  return embed;
}

module.exports = {
  pingEmbed,
  statusEmbed,
  mcStatusEmbed,
  standardEmbed,
};
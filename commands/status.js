const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const { getServerStatus } = require('../controllers/crafty.js');
const { standardEmbed } = require('../utils/embeds.js');

function content(status) {
  const color = status.online ? '#00ff00' : '#ff0000';
  const title = 'Minecraft Server Status';
  const description = '';
  const fields = [
    { name: 'Status', value: status.online ? '🟢 Online' : '🔴 Offline', inline: true },
    { name: 'Players', value: `👥 ${status.players}`, inline: true },
    { name: 'Version', value: `⚙️ ${status.version}`, inline: true },
    { name: 'CPU Usage', value: `⚡ ${status.cpu}%`, inline: true },
    { name: 'RAM Usage', value: `🧠 ${status.ram}`, inline: true },
    { name: 'Crash Status', value: status.crashed ? '💥 Crashed' : '✅ Stable', inline: true },
    { name: 'Uptime', value: `⏱️ ${status.uptime}`, inline: true },
    { name: 'Last Boot', value: `🖥️ ${status.last_boot}`, inline: true },
  ]
  return { color, title, description, fields };
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('status')
    .setDescription('Check the Minecraft server status'),

  async execute(interaction) {
    await interaction.deferReply( {flags: [MessageFlags.Ephemeral]} );
    try {
      const status = await getServerStatus();
      const { color, title, description, fields } = content(status);
      return interaction.editReply({ embeds: [standardEmbed(color, title, description, fields)] });
    } catch (error){
      console.error('Error getting status from Crafty:', error);
      return interaction.editReply({ content: 'Error fetching server status from Crafty.'});
    }
  },

  async executePrefix(message) {
    try {
      const status = await getServerStatus();
      const { color, title, description, fields } = content(status);
      return message.reply({ embeds: [standardEmbed(color, title, description, fields)], flags: [MessageFlags.Ephemeral] });
    } catch (error) {
      console.error('Error getting status from Crafty:', error);
      return message.reply({ content: 'Error fetching server status from Crafty.', flags: [MessageFlags.Ephemeral] });
    }
  },
};
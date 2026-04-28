const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const { getServerStatus } = require('../controllers/crafty.js');
const { standardEmbed } = require('../utils/embeds.js');

function content(status) {
  const color = status.online ? '#00ff00' : '#ff0000';
  const title = 'Minecraft Server Status';
  const description = null;
  const fields = [
    { name: 'Status', value: status.online ? '🟢 Online' : '🔴 Offline', inline: false },
    { name: 'Players', value: `👥 ${status.players}`, inline: false },
    { name: 'Version', value: `⚙️ ${status.version}`, inline: false },
    { name: 'CPU Usage', value: `⚡ ${status.cpu} %`, inline: false },
    { name: 'RAM Usage', value: `🧠 ${status.ram}`, inline: false },
    { name: 'Crash Status', value: status.crashed ? '💥 Crashed' : '✅ Stable', inline: false },
    { name: 'Starting', value: status.starting ? '🚀 Starting' : '🛑 Not Starting', inline: false },
    { name: 'Uptime', value: `⏱️ ${status.uptime}`, inline: false },
    { name: 'Last Boot', value: `🖥️ ${status.last_boot}`, inline: false },
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
};
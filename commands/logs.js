const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const { getRecentLogs } = require('../controllers/crafty');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('logs')
    .setDescription('View the last 15 lines of the server console'),

  async execute(interaction) {
    await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });
    const adminRoleId = process.env.DISCORD_MINECRAFT_ADMIN_ROLE;

    if (!interaction.member.roles.cache.has(adminRoleId)) {
        return interaction.editReply({ content: 'Access denied.'});
    }

    try {
        const logs = await getRecentLogs();
        return interaction.editReply({ content: `\`\`\`\n${logs.substring(0, 1900)}\n\`\`\`` });
    } catch (error) {
      console.log('Error getting logs from Crafty:', error);
      return interaction.editReply({ content: 'Error fetching logs from Crafty.' });
    }
  },
};
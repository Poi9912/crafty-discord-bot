const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const { getRecentLogs } = require('../controllers/crafty');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('mclogs')
    .setDescription('View the last 20 lines of the server console'),

  async execute(interaction) {
    const adminRoleId = process.env.DISCORD_MINECRAFT_ADMIN_ROLE;

    if (!interaction.member.roles.cache.has(adminRoleId)) {
        return interaction.reply({ content: 'Access denied.', flags: [MessageFlags.Ephemeral] });
    }

    await interaction.deferReply();

    try {
        const logs = await getRecentLogs();
        // Slicing to 1900 to ensure it fits in a Discord code block (2000 limit)
        await interaction.editReply({ content: `\`\`\`\n${logs.substring(0, 1900)}\n\`\`\``, flags: [MessageFlags.Ephemeral] });
    } catch (error) {
        await interaction.editReply({ content: 'Error fetching logs from Crafty Controller.' });
        console.error('Error getting logs from Crafty:', error);
    }
  },

  async executePrefix(message) {
    const adminRoleId = process.env.DISCORD_MINECRAFT_ADMIN_ROLE;

    if (!message.member.roles.cache.has(adminRoleId)) {
        return message.reply({ content: 'Access denied.', flags: [MessageFlags.Ephemeral] });
    }

    await message.deferReply();

    try {
        const logs = await getRecentLogs();
        // Slicing to 1900 to ensure it fits in a Discord code block (2000 limit)
        await message.reply({ content: `\`\`\`\n${logs.substring(0, 1900)}\n\`\`\`` });
    } catch (error) {
        await message.reply({ content: 'Error fetching logs from Crafty Controller.' });
        console.error('Error getting logs from Crafty:', error);
    }
  },
};
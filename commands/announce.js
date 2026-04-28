const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const { sendConsoleCommand, sendConsoleCommandWithResponse} = require('../controllers/crafty');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('announce')
    .setDescription('Send a message to all players on the Minecraft server')
    .addStringOption(opt =>
      opt.setName('message')
        .setDescription('The message to send to all players')
        .setRequired(true)
    ),

  async execute(interaction) {
    await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });
    const adminRoleId = process.env.DISCORD_MINECRAFT_ADMIN_ROLE;

    // Verify Role ID authorization
    if (!interaction.member.roles.cache.has(adminRoleId)) {
      return interaction.editReply({
        content: 'You do not have the required permissions to send announcements.'
      });
    }

    const message = interaction.options.getString('message');
    const sender = interaction.user.username;

    try {
      await sendConsoleCommand(`say From ${sender}: ${message}`);
      return interaction.editReply({ content: `Successfully executed: \`say From ${sender}: ${message}\``});
    } catch (error) {
      console.error('Error sending command to Crafty:', error);
      return interaction.editReply({ content: 'Failed to send command to Crafty.'});
    }
  },
};
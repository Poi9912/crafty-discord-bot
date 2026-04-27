const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const { sendConsoleCommand, sendConsoleCommandWithResponse} = require('../controllers/crafty');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('mcannounce')
    .setDescription('Send a message to all players on the Minecraft server')
    .addStringOption(opt =>
      opt.setName('message')
        .setDescription('The message to send to all players')
        .setRequired(true)
    ),

  async execute(interaction) {
    const adminRoleId = process.env.DISCORD_MINECRAFT_ADMIN_ROLE;

    // Verify Role ID authorization
    if (!interaction.member.roles.cache.has(adminRoleId)) {
      return interaction.reply({
        content: 'You do not have the required permissions to send announcements.',
        flags: [MessageFlags.Ephemeral]
      });
    }

    const message = interaction.options.getString('message');
    const sender = interaction.user.username;

    try {
      await sendConsoleCommand(`say From ${sender}: ${message}`);
      await interaction.reply({ content: `Successfully executed: \`say From ${sender}: ${message}\``, flags: [MessageFlags.Ephemeral] });
    } catch (error) {
      await interaction.reply({ content: 'Failed to send command to Crafty.', flags: [MessageFlags.Ephemeral] });
      console.error('Error sending command to Crafty:', error);
    }
  },

  async executePrefix(message) {
    const adminRoleId = process.env.DISCORD_MINECRAFT_ADMIN_ROLE;

    // Verify Role ID authorization
    if (!interaction.member.roles.cache.has(adminRoleId)) {
      return interaction.reply({
        content: 'You do not have the required permissions to send announcements.',
        flags: [MessageFlags.Ephemeral]
      });
    }

    const sender = interaction.user.username;

    try {
      await sendConsoleCommand(`say From ${sender}: ${message}`);
      await interaction.reply({ content: `Successfully executed: \`say From ${sender}: ${message}\``, flags: [MessageFlags.Ephemeral] });
    } catch (error) {
      await interaction.reply({ content: 'Failed to send command to Crafty.', flags: [MessageFlags.Ephemeral] });
      console.error('Error sending command to Crafty:', error);
    }
  },
};
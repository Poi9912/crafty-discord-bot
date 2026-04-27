const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const { sendConsoleCommand, sendConsoleCommandWithResponse} = require('../controllers/crafty');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('whitelist')
    .setDescription('Add/Remove players from the whitelist')
    .addStringOption(opt =>
      opt.setName('action')
        .setDescription('add, remove or list')
        .setRequired(true)
        .addChoices(
          { name: 'add', value: 'add' },
          { name: 'remove', value: 'remove' },
          { name: 'list', value: 'list' },
      ))
    .addStringOption(opt =>
      opt.setName('player')
        .setDescription('Minecraft Username')
        .setRequired(false)),

  async execute(interaction) {
    const adminRoleId = process.env.DISCORD_MINECRAFT_ADMIN_ROLE;

    // Verify Role ID authorization
    if (!interaction.member.roles.cache.has(adminRoleId)) {
      return interaction.reply({
        content: 'You do not have the required permissions to manage the whitelist.',
        flags: [MessageFlags.Ephemeral]
      });
    }

    const action = interaction.options.getString('action');
    const player = interaction.options.getString('player') || '';

    if (action !== 'list' && !player) {
      return interaction.reply({
        content: 'Player name is required for add/remove actions.',
        flags: [MessageFlags.Ephemeral]
      });
    }
    if (action === 'list') {
      try {
        const response = await sendConsoleCommandWithResponse('whitelist list',1000);
        const playerList = response.split('player(s):')[1]?.trim() || "Whitelist is empty";
        return interaction.reply({ content: `Whitelisted players: ${playerList}`, flags: [MessageFlags.Ephemeral] });
      } catch (error) {
        return interaction.reply({ content: 'Failed to retrieve whitelist from Crafty.', flags: [MessageFlags.Ephemeral] });
      }
    } else {
      try {
        await sendConsoleCommand(`whitelist ${action} ${player}`);
        await interaction.reply({ content: `Successfully executed: \`whitelist ${action} ${player}\`` });
        await sendConsoleCommand(`whitelist reload`);
      } catch (error) {
        await interaction.reply({ content: 'Failed to send command to Crafty.', flags: [MessageFlags.Ephemeral] });
        console.error('Error sending command to Crafty:', error);
      }
    }
  },

  async executePrefix(message) {
    const adminRoleId = process.env.DISCORD_MINECRAFT_ADMIN_ROLE;

    // Verify Role ID authorization
    if (!message.member.roles.cache.has(adminRoleId)) {
      return message.reply({
        content: 'You do not have the required permissions to manage the whitelist.',
        flags: [MessageFlags.Ephemeral]
      });
    }

    const action = message.content.split(' ')[1];
    const player = message.content.split(' ')[2] || '';

    if (action !== 'list' && !player) {
      return message.reply({
        content: 'Player name is required for add/remove actions.',
        flags: [MessageFlags.Ephemeral]
      });
    }
    if (action === 'list') {
      try {
        const response = await sendConsoleCommandWithResponse('whitelist list',1000);
        const playerList = response.split('player(s):')[1]?.trim() || "Whitelist is empty";
        return message.reply({ content: `Whitelisted players: ${playerList}`,flags: [MessageFlags.Ephemeral] });
      } catch (error) {
        return message.reply({ content: 'Failed to retrieve whitelist from Crafty.', flags: [MessageFlags.Ephemeral] });
      }
    } else {
      try {
        await sendConsoleCommand(`whitelist ${action} ${player}`);
        await message.reply({ content: `Successfully executed: \`whitelist ${action} ${player}\``, flags: [MessageFlags.Ephemeral] });
        await sendConsoleCommand(`whitelist reload`);
      } catch (error) {
        await message.reply({ content: 'Failed to send command to Crafty.', flags: [MessageFlags.Ephemeral] });
        console.error('Error sending command to Crafty:', error);
      }
    }
  },
};
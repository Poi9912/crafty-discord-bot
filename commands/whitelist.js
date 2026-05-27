const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const { sendConsoleCommand, sendConsoleCommandWithResponse} = require('../controllers/crafty');

function whitelistContent(log) {
  const fullLog = Array.isArray(log) ? log.join('\n') : log;
  const match = fullLog.match(/whitelisted player.*?:\s*(.*)/i);
  let playerList = "None";
  if (match && match[1]) {
    playerList = match[1].trim();
  }
  return playerList;
}

function whitelistEnableDisable(log) {
  const fullLog = Array.isArray(log) ? log.join('\n') : log;
  const match = fullLog.match(/Whitelist is now turned.*?:\s*(.*)/i);
  let whitelistStatus = "unknown";
  if (match && match[1]) {
    whitelistStatus = match[1].trim();
  }
  return whitelistStatus; //returns "on", "off" or "unknown"
}

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
          { name: 'enable', value: 'on' },
          { name: 'disable', value: 'off' },
        )
      )
    .addStringOption(opt =>
      opt.setName('player')
        .setDescription('Minecraft Username')
        .setRequired(false)),

  async execute(interaction) {
    await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });
    const adminRoleId = process.env.DISCORD_MINECRAFT_ADMIN_ROLE;

    if (!interaction.member.roles.cache.has(adminRoleId)) {
      return interaction.editReply({
        content: 'You do not have the required permissions to manage the whitelist.'
      });
    }

    const action = interaction.options.getString('action');
    const player = interaction.options.getString('player') || '';

    if ((action === 'add' || action === 'remove') && !player) {
      return interaction.editReply({
        content: 'Player name is required for add/remove actions.',
        flags: [MessageFlags.Ephemeral]
      });
    }

    if ((action === 'add' || action === 'remove') && player) {
      try {
        await sendConsoleCommand(`whitelist ${action} ${player}`);
        return interaction.editReply({ content: `Successfully executed: \`whitelist ${action} ${player}\`` });
      } catch (error) {
        console.log('Error sending command to Crafty:', error);
        return interaction.editReply({ content: 'Failed to send command to Crafty.', flags: [MessageFlags.Ephemeral] });
      }
    }

    if (action === 'list') {
      try {
        const response = await sendConsoleCommandWithResponse('whitelist list',200);
        const playerList = whitelistContent(response);
        return interaction.editReply({ content: `Whitelisted players: ${playerList}` });
      } catch (error) {
        console.log('Whitelist error:', error);
        return interaction.editReply({ content: 'Failed to retrieve whitelist from Crafty.' });
      }
    } 
    if (action === 'on' || action === 'off') {
      try {
        const response = await sendConsoleCommandWithResponse(`whitelist ${action}`,200);
        const whitelistStatus = whitelistEnableDisable(response);
        if (whitelistStatus === "unknown") {
          return interaction.editReply({ content: 'Whitelist status updated, but unable to confirm status from Crafty, consult the server logs.' });
        } else {
          return interaction.editReply({ content: `Whitelist turned ${whitelistStatus}.` });
        }
      } catch (error) {
        console.log('Whitelist error:', error);
        return interaction.editReply({ content: 'Failed to update whitelist status on Crafty.' });
      }
    }
  },

  whitelistEnableDisable,
  whitelistContent,
};
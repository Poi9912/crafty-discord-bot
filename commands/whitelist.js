const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const { sendConsoleCommand, sendConsoleCommandWithResponse} = require('../controllers/crafty');

function whitelistContent(log) {
  const fullLog = Array.isArray(log) ? log.join('\n') : log;
  const match = fullLog.match(/whitelisted player.*?:\s*(.*)/i);

  return match?.[1]?.trim() || 'None';
}

function whitelistEnableDisable(log) {
  const fullLog = Array.isArray(log) ? log.join('\n') : log;
  const match = fullLog.match(/Whitelist is now turned\s*(on|off)\b/i);

  return match?.[1]?.toLowerCase() || 'unknown';
}

async function executeToggleAction(interaction, action) {
  try {
    const response = await sendConsoleCommandWithResponse(
      `whitelist ${action}`,
      200
    );

    const status = whitelistEnableDisable(response);
    const content = status === 'unknown'
      ? 'Whitelist status updated, but unable to confirm status from Crafty.'
      : `Whitelist turned ${status}.`;

    return interaction.editReply({ content });
  } catch (error) {
    console.error('Whitelist toggle error:', error);
    return interaction.editReply({
      content: 'Failed to update whitelist status on Crafty.'
    });
  }
}

async function executeListAction(interaction) {
  try {
    const response = await sendConsoleCommandWithResponse('whitelist list', 200);

    return interaction.editReply({
      content: `Whitelisted players: ${whitelistContent(response)}`
    });
  } catch (error) {
    console.error('Whitelist list error:', error);
    return interaction.editReply({
      content: 'Failed to retrieve whitelist from Crafty.'
    });
  }
}

async function executePlayerAction(interaction, action, player) {
  try {
    await sendConsoleCommand(`whitelist ${action} ${player}`);

    return interaction.editReply({
      content: `Successfully executed: \`whitelist ${action} ${player}\``
    });
  } catch (error) {
    console.error('Error sending command to Crafty:', error);
    return interaction.editReply({
      content: 'Failed to send command to Crafty.'
    });
  }
}

function hasAdminRole(interaction) {
  const adminRoleId = process.env.DISCORD_MINECRAFT_ADMIN_ROLE;
  return interaction.member.roles.cache.has(adminRoleId);
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('whitelist')
    .setDescription('Add/Remove/List players from the whitelist or enable/disable the whitelist')
    .addStringOption(opt =>
      opt.setName('action')
        .setDescription('add, remove, list, enable or disable')
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

    if (!hasAdminRole(interaction)) {
      return interaction.editReply({
        content: 'You do not have the required permissions to manage the whitelist.'
      });
    }

    const action = interaction.options.getString('action');
    const player = interaction.options.getString('player')?.trim();

    if (['add', 'remove'].includes(action)) {
      if (!player) {
        return interaction.editReply({
          content: 'Player name is required for add/remove actions.'
        });
      }

      return executePlayerAction(interaction, action, player);
    }

    if (action === 'list') {
      return executeListAction(interaction);
    }

    return executeToggleAction(interaction, action);
  },

  whitelistEnableDisable,
  whitelistContent,
};
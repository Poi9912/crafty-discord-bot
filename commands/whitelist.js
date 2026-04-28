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
    await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });
    const adminRoleId = process.env.DISCORD_MINECRAFT_ADMIN_ROLE;

    // Verify Role ID authorization
    if (!interaction.member.roles.cache.has(adminRoleId)) {
      return interaction.editReply({
        content: 'You do not have the required permissions to manage the whitelist.'
      });
    }

    const action = interaction.options.getString('action');
    const player = interaction.options.getString('player') || '';

    console.log('Whitelist command start')
    if (action !== 'list' && !player) {
      return interaction.editReply({
        content: 'Player name is required for add/remove actions.',
        flags: [MessageFlags.Ephemeral]
      });
    }
    if (action === 'list') {
      try {
        const response = await sendConsoleCommandWithResponse('whitelist list',200);
        const fullLog = Array.isArray(response) ? response.join('\n') : response;
        const match = fullLog.match(/whitelisted player.*?:\s*(.*)/i);
        let playerList = "None";
        if (match && match[1]) {
          playerList = match[1].trim();
        }
        return interaction.editReply({ content: `Whitelisted players: ${playerList}` });
      } catch (error) {
        console.log('Whitelist error:', error);
        return interaction.editReply({ content: 'Failed to retrieve whitelist from Crafty.' });
      }
    } else {
      try {
        await sendConsoleCommand(`whitelist ${action} ${player}`);
        await interaction.reply({ content: `Successfully executed: \`whitelist ${action} ${player}\`` });
        await sendConsoleCommand(`whitelist reload`);
      } catch (error) {
        console.error('Error sending command to Crafty:', error);
        return interaction.reply({ content: 'Failed to send command to Crafty.', flags: [MessageFlags.Ephemeral] });
      }
    }
  },
};
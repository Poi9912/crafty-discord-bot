const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const { getServerStatus } = require('../controllers/crafty');
const { mcStatusEmbed } = require('../utils/embeds.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('mcstatus')
    .setDescription('Check the Minecraft server status'),

  async execute(interaction) {
    await interaction.deferReply();
    try {
      const status = await getServerStatus();
      await interaction.editReply({ embeds: [mcStatusEmbed(status)] });
    } catch {
      console.error('Error getting status from Crafty:', error);
    }
  },

  async executePrefix(message) {
    try {
      const status = await getServerStatus();
      await message.reply({ embeds: [mcStatusEmbed(status)] });
    } catch {
      console.error('Error getting status from Crafty:', error);
    }
  },
};
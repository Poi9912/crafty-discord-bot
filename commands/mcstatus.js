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
      return interaction.editReply({ embeds: [mcStatusEmbed(status)], flags: [MessageFlags.Ephemeral] });
    } catch (error){
      console.error('Error getting status from Crafty:', error);
      return interaction.editReply({ content: 'Error fetching server status from Crafty', flags: [MessageFlags.Ephemeral] });
    }
  },

  async executePrefix(message) {
    try {
      const status = await getServerStatus();
      return message.reply({ embeds: [mcStatusEmbed(status)], flags: [MessageFlags.Ephemeral] });
    } catch (error) {
      console.error('Error getting status from Crafty:', error);
      return message.reply({ content: 'Error fetching server status from Crafty', flags: [MessageFlags.Ephemeral] });
    }
  },
};
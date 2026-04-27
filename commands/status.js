const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const { statusEmbed } = require('../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('status')
    .setDescription('Shows bot status information'),

  async execute(interaction) {
    const embed = statusEmbed(interaction.client);
    await interaction.reply({ embeds: [embed], flags: [MessageFlags.Ephemeral] });
  },

  async executePrefix(message) {
    const embed = statusEmbed(message.client);
    await message.reply({ embeds: [embed], flags: [MessageFlags.Ephemeral] });
  },
};
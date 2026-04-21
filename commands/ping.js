const { SlashCommandBuilder } = require('discord.js');
const { pingEmbed } = require('../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Replies with bot latency'),
  async execute(interaction) {
    const embed = pingEmbed(interaction.client.ws.ping);
    await interaction.reply({ embeds: [embed] });
  },
  async executePrefix(message) {
    const embed = pingEmbed(message.client.ws.ping);
    await message.reply({ embeds: [embed] });
  },
};
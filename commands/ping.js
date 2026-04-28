const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const { standardEmbed } = require('../utils/embeds');

function content(latency) {
  return {
    color: '#00ff00',
    title: '🏓 Pong!',
    description: `Latency: ${latency}ms`,
    fields: []
  };
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Replies with bot latency'),

  async execute(interaction) {
    const embed = standardEmbed(content(interaction.client.ws.ping));
    await interaction.reply({ embeds: [embed], flags: [MessageFlags.Ephemeral] });
  },

  async executePrefix(message) {
    const embed = standardEmbed(content(message.client.ws.ping));
    await message.reply({ embeds: [embed], flags: [MessageFlags.Ephemeral] });
  },
};
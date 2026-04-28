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
    return interaction.reply({ embeds: [embed], flags: [MessageFlags.Ephemeral] });
  },
};
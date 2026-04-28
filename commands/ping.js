const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const { standardEmbed } = require('../utils/embeds');

function content(latency) {
  const color = '#00ff00';
  const title = '🏓 Pong!';
  const description = `Latency: ${latency}ms`;
  const fields = [];
  return { color, title, description, fields };
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Replies with bot latency'),

  async execute(interaction) {
    await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });
    try {
      const { color, title, description, fields } = content(interaction.client.ws.ping);
      const embed = standardEmbed(color, title, description, fields);
      return interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error('Error executing ping command:', error);
      return interaction.editReply({ content: 'Failed to retrieve ping information.' });
    }

  },
};
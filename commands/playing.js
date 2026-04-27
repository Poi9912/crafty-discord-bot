const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const { getServerStatus } = require('../controllers/crafty.js');
const { mcStatusEmbed, standardEmbed } = require('../utils/embeds.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('playing')
    .setDescription('Check the list of players currently playing on the Minecraft server'),

  async execute(interaction) {
    await interaction.deferReply();
    try {
      const status = await getServerStatus();
      const color = '#0099ff';
      const title = status.MOTD;
      const description = status.empty ? 'No players online.' : `Players: ${status.players}`;
      const fields = [];
      status.player_list.forEach(player => {
        fields.push({ name: player, value: '', inline: true });
      });
      return interaction.reply({ embeds:
        [standardEmbed(color, title, description, fields)],
        flags: [MessageFlags.Ephemeral],
      });
    } catch (error) {
      console.error('Error getting players from Crafty:', error);
      return interaction.reply({ content: 'Error fetching player list from Crafty Controller.', flags: [MessageFlags.Ephemeral] });
    }
  },

  async executePrefix(message) {
    try {
      const status = await getServerStatus();
      const color = '#0099ff';
      const title = status.MOTD;
      const description = status.empty ? 'No players online.' : `Players: ${status.players}`;
      const fields = [];
      status.player_list.forEach(player => {
        fields.push({ name: player, value: '', inline: true });
      });
      return message.reply({ embeds:
        [standardEmbed(color, title, description, fields)],
        flags: [MessageFlags.Ephemeral],
      });
    } catch (error) {
      console.error('Error getting players from Crafty:', error);
      return message.reply({ content: 'Error fetching player list from Crafty Controller.', flags: [MessageFlags.Ephemeral] });
    }
  },
};
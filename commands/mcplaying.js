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
      await interaction.editReply({ embeds:
        [standardEmbed(color, title, description, fields)]
      });
    } catch (error) {
      console.error('Error getting players from Crafty:', error);
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
      await message.reply({ embeds:
        [standardEmbed(color, title, description, fields)]
      });
    } catch (error) {
      console.error('Error getting players from Crafty:', error);
    }
  },
};
const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const { getServerStatus } = require('../controllers/crafty.js');
const { mcStatusEmbed, standardEmbed } = require('../utils/embeds.js');

function content(status) {
  const color = '#0099ff';
  const title = status.MOTD;
  const description = status.empty ? 'No players online.' : `Players: ${status.players}`;
  const fields = [];
  status.player_list.forEach(player => {
    fields.push({ name: player, value: '', inline: true });
  });
  return { color, title, description, fields };
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('playing')
    .setDescription('Check the list of players currently playing on the Minecraft server'),

  async execute(interaction) {
    await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });
    try {
      const status = await getServerStatus();
      const { color, title, description, fields } = content(status);
      return interaction.editReply({ embeds:
        [standardEmbed(color, title, description, fields)]
      });
    } catch (error) {
      console.error('Error getting players from Crafty:', error);
      return interaction.editReply({ content: 'Error fetching player list from Crafty Controller.', flags: [MessageFlags.Ephemeral] });
    }
  },
};
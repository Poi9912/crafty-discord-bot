const { EmbedBuilder } = require('discord.js');

const standardEmbed = (color, title, description, fields) => {
  const embed = new EmbedBuilder()
    .setColor(color)
    .setTitle(title)
    .setDescription(description)
    .addFields(fields)
    .setTimestamp();
  return embed;
}

module.exports = {
  standardEmbed,
};
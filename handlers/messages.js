const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'messageCreate',
  once: false,
  async execute(message, client) {
    if (message.author.bot) return;
    if (!message.content.startsWith('!')) return;

    const args = message.content.slice(1).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    const commandFile = client.commands.get(command);
    if (!commandFile) return;

    try {
      console.log(`Executing prefix command: ${command} with args: ${args.join(' ')}`);
      await commandFile.executePrefix(message);
    } catch (error) {
      console.error(error);
      message.reply({ content: 'Error executing command', flags: [MessageFlags.Ephemeral] });
    }
  },
};
module.exports = {
  name: 'interactionCreate',
  once: false,
  async execute(interaction, client) {
    // 1. Only handle slash commands
    if (!interaction.isChatInputCommand()) return;

    // 2. Security: Ensure the command is sent from a Guild (Server)
    // This prevents errors when accessing interaction.member or interaction.guild
    if (!interaction.guild) {
      return interaction.reply({
        content: 'This command can only be used within a server.',
        flags: [MessageFlags.Ephemeral]
      });
    }

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
      await command.execute(interaction);
    } catch (error) {
      console.error(`[Command Error] ${interaction.commandName}:`, error);

      // Check if already replied/deferred to avoid "Interaction already acknowledged" errors
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ content: 'There was an error while executing this command!', flags: [MessageFlags.Ephemeral] });
      } else {
        await interaction.reply({ content: 'There was an error while executing this command!', flags: [MessageFlags.Ephemeral] });
      }
    }
  },
};
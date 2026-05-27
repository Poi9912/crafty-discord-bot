jest.mock('discord.js', () => {
  class SlashCommandStringOption {
    setName() { return this; }
    setDescription() { return this; }
    setRequired() { return this; }
    addChoices() { return this; }
  }

  class SlashCommandBuilder {
    constructor() {
      this.data = {};
    }

    setName() { return this; }
    setDescription() { return this; }
    addStringOption(callback) {
      callback(new SlashCommandStringOption());
      return this;
    }
  }

  return {
    SlashCommandBuilder,
    MessageFlags: {
      Ephemeral: 64,
    },
  };
});

jest.mock('../controllers/crafty', () => ({
  sendConsoleCommand: jest.fn(),
  sendConsoleCommandWithResponse: jest.fn(),
}));

// Mock environment variables
process.env.CRAFTY_URL = 'https://crafty-controller-host';
process.env.CRAFTY_TOKEN = 'test-token';
process.env.CRAFTY_MC_INSTANCE = 'test-server-id';
process.env.DISCORD_MINECRAFT_ADMIN_ROLE = 'admin-role-id';

const { sendConsoleCommand, sendConsoleCommandWithResponse } = require('../controllers/crafty');
const whitelistCommand = require('./whitelist');

describe('whitelist command', () => {
  let interaction;

  beforeEach(() => {
    interaction = {
      deferReply: jest.fn().mockResolvedValue({}),
      editReply: jest.fn().mockResolvedValue({}),
      member: {
        roles: {
          cache: {
            has: jest.fn(),
          },
        },
      },
      options: {
        getString: jest.fn(),
      },
    };

    jest.clearAllMocks();
  });

  test('should deny access when user is not admin', async () => {
    interaction.member.roles.cache.has.mockReturnValue(false);
    interaction.options.getString.mockImplementation(name => (name === 'action' ? 'list' : null));

    await whitelistCommand.execute(interaction);

    expect(interaction.deferReply).toHaveBeenCalledWith({ flags: [64] });
    expect(interaction.editReply).toHaveBeenCalledWith({
      content: 'You do not have the required permissions to manage the whitelist.',
    });
    expect(sendConsoleCommandWithResponse).not.toHaveBeenCalled();
    expect(sendConsoleCommand).not.toHaveBeenCalled();
  });

  test('should require player name for add action', async () => {
    interaction.member.roles.cache.has.mockReturnValue(true);
    interaction.options.getString.mockImplementation(name => {
      if (name === 'action') return 'add';
      if (name === 'player') return '';
      return null;
    });

    await whitelistCommand.execute(interaction);

    expect(interaction.deferReply).toHaveBeenCalledWith({ flags: [64] });
    expect(interaction.editReply).toHaveBeenCalledWith({
      content: 'Player name is required for add/remove actions.',
      flags: [64],
    });
    expect(sendConsoleCommand).not.toHaveBeenCalled();
  });

  test('should list whitelisted players', async () => {
    interaction.member.roles.cache.has.mockReturnValue(true);
    interaction.options.getString.mockImplementation(name => (name === 'action' ? 'list' : null));
    sendConsoleCommandWithResponse.mockResolvedValue('whitelisted player: Player1');

    await whitelistCommand.execute(interaction);

    expect(interaction.deferReply).toHaveBeenCalledWith({ flags: [64] });
    expect(sendConsoleCommandWithResponse).toHaveBeenCalledWith('whitelist list', 200);
    expect(interaction.editReply).toHaveBeenCalledWith({
      content: 'Whitelisted players: Player1',
    });
  });

  test('should enable whitelist and return status', async () => {
    interaction.member.roles.cache.has.mockReturnValue(true);
    interaction.options.getString.mockImplementation(name => (name === 'action' ? 'on' : null));
    sendConsoleCommandWithResponse.mockResolvedValue('[14:24:48 INFO]: Whitelist is now turned on');

    await whitelistCommand.execute(interaction);

    expect(sendConsoleCommandWithResponse).toHaveBeenCalledWith('whitelist on', 200);
    expect(interaction.editReply).toHaveBeenCalledWith({
      content: 'Whitelist turned on.',
    });
  });

  test('should execute whitelist add command successfully', async () => {
    interaction.member.roles.cache.has.mockReturnValue(true);
    interaction.options.getString.mockImplementation(name => {
      if (name === 'action') return 'add';
      if (name === 'player') return 'Steve';
      return null;
    });
    sendConsoleCommand.mockResolvedValue({});

    await whitelistCommand.execute(interaction);

    expect(sendConsoleCommand).toHaveBeenCalledWith('whitelist add Steve');
    expect(interaction.editReply).toHaveBeenCalledWith({
      content: 'Successfully executed: `whitelist add Steve`',
    });
  });

  test('should handle sendConsoleCommandWithResponse failure', async () => {
    interaction.member.roles.cache.has.mockReturnValue(true);
    interaction.options.getString.mockImplementation(name => (name === 'action' ? 'list' : null));
    sendConsoleCommandWithResponse.mockRejectedValue(new Error('Crafty failure'));
    const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

    await whitelistCommand.execute(interaction);

    expect(interaction.editReply).toHaveBeenCalledWith({
      content: 'Failed to retrieve whitelist from Crafty.',
    });
    expect(consoleLogSpy).toHaveBeenCalledWith('Whitelist error:', expect.any(Error));

    consoleLogSpy.mockRestore();
  });

  test('should handle sendConsoleCommand failure', async () => {
    interaction.member.roles.cache.has.mockReturnValue(true);
    interaction.options.getString.mockImplementation(name => {
      if (name === 'action') return 'remove';
      if (name === 'player') return 'Steve';
      return null;
    });
    sendConsoleCommand.mockRejectedValue(new Error('Crafty failure'));
    const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

    await whitelistCommand.execute(interaction);

    expect(interaction.editReply).toHaveBeenCalledWith({
      content: 'Failed to send command to Crafty.',
      flags: [64],
    });
    expect(consoleLogSpy).toHaveBeenCalledWith('Error sending command to Crafty:', expect.any(Error));

    consoleLogSpy.mockRestore();
  });
});
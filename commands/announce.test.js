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

// Mock environment variables
process.env.CRAFTY_URL = 'https://crafty-controller-host';
process.env.CRAFTY_TOKEN = 'test-token';
process.env.CRAFTY_MC_INSTANCE = 'test-server-id';

const { getServerStatus } = require('../controllers/crafty');
const { standardEmbed } = require('../utils/embeds');

const announceCommand = require('./announce');

jest.mock('../utils/embeds', () => ({
  standardEmbed: jest.fn((color, title, description, fields) => ({ color, title, description, fields })),
}));

jest.mock('../controllers/crafty', () => ({
  getServerStatus: jest.fn(),
  sendConsoleCommand: jest.fn(),
}));

describe('announce command', () => {
  let interaction;

  beforeEach(() => {
    interaction = {
      deferReply: jest.fn().mockResolvedValue({}),
      editReply: jest.fn().mockResolvedValue({}),
      options: {
        getString: jest.fn(),
      },
      user: {
        username: 'TestUser',
      },
      member: {
        roles: {
          cache: {
            has: jest.fn(),
          }
        },
      },
      options: {
        getString: jest.fn(),
      },
    };
  });

  it('should send the correct console command to Crafty', async () => {
    interaction.member.roles.cache.has.mockReturnValue(true);
    interaction.options.getString.mockImplementation(name => (name === 'message' ? 'Test announcement message' : null));
    await announceCommand.execute(interaction);
    // expect(interaction.options.getString).toHaveBeenCalledWith('message');
    expect(interaction.deferReply).toHaveBeenCalledWith({ flags: [64] });
    expect(getServerStatus.sendConsoleCommand).toHaveBeenCalledWith('say From TestUser: Test announcement message');
    expect(interaction.editReply).toHaveBeenCalledWith({ content: 'Successfully executed: `say From TestUser: Test announcement message`' });
  });

  it('should return an error message if the user is not authorized', async () => {
    interaction.member.roles.cache.has.mockReturnValue(false);
    await announceCommand.execute(interaction);
    expect(interaction.editReply).toHaveBeenCalledWith({
      content: 'You do not have the required permissions to send announcements.'
    });
  });

  it('should return an error message if sending the command fails', async () => {
    getServerStatus.sendConsoleCommand.mockRejectedValue(new Error('Crafty error'));
    await announceCommand.execute(interaction);
    expect(interaction.editReply).toHaveBeenCalledWith({ content: 'Failed to send command to Crafty.' });
  });
});
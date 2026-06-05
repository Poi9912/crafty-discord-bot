jest.mock('discord.js', () => {
  class SlashCommandStringOption {
    setName() { return this; }
    setDescription() { return this; }
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
process.env.DISCORD_MINECRAFT_ADMIN_ROLE = 'admin-role-id';

const { getRecentLogs } = require('../controllers/crafty');
const logsCommand = require('./logs');

jest.mock('../controllers/crafty', () => ({
  getRecentLogs: jest.fn(),
}));

describe('logs command', () => {
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
    };
  });

  it('should deny access if user does not have admin role', async () => {
    interaction.member.roles.cache.has.mockReturnValue(false);
    await logsCommand.execute(interaction);
    expect(interaction.editReply).toHaveBeenCalledWith({ content: 'Access denied.' });
    expect(getRecentLogs).not.toHaveBeenCalled();
  });

  it('should fetch and return logs', async () => {
    interaction.member.roles.cache.has.mockReturnValue(true);
    getRecentLogs.mockResolvedValue('log line 1\nlog line 2\nlog line 3');

    await logsCommand.execute(interaction);
    expect(getRecentLogs).toHaveBeenCalled();
    expect(interaction.editReply).toHaveBeenCalledWith({ content: '```\nlog line 1\nlog line 2\nlog line 3\n```' });
  });

  it('should handle errors when fetching logs', async () => {
    interaction.member.roles.cache.has.mockReturnValue(true);
    getRecentLogs.mockRejectedValue(new Error('Failed to fetch logs'));

    await logsCommand.execute(interaction);
    expect(getRecentLogs).toHaveBeenCalled();
    expect(interaction.editReply).toHaveBeenCalledWith({ content: 'Error fetching logs from Crafty.' });
  } );

});
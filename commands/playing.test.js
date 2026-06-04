jest.mock('discord.js', () => {
  class SlashCommandBuilder {
    constructor() {
      this.data = {};
    }

    setName() { return this; }
    setDescription() { return this; }
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

const playingCommand = require('./playing');

jest.mock('../utils/embeds', () => ({
  standardEmbed: jest.fn((color, title, description, fields) => ({ color, title, description, fields })),
}));

jest.mock('../controllers/crafty', () => ({
  getServerStatus: jest.fn(),
}));

describe('playing command', () => {
  let interaction;

  beforeEach(() => {
    interaction = {
      deferReply: jest.fn().mockResolvedValue({}),
      editReply: jest.fn().mockResolvedValue({}),
    };
  });

  it('should create an embed with the correct player list', async () => {
    getServerStatus.mockResolvedValue({
      online: true,
      players: '2/20',
      version: '1.21.10',
      empty: false,
      cpu: 10.8,
      ram: '2 GB',
      player_list: ['Player1', 'Player2'],
      MOTD: 'A minecraft server',
      starting: false,
      crashed: false,
      last_boot: '2025-06-01 12:00:00',
      uptime: '00:30:00',
    });
    await playingCommand.execute(interaction);

    expect(interaction.deferReply).toHaveBeenCalledWith({ flags: [64] });
    expect(standardEmbed).toHaveBeenCalledWith(
      '#0099ff',
      'A minecraft server',
      'Players: 2/20',
      [
        { name: 'Player1', value: '', inline: false },
        { name: 'Player2', value: '', inline: false },
      ]
    );
    expect(interaction.editReply).toHaveBeenCalledWith({
      embeds: [
        {
          color: '#0099ff',
          title: 'A minecraft server',
          description: 'Players: 2/20',
          fields: [
            { name: 'Player1', value: '', inline: false },
            { name: 'Player2', value: '', inline: false },
          ],
        },
      ],
    }); 
  });
  it('should handle empty player list correctly', async () => {
    getServerStatus.mockResolvedValue({
      online: true,
      players: '0/20',
      version: '1.21.10',
      empty: true,
      cpu: 1.2,
      ram: '1.8 GB',
      player_list: [],
      MOTD: 'A minecraft server',
      starting: false,
      crashed: false,
      last_boot: '2025-06-01 12:00:00',
      uptime: '00:30:00',
    });
    await playingCommand.execute(interaction);

    expect(standardEmbed).toHaveBeenCalledWith(
      '#0099ff',
      'A minecraft server',
      'No players online.',
      []
    );
  });

  it('should return an error message if fetching player list fails', async () => {
    getServerStatus.mockRejectedValue(new Error('Crafty error'));
    await playingCommand.execute(interaction);
    expect(interaction.editReply).toHaveBeenCalledWith({ content: 'Error fetching player list from Crafty Controller.', flags: [64] });
  });
});
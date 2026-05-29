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

const statusCommand = require('./status');

jest.mock('../utils/embeds', () => ({
  standardEmbed: jest.fn((color, title, description, fields) => ({ color, title, description, fields })),
}));

jest.mock('../controllers/crafty', () => ({
  getServerStatus: jest.fn(),
}));

describe('status command', () => {
  let interaction;

  beforeEach(() => {
    interaction = {
      deferReply: jest.fn().mockResolvedValue({}),
      editReply: jest.fn().mockResolvedValue({}),
    };
  });

  it('should create an embed with the correct server status', async () => {
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
    
    await statusCommand.execute(interaction);
    expect(interaction.deferReply).toHaveBeenCalledWith({ flags: [expect.any(Number)] });
    expect(standardEmbed).toHaveBeenCalledWith(
      '#00ff00',
      'Minecraft Server Status',
      null,
      [
        { name: 'Status', value: '🟢 Online', inline: false },
        { name: 'Players', value: '👥 2/20', inline: false },
        { name: 'Version', value: '⚙️ 1.21.10', inline: false },
        { name: 'CPU Usage', value: '⚡ 10.8 %', inline: false },
        { name: 'RAM Usage', value: '🧠 2 GB', inline: false },
        { name: 'Crash Status', value: '✅ Stable', inline: false },
        { name: 'Starting', value: '🛑 Not Starting', inline: false },
        { name: 'Uptime', value: '⏱️ 00:30:00', inline: false },
        { name: 'Last Boot', value: '🖥️ 2025-06-01 12:00:00', inline: false },
      ]
    );
    expect(interaction.editReply).toHaveBeenCalledWith({
      embeds: [{
        color: '#00ff00',
        title: 'Minecraft Server Status',
        description: null,
        fields: [
        { name: 'Status', value: '🟢 Online', inline: false },
        { name: 'Players', value: '👥 2/20', inline: false },
        { name: 'Version', value: '⚙️ 1.21.10', inline: false },
        { name: 'CPU Usage', value: '⚡ 10.8 %', inline: false },
        { name: 'RAM Usage', value: '🧠 2 GB', inline: false },
        { name: 'Crash Status', value: '✅ Stable', inline: false },
        { name: 'Starting', value: '🛑 Not Starting', inline: false },
        { name: 'Uptime', value: '⏱️ 00:30:00', inline: false },
        { name: 'Last Boot', value: '🖥️ 2025-06-01 12:00:00', inline: false },
        ],
      }],
    });
  });

  it('should handle errors gracefully', async () => {
    getServerStatus.mockRejectedValue(new Error('API error'));
    
    await statusCommand.execute(interaction);
    expect(interaction.deferReply).toHaveBeenCalledWith({ flags: [expect.any(Number)] });
    expect(interaction.editReply).toHaveBeenCalledWith({
      content: 'Error fetching server status from Crafty.',
    });
  });

  it('should show offline status when server is not running', async () => {
    getServerStatus.mockResolvedValue({
      online: false,
      players: '0/20',
      version: '1.21.10',
      empty: true,
      cpu: 0,
      ram: '0 GB',
      player_list: [],
      MOTD: 'A minecraft server',
      starting: false,
      crashed: false,
      last_boot: '2024-06-01 12:00:00',
      uptime: '00:00:00',
    });
    
    await statusCommand.execute(interaction);
    expect(standardEmbed).toHaveBeenCalledWith(
      '#ff0000',
      'Minecraft Server Status',
      null,
      [
        { name: 'Status', value: '🔴 Offline', inline: false },
        { name: 'Players', value: '👥 0/20', inline: false },
        { name: 'Version', value: '⚙️ 1.21.10', inline: false },
        { name: 'CPU Usage', value: '⚡ 0 %', inline: false },
        { name: 'RAM Usage', value: '🧠 0 GB', inline: false },
        { name: 'Crash Status', value: '✅ Stable', inline: false },
        { name: 'Starting', value: '🛑 Not Starting', inline: false },
        { name: 'Uptime', value: '⏱️ 00:00:00', inline: false },
        { name: 'Last Boot', value: '🖥️ 2024-06-01 12:00:00', inline: false },
      ]
    );
  });

  it('should handle empty player list correctly', async () => {
    getServerStatus.mockResolvedValue({
      online: true,
      players: '0/20',
      version: '1.21.10',
      empty: true,
      cpu: 1.1,
      ram: '1.4 GB',
      player_list: [],
      MOTD: 'A minecraft server',
      starting: false,
      crashed: false,
      last_boot: '2024-06-01 12:00:00',
      uptime: '00:40:00',
    });
    
    await statusCommand.execute(interaction);
    expect(standardEmbed).toHaveBeenCalledWith(
      '#00ff00',
      'Minecraft Server Status',
      null,
      [
        { name: 'Status', value: '🟢 Online', inline: false },
        { name: 'Players', value: '👥 0/20', inline: false },
        { name: 'Version', value: '⚙️ 1.21.10', inline: false },
        { name: 'CPU Usage', value: '⚡ 1.1 %', inline: false },
        { name: 'RAM Usage', value: '🧠 1.4 GB', inline: false },
        { name: 'Crash Status', value: '✅ Stable', inline: false },
        { name: 'Starting', value: '🛑 Not Starting', inline: false },
        { name: 'Uptime', value: '⏱️ 00:40:00', inline: false },
        { name: 'Last Boot', value: '🖥️ 2024-06-01 12:00:00', inline: false },
      ]
    );
  });
});
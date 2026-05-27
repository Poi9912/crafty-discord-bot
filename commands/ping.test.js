const pingCommand = require('./ping');
const { standardEmbed } = require('../utils/embeds');

jest.mock('../utils/embeds', () => ({
  standardEmbed: jest.fn((color, title, description, fields) => ({ color, title, description, fields })),
}));

jest.mock('discord.js', () => ({
  SlashCommandBuilder: jest.fn().mockImplementation(() => ({
    setName: jest.fn().mockReturnThis(),
    setDescription: jest.fn().mockReturnThis(),
  })),
  MessageFlags: {
    Ephemeral: 64,
  },
}));

describe('Ping Command', () => {
  it('should create an embed with the correct latency', async () => {
    const mockInteraction = {
      deferReply: jest.fn(),
      editReply: jest.fn(),
      client: {
        ws: {
          ping: 123,
        },
      },
    };

    await pingCommand.execute(mockInteraction);

    expect(mockInteraction.deferReply).toHaveBeenCalledWith({ flags: [expect.any(Number)] });
    expect(standardEmbed).toHaveBeenCalledWith(
      '#00ff00',
      '🏓 Pong!',
      'Latency: 123ms',
      []
    );
    expect(mockInteraction.editReply).toHaveBeenCalledWith({
      embeds: [{
        color: '#00ff00',
        title: '🏓 Pong!',
        description: 'Latency: 123ms',
        fields: [],
      }],
    });
  });

  it('should handle errors gracefully', async () => {
    const mockInteraction = {
      deferReply: jest.fn(),
      editReply: jest.fn(),
      client: {
        ws: {
          ping: 123,
        },
      },
    };

    standardEmbed.mockImplementation(() => { throw new Error('Embed error'); });

    await pingCommand.execute(mockInteraction);

    expect(mockInteraction.editReply).toHaveBeenCalledWith({ content: 'Failed to retrieve ping information.' });
  });
});
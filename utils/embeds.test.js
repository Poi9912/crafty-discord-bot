const { standardEmbed } = require('./embeds');
const { EmbedBuilder } = require('discord.js');

jest.mock('discord.js');

describe('embeds', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('standardEmbed', () => {
    it('should create an embed with correct properties', () => {
      const mockEmbed = {
        setColor: jest.fn().mockReturnThis(),
        setTitle: jest.fn().mockReturnThis(),
        setDescription: jest.fn().mockReturnThis(),
        addFields: jest.fn().mockReturnThis(),
        setTimestamp: jest.fn().mockReturnThis(),
      };

      EmbedBuilder.mockImplementation(() => mockEmbed);

      const color = '#FF0000';
      const title = 'Test Title';
      const description = 'Test Description';
      const fields = [{ name: 'Field 1', value: 'Value 1' }];

      const result = standardEmbed(color, title, description, fields);

      expect(mockEmbed.setColor).toHaveBeenCalledWith(color);
      expect(mockEmbed.setTitle).toHaveBeenCalledWith(title);
      expect(mockEmbed.setDescription).toHaveBeenCalledWith(description);
      expect(mockEmbed.addFields).toHaveBeenCalledWith(fields);
      expect(mockEmbed.setTimestamp).toHaveBeenCalled();
      expect(result).toBe(mockEmbed);
    });

    it('should handle empty fields array', () => {
      const mockEmbed = {
        setColor: jest.fn().mockReturnThis(),
        setTitle: jest.fn().mockReturnThis(),
        setDescription: jest.fn().mockReturnThis(),
        addFields: jest.fn().mockReturnThis(),
        setTimestamp: jest.fn().mockReturnThis(),
      };

      EmbedBuilder.mockImplementation(() => mockEmbed);

      standardEmbed('#00FF00', 'Title', 'Description', []);

      expect(mockEmbed.addFields).toHaveBeenCalledWith([]);
    });
  });
});
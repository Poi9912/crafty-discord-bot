const { updateBotPresence } = require('./precense');
const { ActivityType } = require('discord.js');
const { getServerStatus } = require('../controllers/crafty');

jest.mock('../controllers/crafty');

describe('precense', () => {
  let mockClient;

  beforeEach(() => {
    mockClient = {
      user: {
        setPresence: jest.fn().mockResolvedValue(undefined),
      },
    };
    jest.clearAllMocks();
  });

  describe('updateBotPresence', () => {
    it('should set idle status when getServerStatus throws error', async () => {
      getServerStatus.mockRejectedValueOnce(new Error('Connection failed'));

      await updateBotPresence(mockClient);

      expect(mockClient.user.setPresence).toHaveBeenCalledWith({
        activities: [{ name: 'Status unavailable', type: ActivityType.Watching }],
        status: 'idle',
      });
    });

    it('should set idle status when stats has error', async () => {
      getServerStatus.mockResolvedValueOnce({ error: true });

      await updateBotPresence(mockClient);

      expect(mockClient.user.setPresence).toHaveBeenCalledWith({
        activities: [{ name: 'Status unavailable', type: ActivityType.Watching }],
        status: 'idle',
      });
    });

    it('should set dnd status when server is offline', async () => {
      getServerStatus.mockResolvedValueOnce({ online: false, server_status: { running: false } });

      await updateBotPresence(mockClient);

      expect(mockClient.user.setPresence).toHaveBeenCalledWith({
        activities: [{ name: 'Server Offline 🔴', type: ActivityType.Watching }],
        status: 'dnd',
      });
    });

    it('should set online status with no players when server is empty', async () => {
      getServerStatus.mockResolvedValueOnce({
        online: true,
        server_status: { running: true },
        empty: true,
        players: 0,
      });

      await updateBotPresence(mockClient);

      expect(mockClient.user.setPresence).toHaveBeenCalledWith({
        activities: [{ name: 'No players online', type: ActivityType.Playing }],
        status: 'online',
      });
    });

    it('should set online status with player count when players are online', async () => {
      getServerStatus.mockResolvedValueOnce({
        online: true,
        server_status: { running: true },
        empty: false,
        players: 5,
      });

      await updateBotPresence(mockClient);

      expect(mockClient.user.setPresence).toHaveBeenCalledWith({
        activities: [{ name: '5 players online', type: ActivityType.Playing }],
        status: 'online',
      });
    });

    it('should use desc.players when available', async () => {
      getServerStatus.mockResolvedValueOnce({
        online: true,
        server_status: { running: true },
        empty: false,
        desc: { players: 3 },
      });

      await updateBotPresence(mockClient);

      expect(mockClient.user.setPresence).toHaveBeenCalledWith({
        activities: [{ name: '3 players online', type: ActivityType.Playing }],
        status: 'online',
      });
    });
  });
});
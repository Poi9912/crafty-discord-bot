jest.mock('discord.js', () => ({
  Client: jest.fn(),
  Events: {
    ClientReady: 'ready',
  },
  ActivityType: {
    Playing: 0,
    Watching: 3,
  },
}));

jest.mock('../controllers/crafty', () => ({
  getServerStatus: jest.fn(),
}));

const { Events, ActivityType } = require('discord.js');
const { getServerStatus } = require('../controllers/crafty');
const readyEvent = require('./ready');

// Mock environment variables
process.env.CRAFTY_URL = 'https://crafty-controller-host';
process.env.CRAFTY_TOKEN = 'test-token';
process.env.CRAFTY_MC_INSTANCE = 'test-server-id';

describe('Ready event', () => {
  let mockClient;

  beforeEach(() => {
    mockClient = {
      user: {
        tag: 'TestBot#0001',
        setPresence: jest.fn(),
      },
    };
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  test('should have correct event name and once property', () => {
    expect(readyEvent.name).toBe(Events.ClientReady);
    expect(readyEvent.once).toBe(true);
  });

  test('should log bot ready message', async () => {
    const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

    await readyEvent.execute(mockClient);

    expect(consoleLogSpy).toHaveBeenCalledWith(`Ready! Logged in as ${mockClient.user.tag}`);
    consoleLogSpy.mockRestore();
  });

  test('should update presence to unavailable when status fetch fails', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    getServerStatus.mockRejectedValue(new Error('Crafty API error'));

    await readyEvent.execute(mockClient);

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Failed to fetch server status for presence update:',
      expect.any(Error)
    );
    expect(mockClient.user.setPresence).toHaveBeenCalledWith({
      activities: [{ name: 'Status unavailable', type: ActivityType.Watching }],
      status: 'idle',
    });
    consoleErrorSpy.mockRestore();
  });
});
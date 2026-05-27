jest.mock('axios');

// Mock environment variables
process.env.CRAFTY_URL = 'https://crafty-controller-host';
process.env.CRAFTY_TOKEN = 'test-token';
process.env.CRAFTY_MC_INSTANCE = 'test-server-id';

const axios = require('axios');

const craftyInstance = {
  get: jest.fn(),
  post: jest.fn(),
};

axios.create.mockReturnValue(craftyInstance);

const { getServerStatus, sendConsoleCommand, sendConsoleCommandWithResponse, getRecentLogs } = require('./crafty');

describe('Crafty API', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('getServerStatus should return server status', async () => {
    const mockResponse = {
      data: {
        data: {
          running: true,
          online: 5,
          max: 20,
          version: '1.16.5',
          desc: '§aA Minecraft Server',
          mem: 1073741824,
          cpu: 25.5,
          started: '2024-06-01 12:00:00',
          waiting_start: false,
          crashed: false,
          players: "['Player1', 'Player2']",
        },
      },
    };

    craftyInstance.get.mockResolvedValue(mockResponse);

    const status = await getServerStatus();
    expect(status).toEqual({
      online: true,
      players: '5/20',
      version: '1.16.5',
      empty: false,
      cpu: 25.5,
      ram: '1.00 GB',
      player_list: ['Player1', 'Player2'],
      MOTD: 'A Minecraft Server',
      starting: false,
      crashed: false,
      last_boot: '2024-06-01 12:00:00',
      uptime: expect.any(String),
    });
  });

  test('getRecentLogs should return recent logs', async () => {
    const mockResponse = {
      data: {
        data: ['Log line 1', 'Log line 2', 'Log line 3'],
      },
    };

    craftyInstance.get.mockResolvedValue(mockResponse);

    const logs = await getRecentLogs();
    expect(logs).toBe('Log line 1\nLog line 2\nLog line 3');
  });

  test('sendConsoleCommand should send command to server', async () => {
    craftyInstance.post.mockResolvedValue({});

    await sendConsoleCommand('say Hello');
    expect(craftyInstance.post).toHaveBeenCalledWith(
      '/api/v2/servers/test-server-id/stdin',
      'say Hello',
      { headers: { 'Content-Type': 'text/plain' } }
    );
  });

  test('sendConsoleCommandWithResponse should send command and return response', async () => {
    const mockLogsResponse = {
      data: {
        data: ['Previous log line', 'Command output line'],
      },
    };
    const logs = await sendConsoleCommandWithResponse('say Hello', 500);
    expect(craftyInstance.post).toHaveBeenCalledWith(
      '/api/v2/servers/test-server-id/stdin',
      'say Hello',
      { headers: { 'Content-Type': 'text/plain' } }
    );
    expect(craftyInstance.get).toHaveBeenCalledWith('/api/v2/servers/test-server-id/logs');
  });
});
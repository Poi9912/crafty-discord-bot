const axios = require('axios');
const { stat } = require('fs');
const https = require('https');
const { uptime } = require('process');

//https for homelab and self-signed certs
const httpsAgent = new https.Agent({rejectUnauthorized: false});

// crafty settings
const CRAFTY_API_URL = process.env.CRAFTY_URL;
console.log('Crafty API URL:', CRAFTY_API_URL);
const API_KEY = process.env.CRAFTY_TOKEN;
const SERVER_ID = process.env.CRAFTY_MC_INSTANCE;
console.log('Crafty server instance:', SERVER_ID);

const crafty = axios.create({
  baseURL: CRAFTY_API_URL,
  headers: {'Authorization':`Bearer ${API_KEY}`},
  httpsAgent: httpsAgent
});

//get server status from crafty
async function getServerStatus() {
  const response = await crafty.get(`/api/v2/servers/${SERVER_ID}/stats`);
  const stats = response.data.data;
  const cleanStringPlayers = stats.players.replace(/'/g, '"');
  const playerListResponse = JSON.parse(cleanStringPlayers) || [];
  const description = stats.desc.replace(/§./g, '');
  const mtod = description.trim().replace(/\s+/g, ' ');
  const memoryUsageGB = (stats.mem / 1024 / 1024 / 1024 ).toFixed(2)+"GB";
  const utcDateStarted = new Date(stats.started.replace(' ', 'T') + 'Z');
  const msSinceLastBoot = new Date(Date.now() - utcDateStarted.getTime());
  const timeSinceLastBoot = msSinceLastBoot.toISOString().substr(11, 8);
  return {
    online: stats.running,
    players: `${stats.online}/${stats.max}`,
    version: stats.version,
    empty: stats.online!=0? false : true,
    cpu: stats.cpu,
    ram: memoryUsageGB,
    player_list: playerListResponse,
    MOTD: mtod,
    starting: stats.waiting_start,
    crashed: stats.crashed,
    last_boot: stats.started,
    uptime: timeSinceLastBoot,
  };
}

//direct command for autorized mc-admin role
async function sendConsoleCommand(cmd) {
  await crafty.post(`/api/v2/servers/${SERVER_ID}/stdin`, cmd, {
    headers: {
      'Content-Type': 'text/plain'
    }
  });
}

async function sendConsoleCommandWithResponse(cmd,waitMs=1000) {
  await crafty.post(`/api/v2/servers/${SERVER_ID}/stdin`, cmd, {
    headers: {
      'Content-Type': 'text/plain'
    }
  });
  await new Promise(resolve => setTimeout(resolve, waitMs));
  const response = await crafty.get(`/api/v2/servers/${SERVER_ID}/logs`);
  return response.data.data.slice(-20).join('\n');
}

//get last 20 lines of server console
async function getRecentLogs() {
  const response = await crafty.get(`/api/v2/servers/${SERVER_ID}/logs`);
  return response.data.data.slice(-20).join('\n');
}

//actions to crafty
//Valid actions: start, stop, restart, kill
async function serverAction(action) {
  return await crafty.post(`/api/v2/servers/${SERVER_ID}/action/${action}`);
}

module.exports = {
  getServerStatus,
  sendConsoleCommand,
  sendConsoleCommandWithResponse,
  getRecentLogs,
  serverAction
}
const axios = require('axios');

const apiController = {
  async fetchMinecraftStatus(server) {
    try {
      const response = await axios.get(`https://api.mcsrvstat.us/2/${server}`);
      return response.data;
    } catch (error) {
      console.error('API Error:', error.message);
      return null;
    }
  },

  async fetchUserData(endpoint) {
    try {
      const response = await axios.get(endpoint);
      return response.data;
    } catch (error) {
      console.error('API Error:', error.message);
      return null;
    }
  },
};

module.exports = apiController;
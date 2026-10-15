import axios from 'axios';
import { handleMockRequest } from '../mockData/mockApiHandler';

const instance = axios.create({
  baseURL: 'http://localhost:3000 /',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Offline / Disconnected adapter for local dummy mode
instance.defaults.adapter = async (config) => {
  try {
    const mockData = handleMockRequest(config);
    return {
      data: mockData,
      status: 200,
      statusText: 'OK',
      headers: { 'content-type': 'application/json' },
      config,
      request: {}
    };
  } catch (error) {
    return {
      data: { success: false, message: error.message },
      status: 500,
      statusText: 'Internal Error',
      headers: {},
      config,
      request: {}
    };
  }
};

export default instance;
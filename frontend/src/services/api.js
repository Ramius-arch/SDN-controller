import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:3001/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add the auth token to headers
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const getStatistics = async () => {
  const response = await apiClient.get('/statistics');
  return response.data;
};


// Authentication
export const login = async (username, password) => {
  const response = await apiClient.post('/login', { username, password });
  return response.data;
};

export const register = async (username, email, password) => {
  const response = await apiClient.post('/register', { username, email, password });
  return response.data;
};

// Switches
export const getSwitches = async () => {
  const response = await apiClient.get('/switches');
  return response.data;
};

export const getSwitchById = async (id) => {
  const response = await apiClient.get(`/switches/${id}`);
  return response.data;
};

export const createSwitch = async (switchData) => {
  const response = await apiClient.post('/switches', switchData);
  return response.data;
};

export const updateSwitch = async (id, switchData) => {
  const response = await apiClient.put(`/switches/${id}`, switchData);
  return response.data;
};

export const deleteSwitch = async (id) => {
  const response = await apiClient.delete(`/switches/${id}`);
  return response.data;
};

// Ports
export const getPorts = async () => {
  const response = await apiClient.get('/ports');
  return response.data;
};

export const getPortById = async (id) => {
  const response = await apiClient.get(`/ports/${id}`);
  return response.data;
};

export const createPort = async (portData) => {
  const response = await apiClient.post('/ports', portData);
  return response.data;
};

export const updatePort = async (id, portData) => {
  const response = await apiClient.put(`/ports/${id}`, portData);
  return response.data;
};

export const deletePort = async (id) => {
  const response = await apiClient.delete(`/ports/${id}`);
  return response.data;
};

// Rules
export const getRules = async () => {
  const response = await apiClient.get('/rules');
  return response.data;
};

export const createRule = async (ruleData) => {
  const response = await apiClient.post('/rules', ruleData);
  return response.data;
};

export const deleteRule = async (id) => {
  const response = await apiClient.delete(`/rules/${id}`);
  return response.data;
};

// QoS
export const getQos = async () => {
  const response = await apiClient.get('/qos');
  return response.data;
};

export const createQos = async (qosData) => {
  const response = await apiClient.post('/qos', qosData);
  return response.data;
};

export const deleteQos = async (id) => {
  const response = await apiClient.delete(`/qos/${id}`);
  return response.data;
};

// Traffic
export const getTraffic = async () => {
  const response = await apiClient.get('/traffic');
  return response.data;
};

export const createTraffic = async (trafficData) => {
  const response = await apiClient.post('/traffic', trafficData);
  return response.data;
};

export const deleteTraffic = async (id) => {
  const response = await apiClient.delete(`/traffic/${id}`);
  return response.data;
};

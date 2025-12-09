const axios = require('axios');

export const fetchData = async () => {
    try {
        return Promise.all([
http://localhost:3000/api/rules
            axios.get('http://localhost:3000/api/qos'),
http://localhost:3000/api/traffic
        ]);
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
};

export const fetchRules = async () => {
    try {
        const response = await axios.get('http://localhost:3000/api/rules');
        return response.data.rules;
    } catch (error) {
        console.error('Error fetching flow rules:', error);
        throw error;
    }
};

export const fetchQosPolicies = async () => {
    try {
        const response = await axios.get('http://localhost:3000/api/qos');
        return response.data.policies;
    } catch (error) {
        console.error('Error fetching QoS policies:', error);
        throw error;
    }
};

export const fetchTrafficRules = async () => {
    try {
        const response = await axios.get('http://localhost:3000/api/traffic');
        return response.data.rules;
    } catch (error) {
        console.error('Error fetching traffic rules:', error);
        throw error;
    }
};

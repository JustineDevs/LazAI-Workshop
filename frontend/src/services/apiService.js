import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api/v1';

// Create axios instance
const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token expired or invalid
            localStorage.removeItem('authToken');
            window.location.reload();
        }
        return Promise.reject(error);
    }
);

// API endpoints
export const endpoints = {
    // Auth endpoints
    auth: {
        register: '/users/register',
        login: '/users/login',
        profile: '/users/profile',
        refreshToken: '/users/refresh-token',
        logout: '/users/logout',
    },
    
    // DataStream endpoints
    dataStreams: {
        list: '/datastreams',
        create: '/datastreams',
        get: (id) => `/datastreams/${id}`,
        query: (id) => `/datastreams/${id}/query`,
        updatePrice: (id) => `/datastreams/${id}/price`,
        updateStatus: (id) => `/datastreams/${id}/status`,
        getByCreator: (address) => `/datastreams/creator/${address}`,
        getStats: (id) => `/datastreams/stats/${id}`,
        search: '/datastreams/search',
    },
    
    // IPFS endpoints
    ipfs: {
        upload: '/ipfs/upload',
        uploadJson: '/ipfs/upload-json',
        get: (hash) => `/ipfs/${hash}`,
        getJson: (hash) => `/ipfs/${hash}/json`,
        pin: '/ipfs/pin',
        getStatus: (hash) => `/ipfs/${hash}/status`,
        unpin: (hash) => `/ipfs/${hash}/unpin`,
        createMetadata: '/ipfs/datastream-metadata',
    },
    
    // Blockchain endpoints
    blockchain: {
        network: '/blockchain/network',
        balance: (address) => `/blockchain/balance/${address}`,
        datBalance: (address) => `/blockchain/dat-balance/${address}`,
        contract: (address) => `/blockchain/contract/${address}`,
        approve: '/blockchain/approve',
        allowance: (owner, spender) => `/blockchain/allowance/${owner}/${spender}`,
        transaction: (hash) => `/blockchain/transaction/${hash}`,
        block: (number) => `/blockchain/block/${number}`,
        gasPrice: '/blockchain/gas-price',
        estimateGas: '/blockchain/estimate-gas',
    },
};

// Generic API methods
export const apiService = {
    // GET request
    get: async (url, config = {}) => {
        try {
            const response = await api.get(url, config);
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },

    // POST request
    post: async (url, data = {}, config = {}) => {
        try {
            const response = await api.post(url, data, config);
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },

    // PUT request
    put: async (url, data = {}, config = {}) => {
        try {
            const response = await api.put(url, data, config);
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },

    // DELETE request
    delete: async (url, config = {}) => {
        try {
            const response = await api.delete(url, config);
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },

    // PATCH request
    patch: async (url, data = {}, config = {}) => {
        try {
            const response = await api.patch(url, data, config);
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },

    // Upload file
    upload: async (url, formData, config = {}) => {
        try {
            const response = await api.post(url, formData, {
                ...config,
                headers: {
                    'Content-Type': 'multipart/form-data',
                    ...config.headers,
                },
            });
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    },
};

// Error handler
const handleApiError = (error) => {
    if (error.response) {
        // Server responded with error status
        const { status, data } = error.response;
        const message = data?.error || data?.message || 'An error occurred';
        
        return {
            status,
            message,
            data: data?.data,
            details: data?.details,
        };
    } else if (error.request) {
        // Request was made but no response received
        return {
            status: 0,
            message: 'Network error - please check your connection',
        };
    } else {
        // Something else happened
        return {
            status: 0,
            message: error.message || 'An unexpected error occurred',
        };
    }
};

export default apiService;

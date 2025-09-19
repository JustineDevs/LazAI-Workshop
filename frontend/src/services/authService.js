import { apiService, endpoints } from './apiService';

export const authService = {
    // Register new user
    register: async (userData) => {
        return await apiService.post(endpoints.auth.register, userData);
    },

    // Login user
    login: async (credentials) => {
        return await apiService.post(endpoints.auth.login, credentials);
    },

    // Get user profile
    getProfile: async () => {
        return await apiService.get(endpoints.auth.profile);
    },

    // Update user profile
    updateProfile: async (profileData) => {
        return await apiService.put(endpoints.auth.profile, profileData);
    },

    // Refresh token
    refreshToken: async () => {
        return await apiService.post(endpoints.auth.refreshToken);
    },

    // Logout user
    logout: async () => {
        return await apiService.post(endpoints.auth.logout);
    },

    // Check if user exists for address
    checkUserExists: async (address) => {
        try {
            const response = await apiService.get(`/users/${address}`);
            return { exists: true, user: response.data };
        } catch (error) {
            if (error.status === 404) {
                return { exists: false };
            }
            throw error;
        }
    },

    // Get user by address
    getUserByAddress: async (address) => {
        return await apiService.get(`/users/${address}`);
    },

    // Get user statistics
    getUserStats: async (address) => {
        return await apiService.get(`/users/${address}/stats`);
    },

    // Get user's data streams
    getUserDataStreams: async (address, params = {}) => {
        return await apiService.get(`/users/${address}/datastreams`, { params });
    },

    // Search users
    searchUsers: async (query, params = {}) => {
        return await apiService.get('/users/search', { 
            params: { q: query, ...params } 
        });
    },

    // Get top earners leaderboard
    getTopEarners: async (limit = 10) => {
        return await apiService.get('/users/leaderboard/earners', {
            params: { limit }
        });
    },

    // Get top creators leaderboard
    getTopCreators: async (limit = 10) => {
        return await apiService.get('/users/leaderboard/creators', {
            params: { limit }
        });
    },
};

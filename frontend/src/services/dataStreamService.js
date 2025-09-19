import { apiService, endpoints } from './apiService';

export const dataStreamService = {
    // Get all data streams
    getDataStreams: async (params = {}) => {
        return await apiService.get(endpoints.dataStreams.list, { params });
    },

    // Get data stream by ID
    getDataStream: async (id) => {
        return await apiService.get(endpoints.dataStreams.get(id));
    },

    // Create new data stream
    createDataStream: async (dataStreamData) => {
        return await apiService.post(endpoints.dataStreams.create, dataStreamData);
    },

    // Execute query on data stream
    executeQuery: async (id, queryData = {}) => {
        return await apiService.post(endpoints.dataStreams.query(id), queryData);
    },

    // Update query price
    updateQueryPrice: async (id, queryPrice) => {
        return await apiService.put(endpoints.dataStreams.updatePrice(id), {
            queryPrice
        });
    },

    // Update data stream status
    updateStatus: async (id, isActive) => {
        return await apiService.put(endpoints.dataStreams.updateStatus(id), {
            isActive
        });
    },

    // Get data streams by creator
    getDataStreamsByCreator: async (address, params = {}) => {
        return await apiService.get(endpoints.dataStreams.getByCreator(address), { params });
    },

    // Get data stream statistics
    getDataStreamStats: async (id) => {
        return await apiService.get(endpoints.dataStreams.getStats(id));
    },

    // Search data streams
    searchDataStreams: async (query, params = {}) => {
        return await apiService.get(endpoints.dataStreams.search, {
            params: { q: query, ...params }
        });
    },
};

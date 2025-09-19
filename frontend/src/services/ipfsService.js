import { apiService, endpoints } from './apiService';

export const ipfsService = {
    // Upload file to IPFS
    uploadFile: async (file, metadata = {}) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('name', metadata.name || file.name);
        formData.append('type', metadata.type || 'datastream');
        formData.append('keyvalues', JSON.stringify(metadata.keyvalues || {}));

        return await apiService.upload(endpoints.ipfs.upload, formData);
    },

    // Upload JSON metadata to IPFS
    uploadJson: async (metadata, options = {}) => {
        return await apiService.post(endpoints.ipfs.uploadJson, {
            metadata,
            options
        });
    },

    // Get file from IPFS
    getFile: async (hash) => {
        return await apiService.get(endpoints.ipfs.get(hash));
    },

    // Get JSON metadata from IPFS
    getJson: async (hash) => {
        return await apiService.get(endpoints.ipfs.getJson(hash));
    },

    // Pin file to IPFS
    pinFile: async (ipfsHash, metadata = {}) => {
        return await apiService.post(endpoints.ipfs.pin, {
            ipfsHash,
            metadata
        });
    },

    // Get pin status
    getPinStatus: async (hash) => {
        return await apiService.get(endpoints.ipfs.getStatus(hash));
    },

    // Unpin file from IPFS
    unpinFile: async (hash) => {
        return await apiService.delete(endpoints.ipfs.unpin(hash));
    },

    // Create DataStream metadata
    createDataStreamMetadata: async (metadata) => {
        return await apiService.post(endpoints.ipfs.createMetadata, metadata);
    },

    // Helper function to get gateway URL
    getGatewayUrl: (hash) => {
        const gatewayUrl = process.env.REACT_APP_IPFS_GATEWAY_URL || 'https://gateway.pinata.cloud/ipfs/';
        return `${gatewayUrl}${hash}`;
    },

    // Helper function to validate IPFS hash
    isValidIPFSHash: (hash) => {
        return /^Qm[1-9A-HJ-NP-Za-km-z]{44}$/.test(hash) || 
               /^bafybei[a-z2-7]{52}$/.test(hash);
    },
};

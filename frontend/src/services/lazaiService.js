/**
 * LazAI Service for frontend integration
 * Handles data upload, DAT minting, and AI inference
 */

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

class LazAIService {
  /**
   * Upload encrypted data to IPFS and get file ID
   * @param {File} file - File to upload
   * @param {string} title - Data title
   * @param {string} description - Data description
   * @returns {Promise<Object>} Upload result with fileId and tokenURI
   */
  async uploadEncryptedData(file, title, description) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', title);
      formData.append('description', description);

      const response = await fetch(`${API_BASE_URL}/api/lazai/upload-encrypted-data`, {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error uploading data:', error);
      throw error;
    }
  }

  /**
   * Mint a Data Anchoring Token (DAT)
   * @param {string} tokenURI - IPFS URI for metadata
   * @param {string} queryPrice - Query price in ETH
   * @param {string} fileId - File ID from upload
   * @param {string} dataClass - Data classification
   * @param {string} dataValue - Data value assessment
   * @returns {Promise<Object>} Minting result with tokenId and transactionHash
   */
  async mintDataDAT(tokenURI, queryPrice, fileId, dataClass, dataValue) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/lazai/mint-dat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          tokenURI,
          queryPrice,
          fileId,
          dataClass,
          dataValue,
        }),
      });

      if (!response.ok) {
        throw new Error(`Minting failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error minting DAT:', error);
      throw error;
    }
  }

  /**
   * Run AI inference on uploaded data
   * @param {string} fileId - File ID to query
   * @param {string} query - Inference query
   * @param {string} paymentAmount - Payment amount in ETH
   * @returns {Promise<Object>} Inference result
   */
  async runInference(fileId, query, paymentAmount) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/lazai/run-inference`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          fileId,
          query,
          paymentAmount,
        }),
      });

      if (!response.ok) {
        throw new Error(`Inference failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error running inference:', error);
      throw error;
    }
  }

  /**
   * Get DAT details by token ID
   * @param {string} tokenId - DAT token ID
   * @returns {Promise<Object>} DAT details
   */
  async getDATDetails(tokenId) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/lazai/dat/${tokenId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to get DAT details: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting DAT details:', error);
      throw error;
    }
  }

  /**
   * Get DAT details by file ID
   * @param {string} fileId - File ID
   * @returns {Promise<Object>} DAT details
   */
  async getDATByFileId(fileId) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/lazai/dat-by-fileid/${fileId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to get DAT by file ID: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting DAT by file ID:', error);
      throw error;
    }
  }

  /**
   * Update DAT data class
   * @param {string} tokenId - DAT token ID
   * @param {string} newDataClass - New data class
   * @returns {Promise<Object>} Update result
   */
  async updateDataClass(tokenId, newDataClass) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/lazai/dat/${tokenId}/update-class`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          newDataClass,
          ownerAddress: localStorage.getItem('account'),
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update data class: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating data class:', error);
      throw error;
    }
  }

  /**
   * Update DAT data value
   * @param {string} tokenId - DAT token ID
   * @param {string} newDataValue - New data value
   * @returns {Promise<Object>} Update result
   */
  async updateDataValue(tokenId, newDataValue) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/lazai/dat/${tokenId}/update-value`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          newDataValue,
          ownerAddress: localStorage.getItem('account'),
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update data value: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating data value:', error);
      throw error;
    }
  }

  /**
   * Toggle DAT active status
   * @param {string} tokenId - DAT token ID
   * @returns {Promise<Object>} Toggle result
   */
  async toggleActiveStatus(tokenId) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/lazai/dat/${tokenId}/toggle-active`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          ownerAddress: localStorage.getItem('account'),
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to toggle active status: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error toggling active status:', error);
      throw error;
    }
  }
}

export default new LazAIService();

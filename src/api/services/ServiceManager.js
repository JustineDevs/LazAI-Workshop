/**
 * Service Manager
 * Manages shared service instances across the application
 */

class ServiceManager {
    constructor() {
        this.services = {};
    }

    /**
     * Register a service
     * @param {string} name - Service name
     * @param {Object} service - Service instance
     */
    register(name, service) {
        this.services[name] = service;
    }

    /**
     * Get a service
     * @param {string} name - Service name
     * @returns {Object} Service instance
     */
    get(name) {
        return this.services[name];
    }

    /**
     * Check if a service is registered
     * @param {string} name - Service name
     * @returns {boolean} True if service exists
     */
    has(name) {
        return name in this.services;
    }
}

// Create singleton instance
const serviceManager = new ServiceManager();

module.exports = serviceManager;

const axios = require('axios');
const { performance } = require('perf_hooks');

/**
 * Performance testing script
 */
class PerformanceTester {
  constructor(baseURL = 'http://localhost:3001') {
    this.baseURL = baseURL;
    this.results = [];
  }

  /**
   * Run a single test
   */
  async runTest(name, testFunction) {
    console.log(`\n🧪 Running test: ${name}`);
    const startTime = performance.now();
    
    try {
      const result = await testFunction();
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      this.results.push({
        name,
        success: true,
        duration,
        result
      });
      
      console.log(`✅ ${name} completed in ${duration.toFixed(2)}ms`);
      return result;
    } catch (error) {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      this.results.push({
        name,
        success: false,
        duration,
        error: error.message
      });
      
      console.log(`❌ ${name} failed in ${duration.toFixed(2)}ms: ${error.message}`);
      throw error;
    }
  }

  /**
   * Test API response times
   */
  async testAPIResponseTimes() {
    const endpoints = [
      '/api/v1/blockchain/network',
      '/api/v1/monitoring/health',
      '/api/v1/monitoring/metrics'
    ];

    const results = [];
    
    for (const endpoint of endpoints) {
      const startTime = performance.now();
      
      try {
        const response = await axios.get(`${this.baseURL}${endpoint}`, {
          timeout: 5000
        });
        
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        results.push({
          endpoint,
          status: response.status,
          duration,
          success: true
        });
      } catch (error) {
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        results.push({
          endpoint,
          status: error.response?.status || 'error',
          duration,
          success: false,
          error: error.message
        });
      }
    }
    
    return results;
  }

  /**
   * Test concurrent requests
   */
  async testConcurrentRequests(concurrency = 10, requests = 100) {
    console.log(`\n🔄 Testing ${concurrency} concurrent requests (${requests} total)`);
    
    const promises = [];
    const startTime = performance.now();
    
    for (let i = 0; i < requests; i++) {
      const promise = axios.get(`${this.baseURL}/api/v1/blockchain/network`, {
        timeout: 10000
      }).then(response => ({
        success: true,
        status: response.status,
        duration: performance.now() - startTime
      })).catch(error => ({
        success: false,
        status: error.response?.status || 'error',
        duration: performance.now() - startTime,
        error: error.message
      }));
      
      promises.push(promise);
      
      // Limit concurrency
      if (promises.length >= concurrency) {
        await Promise.all(promises);
        promises.length = 0;
      }
    }
    
    // Wait for remaining requests
    if (promises.length > 0) {
      await Promise.all(promises);
    }
    
    const endTime = performance.now();
    const totalDuration = endTime - startTime;
    
    return {
      totalRequests: requests,
      concurrency,
      totalDuration,
      requestsPerSecond: (requests / totalDuration) * 1000
    };
  }

  /**
   * Test memory usage
   */
  async testMemoryUsage() {
    const initialMemory = process.memoryUsage();
    
    // Make multiple requests to test memory usage
    const requests = [];
    for (let i = 0; i < 50; i++) {
      requests.push(axios.get(`${this.baseURL}/api/v1/blockchain/network`));
    }
    
    await Promise.all(requests);
    
    const finalMemory = process.memoryUsage();
    
    return {
      initial: initialMemory,
      final: finalMemory,
      difference: {
        heapUsed: finalMemory.heapUsed - initialMemory.heapUsed,
        heapTotal: finalMemory.heapTotal - initialMemory.heapTotal,
        external: finalMemory.external - initialMemory.external
      }
    };
  }

  /**
   * Test error handling
   */
  async testErrorHandling() {
    const errorTests = [
      {
        name: 'Invalid endpoint',
        url: '/api/v1/invalid-endpoint',
        expectedStatus: 404
      },
      {
        name: 'Invalid blockchain address',
        url: '/api/v1/blockchain/balance/invalid-address',
        expectedStatus: 400
      }
    ];
    
    const results = [];
    
    for (const test of errorTests) {
      try {
        const response = await axios.get(`${this.baseURL}${test.url}`, {
          validateStatus: () => true // Don't throw on error status
        });
        
        results.push({
          name: test.name,
          success: response.status === test.expectedStatus,
          status: response.status,
          expectedStatus: test.expectedStatus
        });
      } catch (error) {
        results.push({
          name: test.name,
          success: false,
          error: error.message
        });
      }
    }
    
    return results;
  }

  /**
   * Run all performance tests
   */
  async runAllTests() {
    console.log('🚀 Starting Performance Tests...\n');
    
    try {
      // Test API response times
      await this.runTest('API Response Times', () => this.testAPIResponseTimes());
      
      // Test concurrent requests
      await this.runTest('Concurrent Requests (10)', () => this.testConcurrentRequests(10, 50));
      await this.runTest('Concurrent Requests (50)', () => this.testConcurrentRequests(50, 100));
      
      // Test memory usage
      await this.runTest('Memory Usage', () => this.testMemoryUsage());
      
      // Test error handling
      await this.runTest('Error Handling', () => this.testErrorHandling());
      
      // Generate report
      this.generateReport();
      
    } catch (error) {
      console.error('❌ Performance tests failed:', error.message);
      process.exit(1);
    }
  }

  /**
   * Generate performance report
   */
  generateReport() {
    console.log('\n📊 Performance Test Report');
    console.log('='.repeat(50));
    
    const successful = this.results.filter(r => r.success);
    const failed = this.results.filter(r => !r.success);
    
    console.log(`\n✅ Successful tests: ${successful.length}`);
    console.log(`❌ Failed tests: ${failed.length}`);
    
    if (successful.length > 0) {
      const avgDuration = successful.reduce((sum, r) => sum + r.duration, 0) / successful.length;
      console.log(`⏱️  Average duration: ${avgDuration.toFixed(2)}ms`);
    }
    
    console.log('\n📋 Test Details:');
    this.results.forEach(result => {
      const status = result.success ? '✅' : '❌';
      console.log(`${status} ${result.name}: ${result.duration.toFixed(2)}ms`);
      if (!result.success && result.error) {
        console.log(`   Error: ${result.error}`);
      }
    });
    
    // Performance recommendations
    console.log('\n💡 Performance Recommendations:');
    const slowTests = this.results.filter(r => r.success && r.duration > 1000);
    if (slowTests.length > 0) {
      console.log('⚠️  Some tests are slow (>1s):');
      slowTests.forEach(test => {
        console.log(`   - ${test.name}: ${test.duration.toFixed(2)}ms`);
      });
    } else {
      console.log('✅ All tests completed within acceptable time limits');
    }
  }
}

// Run tests if called directly
if (require.main === module) {
  const tester = new PerformanceTester();
  tester.runAllTests().catch(console.error);
}

module.exports = PerformanceTester;

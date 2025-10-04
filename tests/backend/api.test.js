const request = require('supertest');
const { expect } = require('chai');
const app = require('../../src/api/server');

describe('Backend API Tests', () => {
  describe('Health Check', () => {
    it('should return 200 for health check', async () => {
      const res = await request(app)
        .get('/api/v1/health')
        .expect(200);
      
      expect(res.body).to.have.property('status', 'ok');
    });
  });

  describe('Blockchain API', () => {
    it('should get network information', async () => {
      const res = await request(app)
        .get('/api/v1/blockchain/network')
        .expect(200);
      
      expect(res.body).to.have.property('success', true);
      expect(res.body.data).to.have.property('chainId');
      expect(res.body.data).to.have.property('blockNumber');
    });

    it('should get balance for valid address', async () => {
      const testAddress = '0x1868C3935B5A548C90d5660981FB866160382Da7';
      const res = await request(app)
        .get(`/api/v1/blockchain/balance/${testAddress}`)
        .expect(200);
      
      expect(res.body).to.have.property('success', true);
      expect(res.body.data).to.have.property('balance');
    });

    it('should return 400 for invalid address', async () => {
      const res = await request(app)
        .get('/api/v1/blockchain/balance/invalid-address')
        .expect(400);
      
      expect(res.body).to.have.property('success', false);
    });
  });

  describe('LazAI API', () => {
    it('should handle file upload', async () => {
      const res = await request(app)
        .post('/api/lazai/upload-encrypted-data')
        .attach('file', Buffer.from('test data'), 'test.txt')
        .expect(200);
      
      expect(res.body).to.have.property('success', true);
      expect(res.body.data).to.have.property('fileId');
    });

    it('should mint DAT token', async () => {
      const datData = {
        fileId: 'test-file-123',
        dataClass: 'model',
        dataValue: 'high',
        queryPrice: '1000000000000000000', // 1 ETH in wei
        creatorAddress: '0x1868C3935B5A548C90d5660981FB866160382Da7'
      };

      const res = await request(app)
        .post('/api/lazai/mint-dat')
        .send(datData)
        .expect(200);
      
      expect(res.body).to.have.property('success', true);
    });

    it('should run inference', async () => {
      const inferenceData = {
        fileId: 'test-file-123',
        query: 'What is the data about?',
        querierAddress: '0x1868C3935B5A548C90d5660981FB866160382Da7',
        paymentAmount: '1000000000000000000'
      };

      const res = await request(app)
        .post('/api/lazai/run-inference')
        .send(inferenceData)
        .expect(200);
      
      expect(res.body).to.have.property('success', true);
      expect(res.body).to.have.property('response');
    });
  });

  describe('Error Handling', () => {
    it('should return 404 for non-existent routes', async () => {
      const res = await request(app)
        .get('/api/v1/non-existent')
        .expect(404);
      
      expect(res.body).to.have.property('error', 'Route not found');
    });

    it('should handle CORS properly', async () => {
      const res = await request(app)
        .options('/api/v1/blockchain/network')
        .expect(204);
    });
  });
});

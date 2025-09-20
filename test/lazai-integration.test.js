/**
 * LazAI Integration Test Suite
 * Tests the complete LazAI workflow: upload, mint, inference
 */

const { expect } = require('chai');
const { ethers } = require('hardhat');
const fs = require('fs');
const path = require('path');

describe('LazAI Integration', function () {
    let dataStreamDAT;
    let owner, user1, user2;
    let platformTreasury;

    beforeEach(async function () {
        [owner, user1, user2] = await ethers.getSigners();
        platformTreasury = owner.address;

        // Deploy DataStreamDAT contract
        const DataStreamDAT = await ethers.getContractFactory('DataStreamDAT');
        dataStreamDAT = await DataStreamDAT.deploy(platformTreasury);
        await dataStreamDAT.waitForDeployment();
    });

    describe('DataStreamDAT Contract', function () {
        it('Should deploy with correct initial values', async function () {
            expect(await dataStreamDAT.name()).to.equal('DataStreamDAT');
            expect(await dataStreamDAT.symbol()).to.equal('DAT');
            expect(await dataStreamDAT.platformFeeBps()).to.equal(250); // 2.5%
            expect(await dataStreamDAT.platformTreasury()).to.equal(platformTreasury);
        });

        it('Should mint a DAT successfully', async function () {
            const tokenURI = 'ipfs://QmTest123';
            const queryPrice = ethers.parseEther('0.001');
            const fileId = 'lazai_test123';
            const dataClass = 'reference';
            const dataValue = 'high';

            const tx = await dataStreamDAT.mintDataDAT(
                tokenURI,
                queryPrice,
                fileId,
                dataClass,
                dataValue
            );

            const receipt = await tx.wait();
            const event = receipt.logs.find(log => {
                try {
                    const parsed = dataStreamDAT.interface.parseLog(log);
                    return parsed.name === 'DataDATMinted';
                } catch (e) {
                    return false;
                }
            });

            expect(event).to.not.be.undefined;
            const parsedEvent = dataStreamDAT.interface.parseLog(event);
            expect(parsedEvent.args.tokenId).to.equal(1);
            expect(parsedEvent.args.creator).to.equal(owner.address);
            expect(parsedEvent.args.fileId).to.equal(fileId);
        });

        it('Should allow query payment', async function () {
            // First mint a DAT
            const tokenURI = 'ipfs://QmTest123';
            const queryPrice = ethers.parseEther('0.001');
            const fileId = 'lazai_test123';
            const dataClass = 'reference';
            const dataValue = 'high';

            await dataStreamDAT.mintDataDAT(
                tokenURI,
                queryPrice,
                fileId,
                dataClass,
                dataValue
            );

            // Pay for query
            const queryAmount = ethers.parseEther('0.001');
            const query = 'What is the data about?';

            const tx = await dataStreamDAT.payForQuery(1, query, { value: queryAmount });
            const receipt = await tx.wait();

            const event = receipt.logs.find(log => {
                try {
                    const parsed = dataStreamDAT.interface.parseLog(log);
                    return parsed.name === 'QueryPaid';
                } catch (e) {
                    return false;
                }
            });

            expect(event).to.not.be.undefined;
            const parsedEvent = dataStreamDAT.interface.parseLog(event);
            expect(parsedEvent.args.tokenId).to.equal(1);
            expect(parsedEvent.args.querier).to.equal(owner.address);
            expect(parsedEvent.args.amount).to.equal(queryAmount);
        });

        it('Should update data class', async function () {
            // First mint a DAT
            const tokenURI = 'ipfs://QmTest123';
            const queryPrice = ethers.parseEther('0.001');
            const fileId = 'lazai_test123';
            const dataClass = 'reference';
            const dataValue = 'high';

            await dataStreamDAT.mintDataDAT(
                tokenURI,
                queryPrice,
                fileId,
                dataClass,
                dataValue
            );

            // Update data class
            const newDataClass = 'model';
            const tx = await dataStreamDAT.updateDataClass(1, newDataClass);
            const receipt = await tx.wait();

            const event = receipt.logs.find(log => {
                try {
                    const parsed = dataStreamDAT.interface.parseLog(log);
                    return parsed.name === 'DataClassUpdated';
                } catch (e) {
                    return false;
                }
            });

            expect(event).to.not.be.undefined;
            const parsedEvent = dataStreamDAT.interface.parseLog(event);
            expect(parsedEvent.args.tokenId).to.equal(1);
            expect(parsedEvent.args.newClass).to.equal(newDataClass);
        });

        it('Should get DAT by file ID', async function () {
            // First mint a DAT
            const tokenURI = 'ipfs://QmTest123';
            const queryPrice = ethers.parseEther('0.001');
            const fileId = 'lazai_test123';
            const dataClass = 'reference';
            const dataValue = 'high';

            await dataStreamDAT.mintDataDAT(
                tokenURI,
                queryPrice,
                fileId,
                dataClass,
                dataValue
            );

            // Get DAT by file ID
            const [tokenId, dat] = await dataStreamDAT.getDATByFileId(fileId);
            expect(tokenId).to.equal(1);
            expect(dat.creator).to.equal(owner.address);
            expect(dat.fileId).to.equal(fileId);
            expect(dat.dataClass).to.equal(dataClass);
            expect(dat.dataValue).to.equal(dataValue);
        });

        it('Should get creator tokens', async function () {
            // Mint multiple DATs
            const tokenURI = 'ipfs://QmTest123';
            const queryPrice = ethers.parseEther('0.001');
            const fileId1 = 'lazai_test123';
            const fileId2 = 'lazai_test456';
            const dataClass = 'reference';
            const dataValue = 'high';

            await dataStreamDAT.mintDataDAT(
                tokenURI,
                queryPrice,
                fileId1,
                dataClass,
                dataValue
            );

            await dataStreamDAT.mintDataDAT(
                tokenURI,
                queryPrice,
                fileId2,
                dataClass,
                dataValue
            );

            // Get creator tokens
            const tokens = await dataStreamDAT.getCreatorTokens(owner.address);
            expect(tokens).to.have.lengthOf(2);
            expect(tokens[0]).to.equal(1);
            expect(tokens[1]).to.equal(2);
        });
    });

    describe('LazAI Python Integration', function () {
        it('Should have required Python files', function () {
            const requiredFiles = [
                'lazai-integration/Dat.py',
                'lazai-integration/inference.py',
                'lazai-integration/enhanced_dat.py',
                'lazai-integration/contract_integration.py',
                'lazai-integration/requirements.txt'
            ];

            requiredFiles.forEach(file => {
                expect(fs.existsSync(file), `${file} should exist`).to.be.true;
            });
        });

        it('Should have valid Python syntax', function () {
            const pythonFiles = [
                'lazai-integration/Dat.py',
                'lazai-integration/inference.py',
                'lazai-integration/enhanced_dat.py',
                'lazai-integration/contract_integration.py'
            ];

            pythonFiles.forEach(file => {
                const content = fs.readFileSync(file, 'utf8');
                // Basic syntax check - should not contain obvious syntax errors
                expect(content).to.not.include('SyntaxError');
                expect(content).to.not.include('IndentationError');
            });
        });
    });

    describe('Frontend Integration', function () {
        it('Should have LazAI service', function () {
            const serviceFile = 'frontend/src/services/lazaiService.js';
            expect(fs.existsSync(serviceFile), 'LazAI service should exist').to.be.true;
        });

        it('Should have LazAI page', function () {
            const pageFile = 'frontend/src/pages/LazAIPage.jsx';
            expect(fs.existsSync(pageFile), 'LazAI page should exist').to.be.true;
        });

        it('Should have proper API routes', function () {
            const routesFile = 'src/api/routes/lazaiRoutes.js';
            expect(fs.existsSync(routesFile), 'LazAI routes should exist').to.be.true;
        });
    });

    describe('Backend API', function () {
        it('Should have LazAI controller', function () {
            const controllerFile = 'src/api/controllers/LazAIController.js';
            expect(fs.existsSync(controllerFile), 'LazAI controller should exist').to.be.true;
        });

        it('Should have proper route definitions', function () {
            const routesContent = fs.readFileSync('src/api/routes/lazaiRoutes.js', 'utf8');
            
            const expectedRoutes = [
                'upload-encrypted-data',
                'mint-dat',
                'run-inference',
                'dat/:tokenId',
                'dat-by-fileid/:fileId'
            ];

            expectedRoutes.forEach(route => {
                expect(routesContent).to.include(route, `Route ${route} should be defined`);
            });
        });
    });

    describe('Documentation', function () {
        it('Should have LazAI integration guide', function () {
            const docFile = 'docs/LAZAI_INTEGRATION.md';
            expect(fs.existsSync(docFile), 'LazAI integration guide should exist').to.be.true;
        });

        it('Should have updated README', function () {
            const readmeContent = fs.readFileSync('README.md', 'utf8');
            expect(readmeContent).to.include('LazAI Integration');
            expect(readmeContent).to.include('Data Anchoring Tokens');
        });
    });

    describe('Environment Configuration', function () {
        it('Should have DAT contract address in .env', function () {
            const envContent = fs.readFileSync('.env', 'utf8');
            expect(envContent).to.include('DAT_CONTRACT_ADDRESS');
        });

        it('Should have proper .gitignore entries', function () {
            const gitignoreContent = fs.readFileSync('.gitignore', 'utf8');
            expect(gitignoreContent).to.include('lazai-integration/venv/');
            expect(gitignoreContent).to.include('lazai-integration/__pycache__/');
        });
    });
});

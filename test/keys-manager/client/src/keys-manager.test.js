const utils = require('./utils');
const chai = require('chai');
const { toAccountHashString } = require('./utils');

describe('Testing SDK', () => {

    beforeEach(() => {
        let masterKey = utils.randomMasterKey();
        this.mainAccount = masterKey.deriveIndex(1);
        this.firstAccount = masterKey.deriveIndex(2);
        this.secondAccount = masterKey.deriveIndex(3);

    });

    it('Should fund account', async () => {
        // Account needs to be funded before getAccount can be called
        await utils.fund(this.mainAccount, 1000);

        let initialBalance = await utils.getBalanceOfByAccountHash(utils.toAccountHashString(this.mainAccount.publicKey));
        console.log(`Initial Balance: ${initialBalance}`);

        // Increment initial balance by 100
        await utils.fund(this.mainAccount, 100);

        let finalBalance =  await utils.getBalanceOfByAccountHash(utils.toAccountHashString(this.mainAccount.publicKey));
        console.log(`Final Balance: ${finalBalance}`);

        // Balance should be 1100
        chai.assert(finalBalance > initialBalance, "Balance did not increase");
    });
    
    it('Should make a transfer and verify deploy...', async () => {

        await utils.fund(this.mainAccount);
        
        let deployThreshold = 2;
        let keyManagementThreshold = 2;
        let accounts = [
            { publicKey: this.mainAccount.publicKey, weight: 1 },
            { publicKey: this.firstAccount.publicKey, weight: 1 },
        ]
        
        let deploy = utils.keys.setAll(this.mainAccount, deployThreshold, keyManagementThreshold, accounts);
        await utils.sendDeploy(deploy, [this.mainAccount]);


        deploy = utils.transferDeploy(this.mainAccount, this.secondAccount, 1000);
        // mainAccount and firstAccount have a combined weight of 2 which should satisfy the deployThreshold weight of 2
        let deployHash = await utils.sendDeploy(deploy, [this.mainAccount, this.firstAccount]);

        let processedDeploy = await utils.getDeploy(deployHash);

        chai.assert.strictEqual(processedDeploy.account, this.mainAccount.publicKey.toAccountHex(), "Public keys did not match!");
        chai.assert.isNull(processedDeploy.errorMessage, `The deploy failed with error: ${processedDeploy.errorMessage}`);
        chai.assert.strictEqual(processedDeploy.transfers[0].fromAccount, toAccountHashString(this.mainAccount.publicKey), "FromAccount did not match!");
        chai.assert.strictEqual(processedDeploy.transfers[0].toAccount, toAccountHashString(this.firstAccount.publicKey), "ToAccount did not match!");

    });

    it('Transfer should fail if weight(s) below deploy threshold...', async () => {

        await utils.fund(this.mainAccount);
        
        let deployThreshold = 3;
        let keyManagementThreshold = 2;
        let accounts = [
            { publicKey: this.mainAccount.publicKey, weight: 2 },
            { publicKey: this.firstAccount.publicKey, weight: 1 } 
        ];

        let deploy = utils.keys.setAll(this.mainAccount, deployThreshold, keyManagementThreshold, accounts);
        await utils.sendDeploy(deploy, [this.mainAccount]);

        deploy = utils.transferDeploy(this.mainAccount, this.secondAccount, 1000);
        // mainAccount key has weight 2 which should fail against the deployThreshold weight of 3
        let deployHash = await utils.sendDeploy(deploy, [this.mainAccount]);

        let processedDeploy = await utils.getDeploy(deployHash);

        chai.assert.strictEqual(processedDeploy.errorMessage, "Deployment authorization failure", "Deploy should have failed but did not!");
        chai.assert.strictEqual(processedDeploy.account, this.mainAccount.publicKey.toAccountHex(), "Public keys did not match!");
        chai.assert.strictEqual(processedDeploy.transfers[0].fromAccount, toAccountHashString(this.mainAccount.publicKey), "FromAccount did not match!");
        chai.assert.strictEqual(processedDeploy.transfers[0].toAccount, toAccountHashString(this.firstAccount.publicKey), "ToAccount did not match!");

    });

    it('Check balance by public key...', async () => {
        await utils.fund(this.mainAccount, 1000);
        let balance = await utils.getBalanceOfByPublicKey(this.mainAccount.publicKey);
        chai.assert.strictEqual(balance, 1000);
    });

    it('Check balance by account hash...', async () => {
        await utils.fund(this.mainAccount, 1000);
        let balance = await utils.getBalanceOfByAccountHash(toAccountHashString(this.mainAccount.publicKey));
        chai.assert.strictEqual(balance, 1000);
    });
});
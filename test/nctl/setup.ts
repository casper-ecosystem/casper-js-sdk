import { spawn } from 'child_process';
import { CasperServiceByJsonRPC } from '../../src';

export const start_nctl_docker = async () => {
  // docker run --rm -it --name mynctl -d -p 11101:11101 -p 14101:14101 -p 18101:18101 --env PREDEFINED_ACCOUNTS=true makesoftware/casper-nctl
  const casper_node = spawn('docker', [
    'run',
    '--rm',
    '-it',
    '--name',
    'mynctl',
    '-d',
    '-p',
    '11101:11101',
    '-p',
    '14101:14101',
    '-p',
    '18101:18101',
    '--env',
    'PREDEFINED_ACCOUNTS=true',
    '--env',
    'DEPLOY_DELAY=0sec',
    'makesoftware/casper-nctl'
  ]);

  const promise = new Promise<void>(function(resolve, reject) {
    casper_node.on('error', error => {
      console.error(error);
    });
    casper_node.on('close', code => {
      if (code === 0) {
        resolve();
      } else if (code === 125) {
        resolve();
      } else {
        console.log(`NCTL docker daemon exited with ${code}`);
        reject(code);
      }
    });

    casper_node.stdout.on('data', data => {
      const dockerHash = data.toString();
      console.log(`NCTL Started: Docker hash ${dockerHash}`);
    });
  });

  return promise;
};

export const waitForFirstBlock = async () => {
  const client = new CasperServiceByJsonRPC('http://localhost:11101/rpc');
  console.log('Wait for first block to be mined...');
  while (true) {
    try {
      const { block } = await client.getLatestBlockInfo();
      if (block) {
        const {
          header: { height }
        } = block;
        if (height > 0) break;
      }
    } catch (error) {
      if (error.code === 7979 || error.message === 'block not known') {
        await sleep(300);
      } else console.error(error);
    }
  }
};

export const sleep = (ms: number) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

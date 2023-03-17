import { config } from 'dotenv';

config();

const REQUIRED_ENVS = ['NODE_URL', 'NETWORK_NAME', 'FAUCET_PRIV_KEY'];

export const NODE_ENV = process.env.NODE_ENV || 'production';

if (NODE_ENV !== 'test') {
  REQUIRED_ENVS.forEach(requiredEnv => {
    if (!Object.keys(process.env).includes(requiredEnv))
      throw Error(`Missing ${requiredEnv} env variable`);
  });
}

export const NODE_URL = process.env.NODE_URL!;
export const NETWORK_NAME = process.env.NETWORK_NAME!;
export const FAUCET_PRIV_KEY = process.env.FAUCET_PRIV_KEY!;
export const HTTP_EVENT_STREAM_URL = process.env.HTTP_EVENT_STREAM_URL!;
export const HTTPS_EVENT_STREAM_URL = process.env.HTTPS_EVENT_STREAM_URL!;

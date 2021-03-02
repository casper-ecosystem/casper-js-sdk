import axios from 'axios';

export interface BlockResult {
  blockHash: string;
  parentHash: string;
  timestamp: string;
  eraId: number;
  proposer: string;
  state: string;
  deployCount: number;
  height: number;
  deploys: string[];
}

export interface Page {
  number: number;
  url: string;
}

export interface BlocksResult {
  data: BlockResult[] | null;
  pageCount: number;
  itemCount: number;
  pages: Page[];
}

export interface DeployResult {
  deployHash: string;
  state: string;
  cost: number;
  errorMessage: string;
  account: string;
  blockHash: string;
}

export interface Deployhash {
  blockHash: string;
  deployHash: string;
  state: string;
  cost: number;
  errormessage: string;
}

export interface AccountDeploy {
  deployHash: string;
  account: string;
  state: string;
  cost: number;
  errorMessage: string;
  blockHash: string;
}

export interface AccountDeploysResult {
  data: AccountDeploy[];
  pageCount: number;
  itemCount: number;
  pages: Page[];
}

export interface TransferResult {
  deployHash: string;
  sourcePurse: string;
  targetPurse: string;
  amount: string;
  id: string;
  fromAccount: string;
  toAccount: string;
}

export class EventService {
  private url?: string;

  constructor(url?: string) {
    this.url = url;
  }

  private async getResponseData(endPoint: string): Promise<any> {
    const response = await axios.get(`${this.url}${endPoint}`);
    return response.data;
  }

  public async getBlocks(page: number, count: number): Promise<BlocksResult> {
    return this.getResponseData(`/blocks?page=${page}&limit=${count}`);
  }

  public async getDeployByHash(deployHash: string): Promise<DeployResult> {
    return this.getResponseData(`/deploy/${deployHash}`);
  }

  public async getBlockByHash(blockHash: string): Promise<BlockResult> {
    return this.getResponseData(`/block/${blockHash}`);
  }

  public async getAccountDeploys(
    accountHex: string,
    page: number,
    limit: number
  ): Promise<AccountDeploysResult> {
    return this.getResponseData(
      `/accountDeploys/${accountHex}?page=${page}&limit=${limit}`
    );
  }

  public async getTransfersByAccountHash(
    accountHash: string
  ): Promise<TransferResult[]> {
    return this.getResponseData(`/transfers/${accountHash}`);
  }
}

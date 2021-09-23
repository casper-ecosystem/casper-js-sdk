import Client, { RequestManager } from '@open-rpc/client-js';
import ProviderTransport, {
  SafeEventEmitterProvider
} from './ProviderTransport';
import { CasperServiceByJsonRPC } from './CasperServiceByJsonRPC';

export class CasperServiceByProvider extends CasperServiceByJsonRPC {
  constructor(provider: SafeEventEmitterProvider) {
    // Hack to override base class
    super('https://example.com');
    const transport = new ProviderTransport(provider);
    const requestManager = new RequestManager([transport]);
    this.client = new Client(requestManager);
  }
}

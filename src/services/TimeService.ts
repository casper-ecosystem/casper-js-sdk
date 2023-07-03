import fetch from 'node-fetch';

type TimeJSON = {
  unixtime: number;
}

export class TimeService {
  constructor(public url: string) {}

  async getTime(): Promise<TimeJSON> {
    const result = await fetch(this.url);
    const json = await result.json();

    return json as TimeJSON;
  }
}

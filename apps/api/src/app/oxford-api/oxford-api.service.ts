import { HttpService, Injectable } from '@nestjs/common';
import { ConfigService } from '../config/config.service';

const BASE_URL = 'https://od-api.oxforddictionaries.com/api/v2/';

@Injectable()
export class OxfordApiService {
  constructor(
    private readonly httpService: HttpService,
    private config: ConfigService
  ) {}

  getEntries(term: string): Promise<any> {
    const url = `${BASE_URL}entries/en-gb/${term}?strictMatch=false`;
    return this.getResults(term, url);
  }

  getThesauruses(term: string): Promise<any> {
    const url = `${BASE_URL}thesaurus/en-gb/${term}`;
    return this.getResults(term, url);
  }

  async getResults(term: string, url: string): Promise<any> {
    const options = {
      headers: {
        app_id: this.config.get('OXFORD_APP_ID'),
        app_key: this.config.get('OXFORD_APP_KEY')
      }
    };

    try {
      const res = await this.httpService.get(url, options).toPromise();
      return res.data.results;
    } catch (e) {
      if (e.response && e.response.status === 404) {
        return [];
      } else {
        throw e;
      }
    }
  }
}

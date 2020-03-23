import { Controller, Get, Response } from '@nestjs/common';
import { SitemapStream, streamToPromise } from 'sitemap';
import { PRODUCTION_BASE_URL } from '@edfu/api-interfaces';
import { ReferenceService } from '../reference.service';

@Controller()
export class SitemapController {
  constructor(private referenceService: ReferenceService) {}

  sitemapXmlCache: any;
  sitemapTimeoutMs = 1000 * 60 * 60;

  @Get('sitemap')
  async sitemap(@Response() res) {
    res.set('Content-Type', 'text/xml');
    if (this.sitemapXmlCache) {
      console.log('Sitemap: Cache hit!');
      res.send(this.sitemapXmlCache);
      return;
    }
    console.log('Sitemap: rebuilding...');

    const oxIdsLowercase = await this.referenceService.allOxIdsLowercaseThatHaveDictionarySensesAndSigns();

    const smStream = new SitemapStream({
      hostname: PRODUCTION_BASE_URL
    });

    oxIdsLowercase.forEach(oxId => {
      smStream.write({
        url: `sign/${oxId}`
      });
    });

    smStream.end();

    streamToPromise(smStream).then(xml => {
      this.sitemapXmlCache = xml;
      setTimeout(() => {
        this.sitemapXmlCache = null;
      }, this.sitemapTimeoutMs);
      res.send(xml);
    });
  }
}

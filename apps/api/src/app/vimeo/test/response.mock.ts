import { SmooshedResponseBody } from '../vimeo.service';
import { VimeoVideoStatus } from '@edfu/api-interfaces';

export const makeBody = (status: VimeoVideoStatus): SmooshedResponseBody => {
  return {
    body: {
      uri: '/videos/398789046',
      name: 'fast',
      description: 'fast',
      type: 'video',
      link: 'https://vimeo.com/398789046',
      duration: 2,
      width: 426,
      language: null,
      height: 240,
      embed: {
        buttons: null,
        logos: null,
        title: null,
        playbar: true,
        volume: true,
        speed: false,
        color: '00adef',
        uri: null,
        html:
          '<iframe src="https://player.vimeo.com/video/398789046?badge=0&amp;autopause=0&amp;player_id=0&amp;app_id=168047" width="426" height="240" frameborder="0" allow="autoplay; fullscreen" allowfullscreen title="fast"></iframe>',
        badges: null
      },
      created_time: '2020-03-19T10:58:41+00:00',
      modified_time: '2020-03-19T11:00:00+00:00',
      release_time: '2020-03-19T10:58:41+00:00',
      content_rating: ['unrated'],
      license: null,
      privacy: {
        view: 'anybody',
        embed: 'public',
        download: true,
        add: true,
        comments: 'anybody'
      },
      pictures: {
        uri: '/videos/398789046/pictures/866560074',
        active: true,
        type: 'custom',
        sizes: [Array],
        resource_key: '2cbbc4b23aee144b6201352b90686645dd1486db'
      },
      tags: [],
      stats: { plays: 0 },
      categories: [],
      metadata: { connections: null, interactions: null },
      user: {
        uri: '/users/10016592',
        name: 'Derek Hill',
        link: 'https://vimeo.com/user10016592',
        location: '',
        gender: '',
        bio: null,
        short_bio: null,
        created_time: '2012-01-15T10:58:28+00:00',
        pictures: null,
        websites: [],
        metadata: null,
        location_details: null,
        skills: [],
        available_for_hire: false,
        preferences: null,
        content_filter: null,
        upload_quota: null,
        resource_key: 'd8811327bf0c10263fa7aaba22e0ddcbb9f35e9c',
        account: 'pro'
      },
      review_page: {
        active: true,
        link: 'https://vimeo.com/user10016592/review/398789046/c05156fd74'
      },
      parent_folder: null,
      last_user_action_event_date: '2020-03-19T10:58:41+00:00',
      files: [null, null, null, null],
      download: [null, null, null, null],
      app: { name: 'edfu', uri: '/apps/168047' },
      status: status,
      resource_key: '6015d541925a4c82bf6cec4172964368d2cd6abc',
      upload: {
        status: 'complete',
        link: null,
        upload_link: null,
        complete_uri: null,
        form: null,
        approach: null,
        size: null,
        redirect_url: null
      },
      transcode: { status: 'in_progress' }
    },
    status_code: 200,
    headers: {
      server: 'nginx',
      'content-type': 'application/vnd.vimeo.video+json',
      'cache-control': 'private, no-store, no-cache',
      'strict-transport-security':
        'max-age=31536000; includeSubDomains; preload',
      'x-ratelimit-limit': '500',
      'x-ratelimit-remaining': '494',
      'x-ratelimit-reset': '2020-03-19T11:54:45+00:00',
      'request-hash': 'ad271491',
      'x-vimeo-dc': 'ge',
      'accept-ranges': 'bytes, bytes',
      via: '1.1 varnish, 1.1 varnish',
      age: '0',
      'transfer-encoding': 'chunked',
      date: 'Thu, 19 Mar 2020 11:54:11 GMT',
      connection: 'close',
      'x-served-by': 'cache-bwi5129-BWI, cache-lhr7331-LHR',
      'x-cache': 'MISS, MISS',
      'x-cache-hits': '0, 0',
      'x-timer': 'S1584618852.646399,VS0,VE224',
      vary: 'Accept,Vimeo-Client-Id,Accept-Encoding'
    }
  };
};

// https://github.com/Pop-Code/nestjs-console

// ng run api:build-console
// ng run api:serve-console

// node ./dist/apps/api-console/main.js --help
// node ./dist/apps/api-console/main.js oxfordEntries
// node ./dist/apps/api-console/main.js fixtures
// node ./dist/apps/api-console/main.js load

import { BootstrapConsole } from 'nestjs-console';
import { AppModule } from './app/app.module';

const bootstrap = new BootstrapConsole({
  module: AppModule,
  useDecorators: true
});
bootstrap.init().then(async app => {
  try {
    await app.init();
    await bootstrap.boot();
    process.exit(0);
  } catch (e) {
    console.error('Error', e);
    process.exit(1);
  }
});

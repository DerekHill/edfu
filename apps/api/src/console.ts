// https://github.com/Pop-Code/nestjs-console

// ng run api:build-console

// node ./dist/apps/api/main.js --help
// node ./dist/apps/api/main.js oxfordEntries
// node ./dist/apps/api/main.js fixtures

import { BootstrapConsole } from 'nestjs-console';
import { AppModule } from './app/app.module';

BootstrapConsole.init({ module: AppModule })
  .then(({ app, boot }) => {
    // do something with your app container if you need (app)
    // boot the cli
    boot(/*process.argv*/);
  })
  .catch(e => console.log('Error', e));

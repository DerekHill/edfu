// https://github.com/Pop-Code/nestjs-console
// npm run console:dev -- --help
// npm run console:dev oxfordEntries
import { BootstrapConsole } from 'nestjs-console';
import { AppModule } from './app/app.module';

BootstrapConsole.init({ module: AppModule })
  .then(({ app, boot }) => {
    // do something with your app container if you need (app)
    // boot the cli
    console.log('this happened');
    boot(/*process.argv*/);
  })
  .catch(e => console.log('Error', e));

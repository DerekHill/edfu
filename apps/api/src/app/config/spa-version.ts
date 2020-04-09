import { readdirSync } from 'fs';
import { resolve } from 'path';
import { NO_VERSION_FOUND, GET_VERSION_REGEX } from '@edfu/api-interfaces';

let spa_version: string;

export const SPA_DIR = 'dist/apps/erya';

try {
  spa_version = readdirSync(resolve(SPA_DIR))
    .map(x => x.match(GET_VERSION_REGEX))
    .find(x => !!x)[0]
    .split('.')[1];
} catch {
  spa_version = NO_VERSION_FOUND;
}

export const SPA_VERSION = spa_version;

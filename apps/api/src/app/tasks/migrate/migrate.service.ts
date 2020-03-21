import { Injectable } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

interface Migration {
  up: (connection: Connection) => Promise<void>;
  down: (connection: Connection) => Promise<void>;
}

interface MigrationFile {
  index: number;
  file: string;
}

// Runs a single migration based on index of migration e.g.
// SKIP_TENSORFLOW=yes node ./dist/apps/api-console/main.js migrate 1
@Injectable()
export class MigrateService {
  migrations: MigrationFile[];
  constructor(@InjectConnection() private connection: Connection) {
    this.load();
  }

  async up(approxFilename: string) {
    const desiredIndex = this.getIndex(approxFilename);
    const exactFilename = this.migrations.find(
      ({ index }) => index === desiredIndex
    ).file;
    const migration: Migration = await import(`./migrations/${exactFilename}`);
    const res = await migration.up(this.connection);
    console.log(`Migration ${exactFilename} completed`);
    console.log(res);
  }

  load() {
    const migrationsDir = path.resolve(
      'apps/api/src/app/tasks/migrate/migrations'
    );
    this.migrations = fs
      .readdirSync(migrationsDir)
      .map(file => ({ index: +file.split('_')[0], file: file.split('.')[0] }));
  }

  private getIndex(name: string): number {
    return parseInt(name.match(/^\d*/)[0], 10);
  }
}

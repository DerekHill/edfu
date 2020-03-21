import { Connection } from 'mongoose';
import { SIGN_COLLECTION_NAME } from '../../../constants';
import * as pluralize from 'mongoose-legacy-pluralize';

export async function up(connection: Connection) {
  return connection.collection(pluralize(SIGN_COLLECTION_NAME)).dropIndexes();
}

export async function down() {
  console.log('Down!');
}

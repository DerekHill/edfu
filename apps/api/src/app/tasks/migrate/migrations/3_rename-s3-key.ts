import { Connection } from 'mongoose';
import { SIGN_COLLECTION_NAME } from '../../../constants';
import * as pluralize from 'mongoose-legacy-pluralize';

export async function up(connection: Connection) {
  return connection
    .collection(pluralize(SIGN_COLLECTION_NAME))
    .updateMany({}, { $rename: { s3Key: 's3KeyOrig' } });
}

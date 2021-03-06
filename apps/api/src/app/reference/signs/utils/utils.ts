import { extname } from 'path';
import { VALID_VIDEO_FILE_REGEX } from '@edfu/api-interfaces';

export const videoFilter = (req, file, callback) => {
  if (!file.originalname.match(VALID_VIDEO_FILE_REGEX)) {
    return callback(new Error('Only video files are allowed'), false);
  }
  callback(null, true);
};

export const copyExtension = (
  newName: string,
  nameWithExtension: string
): string => {
  const extension = extname(nameWithExtension);
  return `${newName}${extension}`;
};

export const standardiseFileNameDeprecated = (originalname: string) => {
  const baseName = originalname.split('.')[0];
  const extension = extname(originalname);
  const randomHex = Array(4)
    .fill(null)
    .map(() => Math.round(Math.random() * 16).toString(16))
    .join('');

  const today = new Date();
  const dd = String(today.getDate()).padStart(2, '0');
  const mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
  const yy = String(today.getFullYear()).substring(2);

  return `${yy}${mm}${dd}_${baseName}_${randomHex}${extension}`;
};

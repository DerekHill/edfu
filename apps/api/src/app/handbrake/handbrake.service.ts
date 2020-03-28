import { Injectable } from '@nestjs/common';
import * as hbjs from 'handbrake-js';
import * as fs from 'fs';

export const TEMP_DIR = './tmp';

// https://handbrake.fr/docs/en/latest/technical/official-presets.html
enum HandbrakePreset {
  Very_Fast_480p30 = 'Very Fast 480p30'
}

interface HandbrakeResult {
  stdout: string;
  stderr: string;
}

@Injectable()
export class HandbrakeService {
  constructor() {
    if (!fs.existsSync(TEMP_DIR)) {
      fs.mkdirSync(TEMP_DIR);
    }
  }

  run(input: string, output: string): Promise<HandbrakeResult> {
    const options = {
      input: input,
      output: output,
      preset: HandbrakePreset.Very_Fast_480p30,
      optimize: true
    };

    return hbjs.run(options);
  }

  writeToFs(path: string, data: any): Promise<void> {
    return fs.promises.writeFile(path, data);
  }

  deleteFile(path: string): Promise<void> {
    return fs.promises.unlink(path);
  }
}

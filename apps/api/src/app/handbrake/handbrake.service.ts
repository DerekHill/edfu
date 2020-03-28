import { Injectable } from '@nestjs/common';
import * as hbjs from 'handbrake-js';
import { promises as fs } from 'fs';

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
    return fs.writeFile(path, data);
  }

  deleteFile(path: string): Promise<void> {
    return fs.unlink(path);
  }
}

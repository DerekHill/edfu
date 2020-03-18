import { videoFilter, standardiseFileName } from './utils';

describe('utils', () => {
  describe('videoFilter', () => {
    it('accepts video file formats', () => {
      const validFiles = [
        'hello.MP4',
        'hello.mp4',
        'hello.MOV',
        'hello.mov',
        'hello.WMV',
        'hello.wmv',
        'hello.AVI',
        'hello.avi',
        'hello.FLV',
        'hello.flv'
      ];

      const validFileObjects = validFiles.map(f => {
        return { originalname: f };
      });
      for (const filename of validFileObjects) {
        const mockCallback = jest.fn((a: any, b: boolean) => {
          return null;
        });

        videoFilter('req', filename, mockCallback);
        expect(mockCallback.mock.calls.length).toBe(1);
        expect(mockCallback.mock.calls[0][1]).toBeTruthy();
      }
      console.log('yo');
    });

    it('rejects other file formats', () => {
      const invalidFiles = [
        'wrong.MP3',
        'wrong.mp3',
        'wrong.WAV',
        'wrong.wav',
        'wrong.WMA',
        'wrong.wma',
        'wrong.JPG',
        'wrong.jpg',
        'wrong.PNG',
        'wrong.png',
        'wrong.GIF',
        'wrong.gif'
      ];

      const invalidFileObjects = invalidFiles.map(f => {
        return { originalname: f };
      });

      for (const filename of invalidFileObjects) {
        const mockCallback = jest.fn((a: any, b: boolean) => {
          return null;
        });

        videoFilter('req', filename, mockCallback);
        expect(mockCallback.mock.calls.length).toBe(1);
        expect(mockCallback.mock.calls[0][1]).toBeFalsy();
      }
    });
  });

  describe('standardiseFileName', () => {
    it.only('works', () => {
      const originalname = 'hello.mp4';
      const res = standardiseFileName(originalname);
      expect(res).toMatch(/hello/);
    });
  });
});

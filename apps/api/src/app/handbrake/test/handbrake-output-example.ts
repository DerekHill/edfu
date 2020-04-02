import { HandbrakeOutput } from '../interfaces/handbrake-output.interface';

export interface CreateHandbrakeOutputExampleIPhoneParams {
  inputHeight?: number;
  inputWidth?: number;
  inputDurationString?: string;
  outputHeight?: number;
  outputWidth?: number;
  durationSecondsMod?: number;
  durationMinutesMod?: number;
  durationHoursMod?: number;
}

export const createHandbrakeOutputExampleIPhone = ({
  inputHeight = 1280,
  inputWidth = 720,
  inputDurationString = '00:00:03',
  outputHeight = 480,
  outputWidth = 270,
  durationSecondsMod = 3,
  durationMinutesMod = 2,
  durationHoursMod = 1
}: CreateHandbrakeOutputExampleIPhoneParams): HandbrakeOutput => {
  return {
    stdout:
      '\rEncoding: task 1 of 1, 58.76 %\rEncoding: task 1 of 1, 58.76 %\n',
    stderr:
      '[22:29:39] Compile-time hardening features are enabled\n' +
      '[22:29:39] hb_init: starting libhb thread\n' +
      '[22:29:39] thread 700008516000 started ("libhb")\n' +
      'HandBrake 1.3.0 (2019110900) - Darwin x86_64 - https://handbrake.fr\n' +
      '8 CPUs detected\n' +
      'Opening tmp/1234.mp4...\n' +
      '[22:29:39] CPU: Intel(R) Core(TM) i7-4980HQ CPU @ 2.80GHz\n' +
      '[22:29:39]  - Intel microarchitecture Haswell\n' +
      '[22:29:39]  - logical processor count: 8\n' +
      '[22:29:39] hb_scan: path=tmp/1234.mp4, title_index=1\n' +
      'udfread ERROR: ECMA 167 Volume Recognition failed\n' +
      'disc.c:323: failed opening UDF image tmp/1234.mp4\n' +
      'disc.c:424: error opening file BDMV/index.bdmv\n' +
      'disc.c:424: error opening file BDMV/BACKUP/index.bdmv\n' +
      'bluray.c:2585: nav_get_title_list(tmp/1234.mp4/) failed\n' +
      '[22:29:39] bd: not a bd - trying as a stream/file instead\n' +
      'libdvdnav: Using dvdnav version 6.0.1\n' +
      'libdvdread: Encrypted DVD support unavailable.\n' +
      'libdvdread:DVDOpenFileUDF:UDFFindFile /VIDEO_TS/VIDEO_TS.IFO failed\n' +
      'libdvdread:DVDOpenFileUDF:UDFFindFile /VIDEO_TS/VIDEO_TS.BUP failed\n' +
      "libdvdread: Can't open file VIDEO_TS.IFO.\n" +
      'libdvdnav: vm: failed to read VIDEO_TS.IFO\n' +
      '[22:29:39] dvd: not a dvd - trying as a stream/file instead\n' +
      "Input #0, mov,mp4,m4a,3gp,3g2,mj2, from 'tmp/1234.mp4':\n" +
      '  Metadata:\n' +
      '    major_brand     : qt  \n' +
      '    minor_version   : 0\n' +
      '    compatible_brands: qt  \n' +
      '    creation_time   : 2020-03-30T21:29:04.000000Z\n' +
      '    com.apple.quicktime.make: Apple\n' +
      '    com.apple.quicktime.model: iPhone 6\n' +
      '    com.apple.quicktime.software: 12.4.4\n' +
      '    com.apple.quicktime.creationdate: 2020-03-30T16:56:10+0100\n' +
      '  Duration: 00:00:03.26, start: 0.000000, bitrate: 11020 kb/s\n' +
      '    Stream #0:0(und): Video: h264 (Baseline) (avc1 / 0x31637661), yuv420p(tv, bt709), 1280x720, 10886 kb/s, 30.03 fps, 30 tbr, 600 tbn, 1200 tbc (default)\n' +
      '    Metadata:\n' +
      '      rotate          : 90\n' +
      '      creation_time   : 2020-03-30T21:29:04.000000Z\n' +
      '      handler_name    : Core Media Video\n' +
      '      encoder         : H.264\n' +
      '    Side data:\n' +
      '      displaymatrix: rotation of -90.00 degrees\n' +
      '    Stream #0:1(und): Audio: aac (LC) (mp4a / 0x6134706D), 44100 Hz, mono, fltp, 95 kb/s (default)\n' +
      '    Metadata:\n' +
      '      creation_time   : 2020-03-30T21:29:04.000000Z\n' +
      '      handler_name    : Core Media Audio\n' +
      '    Stream #0:2(und): Data: none (mebx / 0x7862656D), 24 kb/s (default)\n' +
      '    Metadata:\n' +
      '      creation_time   : 2020-03-30T21:29:04.000000Z\n' +
      '      handler_name    : Core Media Metadata\n' +
      '    Stream #0:3(und): Data: none (mebx / 0x7862656D), 0 kb/s (default)\n' +
      '    Metadata:\n' +
      '      creation_time   : 2020-03-30T21:29:04.000000Z\n' +
      '      handler_name    : Core Media Metadata\n' +
      '[22:29:39] scan: decoding previews for title 1\n' +
      '[22:29:39] scan: audio 0x1: aac, rate=44100Hz, bitrate=95709 Unknown (AAC LC) (1.0 ch) (95 kbps)\n' +
      '[22:29:40] scan: 10 previews, 720x1280, 30.031 fps, autocrop = 0/0/0/0, aspect 1:1.78, PAR 1:1\n' +
      '[22:29:40] libhb: scan thread found 1 valid title(s)\n' +
      '+ Using preset: Very Fast 480p30\n' +
      '+ title 1:\n' +
      '  + stream: tmp/1234.mp4\n' +
      `  + duration: ${inputDurationString}\n` +
      `  + size: ${inputWidth}x${inputHeight}, pixel aspect: 1/1, display aspect: 0.56, 30.031 fps\n` +
      '  + autocrop: 0/0/0/0\n' +
      '  + chapters:\n' +
      '    + 1: duration 00:00:03\n' +
      '  + audio tracks:\n' +
      '    + 1, Unknown (AAC LC) (1.0 ch) (95 kbps) (iso639-2: und)\n' +
      '  + subtitle tracks:\n' +
      '[22:29:40] Starting work at: Mon Mar 30 22:29:40 2020\n' +
      '\n' +
      '[22:29:40] 1 job(s) to process\n' +
      '[22:29:40] json job:\n' +
      '{\n' +
      '    "Audio": {\n' +
      '        "AudioList": [\n' +
      '            {\n' +
      '                "Bitrate": 160,\n' +
      '                "CompressionLevel": -1.0,\n' +
      '                "DRC": 0.0,\n' +
      '                "DitherMethod": "auto",\n' +
      '                "Encoder": "ca_aac",\n' +
      '                "Gain": 0.0,\n' +
      '                "Mixdown": "mono",\n' +
      '                "NormalizeMixLevel": false,\n' +
      '                "PresetEncoder": "ca_aac",\n' +
      '                "Quality": -3.0,\n' +
      '                "Samplerate": 0,\n' +
      '                "Track": 0\n' +
      '            }\n' +
      '        ],\n' +
      '        "CopyMask": [\n' +
      '            "copy:aac"\n' +
      '        ],\n' +
      '        "FallbackEncoder": "ca_aac"\n' +
      '    },\n' +
      '    "Destination": {\n' +
      '        "AlignAVStart": true,\n' +
      '        "ChapterList": [\n' +
      '            {\n' +
      '                "Duration": {\n' +
      `                    "Hours": ${durationHoursMod},\n` +
      `                    "Minutes": ${durationMinutesMod},\n` +
      `                    "Seconds": ${durationSecondsMod},\n` +
      '                    "Ticks": 293699\n' +
      '                },\n' +
      '                "Name": ""\n' +
      '            }\n' +
      '        ],\n' +
      '        "ChapterMarkers": false,\n' +
      '        "File": "tmp/1234_1.mp4",\n' +
      '        "InlineParameterSets": false,\n' +
      '        "Mp4Options": {\n' +
      '            "IpodAtom": false,\n' +
      '            "Mp4Optimize": true\n' +
      '        },\n' +
      '        "Mux": "m4v"\n' +
      '    },\n' +
      '    "Filters": {\n' +
      '        "FilterList": [\n' +
      '            {\n' +
      '                "ID": 3,\n' +
      '                "Settings": {\n' +
      '                    "block-height": "16",\n' +
      '                    "block-thresh": "80",\n' +
      '                    "block-width": "16",\n' +
      '                    "filter-mode": "1",\n' +
      '                    "mode": "0",\n' +
      '                    "motion-thresh": "2",\n' +
      '                    "spatial-metric": "2",\n' +
      '                    "spatial-thresh": "3"\n' +
      '                }\n' +
      '            },\n' +
      '            {\n' +
      '                "ID": 4,\n' +
      '                "Settings": {\n' +
      '                    "mode": "7"\n' +
      '                }\n' +
      '            },\n' +
      '            {\n' +
      '                "ID": 6,\n' +
      '                "Settings": {\n' +
      '                    "mode": 2,\n' +
      '                    "rate": "27000000/900000"\n' +
      '                }\n' +
      '            },\n' +
      '            {\n' +
      '                "ID": 12,\n' +
      '                "Settings": {\n' +
      '                    "crop-bottom": 0,\n' +
      '                    "crop-left": 0,\n' +
      '                    "crop-right": 0,\n' +
      '                    "crop-top": 0,\n' +
      `                    "height": ${outputHeight},\n` +
      `                    "width": ${outputWidth}\n` +
      '                }\n' +
      '            }\n' +
      '        ]\n' +
      '    },\n' +
      '    "Metadata": {},\n' +
      '    "PAR": {\n' +
      '        "Den": 1,\n' +
      '        "Num": 1\n' +
      '    },\n' +
      '    "SequenceID": 0,\n' +
      '    "Source": {\n' +
      '        "Angle": 0,\n' +
      '        "Path": "tmp/1234.mp4",\n' +
      '        "Range": {\n' +
      '            "End": 1,\n' +
      '            "Start": 1,\n' +
      '            "Type": "chapter"\n' +
      '        },\n' +
      '        "Title": 1\n' +
      '    },\n' +
      '    "Subtitle": {\n' +
      '        "Search": {\n' +
      '            "Burn": true,\n' +
      '            "Default": false,\n' +
      '            "Enable": false,\n' +
      '            "Forced": false\n' +
      '        },\n' +
      '        "SubtitleList": []\n' +
      '    },\n' +
      '    "Video": {\n' +
      '        "ColorFormat": 0,\n' +
      '        "ColorMatrix": 1,\n' +
      '        "ColorPrimaries": 1,\n' +
      '        "ColorRange": 1,\n' +
      '        "ColorTransfer": 1,\n' +
      '        "Encoder": "x264",\n' +
      '        "Level": "3.1",\n' +
      '        "Options": "",\n' +
      '        "Preset": "veryfast",\n' +
      '        "Profile": "main",\n' +
      '        "QSV": {\n' +
      '            "AsyncDepth": 4,\n' +
      '            "Decode": false\n' +
      '        },\n' +
      '        "Quality": 22.0,\n' +
      '        "Tune": "",\n' +
      '        "Turbo": false,\n' +
      '        "TwoPass": false\n' +
      '    }\n' +
      '}\n' +
      '[22:29:40] Starting Task: Encoding Pass\n' +
      '[22:29:40] job configuration:\n' +
      '[22:29:40]  * source\n' +
      '[22:29:40]    + tmp/1234.mp4\n' +
      '[22:29:40]    + title 1, chapter(s) 1 to 1\n' +
      '[22:29:40]    + container: mov,mp4,m4a,3gp,3g2,mj2\n' +
      '[22:29:40]    + data rate: 11020 kbps\n' +
      '[22:29:40]  * destination\n' +
      '[22:29:40]    + tmp/1234_1.mp4\n' +
      '[22:29:40]    + container: MPEG-4 (libavformat)\n' +
      '[22:29:40]      + optimized for HTTP streaming (fast start)\n' +
      '[22:29:40]      + align initial A/V stream timestamps\n' +
      '[22:29:40]  * video track\n' +
      '[22:29:40]    + decoder: h264\n' +
      '[22:29:40]      + bitrate 10886 kbps\n' +
      '[22:29:40]    + filters\n' +
      '[22:29:40]      + Comb Detect (mode=0:spatial-metric=2:motion-thresh=2:spatial-thresh=3:filter-mode=1:block-thresh=80:block-width=16:block-height=16)\n' +
      '[22:29:40]      + Decomb (mode=39)\n' +
      '[22:29:40]      + Framerate Shaper (mode=2:rate=27000000/900000)\n' +
      '[22:29:40]        + frame rate: 30.031 fps -> peak rate limited to 30.000 fps\n' +
      '[22:29:40]      + Crop and Scale (width=270:height=480:crop-top=0:crop-bottom=0:crop-left=0:crop-right=0)\n' +
      '[22:29:40]        + source: 720 * 1280, crop (0/0/0/0): 720 * 1280, scale: 270 * 480\n' +
      '[22:29:40]    + Output geometry\n' +
      '[22:29:40]      + storage dimensions: 270 x 480\n' +
      '[22:29:40]      + pixel aspect ratio: 1 : 1\n' +
      '[22:29:40]      + display dimensions: 270 x 480\n' +
      '[22:29:40]    + encoder: H.264 (libx264)\n' +
      '[22:29:40]      + preset:  veryfast\n' +
      '[22:29:40]      + profile: main\n' +
      '[22:29:40]      + level:   3.1\n' +
      '[22:29:40]      + quality: 22.00 (RF)\n' +
      '[22:29:40]      + color profile: 1-1-1\n' +
      '[22:29:40]  * audio track 1\n' +
      '[22:29:40]    + decoder: Unknown (AAC LC) (1.0 ch) (95 kbps) (track 1, id 0x1)\n' +
      '[22:29:40]      + bitrate: 95 kbps, samplerate: 44100 Hz\n' +
      '[22:29:40]    + mixdown: Mono\n' +
      '[22:29:40]    + dither: triangular\n' +
      '[22:29:40]    + encoder: AAC (Apple AudioToolbox)\n' +
      '[22:29:40]      + bitrate: 160 kbps, samplerate: 44100 Hz\n' +
      '[22:29:40] sync: expecting 97 video frames\n' +
      '[22:29:40] encx264: min-keyint: 30, keyint: 300\n' +
      '[22:29:40] encx264: encoding at constant RF 22.000000\n' +
      '[22:29:40] encx264: unparsed options: level=3.1:ref=1:8x8dct=0:weightp=1:subme=2:mixed-refs=0:trellis=0:vbv-bufsize=14000:vbv-maxrate=14000:rc-lookahead=10\n' +
      'x264 [info]: using SAR=1/1\n' +
      'x264 [info]: using cpu capabilities: MMX2 SSE2Fast SSSE3 SSE4.2 AVX FMA3 BMI2 AVX2\n' +
      'x264 [info]: profile Main, level 3.1, 4:2:0, 8-bit\n' +
      '[22:29:40] sync: first pts video is 0\n' +
      '[22:29:40] sync: Chapter 1 at frame 1 time 0\n' +
      '[22:29:40] sync: first pts audio 0x1 is 0\n' +
      '[22:29:40] reader: done. 1 scr changes\n' +
      '[22:29:40] work: average encoding speed for job is 0.000000 fps\n' +
      '[22:29:40] comb detect: heavy 0 | light 0 | uncombed 98 | total 98\n' +
      '[22:29:40] decomb: deinterlaced 0 | blended 0 | unfiltered 98 | total 98\n' +
      '[22:29:40] vfr: 98 frames output, 0 dropped and 0 duped for CFR/PFR\n' +
      '[22:29:40] vfr: lost time: 0 (0 frames)\n' +
      '[22:29:40] vfr: gained time: 0 (0 frames) (0 not accounted for)\n' +
      '[22:29:40] aac-decoder done: 141 frames, 0 decoder errors\n' +
      '[22:29:40] h264-decoder done: 98 frames, 0 decoder errors\n' +
      '[22:29:40] sync: got 98 frames, 97 expected\n' +
      '[22:29:40] sync: framerate min 30.031 fps, max 30.031 fps, avg 30.031 fps\n' +
      'x264 [info]: frame I:1     Avg QP:23.25  size: 15554\n' +
      'x264 [info]: frame P:25    Avg QP:24.11  size:  2134\n' +
      'x264 [info]: frame B:72    Avg QP:28.52  size:   210\n' +
      'x264 [info]: consecutive B-frames:  2.0%  0.0%  0.0% 98.0%\n' +
      'x264 [info]: mb I  I16..4: 13.5%  0.0% 86.5%\n' +
      'x264 [info]: mb P  I16..4:  0.4%  0.0%  0.1%  P16..4: 46.5% 15.1%  9.1%  0.0%  0.0%    skip:28.8%\n' +
      'x264 [info]: mb B  I16..4:  0.1%  0.0%  0.0%  B16..8: 11.6%  2.7%  0.1%  direct: 1.4%  skip:84.1%  L0:40.8% L1:40.2% BI:19.1%\n' +
      'x264 [info]: coded y,uvDC,uvAC intra: 90.2% 66.5% 28.6% inter: 6.2% 2.1% 0.1%\n' +
      'x264 [info]: i16 v,h,dc,p: 57%  9% 19% 15%\n' +
      'x264 [info]: i4 v,h,dc,ddl,ddr,vr,hd,vl,hu: 29% 13% 11%  9%  6% 11%  5% 10%  7%\n' +
      'x264 [info]: i8c dc,h,v,p: 47% 20% 28%  6%\n' +
      'x264 [info]: Weighted P-Frames: Y:0.0% UV:0.0%\n' +
      'x264 [info]: kb/s:205.81\n' +
      '[22:29:40] mux: track 0, 98 frames, 84000 bytes, 201.60 kbps, fifo 128\n' +
      '[22:29:40] mux: track 1, 144 frames, 60047 bytes, 144.11 kbps, fifo 256\n' +
      '[22:29:40] Finished work at: Mon Mar 30 22:29:40 2020\n' +
      '\n' +
      '[22:29:40] libhb: work result = 0\n' +
      '\n' +
      'Encode done!\n' +
      'HandBrake has exited.\n'
  };
};

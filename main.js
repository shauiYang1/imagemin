// src/main.js npm包使用
import isJpg from 'is-jpg';
import isPng from 'is-png';
import images from 'images';
import stream from 'stream';
import PngQuant from 'pngquant';
import { optimize } from 'svgo';
import unexpected from 'unexpected';
import unexpectedSinon from 'unexpected-sinon';
import unexpectedStream from 'unexpected-stream';
import { createFilter } from '@rollup/pluginutils';

const sizeEnum = {
  'small': {
    jpgQuality: 30,
    pngQuality: '20-40',
  },
  'medium': {
    jpgQuality: 70,
    pngQuality: '60-80',
  },
  'large': {
    jpgQuality: 90,
    pngQuality: '80-100',
  }
};
const filter = createFilter(/\.(png|svg|jpg)$/, undefined, { resolve: false });
const expect = unexpected.clone().use(unexpectedStream).use(unexpectedSinon);


function isSVGFile(buffer) {
  const magicNumber = "<svg";
  const bufferString = buffer.toString("utf8", 0, magicNumber.length);
  return bufferString === magicNumber;
}
function expectAsync(buffer, quality) {
  const bufferStream = new stream.PassThrough();
  const readerStream = bufferStream.end(buffer);
  return new Promise((resolve) => {
    expect(
      readerStream,
      'when piped through',
      new PngQuant([128, '--quality', `${quality}`, '--nofs']),
      'to yield output satisfying',
      expect.it((resultPngBuffer) => {
        resolve(resultPngBuffer)
      })
    )
  })

}
export default function myPlugin(config = {}) {
  const { size = 'medium' } = config;
  const { jpgQuality: quality, pngQuality } = sizeEnum[size];
  return {
    name: 'rollup-plugin-imgmin',
    async generateBundle(_, bundler) {
      for (const key in bundler) {
        if (filter(key)) {
          let buffer = bundler[key].source;
          const isBuffer = Buffer.isBuffer(buffer);
          if (!isBuffer) return;

          if (isSVGFile(buffer)) {
            if (Buffer.isBuffer(buffer)) {
              buffer = buffer.toString();
            }
            try {
              const { data } = optimize(buffer);
              buffer = Buffer.from(data);
            } catch (err) {
              console.log(`err--${key}`, err)
            }
          }
          if (isJpg(buffer)) {
            const option = {}
            buffer = images(buffer).encode("jpg", { quality, ...option });
          }
          if (isPng(buffer)) {
            buffer = await expectAsync(buffer, pngQuality)
          }
          bundler[key] = {
            ...bundler[key],
            source: buffer
          };
        }
      }
    }
  }
}

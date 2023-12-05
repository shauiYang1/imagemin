// src/main.js npm包使用
import { version } from './package.json';

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

console.log('version ' + version);



const filter = createFilter(/\.(png|svg|jpg)$/, undefined, { resolve: false });
const expect = unexpected.clone().use(unexpectedStream).use(unexpectedSinon);


function isSVGFile(buffer) {
  const magicNumber = "<svg";
  const bufferString = buffer.toString("utf8", 0, magicNumber.length);
  return bufferString === magicNumber;
}
function expectAsync(buffer) {
  const bufferStream = new stream.PassThrough();
  const readerStream = bufferStream.end(buffer);
  return new Promise((resolve) => {
    expect(
      readerStream,
      'when piped through',
      new PngQuant([128, '--quality', '60-80', '--nofs']),
      'to yield output satisfying',
      expect.it((resultPngBuffer) => {
        resolve(resultPngBuffer)
      })
    )
  })

}
export default function myPlugin(config) {
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
            buffer = images(buffer).encode("jpg", { quality: 70, ...option });
          }
          if (isPng(buffer)) {

            console.log('old', buffer.length)
            buffer = await expectAsync(buffer)
            console.log('new', buffer.length)
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

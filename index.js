import fs from 'fs';
import stream from 'stream';
import imagemin from 'imagemin';
import isPng from 'is-png';
import isJpg from 'is-jpg';
import images from 'images';
import { optimize } from 'svgo';
import PngQuant from 'pngquant';
import { isStream } from 'is-stream';
import streams from 'memory-streams';
import sharp from 'sharp';


function isSVGFile(buffer) {
  const magicNumber = "<svg";
  const bufferString = buffer.toString("utf8", 0, magicNumber.length);
  return bufferString === magicNumber;
}

const imageminSvgo = () => {
  return (buffer) => {
    if (!isSVGFile(buffer)) {
      return Promise.resolve(buffer);
    }
    if (Buffer.isBuffer(buffer)) {
      buffer = buffer.toString();
    }
    const { data } = optimize(buffer);
    return Buffer.from(data);
  }
}
const pngQuantStream = (buffer) => {
  return new Promise((resolve, reject) => {
    const bufferStream = new stream.PassThrough();
    const readerStream = bufferStream.end(buffer);
    const writerStream = new streams.WritableStream();
    const myPngQuanter = new PngQuant([192, '--quality', '60-80', '--nofs', '-']);
    readerStream.pipe(myPngQuanter).pipe(writerStream);
    writerStream.on('finish', function () {
      console.log('writerStream.toBuffer()', writerStream.toBuffer())
      resolve(writerStream.toBuffer());
    });
  })
}
const imageminPng = () => {
  return async (buffer) => {
    const isBuffer = Buffer.isBuffer(buffer);
    if (!isBuffer && !isStream(buffer)) {
      return Promise.reject(new TypeError(`Expected a Buffer or Stream, got ${typeof buffer}`));
    }
    if (isBuffer && !isPng(buffer)) {
      return Promise.resolve(buffer);
    }
    return await pngQuantStream(buffer);
  }
}
const imageminJpg = (option) => {
  return async (buffer) => {
    const isBuffer = Buffer.isBuffer(buffer);
    if (!isBuffer) {
      return Promise.reject(new TypeError(`Expected a Buffer, got ${typeof buffer}`));
    }
    if (!isJpg(buffer)) {
      return Promise.resolve(buffer);
    }
    buffer = images(buffer).encode("jpg", { quality: 70, ...option });
    return buffer;
  }
}
(async () => {
  const files = await imagemin(['src/assets/images/*.{svg,jpg,png}'], {
    destination: 'dist/assets/images',
    plugins: [
      imageminSvgo(),
      imageminPng(),
      imageminJpg()
    ]
  });
})();

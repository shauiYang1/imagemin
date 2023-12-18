// node本地处理使用 
import isJpg from 'is-jpg';
import isPng from 'is-png';
import images from 'images';
import stream from 'stream';
import { optimize } from 'svgo';
import PngQuant from 'pngquant';
import imagemin from 'imagemin';
import unexpected from 'unexpected';
import { isStream } from 'is-stream';
import unexpectedSinon from 'unexpected-sinon';
import unexpectedStream from 'unexpected-stream';


const expect = unexpected.clone().use(unexpectedStream).use(unexpectedSinon);


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
    expect(
      readerStream,
      'when piped through',
      new PngQuant([128, '--quality', '60-80', '--nofs']),
      'to yield output satisfying',
      expect.it((resultPngBuffer) => {
        resolve(resultPngBuffer);
      })
    )
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
  imagemin(['src/assets/images/**'], {
    destination: 'dist/assets/images',
    plugins: [
      imageminSvgo(),
      imageminPng(),
      imageminJpg()
    ]
  });
})();

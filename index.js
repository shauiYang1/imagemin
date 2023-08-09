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
const reduce = (metadata) => {
  const { width, height } = metadata;
  return {
    width: width * 0.5,
    height: height * 0.5
  }
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
    const bufferStream = new stream.PassThrough();
    const sourceStream = bufferStream.end(buffer);

    const createWriteStream = new streams.WritableStream();

    //  使用sharp通过图片大小压缩（不是我想要的结果）
    // const metadata = await sharp(buffer).metadata();
    // const { width, height } = reduce(metadata)
    // buffer = await sharp(buffer)
    //   .resize({
    //     width: width,
    //     height: height,
    //   })
    //   .png({ compressionLevel: 9 })
    //   .toBuffer();


    const myPngQuanter = new PngQuant([192, '--quality', '60-80', '--nofs', '-']);
    // console.log('myPngQuanter', myPngQuanter)
    sourceStream.pipe(myPngQuanter).pipe(createWriteStream);
    // console.log('createWriteStream', createWriteStream)
    return buffer;
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
  console.log('Images optimized', files);
})();

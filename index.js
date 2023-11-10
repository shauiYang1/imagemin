import fs from 'fs';
import path from 'node:path';
import { readFile } from 'node:fs/promises';
import { exec, spawn } from 'node:child_process';
import stream from 'stream';
import imagemin from 'imagemin';
import isPng from 'is-png';
import isJpg from 'is-jpg';
import images from 'images';
import { optimize } from 'svgo';
import PngQuant from 'pngquant';
import { isStream } from 'is-stream';
import streams from 'memory-streams';


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
    const myPngQuanter = new PngQuant([192, '--quality', '65-80', '--nofs', '--verbose']);
    readerStream.pipe(myPngQuanter).pipe(writerStream);
    writerStream.on('finish', function () {
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


function getAllFilesInDirectory(directory) {
  const files = [];
  fs.readdirSync(directory, (err, entries) => {
    if (err) {
      console.error(`Error reading directory ${directory}: ${err}`);
      return;
    }
    console.log('entryPath', entries);
    entries.forEach((entry) => {
      const entryPath = path.join(directory, entry);
      if (fs.lstatSync(entryPath).isDirectory()) {
        files.push(...getAllFilesInDirectory(entryPath));
      } else {
        files.push(entryPath);
      }
    });
  });

  return files;
}

// 测试Node api
function testCommand() {
  //                       命令      参数  options配置
  /*   const { stdout } = spawn('netstat', ['-an'], {})
  
    //返回的数据用data事件接受
    stdout.on('data', (steram) => {
      console.log(steram.toString())
    }) */
  const filePath = new URL('./src/assets/images/png/4.1-配图.png', import.meta.url);
  exec(`pngquant --quality 20-30 --skip-if-larger src/assets/images/png/3.1-目标物光载因数.png --output src/assets/images/png/a.png`, (err, stdout, stderr) => {
    if (err) {
      return err
    }
  })
  console.log('fs.readdirSync', path.join(process.cwd(), 'src'))
  // const files = getAllFilesInDirectory('src/');
  // console.log('files', files)
  fs.readdirSync(path.join(process.cwd(), 'src'), (err, entries) => {
    if (err) {
      console.error(`Error reading directory ${directory}: ${err}`);
      return;
    }
    console.log('entries', entries)
  })
}



// const workerpath = new URL('./worker.js', import.meta.url);
// const worker = new Worker(workerpath);
(async () => {



  const filePath = new URL('./src/assets/images/png/4.1-配图.png', import.meta.url);
  // const filePath = new URL('./src/assets/images/png/concat.png', import.meta.url);
  const contents = await readFile(filePath);
  const bufferStream = new stream.PassThrough();
  const readerStream = bufferStream.end(contents);
  const writerStream = new streams.WritableStream();
  const myPngQuanter = new PngQuant([256, '--quality', '65-80', '--nofs', '-']);
  // worker.postMessage({ myPngQuanter, writerStream })
  readerStream.pipe(myPngQuanter).pipe(writerStream);

  writerStream.on('finish', function () {
    console.log('writerStream.toBuffer()', writerStream.toBuffer())
  });


  // const files = await imagemin(['src/assets/images/**'], {
  //   destination: 'dist/assets/images',
  //   plugins: [
  //     imageminSvgo(),
  //     imageminPng(),
  //     imageminJpg()
  //   ]
  // });
})();

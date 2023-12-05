import imagemin from 'imagemin';
import {
  imageminSvgo,
  imageminPng,
  imageminJpg
} from './utils.js'


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

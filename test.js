import { exec } from 'child_process';
import { readFileSync } from 'fs'


// const buildOutPath = './' + readFileSync('./buildOutPath.txt', 'utf-8').toString();


const cmd = `npm -v`
// exec(cmd, (error, stdout, stderr) => {
//   if (error) {
//     console.error('error11: ' + error);
//     return;
//   }
//   console.log(`exec: ${stdout}`);
// })
exec(cmd,(error, stdout, stderr) => {
  if(error) {
    console.error('error11: ' + error);
    return;
  }
  console.log('succ',stdout,stderr)
})

// exec('node -v', (error, stdout, stderr) => {
//   if (error) {
//     console.error(`执行命令出错: ${error}`);
//     return;
//   }
//   console.log(`Node版本: ${stdout}`);
// });
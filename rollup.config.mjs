// rollup.config.mjs
import json from '@rollup/plugin-json';
import terser from '@rollup/plugin-terser';
import resolve from "@rollup/plugin-node-resolve";
import commonjs from '@rollup/plugin-commonjs';
import { babel } from '@rollup/plugin-babel';
import globals from 'rollup-plugin-node-globals';


function manualChunks(id) {
  const match = /.*\.strings\.(\w+)\.js/.exec(id);
  if (match) {
    const language = match[1]; // 例如 “en”
    const dependentEntryPoints = [];

    // 在这里，我们使用 Set 一次性处理每个依赖模块
    // 它可以阻止循环依赖中的无限循环
    const idsToHandle = new Set(getModuleInfo(id).dynamicImporters);

    for (const moduleId of idsToHandle) {
      const { isEntry, dynamicImporters, importers } =
        getModuleInfo(moduleId);
      if (isEntry || dynamicImporters.length > 0)
        dependentEntryPoints.push(moduleId);

      // Set 迭代器足够智能，可以处理
      // 在迭代过程中添加元素
      for (const importerId of importers) idsToHandle.add(importerId);
    }

    // 如果仅有一个入口，那么我们会根据入口名
    // 将它放到独立的 chunk 中
    if (dependentEntryPoints.length === 1) {
      return `${dependentEntryPoints[0].split('/').slice(-1)[0].split('.')[0]
        }.strings.${language}`;
    }
    // 对于多个入口，我们会把它放到“共享”的 chunk 中
    if (dependentEntryPoints.length > 1) {
      return `shared.strings.${language}`;
    }
  }
}
export default {
  input: 'main.js',
  output: [
    {
      file: 'lib/index.js',
      format: 'es',
    },
    {
      file: 'lib/index.cjs',
      format: 'cjs'
    },
    {
      file: 'lib/index.min.js',
      format: 'iife',
      name: 'version',
      plugins: [terser()]
    },
  ],
  plugins: [
    json(),
    resolve(),
    commonjs({
      include: 'node_modules/**'
    }),
    // babel({
    //   extensions: ['.js', '.ts'],
    //   babelrc: false, // 忽略工程内的 babel 配置文件，使用 rollup 这里的配置
    //   babelHelpers: 'bundled', // 当工程作为程序应用时推荐使用 bundled（默认值），当构建库时推荐使用 runtime。
    // }),
    // globals(),
  ],
  external: ['moment', 'images', 'is-jpg', 'is-png', 'pngquant', 'svgo', 'unexpected', 'unexpected-sinon', 'unexpected-stream"'],
  // context: 'window'
};
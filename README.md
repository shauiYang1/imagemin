
## 1、直接使用
git clone 项目

npm install

```
node index.js | npm run dev
```

导出文件在dist/assets/images文件下

## 2、使用npm安装
#rollup-plugin-imgmin 

rollup 图片压缩插件 (目前仅支持压缩png、jpg、svg)

## install
```
npm install  rollup-plugin-imgmin  -D
```
## usage

``` javascript
    // 在package.json中配置

    import rollup-plugin-imgmin from 'rollup-plugin-imgmin'

     plugins: [
      rollup-plugin-imgmin()
     ]

```

[项目地址github仓库地址](https://github.com/shauiYang1/imagemin)
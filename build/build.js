#!/usr/bin/env node
/**
 * 构建脚本：将字体、图标等资源以 base64 内嵌到 checklist.template.html
 * 生成最终的单文件 checklist.html
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const TEMPLATE = path.join(__dirname, 'checklist.template.html');
const OUT = path.join(ROOT, 'checklist.html');

const FONT_DIR = path.join(ROOT, 'HarmonyOS_Sans_SC');
const ICON_PNG = path.join(ROOT, 'icon.png');
const MS_WOFF2 = path.join(__dirname, 'material_symbols.woff2');

function toBase64(file){
  return fs.readFileSync(file).toString('base64');
}

// 构建 @font-face 块
function buildFontFaces(){
  const fonts = [
    {file:'HarmonyOS_Sans_SC_Thin.ttf',    weight:100, style:'normal'},
    {file:'HarmonyOS_Sans_SC_Light.ttf',   weight:300, style:'normal'},
    {file:'HarmonyOS_Sans_SC_Regular.ttf', weight:400, style:'normal'},
    {file:'HarmonyOS_Sans_SC_Medium.ttf',  weight:500, style:'normal'},
    {file:'HarmonyOS_Sans_SC_Bold.ttf',    weight:700, style:'normal'},
    {file:'HarmonyOS_Sans_SC_Black.ttf',   weight:900, style:'normal'},
  ];
  let css = '';
  // HarmonyOS Sans SC 字体族
  for(const f of fonts){
    const b64 = toBase64(path.join(FONT_DIR, f.file));
    css += `@font-face{font-family:'HarmonyOS Sans SC';font-style:${f.style};font-weight:${f.weight};font-display:swap;src:url(data:font/ttf;base64,${b64}) format('truetype');}\n`;
  }
  // Material Symbols Rounded（图标字体）
  const msB64 = toBase64(MS_WOFF2);
  css += `@font-face{font-family:'Material Symbols Rounded';font-style:normal;font-weight:100 700;font-display:swap;src:url(data:font/woff2;base64,${msB64}) format('woff2');}\n`;
  return css;
}

function main(){
  console.log('读取模板...');
  let html = fs.readFileSync(TEMPLATE, 'utf8');

  console.log('构建字体 @font-face...');
  const fontCss = buildFontFaces();

  console.log('注入字体 CSS...');
  html = html.replace('/*INJECT_FONTS_HERE*/', fontCss);

  console.log('注入图标 PNG (base64)...');
  const iconB64 = toBase64(ICON_PNG);
  const iconDataUri = `data:image/png;base64,${iconB64}`;
  html = html.replace(/\/\*INJECT_ICON_PNG\*\/'[^']*'/, `/*INJECT_ICON_PNG*/'${iconDataUri}'`);

  console.log('写入输出文件: ' + OUT);
  fs.writeFileSync(OUT, html, 'utf8');

  const sizeMB = (fs.statSync(OUT).size / 1024 / 1024).toFixed(2);
  console.log(`完成! 文件大小: ${sizeMB} MB`);
}

main();

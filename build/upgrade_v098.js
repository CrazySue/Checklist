// Checklist v0.9.7 -> v0.9.8 upgrade runner
const fs = require('fs');
const path = require('path');
const SRC = path.join(__dirname, '..', 'Checklist-v0.9.7.html');
const OUT = path.join(__dirname, '..', 'Checklist-v0.9.8.html');

let html = fs.readFileSync(SRC, 'utf8');
if (html.indexOf('\r') >= 0) { console.error('CRLF detected'); process.exit(1); }
let fail = 0;
function apply(oldStr, newStr, expect) {
  const c = html.split(oldStr).length - 1;
  if (c !== expect) { console.error('COUNT MISMATCH (expect ' + expect + ', got ' + c + '): ' + JSON.stringify(oldStr.slice(0, 90))); fail++; return; }
  html = html.split(oldStr).join(newStr);
}

// ---- 版本 ----
apply("const APP_VERSION = 'Release v0.9.7';", "const APP_VERSION = 'Release v0.9.8';", 1);

// ---- #1 安卓端聚焦自动居中：直接写 scrollTop（兼容所有 WebView）+ 软键盘校正 ----
apply(
".form-page-content{\n  flex:1;overflow-y:auto;overflow-x:hidden;\n  padding:8px 0 24px;\n  -webkit-overflow-scrolling:touch;\n}",
".form-page-content{\n  flex:1;overflow-y:auto;overflow-x:hidden;\n  padding:8px 0 24px;\n  -webkit-overflow-scrolling:touch;\n  scroll-behavior:smooth;\n}",
1);
apply(
"  // 编辑检查项时自动滚动到页面中间\n  $('#formContent').addEventListener('focusin', e=>{\n    if(e.target && e.target.tagName==='INPUT'){\n      const item = e.target.closest('.form-item');\n      const scroller = $('#formContent');\n      if(!item || !scroller) return;\n      const r = item.getBoundingClientRect();\n      const sr = scroller.getBoundingClientRect();\n      let targetTop = scroller.scrollTop + (r.top - sr.top) - (sr.height/2) + (r.height/2);\n      if(targetTop < 0) targetTop = 0;\n      try{ scroller.scrollTo({top:targetTop, behavior:'smooth'}); }\n      catch(err){ scroller.scrollTop = targetTop; }\n    }\n  });",
"  // 编辑检查项时自动滚动到页面中间（直接写 scrollTop，兼容 Android WebView）\n  $('#formContent').addEventListener('focusin', e=>{\n    if(e.target && e.target.tagName==='INPUT'){\n      const scroller = $('#formContent');\n      const center = ()=>{\n        const item = e.target.closest('.form-item');\n        if(!item || !scroller) return;\n        const r = item.getBoundingClientRect();\n        const sr = scroller.getBoundingClientRect();\n        let targetTop = scroller.scrollTop + (r.top - sr.top) - (sr.height/2) + (r.height/2);\n        if(targetTop < 0) targetTop = 0;\n        scroller.scrollTop = targetTop;\n      };\n      center();\n      // 软键盘弹出引起视口变化后再次校正\n      setTimeout(center, 200);\n    }\n  });",
1);

// ---- #2 安卓导入：去掉 accept 过滤（系统文件选择器即可选择任意文件） ----
apply(
"/* HBuilderX 5+ App（Android）：系统文件选择器，可选任意文件类型（含 .checklist） */\nfunction importViaPlusAndroid(){\n  try{\n    const main = plus.android.runtimeMainActivity();\n    const Intent = plus.android.importClass('android.content.Intent');\n    const intent = new Intent(Intent.ACTION_OPEN_DOCUMENT);\n    intent.addCategory(Intent.CATEGORY_OPENABLE);\n    intent.setType('*/*');\n    main.onActivityResult = function(requestCode, resultCode, data){\n      if(requestCode !== 9527) return; // 忽略其他插件的回调\n      if(resultCode !== -1 || !data){ showToast(t('import_fail')); return; }\n      try{\n        const uri = data.getData();\n        if(!uri){ showToast(t('import_fail')); return; }\n        const cr = main.getContentResolver();\n        const DataInputStream = plus.android.importClass('java.io.DataInputStream');\n        const dis = new DataInputStream(cr.openInputStream(uri));\n        const bytes = [];\n        let b;\n        while((b = dis.read()) !== -1){ bytes.push(b & 0xff); }\n        dis.close();\n        const text = new TextDecoder('utf-8').decode(new Uint8Array(bytes));\n        finishImport(text);\n      }catch(e){ showToast(t('import_fail')); }\n    };\n    main.startActivityForResult(intent, 9527);\n    return true;\n  }catch(e){\n    return false;\n  }\n}\nfunction handleImport(){\n  // HBuilderX 5+ App（Android）：系统文件选择器\n  if(window.plus && window.plus.android && plus.os && plus.os.name==='Android'){\n    if(importViaPlusAndroid()) return;\n  }\n  // Web/其他环境：file input\n  const input = document.createElement('input');\n  input.type = 'file';\n  input.accept = '.json,.checklist.json,.checklist,application/json';\n  input.onchange = (e)=>{\n    const file = e.target.files[0];\n    if(!file) return;\n    const reader = new FileReader();\n    reader.onload = (ev)=>finishImport(ev.target.result);\n    reader.onerror = ()=>showToast(t('import_fail'));\n    reader.readAsText(file);\n  };\n  input.click();\n}",
"function handleImport(){\n  // 创建隐藏的 file input；Android WebView 下不带 accept（部分系统文件选择器\n  // 无法映射自定义扩展名，带 accept 会导致所有文件都不可选）\n  const input = document.createElement('input');\n  input.type = 'file';\n  const isAndroidApp = !!(window.plus && plus.os && plus.os.name==='Android');\n  if(!isAndroidApp){\n    input.accept = '.json,.checklist.json,.checklist,application/json';\n  }\n  input.onchange = (e)=>{\n    const file = e.target.files[0];\n    if(!file) return;\n    const reader = new FileReader();\n    reader.onload = (ev)=>finishImport(ev.target.result);\n    reader.onerror = ()=>showToast(t('import_fail'));\n    reader.readAsText(file);\n  };\n  input.click();\n}",
1);

// ---- #3 安卓导出：MediaStore 直写 → 系统"另存为"对话框(SAF) → plus.io → 锚点 ----
apply(
"  // HBuilderX 5+ App（APK）\n  if(window.plus){\n    // Android：优先通过 MediaStore 写入系统公共 Download 目录（/storage/emulated/0/Download，Android 10+ 无需权限）\n    if(exportViaPlusAndroid(filename, json)) return;\n    // 回退：plus.io 链（_downloads → PUBLIC_DOWNLOADS → 私有文档目录）\n    if(exportViaPlusIO(filename, json)) return;\n  }\n  downloadViaAnchor(json, filename);\n}",
"  // HBuilderX 5+ App（APK）\n  if(window.plus && plus.os && plus.os.name==='Android' && plus.android){\n    // 1) MediaStore 直写公共 Download 目录（无对话框，Android 10+ 免权限）\n    if(exportViaPlusAndroid(filename, json)) return;\n    // 2) 系统\"另存为\"对话框（SAF，默认下载目录，权限由系统保证，100% 可用）\n    exportViaSAF(filename, json);\n    return;\n  }\n  if(window.plus && plus.io){\n    // 其他 plus 环境：plus.io 链（_downloads → PUBLIC_DOWNLOADS → 私有文档目录）\n    if(exportViaPlusIO(filename, json)) return;\n  }\n  downloadViaAnchor(json, filename);\n}",
1);
apply(
"  }catch(e){\n    return false;\n  }\n}\n/* plus.io 回退：_downloads → PUBLIC_DOWNLOADS → 应用私有文档目录 */",
"  }catch(e){\n    return false;\n  }\n}\n/* Android：系统\"另存为\"对话框（SAF，用户选择保存位置，默认下载目录） */\nfunction exportViaSAF(filename, json){\n  try{\n    const main = plus.android.runtimeMainActivity();\n    const Intent = plus.android.importClass('android.content.Intent');\n    const intent = new Intent(Intent.ACTION_CREATE_DOCUMENT);\n    intent.addCategory(Intent.CATEGORY_OPENABLE);\n    intent.setType('application/octet-stream');\n    intent.putExtra(Intent.EXTRA_TITLE, filename);\n    main.onActivityResult = function(requestCode, resultCode, data){\n      if(requestCode !== 9528) return; // 忽略其他插件的回调\n      if(resultCode !== -1 || !data) return; // 用户取消：静默返回\n      try{\n        const uri = data.getData();\n        if(!uri){ showToast(t('export_fail')); return; }\n        const os = main.getContentResolver().openOutputStream(uri);\n        if(!os){ showToast(t('export_fail')); return; }\n        const OutputStreamWriter = plus.android.importClass('java.io.OutputStreamWriter');\n        const osw = new OutputStreamWriter(os, 'UTF-8');\n        osw.write(json);\n        osw.close();\n        showToast(t('export_success'));\n      }catch(e){ showToast(t('export_fail')); }\n    };\n    main.startActivityForResult(intent, 9528);\n  }catch(e){\n    if(window.plus && plus.io){ exportViaPlusIO(filename, json); }\n    else{ downloadViaAnchor(json, filename); }\n  }\n}\n/* plus.io 回退：_downloads → PUBLIC_DOWNLOADS → 应用私有文档目录 */",
1);

// ---- #4a 长名→短名：先让名字翻出消失，再移动后缀，最后新名字翻入 ----
apply(
"  if((mode==='slide-right'||mode==='slide-left') && sEl.textContent){\n    // 检查单间切换：后缀（「检查单」）先按 MD3 曲线非线性移动到新位置（旧名字保持不动），\n    // 移到约 75% 时新名字（XX）上下翻动出来（目标在右侧→向上翻，在左侧→向下翻）\n    const dirUp = mode==='slide-right';\n    const oldLeft = sEl.getBoundingClientRect().left;\n    // 测量后缀新位置（临时换名测量，同步恢复，不产生视觉闪动）\n    const oldText = tEl.textContent;\n    tEl.textContent = text;\n    const newLeft = sEl.getBoundingClientRect().left;\n    tEl.textContent = oldText;\n    const delta = newLeft - oldLeft;\n    // 1. 后缀从旧位置非线性滑到新位置（旧名字保持可见）\n    if(Math.abs(delta) > 0.5){\n      sEl.style.transition = 'none';\n      sEl.style.transform = 'translateX(0)';\n      void sEl.offsetWidth;\n      sEl.style.transition = 'transform 320ms var(--md-easing-emphasized)';\n      sEl.style.transform = 'translateX('+delta+'px)';\n    }\n    // 2. 约 75%（240ms）处旧名翻出；翻出完成后的同一帧内换名并同步取消后缀位移（视觉连续，无瞬移）\n    const flipAt = Math.abs(delta) > 0.5 ? 240 : 0;\n    setTimeout(()=>{\n      // 旧名翻出（上下方向取决于目标位置）\n      tEl.style.display = 'inline-block';\n      tEl.style.transition = 'transform 120ms var(--md-easing-emphasized-accelerate), opacity 120ms var(--md-easing-standard-accelerate)';\n      tEl.style.transform = 'translateY('+(dirUp?-1:1)*100+'%)';\n      tEl.style.opacity = '0';\n      setTimeout(()=>{\n        // 同一帧：换名 + 同步去掉后缀位移补偿（自然位置变化与 transform 变化相互抵消，不产生瞬移）\n        tEl.style.transition = 'none';\n        tEl.style.transform = 'translateY('+(dirUp?1:-1)*100+'%)';\n        tEl.style.opacity = '0';\n        tEl.textContent = text;\n        if(Math.abs(delta) > 0.5){\n          sEl.style.transition = 'none';\n          sEl.style.transform = 'translateX(0)';\n        }\n        void tEl.offsetWidth;\n        tEl.style.transition = 'transform 200ms var(--md-easing-emphasized-decelerate), opacity 180ms var(--md-easing-emphasized-decelerate)';\n        tEl.style.transform = 'translateY(0)';\n        tEl.style.opacity = '1';\n        setTimeout(()=>{\n          tEl.style.transition=''; tEl.style.transform=''; tEl.style.opacity='';\n          tEl.style.display='';\n          sEl.style.transition=''; sEl.style.transform='';\n        }, 220);\n      }, 120);\n    }, flipAt);\n    return;\n  }",
"  if((mode==='slide-right'||mode==='slide-left') && sEl.textContent){\n    // 检查单间切换：后缀（「检查单」）按 MD3 曲线非线性移动，名字（XX）上下翻动\n    // （目标在右侧→向上翻，在左侧→向下翻）\n    // 后缀向右移：后缀先滑（旧名字可见，向右为空区）；后缀向左移：先让长名字翻出消失再滑，避免重叠\n    const dirUp = mode==='slide-right';\n    const oldLeft = sEl.getBoundingClientRect().left;\n    // 测量后缀新位置（临时换名测量，同步恢复，不产生视觉闪动）\n    const oldText = tEl.textContent;\n    tEl.textContent = text;\n    const newLeft = sEl.getBoundingClientRect().left;\n    tEl.textContent = oldText;\n    const delta = newLeft - oldLeft;\n    const hasMove = Math.abs(delta) > 0.5;\n    const slideSuffix = ()=>{\n      if(!hasMove) return;\n      sEl.style.transition = 'none';\n      sEl.style.transform = 'translateX(0)';\n      void sEl.offsetWidth;\n      sEl.style.transition = 'transform 320ms var(--md-easing-emphasized)';\n      sEl.style.transform = 'translateX('+delta+'px)';\n    };\n    const flipOut = (cb)=>{\n      tEl.style.display = 'inline-block';\n      tEl.style.transition = 'transform 120ms var(--md-easing-emphasized-accelerate), opacity 120ms var(--md-easing-standard-accelerate)';\n      tEl.style.transform = 'translateY('+(dirUp?-1:1)*100+'%)';\n      tEl.style.opacity = '0';\n      setTimeout(cb, 120);\n    };\n    const swapAndFlipIn = ()=>{\n      // 同一帧：换名 + 同步去掉后缀位移补偿（自然位置变化与 transform 变化相互抵消，不产生瞬移）\n      tEl.style.transition = 'none';\n      tEl.style.transform = 'translateY('+(dirUp?1:-1)*100+'%)';\n      tEl.style.opacity = '0';\n      tEl.textContent = text;\n      if(hasMove){\n        sEl.style.transition = 'none';\n        sEl.style.transform = 'translateX(0)';\n      }\n      void tEl.offsetWidth;\n      tEl.style.transition = 'transform 200ms var(--md-easing-emphasized-decelerate), opacity 180ms var(--md-easing-emphasized-decelerate)';\n      tEl.style.transform = 'translateY(0)';\n      tEl.style.opacity = '1';\n      setTimeout(()=>{\n        tEl.style.transition=''; tEl.style.transform=''; tEl.style.opacity='';\n        tEl.style.display='';\n        sEl.style.transition=''; sEl.style.transform='';\n      }, 220);\n    };\n    if(delta < -0.5){\n      // 后缀向左移动：先让长名字翻出消失，再滑后缀，滑到位后换名翻入\n      flipOut(()=>{\n        slideSuffix();\n        setTimeout(()=>{\n          swapAndFlipIn();\n        }, hasMove ? 320 : 0);\n      });\n    }else{\n      // 后缀向右/不动：后缀先滑（旧名字可见），约 75% 处旧名翻出，随后换名翻入\n      slideSuffix();\n      const flipAt = hasMove ? 240 : 0;\n      setTimeout(()=>{\n        flipOut(swapAndFlipIn);\n      }, flipAt);\n    }\n    return;\n  }",
1);

// ---- #4b 非中文语言：名称与后缀之间加空格（如 Go Home Checklist） ----
apply(
"    if(cl){\n      setTopbarTitle(cl.name, t('app_suffix'), slideTitleNext ? ('slide-'+slideTitleDir) : 'fade');\n      slideTitleNext = false;\n    }else{",
"    if(cl){\n      const suffixText = t('app_suffix');\n      const lang = getLang();\n      const needSpace = lang !== 'zh-CN' && lang !== 'zh-TW' && suffixText.charAt(0) !== ' ';\n      setTopbarTitle(cl.name, needSpace ? ' ' + suffixText : suffixText, slideTitleNext ? ('slide-'+slideTitleDir) : 'fade');\n      slideTitleNext = false;\n    }else{",
1);

// ---- #5 设置→新建（返回）：设置页向右滑出，新建页从左滑入 ----
apply(
"function switchPage(target){\n  const pages = {home:'#pageHome', form:'#pageForm', settings:'#pageSettings'};\n  const curEl = $(pages[currentPage]);\n  const tgtEl = $(pages[target]);\n  if(curEl===tgtEl) return;\n  // 方向规则：新建/设置页始终从右侧滑入（向左滑），检查单页从左侧滑入（向右滑）\n  // （设置→检查单即为唯一的从左侧滑到右侧的情形）\n  const goRight = target !== 'home';",
"function switchPage(target, reverse){\n  const pages = {home:'#pageHome', form:'#pageForm', settings:'#pageSettings'};\n  const curEl = $(pages[currentPage]);\n  const tgtEl = $(pages[target]);\n  if(curEl===tgtEl) return;\n  // 方向规则：新建/设置页从右侧滑入，检查单页从左侧滑入；\n  // reverse（从设置返回）：设置页向右滑出，目标页从左滑入\n  const goRight = reverse ? (target === 'home') : (target !== 'home');",
1);
apply(
"function goBackFromSettings(){\n  if(settingsFromPage==='form'){\n    renderForm();\n    switchPage('form');\n    renderTopbar('form');\n    renderBottombar();\n  }else{",
"function goBackFromSettings(){\n  if(settingsFromPage==='form'){\n    renderForm();\n    switchPage('form', true);\n    renderTopbar('form');\n    renderBottombar();\n  }else{",
1);

// ---- #6 赞助按钮标题：完全复制其它按钮标题样式 ----
apply(
".support-card .sc-title{font-size:16px;font-weight:400;color:var(--md-on-surface);}",
".support-card .sc-title{font-size:16px;color:var(--md-on-surface);}",
1);

// ---- #7 重置咖啡下移提速（200ms 移出 + 320ms 淡出） ----
apply(
".all-done.leaving{opacity:0;transform:translateY(64px);animation:all-done-fade 380ms var(--md-easing-standard) forwards,all-done-move 280ms var(--md-easing-emphasized-accelerate) forwards;}\n@keyframes all-done-fade{from{opacity:1;}to{opacity:0;}}\n@keyframes all-done-move{from{transform:translateY(0);}to{transform:translateY(64px);}}",
".all-done.leaving{opacity:0;transform:translateY(64px);animation:all-done-fade 320ms var(--md-easing-standard) forwards,all-done-move 200ms var(--md-easing-emphasized-accelerate) forwards;}\n@keyframes all-done-fade{from{opacity:1;}to{opacity:0;}}\n@keyframes all-done-move{from{transform:translateY(0);}to{transform:translateY(64px);}}",
1);
apply(
"    doneView.classList.add('leaving');\n    setTimeout(()=>{\n      renderHome(true);\n      renderBottombar();\n    }, 300);",
"    doneView.classList.add('leaving');\n    setTimeout(()=>{\n      renderHome(true);\n      renderBottombar();\n    }, 240);",
1);
apply(
"  if(oldDone){ oldDone.classList.remove('show'); oldDone.classList.add('leaving'); setTimeout(()=>oldDone.remove(), 430); }",
"  if(oldDone){ oldDone.classList.remove('show'); oldDone.classList.add('leaving'); setTimeout(()=>oldDone.remove(), 380); }",
1);

console.log('0.9.8 patches done, fail =', fail);
if (fail > 0) { console.error('ABORT'); process.exit(1); }
fs.writeFileSync(OUT, html, 'utf8');
console.log('OK: v0.9.8 written, size =', html.length);

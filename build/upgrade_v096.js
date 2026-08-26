// Checklist v0.9.5 -> v0.9.6 upgrade runner
const fs = require('fs');
const path = require('path');
const SRC = path.join(__dirname, '..', 'Checklist-v0.9.5.html');
const OUT = path.join(__dirname, '..', 'Checklist-v0.9.6.html');

let html = fs.readFileSync(SRC, 'utf8');
if (html.indexOf('\r') >= 0) { console.error('CRLF detected'); process.exit(1); }
let fail = 0;
function apply(oldStr, newStr, expect) {
  const c = html.split(oldStr).length - 1;
  if (c !== expect) { console.error('COUNT MISMATCH (expect ' + expect + ', got ' + c + '): ' + JSON.stringify(oldStr.slice(0, 90))); fail++; return; }
  html = html.split(oldStr).join(newStr);
}

// ---- 版本 ----
apply("const APP_VERSION = 'Release v0.9.5';", "const APP_VERSION = 'Release v0.9.6';", 1);

// ---- #1 下拉水波作用于整个下拉菜单（去掉头部裁剪，恢复 0.8.0 行为） ----
apply(
".dropdown-header{\n  display:flex;align-items:center;gap:12px;padding:16px;cursor:pointer;\n  position:relative;overflow:hidden;transition:background-color var(--md-dur-short);\n}",
".dropdown-header{\n  display:flex;align-items:center;gap:12px;padding:16px;cursor:pointer;\n  position:relative;transition:background-color var(--md-dur-short);\n}",
1);

// ---- #2 Web 端外链只打开一个标签页 ----
apply(
"function openExternal(url){\n  if(window.plus && window.plus.runtime && typeof plus.runtime.openURL==='function'){\n    try{ plus.runtime.openURL(url); return; }catch(e){}\n  }\n  const w = window.open(url, '_blank', 'noopener');\n  if(!w){\n    const a = document.createElement('a');\n    a.href = url; a.target = '_blank'; a.rel = 'noopener';\n    document.body.appendChild(a); a.click(); document.body.removeChild(a);\n  }\n}",
"function openExternal(url){\n  if(window.plus && window.plus.runtime && typeof plus.runtime.openURL==='function'){\n    try{ plus.runtime.openURL(url); return; }catch(e){}\n  }\n  // Web 端：锚点方式打开（仅一个标签页，不会被拦截，且不会与 window.open 重复打开）\n  const a = document.createElement('a');\n  a.href = url; a.target = '_blank'; a.rel = 'noopener';\n  document.body.appendChild(a); a.click(); document.body.removeChild(a);\n}",
1);

// ---- #3 横屏判定只看窗口比例（不受显示器物理方向影响，也不受软键盘影响） ----
apply(
"/* ---------- 横竖屏布局（横屏用左栏并占满页面，竖屏用底栏） ---------- */\nfunction updateLayout(){\n  let land = false;\n  // 1) 优先使用屏幕物理方向（不受软键盘收缩视口影响）\n  if(window.screen && screen.orientation && screen.orientation.type){\n    land = screen.orientation.type.indexOf('landscape') === 0;\n  }\n  // 2) 回退：媒体查询\n  else if(window.matchMedia && window.matchMedia('(orientation: landscape)').matches){\n    land = true;\n  }\n  // 3) 最终回退：视口宽高比较\n  else{\n    const w = window.innerWidth || document.documentElement.clientWidth || 0;\n    const h = window.innerHeight || document.documentElement.clientHeight || 0;\n    land = w > h;\n  }\n  document.documentElement.classList.toggle('landscape', land);\n}",
"/* ---------- 横竖屏布局（横屏用左栏并占满页面，竖屏用底栏） ---------- */\nfunction updateLayout(){\n  // 只按窗口本身比例判定（显示器方向不影响；outer 尺寸不受软键盘影响）\n  const w = window.outerWidth || document.documentElement.clientWidth || 0;\n  const h = window.outerHeight || document.documentElement.clientHeight || 0;\n  document.documentElement.classList.toggle('landscape', w > h);\n}",
1);

// ---- #4 赞助按钮标题颜色与其他按钮标题一致 ----
apply(
".support-card .sc-title{font-size:15px;font-weight:600;color:var(--md-primary);}",
".support-card .sc-title{font-size:15px;font-weight:600;color:var(--md-on-surface);}",
1);

// ---- #5 页面切换加固：清除退出页残留的 leave 类（所有进设置的路径均从右往左翻） ----
apply(
"  curEl.classList.remove('page-active');\n  curEl.classList.add(goRight? 'page-leave-left':'page-leave-right');",
"  curEl.classList.remove('page-active');\n  curEl.classList.remove('page-leave-left','page-leave-right');\n  curEl.classList.add(goRight? 'page-leave-left':'page-leave-right');",
1);

// ---- #6 取消顶栏按钮图标切换动画（直接替换） ----
apply(
"  const setSettingsIcon = (icon, label, active)=>{\n    btnSettings.classList.toggle('is-active', !!active);\n    btnSettings.setAttribute('aria-label', t(label));\n    swapIcon(btnSettings.querySelector('.icon'), icon);\n  };",
"  const setSettingsIcon = (icon, label, active)=>{\n    btnSettings.classList.toggle('is-active', !!active);\n    btnSettings.setAttribute('aria-label', t(label));\n    const ic = btnSettings.querySelector('.icon');\n    if(ic.textContent !== icon) ic.textContent = icon;\n  };",
1);

// ---- #7 标题动画：后缀右移时先移后缀再换名字；名字用上下翻动（方向取决于目标位置） ----
apply(
"let slideTitleNext = false; // 检查单间切换时标题后缀做位移动画",
"let slideTitleNext = false; // 检查单间切换时标题做位移动画\nlet slideTitleDir = 'right'; // 目标检查单方向（right=右侧/下一个，left=左侧/上一个）",
1);
apply(
"  slideTitleNext = (!fromOtherPage && oldId !== clId);\n  renderTopbar('home');",
"  slideTitleNext = (!fromOtherPage && oldId !== clId);\n  slideTitleDir = goRight ? 'right' : 'left';\n  renderTopbar('home');",
1);
apply(
"      setTopbarTitle(cl.name, t('app_suffix'), slideTitleNext ? 'slide' : 'fade');\n      slideTitleNext = false;",
"      setTopbarTitle(cl.name, t('app_suffix'), slideTitleNext ? ('slide-'+slideTitleDir) : 'fade');\n      slideTitleNext = false;",
1);
apply(
"function setTopbarTitle(text, suffix, mode){\n  const wrap = $('#topbarTitle');\n  const tEl = $('#topbarTitleText');\n  const sEl = $('#topbarTitleSuffix');\n  if(tEl.textContent===text && sEl.textContent===suffix) return;\n  if(mode==='slide' && sEl.textContent){\n    // 检查单间切换：名字（XX）淡入淡出，后缀（「检查单」）按 MD3 曲线非线性移动到新位置\n    const oldLeft = sEl.getBoundingClientRect().left;\n    tEl.style.transition = 'opacity 100ms var(--md-easing-standard-accelerate)';\n    tEl.style.opacity = '0';\n    setTimeout(()=>{\n      tEl.textContent = text;\n      sEl.textContent = suffix;\n      const newLeft = sEl.getBoundingClientRect().left;\n      const dx = oldLeft - newLeft;\n      if(Math.abs(dx) > 0.5){\n        sEl.style.transition = 'none';\n        sEl.style.transform = 'translateX('+dx+'px)';\n        void sEl.offsetWidth;\n        sEl.style.transition = 'transform 320ms var(--md-easing-emphasized)';\n        sEl.style.transform = 'translateX(0)';\n      }\n      tEl.style.transition = 'opacity 200ms var(--md-easing-emphasized-decelerate)';\n      tEl.style.opacity = '1';\n      setTimeout(()=>{\n        tEl.style.transition=''; tEl.style.opacity='';\n        sEl.style.transition=''; sEl.style.transform='';\n      }, 340);\n    }, 100);\n    return;\n  }",
"function setTopbarTitle(text, suffix, mode){\n  const wrap = $('#topbarTitle');\n  const tEl = $('#topbarTitleText');\n  const sEl = $('#topbarTitleSuffix');\n  if(tEl.textContent===text && sEl.textContent===suffix) return;\n  if((mode==='slide-right'||mode==='slide-left') && sEl.textContent){\n    // 检查单间切换：名字（XX）上下翻动（目标在右侧→向上翻，在左侧→向下翻），\n    // 后缀（「检查单」）按 MD3 曲线非线性移动到新位置；后缀向右移动时先移后缀再换名字，避免重叠\n    const dirUp = mode==='slide-right';\n    const oldLeft = sEl.getBoundingClientRect().left;\n    // 1. 旧名字垂直翻出（span 临时 inline-block 才能应用 transform）\n    tEl.style.display = 'inline-block';\n    tEl.style.transition = 'transform 130ms var(--md-easing-emphasized-accelerate), opacity 130ms var(--md-easing-standard-accelerate)';\n    tEl.style.transform = 'translateY('+(dirUp?-1:1)*100+'%)';\n    tEl.style.opacity = '0';\n    setTimeout(()=>{\n      // 2. 测量后缀新位置（临时换文本，同步恢复，不产生视觉闪动）\n      const oldText = tEl.textContent;\n      tEl.textContent = text;\n      const newLeft = sEl.getBoundingClientRect().left;\n      tEl.textContent = oldText;\n      const dx = oldLeft - newLeft;\n      const finishSwap = ()=>{ // 3. 新名字从另一侧翻入\n        tEl.style.transition = 'none';\n        tEl.style.transform = 'translateY('+(dirUp?1:-1)*100+'%)';\n        tEl.style.opacity = '0';\n        tEl.textContent = text;\n        void tEl.offsetWidth;\n        tEl.style.transition = 'transform 240ms var(--md-easing-emphasized-decelerate), opacity 200ms var(--md-easing-emphasized-decelerate)';\n        tEl.style.transform = 'translateY(0)';\n        tEl.style.opacity = '1';\n        setTimeout(()=>{\n          tEl.style.transition=''; tEl.style.transform=''; tEl.style.opacity='';\n          tEl.style.display='';\n        }, 260);\n      };\n      if(dx < -0.5){\n        // 后缀向右移动：先让后缀滑到新位置，再更换名字（避免名字与后缀重叠）\n        sEl.style.transition = 'none';\n        sEl.style.transform = 'translateX('+dx+'px)';\n        void sEl.offsetWidth;\n        sEl.style.transition = 'transform 240ms var(--md-easing-emphasized)';\n        sEl.style.transform = 'translateX(0)';\n        setTimeout(()=>{\n          finishSwap();\n          sEl.style.transition=''; sEl.style.transform='';\n        }, 240);\n      }else{\n        // 后缀向左移动（或不动）：名字与后缀同时动画\n        if(Math.abs(dx) > 0.5){\n          sEl.style.transition = 'none';\n          sEl.style.transform = 'translateX('+dx+'px)';\n          void sEl.offsetWidth;\n          sEl.style.transition = 'transform 320ms var(--md-easing-emphasized)';\n          sEl.style.transform = 'translateX(0)';\n        }\n        finishSwap();\n        setTimeout(()=>{ sEl.style.transition=''; sEl.style.transform=''; }, 340);\n      }\n    }, 130);\n    return;\n  }",
1);

// ---- #8a 导出：写入系统公共 Download 目录（/storage/emulated/0/Download） ----
apply(
"  // HBuilderX 5+ App（APK）：写入公共下载目录，保证导出可用\n  if(window.plus && window.plus.io){\n    try{\n      const isAndroid = plus.os && plus.os.name === 'Android';\n      const base = (isAndroid && plus.io.PUBLIC_DOWNLOADS) ? plus.io.PUBLIC_DOWNLOADS : plus.io.PRIVATE_DOC;\n      plus.io.requestFileSystem(base, function(fs){\n        fs.root.getFile(filename, {create:true}, function(fileEntry){\n          fileEntry.createWriter(function(writer){\n            writer.onwrite = function(){ showToast(t('export_success')); };\n            writer.onerror = function(){ showToast(t('export_fail')); };\n            writer.write(json);\n          }, function(){ showToast(t('export_fail')); });\n        }, function(){ downloadViaAnchor(json, filename); });\n      }, function(){ downloadViaAnchor(json, filename); });\n      return;\n    }catch(e){\n      downloadViaAnchor(json, filename);\n      return;\n    }\n  }\n  downloadViaAnchor(json, filename);",
"  // HBuilderX 5+ App（APK）：写入系统公共 Download 目录（Android: /storage/emulated/0/Download）\n  if(window.plus && window.plus.io){\n    const writeInto = (dirEntry)=>{\n      dirEntry.getFile(filename, {create:true}, function(fileEntry){\n        fileEntry.createWriter(function(writer){\n          writer.onwrite = function(){ showToast(t('export_success')); };\n          writer.onerror = function(){ showToast(t('export_fail')); };\n          writer.write(json);\n        }, function(){ showToast(t('export_fail')); });\n      }, function(){ downloadViaAnchor(json, filename); });\n    };\n    try{\n      // 优先：公共下载目录（_downloads/ 即系统 Download 文件夹）\n      plus.io.resolveLocalFileSystemURL('_downloads/', function(dirEntry){\n        writeInto(dirEntry);\n      }, function(){\n        // 回退：PUBLIC_DOWNLOADS → 应用私有文档目录\n        const isAndroid = plus.os && plus.os.name === 'Android';\n        const base = (isAndroid && plus.io.PUBLIC_DOWNLOADS) ? plus.io.PUBLIC_DOWNLOADS : plus.io.PRIVATE_DOC;\n        plus.io.requestFileSystem(base, function(fs){ writeInto(fs.root); }, function(){ downloadViaAnchor(json, filename); });\n      });\n      return;\n    }catch(e){\n      downloadViaAnchor(json, filename);\n      return;\n    }\n  }\n  downloadViaAnchor(json, filename);",
1);

// ---- #8b 导入：APK(Android) 用系统文件选择器（可选任意文件类型），Web 用 file input ----
apply(
"/* ---------- 导入检查单 ---------- */\nfunction handleImport(){\n  // 创建隐藏的 file input\n  const input = document.createElement('input');\n  input.type = 'file';\n  input.accept = '.json,.checklist.json,.checklist,application/json';\n  input.onchange = (e)=>{\n    const file = e.target.files[0];\n    if(!file) return;\n    const reader = new FileReader();\n    reader.onload = (ev)=>{\n      try {\n        const data = JSON.parse(ev.target.result);\n        if(!data.name || !Array.isArray(data.items)){ throw new Error('invalid'); }\n        // 创建新检查单\n        const newCl = {\n          id: uid(),\n          name: data.name,\n          icon: data.icon || 'auto',\n          resetHours: data.resetHours || 0,\n          items: data.items.map(i=>({ id:uid(), text:i.text, icon:i.icon||'auto', done:false })),\n          completedAt: null,\n          createdAt: Date.now()\n        };\n        Store.state.checklists.push(newCl);\n        Store.state.activeChecklistId = newCl.id;\n        Store.state._editing = null;\n        Store.save();\n        switchPage('home');\n        renderTopbar('home');\n        renderHome();\n        renderBottombar(newCl.id);\n        showToast(t('import_success'));\n      } catch(err) {\n        showToast(t('import_fail'));\n      }\n    };\n    reader.onerror = ()=>showToast(t('import_fail'));\n    reader.readAsText(file);\n  };\n  input.click();\n}",
"/* ---------- 导入检查单 ---------- */\nfunction finishImport(text){\n  try {\n    const data = JSON.parse(text);\n    if(!data.name || !Array.isArray(data.items)){ throw new Error('invalid'); }\n    // 创建新检查单\n    const newCl = {\n      id: uid(),\n      name: data.name,\n      icon: data.icon || 'auto',\n      resetHours: data.resetHours || 0,\n      items: data.items.map(i=>({ id:uid(), text:i.text, icon:i.icon||'auto', done:false })),\n      completedAt: null,\n      createdAt: Date.now()\n    };\n    Store.state.checklists.push(newCl);\n    Store.state.activeChecklistId = newCl.id;\n    Store.state._editing = null;\n    Store.save();\n    switchPage('home');\n    renderTopbar('home');\n    renderHome();\n    renderBottombar(newCl.id);\n    showToast(t('import_success'));\n  } catch(err) {\n    showToast(t('import_fail'));\n  }\n}\n/* HBuilderX 5+ App（Android）：系统文件选择器，可选任意文件类型（含 .checklist） */\nfunction importViaPlusAndroid(){\n  try{\n    const main = plus.android.runtimeMainActivity();\n    const Intent = plus.android.importClass('android.content.Intent');\n    const intent = new Intent(Intent.ACTION_OPEN_DOCUMENT);\n    intent.addCategory(Intent.CATEGORY_OPENABLE);\n    intent.setType('*/*');\n    main.onActivityResult = function(requestCode, resultCode, data){\n      if(requestCode !== 9527) return; // 忽略其他插件的回调\n      if(resultCode !== -1 || !data){ showToast(t('import_fail')); return; }\n      try{\n        const uri = data.getData();\n        if(!uri){ showToast(t('import_fail')); return; }\n        const cr = main.getContentResolver();\n        const DataInputStream = plus.android.importClass('java.io.DataInputStream');\n        const dis = new DataInputStream(cr.openInputStream(uri));\n        const bytes = [];\n        let b;\n        while((b = dis.read()) !== -1){ bytes.push(b & 0xff); }\n        dis.close();\n        const text = new TextDecoder('utf-8').decode(new Uint8Array(bytes));\n        finishImport(text);\n      }catch(e){ showToast(t('import_fail')); }\n    };\n    main.startActivityForResult(intent, 9527);\n    return true;\n  }catch(e){\n    return false;\n  }\n}\nfunction handleImport(){\n  // HBuilderX 5+ App（Android）：系统文件选择器\n  if(window.plus && window.plus.android && plus.os && plus.os.name==='Android'){\n    if(importViaPlusAndroid()) return;\n  }\n  // Web/其他环境：file input\n  const input = document.createElement('input');\n  input.type = 'file';\n  input.accept = '.json,.checklist.json,.checklist,application/json';\n  input.onchange = (e)=>{\n    const file = e.target.files[0];\n    if(!file) return;\n    const reader = new FileReader();\n    reader.onload = (ev)=>finishImport(ev.target.result);\n    reader.onerror = ()=>showToast(t('import_fail'));\n    reader.readAsText(file);\n  };\n  input.click();\n}",
1);

console.log('0.9.6 patches done, fail =', fail);
if (fail > 0) { console.error('ABORT'); process.exit(1); }
fs.writeFileSync(OUT, html, 'utf8');
console.log('OK: v0.9.6 written, size =', html.length);

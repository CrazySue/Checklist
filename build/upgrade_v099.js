// Checklist v0.9.8 -> v0.9.9 upgrade runner
const fs = require('fs');
const path = require('path');
const SRC = path.join(__dirname, '..', 'Checklist-v0.9.8.html');
const OUT = path.join(__dirname, '..', 'Checklist-v0.9.9.html');

let html = fs.readFileSync(SRC, 'utf8');
if (html.indexOf('\r') >= 0) { console.error('CRLF detected'); process.exit(1); }
let fail = 0;
function apply(oldStr, newStr, expect) {
  const c = html.split(oldStr).length - 1;
  if (c !== expect) { console.error('COUNT MISMATCH (expect ' + expect + ', got ' + c + '): ' + JSON.stringify(oldStr.slice(0, 90))); fail++; return; }
  html = html.split(oldStr).join(newStr);
}

// ---- 版本 ----
apply("const APP_VERSION = 'Release v0.9.8';", "const APP_VERSION = 'Release v0.9.9';", 1);

// ---- #1 安卓导出：新增 FileWriter 直写 Download（纯字符串桥接，兼容性最好）；写流改用 PrintWriter ----
apply(
"  // HBuilderX 5+ App（APK）\n  if(window.plus && plus.os && plus.os.name==='Android' && plus.android){\n    // 1) MediaStore 直写公共 Download 目录（无对话框，Android 10+ 免权限）\n    if(exportViaPlusAndroid(filename, json)) return;\n    // 2) 系统\"另存为\"对话框（SAF，默认下载目录，权限由系统保证，100% 可用）\n    exportViaSAF(filename, json);\n    return;\n  }",
"  // HBuilderX 5+ App（APK）\n  if(window.plus && plus.os && plus.os.name==='Android' && plus.android){\n    // 1) java.io.FileWriter 直写公共 Download 目录（路径字符串直传，桥接兼容性最好）\n    if(exportViaFileWriter(filename, json)) return;\n    // 2) MediaStore 直写（Android 10+ 免权限）\n    if(exportViaPlusAndroid(filename, json)) return;\n    // 3) 系统\"另存为\"对话框（SAF，默认下载目录，权限由系统保证）\n    exportViaSAF(filename, json);\n    return;\n  }",
1);
apply(
"/* Android：MediaStore 写入公共 Download 目录 */\nfunction exportViaPlusAndroid(filename, json){",
"/* Android：java.io.FileWriter 直写公共 Download 目录（纯字符串桥接参数，最兼容） */\nfunction exportViaFileWriter(filename, json){\n  if(!window.plus || !plus.android || !plus.os || plus.os.name!=='Android') return false;\n  try{\n    const Environment = plus.android.importClass('android.os.Environment');\n    const FileWriter = plus.android.importClass('java.io.FileWriter');\n    const dir = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS);\n    const dirPath = dir.getAbsolutePath();\n    const fw = new FileWriter(dirPath + '/' + filename);\n    fw.write(json);\n    fw.close();\n    showToast(t('export_success'));\n    return true;\n  }catch(e){\n    return false;\n  }\n}\n/* Android：MediaStore 写入公共 Download 目录 */\nfunction exportViaPlusAndroid(filename, json){",
1);
apply(
"    const os = resolver.openOutputStream(uri);\n    if(!os) return false;\n    const OutputStreamWriter = plus.android.importClass('java.io.OutputStreamWriter');\n    const osw = new OutputStreamWriter(os, 'UTF-8');\n    osw.write(json);\n    osw.close();\n    showToast(t('export_success'));\n    return true;",
"    const os = resolver.openOutputStream(uri);\n    if(!os) return false;\n    const PrintWriter = plus.android.importClass('java.io.PrintWriter');\n    const pw = new PrintWriter(os);\n    pw.print(json);\n    pw.close();\n    showToast(t('export_success'));\n    return true;",
1);
apply(
"        const os = main.getContentResolver().openOutputStream(uri);\n        if(!os){ showToast(t('export_fail')); return; }\n        const OutputStreamWriter = plus.android.importClass('java.io.OutputStreamWriter');\n        const osw = new OutputStreamWriter(os, 'UTF-8');\n        osw.write(json);\n        osw.close();\n        showToast(t('export_success'));",
"        const os = main.getContentResolver().openOutputStream(uri);\n        if(!os){ showToast(t('export_fail')); return; }\n        const PrintWriter = plus.android.importClass('java.io.PrintWriter');\n        const pw = new PrintWriter(os);\n        pw.print(json);\n        pw.close();\n        showToast(t('export_success'));",
1);

// ---- #2 安卓水波过快：松手后继续播放，动画整体放慢 ----
apply(
"    el.appendChild(ripple);\n    // 主动画结束后移除\n    const cleanup = ()=>{ ripple.remove(); el.removeEventListener('pointerup', cleanup); el.removeEventListener('pointerleave', cleanup); };\n    el.addEventListener('pointerup', cleanup);\n    el.addEventListener('pointerleave', cleanup);\n    // 兜底清理\n    setTimeout(()=>ripple.remove(), 700);\n  });\n}",
"    el.appendChild(ripple);\n    // 松手后水波继续播放至动画结束（MD3 规范），超时兜底清理\n    setTimeout(()=>ripple.remove(), 1000);\n  });\n}",
1);
apply("    setTimeout(()=>ripple.remove(), 550);", "    setTimeout(()=>ripple.remove(), 850);", 1);
apply(
".md-ripple{\n  position:absolute;border-radius:50%;\n  background:currentColor;opacity:.14;\n  transform:scale(0);\n  animation:md-ripple-anim 500ms var(--md-easing-standard);\n  pointer-events:none;z-index:0;\n}",
".md-ripple{\n  position:absolute;border-radius:50%;\n  background:currentColor;opacity:.14;\n  transform:scale(0);\n  animation:md-ripple-anim 750ms var(--md-easing-standard);\n  pointer-events:none;z-index:0;\n}",
1);
apply(".check-item .md-ripple{animation-duration:650ms;}", ".check-item .md-ripple{animation-duration:900ms;}", 1);
apply(".ci-check .md-ripple{animation-duration:600ms;}", ".ci-check .md-ripple{animation-duration:850ms;}", 1);

// ---- #3 安卓偶发卡顿：移除整页常驻合成层提示、缩短高度动画 ----
apply(
".page{\n  position:absolute;inset:0;\n  display:flex;flex-direction:column;\n  overflow:hidden;\n  transition:transform var(--md-dur-long) var(--md-easing-emphasized),opacity var(--md-dur-medium) var(--md-easing-standard);\n  will-change:transform,opacity;\n}",
".page{\n  position:absolute;inset:0;\n  display:flex;flex-direction:column;\n  overflow:hidden;\n  transition:transform var(--md-dur-long) var(--md-easing-emphasized),opacity var(--md-dur-medium) var(--md-easing-standard);\n}",
1);
apply(
"    height var(--md-dur-long) var(--md-easing-emphasized),\n    min-height var(--md-dur-long) var(--md-easing-emphasized),",
"    height 280ms var(--md-easing-emphasized),\n    min-height 280ms var(--md-easing-emphasized),",
1);

// ---- #4 标题动画统一编排：名字先翻（无空白），75% 处后缀移动；同名检查单也播放翻动 ----
apply(
"  if(tEl.textContent===text && sEl.textContent===suffix) return;",
"  if(mode!=='slide-right' && mode!=='slide-left' && tEl.textContent===text && sEl.textContent===suffix) return;",
1);
apply(
"  if((mode==='slide-right'||mode==='slide-left') && sEl.textContent){\n    // 检查单间切换：后缀（「检查单」）按 MD3 曲线非线性移动，名字（XX）上下翻动\n    // （目标在右侧→向上翻，在左侧→向下翻）\n    // 后缀向右移：后缀先滑（旧名字可见，向右为空区）；后缀向左移：先让长名字翻出消失再滑，避免重叠\n    const dirUp = mode==='slide-right';\n    const oldLeft = sEl.getBoundingClientRect().left;\n    // 测量后缀新位置（临时换名测量，同步恢复，不产生视觉闪动）\n    const oldText = tEl.textContent;\n    tEl.textContent = text;\n    const newLeft = sEl.getBoundingClientRect().left;\n    tEl.textContent = oldText;\n    const delta = newLeft - oldLeft;\n    const hasMove = Math.abs(delta) > 0.5;\n    const slideSuffix = ()=>{\n      if(!hasMove) return;\n      sEl.style.transition = 'none';\n      sEl.style.transform = 'translateX(0)';\n      void sEl.offsetWidth;\n      sEl.style.transition = 'transform 320ms var(--md-easing-emphasized)';\n      sEl.style.transform = 'translateX('+delta+'px)';\n    };\n    const flipOut = (cb)=>{\n      tEl.style.display = 'inline-block';\n      tEl.style.transition = 'transform 120ms var(--md-easing-emphasized-accelerate), opacity 120ms var(--md-easing-standard-accelerate)';\n      tEl.style.transform = 'translateY('+(dirUp?-1:1)*100+'%)';\n      tEl.style.opacity = '0';\n      setTimeout(cb, 120);\n    };\n    const swapAndFlipIn = ()=>{\n      // 同一帧：换名 + 同步去掉后缀位移补偿（自然位置变化与 transform 变化相互抵消，不产生瞬移）\n      tEl.style.transition = 'none';\n      tEl.style.transform = 'translateY('+(dirUp?1:-1)*100+'%)';\n      tEl.style.opacity = '0';\n      tEl.textContent = text;\n      if(hasMove){\n        sEl.style.transition = 'none';\n        sEl.style.transform = 'translateX(0)';\n      }\n      void tEl.offsetWidth;\n      tEl.style.transition = 'transform 200ms var(--md-easing-emphasized-decelerate), opacity 180ms var(--md-easing-emphasized-decelerate)';\n      tEl.style.transform = 'translateY(0)';\n      tEl.style.opacity = '1';\n      setTimeout(()=>{\n        tEl.style.transition=''; tEl.style.transform=''; tEl.style.opacity='';\n        tEl.style.display='';\n        sEl.style.transition=''; sEl.style.transform='';\n      }, 220);\n    };\n    if(delta < -0.5){\n      // 后缀向左移动：先让长名字翻出消失，再滑后缀，滑到位后换名翻入\n      flipOut(()=>{\n        slideSuffix();\n        setTimeout(()=>{\n          swapAndFlipIn();\n        }, hasMove ? 320 : 0);\n      });\n    }else{\n      // 后缀向右/不动：后缀先滑（旧名字可见），约 75% 处旧名翻出，随后换名翻入\n      slideSuffix();\n      const flipAt = hasMove ? 240 : 0;\n      setTimeout(()=>{\n        flipOut(swapAndFlipIn);\n      }, flipAt);\n    }\n    return;\n  }",
"  if((mode==='slide-right'||mode==='slide-left') && sEl.textContent){\n    // 检查单间切换：名字（XX）上下翻动（目标在右侧→向上翻，在左侧→向下翻），\n    // 旧名翻出后立即翻入新名（中间无空白）；翻到约 75% 时后缀（「检查单」）\n    // 按 MD3 曲线非线性移动到新位置；名字完全相同时也播放翻动动画\n    const dirUp = mode==='slide-right';\n    const oldLeft = sEl.getBoundingClientRect().left;\n    // 测量后缀新位置（临时换名测量，同步恢复，不产生视觉闪动）\n    const oldText = tEl.textContent;\n    tEl.textContent = text;\n    const newLeft = sEl.getBoundingClientRect().left;\n    tEl.textContent = oldText;\n    const delta = newLeft - oldLeft;\n    const hasMove = Math.abs(delta) > 0.5;\n    // 1. 旧名翻出（120ms）\n    tEl.style.display = 'inline-block';\n    tEl.style.transition = 'transform 120ms var(--md-easing-emphasized-accelerate), opacity 120ms var(--md-easing-standard-accelerate)';\n    tEl.style.transform = 'translateY('+(dirUp?-1:1)*100+'%)';\n    tEl.style.opacity = '0';\n    setTimeout(()=>{\n      // 2. 同一帧换名 + 后缀位移补偿（视觉连续），随后新名立即翻入（无空白）\n      tEl.style.transition = 'none';\n      tEl.style.transform = 'translateY('+(dirUp?1:-1)*100+'%)';\n      tEl.style.opacity = '0';\n      tEl.textContent = text;\n      if(hasMove){\n        sEl.style.transition = 'none';\n        sEl.style.transform = 'translateX('+(-delta)+'px)';\n      }\n      void tEl.offsetWidth;\n      tEl.style.transition = 'transform 200ms var(--md-easing-emphasized-decelerate), opacity 180ms var(--md-easing-emphasized-decelerate)';\n      tEl.style.transform = 'translateY(0)';\n      tEl.style.opacity = '1';\n      setTimeout(()=>{\n        tEl.style.transition=''; tEl.style.transform=''; tEl.style.opacity='';\n        tEl.style.display='';\n      }, 220);\n    }, 120);\n    // 3. 翻动到约 75%（240ms）处后缀开始非线性移动到新位置\n    setTimeout(()=>{\n      if(hasMove){\n        sEl.style.transition = 'none';\n        sEl.style.transform = 'translateX('+(-delta)+'px)';\n        void sEl.offsetWidth;\n        sEl.style.transition = 'transform 320ms var(--md-easing-emphasized)';\n        sEl.style.transform = 'translateX(0)';\n      }\n      setTimeout(()=>{ sEl.style.transition=''; sEl.style.transform=''; }, 340);\n    }, 240);\n    return;\n  }",
1);

// ---- #5 清空最后一个有内容的检查项：动画移除其下方自动空行，聚焦不变 ----
apply(
"      // 自动行：内容被清空且未选图标时自动消失（首项不清除；聚焦移到上一项，输入法保持打开）\n      if(!hc && item.icon==='auto' && item.id!==formState.items[0].id && formState.items.length>1 && item.id!==formState.items[formState.items.length-1].id){\n        const idxNow = formState.items.findIndex(i=>i.id===item.id);\n        const prevItem = idxNow > 0 ? formState.items[idxNow-1] : null;\n        pendingFocusItemId = prevItem ? prevItem.id : null;\n        fi.classList.add('removing');\n        setTimeout(()=>{\n          formState.items = formState.items.filter(i=>i.id!==item.id);\n          renderFormItems(wrap);\n        }, 250);\n        return;\n      }\n      // 未触发自动删除（首项/已选图标/最末行）时重渲染，裁剪多余的空自动行\n      if(!hc){\n        renderFormItems(wrap);\n        return;\n      }",
"      if(!hc){\n        // 1) 清空的是最后一个有内容的检查项：动画移除其下方的自动空行（聚焦不变，输入法保持）\n        if(item.icon==='auto' && formState.items.length>1){\n          const lastItem = formState.items[formState.items.length-1];\n          const prevItem = formState.items[formState.items.length-2];\n          if(lastItem && prevItem && !lastItem.text.trim() && lastItem.icon==='auto' && item.id===prevItem.id){\n            const autoRow = wrap.querySelector('.form-item[data-id=\"'+lastItem.id+'\"]');\n            if(autoRow){\n              autoRow.classList.add('removing');\n              setTimeout(()=>{\n                formState.items = formState.items.filter(i=>i.id!==lastItem.id);\n                renderFormItems(wrap);\n              }, 250);\n              return;\n            }\n          }\n        }\n        // 2) 中间空行自动删除（首项除外；聚焦移到上一项，输入法保持打开）\n        if(item.icon==='auto' && item.id!==formState.items[0].id && formState.items.length>1 && item.id!==formState.items[formState.items.length-1].id){\n          const idxNow = formState.items.findIndex(i=>i.id===item.id);\n          const prevItem = idxNow > 0 ? formState.items[idxNow-1] : null;\n          pendingFocusItemId = prevItem ? prevItem.id : null;\n          fi.classList.add('removing');\n          setTimeout(()=>{\n            formState.items = formState.items.filter(i=>i.id!==item.id);\n            renderFormItems(wrap);\n          }, 250);\n          return;\n        }\n        // 3) 其它情况：重渲染裁剪多余的空自动行\n        renderFormItems(wrap);\n        return;\n      }",
1);
apply(
"    // 自动行：内容被清空且未选图标时自动消失（首项不清除；聚焦移到上一项，输入法保持打开）\n    if(!hc && item.icon==='auto' && item.id!==formState.items[0].id && formState.items.length>1 && item.id!==formState.items[formState.items.length-1].id){\n      const idxNow = formState.items.findIndex(i=>i.id===item.id);\n      const prevItem = idxNow > 0 ? formState.items[idxNow-1] : null;\n      pendingFocusItemId = prevItem ? prevItem.id : null;\n      fi.classList.add('removing');\n      setTimeout(()=>{ formState.items = formState.items.filter(i=>i.id!==item.id); renderFormItems(wrap); }, 250);\n      return;\n    }\n    // 未触发自动删除（首项/已选图标/最末行）时重渲染，裁剪多余的空自动行\n    if(!hc){\n      renderFormItems(wrap);\n      return;\n    }",
"    if(!hc){\n      // 1) 清空的是最后一个有内容的检查项：动画移除其下方的自动空行（聚焦不变，输入法保持）\n      if(item.icon==='auto' && formState.items.length>1){\n        const lastItem = formState.items[formState.items.length-1];\n        const prevItem = formState.items[formState.items.length-2];\n        if(lastItem && prevItem && !lastItem.text.trim() && lastItem.icon==='auto' && item.id===prevItem.id){\n          const autoRow = wrap.querySelector('.form-item[data-id=\"'+lastItem.id+'\"]');\n          if(autoRow){\n            autoRow.classList.add('removing');\n            setTimeout(()=>{\n              formState.items = formState.items.filter(i=>i.id!==lastItem.id);\n              renderFormItems(wrap);\n            }, 250);\n            return;\n          }\n        }\n      }\n      // 2) 中间空行自动删除（首项除外；聚焦移到上一项，输入法保持打开）\n      if(item.icon==='auto' && item.id!==formState.items[0].id && formState.items.length>1 && item.id!==formState.items[formState.items.length-1].id){\n        const idxNow = formState.items.findIndex(i=>i.id===item.id);\n        const prevItem = idxNow > 0 ? formState.items[idxNow-1] : null;\n        pendingFocusItemId = prevItem ? prevItem.id : null;\n        fi.classList.add('removing');\n        setTimeout(()=>{ formState.items = formState.items.filter(i=>i.id!==item.id); renderFormItems(wrap); }, 250);\n        return;\n      }\n      // 3) 其它情况：重渲染裁剪多余的空自动行\n      renderFormItems(wrap);\n      return;\n    }",
1);

// ---- #5b 修复焦点捕获时机（清空前捕获 + 同步聚焦，输入法不中断） ----
apply(
"function renderFormItems(wrap){\n  wrap.innerHTML='';",
"function renderFormItems(wrap){\n  // 记录当前聚焦元素（必须在清空前捕获，避免重新渲染后丢失焦点）\n  const focusedId = document.activeElement && document.activeElement.tagName==='INPUT' ? document.activeElement.closest('.form-item')?.dataset?.id : null;\n  wrap.innerHTML='';",
1);
apply(
"    // 记录当前聚焦元素，避免重新渲染时丢失焦点\n    const focusedId = document.activeElement && document.activeElement.tagName==='INPUT' ? document.activeElement.closest('.form-item')?.dataset?.id : null;\n",
"",
1);
apply(
"    // 恢复焦点\n    if(focusedId===item.id){\n      requestAnimationFrame(()=>input.focus());\n      // 将光标放到末尾\n      const len = input.value.length;\n      requestAnimationFrame(()=>{ input.setSelectionRange(len,len); });\n    }",
"    // 恢复焦点（同步聚焦，输入法不中断）\n    if(focusedId===item.id){\n      input.focus();\n      const len = input.value.length;\n      try{ input.setSelectionRange(len,len); }catch(e){}\n    }",
1);

// ---- #6 深色模式过渡：主区域/搜索栏背景也平滑过渡 ----
apply(
".main-area{\n  flex:1;position:relative;overflow:hidden;\n  background:var(--md-surface);\n}",
".main-area{\n  flex:1;position:relative;overflow:hidden;\n  background:var(--md-surface);\n  transition:background-color .25s ease;\n}",
1);
apply(
"  transition:max-height var(--md-dur-medium) var(--md-easing-emphasized-decelerate),opacity var(--md-dur-short) var(--md-easing-standard),padding var(--md-dur-medium) var(--md-easing-standard);",
"  transition:max-height var(--md-dur-medium) var(--md-easing-emphasized-decelerate),opacity var(--md-dur-short) var(--md-easing-standard),padding var(--md-dur-medium) var(--md-easing-standard),background-color .25s ease;",
1);

console.log('0.9.9 patches done, fail =', fail);
if (fail > 0) { console.error('ABORT'); process.exit(1); }
fs.writeFileSync(OUT, html, 'utf8');
console.log('OK: v0.9.9 written, size =', html.length);

// Checklist v0.9.6 -> v0.9.7 upgrade runner
const fs = require('fs');
const path = require('path');
const SRC = path.join(__dirname, '..', 'Checklist-v0.9.6.html');
const OUT = path.join(__dirname, '..', 'Checklist-v0.9.7.html');

let html = fs.readFileSync(SRC, 'utf8');
if (html.indexOf('\r') >= 0) { console.error('CRLF detected'); process.exit(1); }
let fail = 0;
function apply(oldStr, newStr, expect) {
  const c = html.split(oldStr).length - 1;
  if (c !== expect) { console.error('COUNT MISMATCH (expect ' + expect + ', got ' + c + '): ' + JSON.stringify(oldStr.slice(0, 90))); fail++; return; }
  html = html.split(oldStr).join(newStr);
}

// ---- 版本 ----
apply("const APP_VERSION = 'Release v0.9.6';", "const APP_VERSION = 'Release v0.9.7';", 1);

// ---- #1 标题动画：去掉换名前后的两次瞬移（换名与后缀位移取消在同一帧同步进行） ----
apply(
"    // 2. 约 75%（240ms）处：名字换位瞬间补偿后缀位移（视觉连续），随后名字上下翻动\n    const flipAt = Math.abs(delta) > 0.5 ? 240 : 0;\n    setTimeout(()=>{\n      if(Math.abs(delta) > 0.5){\n        const comp = delta*0.8 - delta; // 剩余位移补偿，保持视觉连续\n        sEl.style.transition = 'none';\n        sEl.style.transform = 'translateX('+comp+'px)';\n        void sEl.offsetWidth;\n        sEl.style.transition = 'transform 160ms var(--md-easing-emphasized)';\n        sEl.style.transform = 'translateX(0)';\n      }\n      // 旧名翻出、新名翻入（上下方向取决于目标位置）\n      tEl.style.display = 'inline-block';\n      tEl.style.transition = 'transform 120ms var(--md-easing-emphasized-accelerate), opacity 120ms var(--md-easing-standard-accelerate)';\n      tEl.style.transform = 'translateY('+(dirUp?-1:1)*100+'%)';\n      tEl.style.opacity = '0';\n      setTimeout(()=>{\n        tEl.style.transition = 'none';\n        tEl.style.transform = 'translateY('+(dirUp?1:-1)*100+'%)';\n        tEl.style.opacity = '0';\n        tEl.textContent = text;\n        void tEl.offsetWidth;\n        tEl.style.transition = 'transform 200ms var(--md-easing-emphasized-decelerate), opacity 180ms var(--md-easing-emphasized-decelerate)';\n        tEl.style.transform = 'translateY(0)';\n        tEl.style.opacity = '1';\n        setTimeout(()=>{\n          tEl.style.transition=''; tEl.style.transform=''; tEl.style.opacity='';\n          tEl.style.display='';\n          sEl.style.transition=''; sEl.style.transform='';\n        }, 220);\n      }, 120);\n    }, flipAt);\n    return;\n  }",
"    // 2. 约 75%（240ms）处旧名翻出；翻出完成后的同一帧内换名并同步取消后缀位移（视觉连续，无瞬移）\n    const flipAt = Math.abs(delta) > 0.5 ? 240 : 0;\n    setTimeout(()=>{\n      // 旧名翻出（上下方向取决于目标位置）\n      tEl.style.display = 'inline-block';\n      tEl.style.transition = 'transform 120ms var(--md-easing-emphasized-accelerate), opacity 120ms var(--md-easing-standard-accelerate)';\n      tEl.style.transform = 'translateY('+(dirUp?-1:1)*100+'%)';\n      tEl.style.opacity = '0';\n      setTimeout(()=>{\n        // 同一帧：换名 + 同步去掉后缀位移补偿（自然位置变化与 transform 变化相互抵消，不产生瞬移）\n        tEl.style.transition = 'none';\n        tEl.style.transform = 'translateY('+(dirUp?1:-1)*100+'%)';\n        tEl.style.opacity = '0';\n        tEl.textContent = text;\n        if(Math.abs(delta) > 0.5){\n          sEl.style.transition = 'none';\n          sEl.style.transform = 'translateX(0)';\n        }\n        void tEl.offsetWidth;\n        tEl.style.transition = 'transform 200ms var(--md-easing-emphasized-decelerate), opacity 180ms var(--md-easing-emphasized-decelerate)';\n        tEl.style.transform = 'translateY(0)';\n        tEl.style.opacity = '1';\n        setTimeout(()=>{\n          tEl.style.transition=''; tEl.style.transform=''; tEl.style.opacity='';\n          tEl.style.display='';\n          sEl.style.transition=''; sEl.style.transform='';\n        }, 220);\n      }, 120);\n    }, flipAt);\n    return;\n  }",
1);

// ---- #2 重置时咖啡：下移 + 逐渐淡出（分开两条动画，淡出更明显） ----
apply(
".all-done.leaving{opacity:0;transform:translateY(64px);animation:all-done-out 220ms var(--md-easing-emphasized-accelerate) forwards;}\n@keyframes all-done-out{from{opacity:1;transform:translateY(0);}to{opacity:0;transform:translateY(64px);}}",
".all-done.leaving{opacity:0;transform:translateY(64px);animation:all-done-fade 380ms var(--md-easing-standard) forwards,all-done-move 280ms var(--md-easing-emphasized-accelerate) forwards;}\n@keyframes all-done-fade{from{opacity:1;}to{opacity:0;}}\n@keyframes all-done-move{from{transform:translateY(0);}to{transform:translateY(64px);}}",
1);
apply(
"    doneView.classList.add('leaving');\n    setTimeout(()=>{\n      renderHome(true);\n      renderBottombar();\n    }, 220);",
"    doneView.classList.add('leaving');\n    setTimeout(()=>{\n      renderHome(true);\n      renderBottombar();\n    }, 300);",
1);
apply(
"  if(oldDone){ oldDone.classList.remove('show'); oldDone.classList.add('leaving'); setTimeout(()=>oldDone.remove(), 260); }",
"  if(oldDone){ oldDone.classList.remove('show'); oldDone.classList.add('leaving'); setTimeout(()=>oldDone.remove(), 430); }",
1);

// ---- #3 清空未触发自动删除时重渲染，裁剪多余的空自动行 ----
apply(
"      // 自动行：内容被清空且未选图标时自动消失（首项不清除；聚焦移到上一项，输入法保持打开）\n      if(!hc && item.icon==='auto' && item.id!==formState.items[0].id && formState.items.length>1 && item.id!==formState.items[formState.items.length-1].id){\n        const idxNow = formState.items.findIndex(i=>i.id===item.id);\n        const prevItem = idxNow > 0 ? formState.items[idxNow-1] : null;\n        pendingFocusItemId = prevItem ? prevItem.id : null;\n        fi.classList.add('removing');\n        setTimeout(()=>{\n          formState.items = formState.items.filter(i=>i.id!==item.id);\n          renderFormItems(wrap);\n        }, 250);\n        return;\n      }",
"      // 自动行：内容被清空且未选图标时自动消失（首项不清除；聚焦移到上一项，输入法保持打开）\n      if(!hc && item.icon==='auto' && item.id!==formState.items[0].id && formState.items.length>1 && item.id!==formState.items[formState.items.length-1].id){\n        const idxNow = formState.items.findIndex(i=>i.id===item.id);\n        const prevItem = idxNow > 0 ? formState.items[idxNow-1] : null;\n        pendingFocusItemId = prevItem ? prevItem.id : null;\n        fi.classList.add('removing');\n        setTimeout(()=>{\n          formState.items = formState.items.filter(i=>i.id!==item.id);\n          renderFormItems(wrap);\n        }, 250);\n        return;\n      }\n      // 未触发自动删除（首项/已选图标/最末行）时重渲染，裁剪多余的空自动行\n      if(!hc){\n        renderFormItems(wrap);\n        return;\n      }",
1);
apply(
"    // 自动行：内容被清空且未选图标时自动消失（首项不清除；聚焦移到上一项，输入法保持打开）\n    if(!hc && item.icon==='auto' && item.id!==formState.items[0].id && formState.items.length>1 && item.id!==formState.items[formState.items.length-1].id){\n      const idxNow = formState.items.findIndex(i=>i.id===item.id);\n      const prevItem = idxNow > 0 ? formState.items[idxNow-1] : null;\n      pendingFocusItemId = prevItem ? prevItem.id : null;\n      fi.classList.add('removing');\n      setTimeout(()=>{ formState.items = formState.items.filter(i=>i.id!==item.id); renderFormItems(wrap); }, 250);\n      return;\n    }",
"    // 自动行：内容被清空且未选图标时自动消失（首项不清除；聚焦移到上一项，输入法保持打开）\n    if(!hc && item.icon==='auto' && item.id!==formState.items[0].id && formState.items.length>1 && item.id!==formState.items[formState.items.length-1].id){\n      const idxNow = formState.items.findIndex(i=>i.id===item.id);\n      const prevItem = idxNow > 0 ? formState.items[idxNow-1] : null;\n      pendingFocusItemId = prevItem ? prevItem.id : null;\n      fi.classList.add('removing');\n      setTimeout(()=>{ formState.items = formState.items.filter(i=>i.id!==item.id); renderFormItems(wrap); }, 250);\n      return;\n    }\n    // 未触发自动删除（首项/已选图标/最末行）时重渲染，裁剪多余的空自动行\n    if(!hc){\n      renderFormItems(wrap);\n      return;\n    }",
1);

// ---- #4 开关恢复 0.8.0 状态（去掉长按拉伸） ----
apply(
".switch .switch-thumb{\n  position:absolute;left:6px;top:50%;\n  width:24px;height:24px;margin-top:-12px;border-radius:50%;\n  background:var(--md-on-surface-variant);\n  transform:translateX(0) scale(.6667);\n  transform-origin:center;\n  transition:transform var(--md-dur-medium) var(--md-easing-emphasized),\n             background-color var(--md-dur-medium) var(--md-easing-standard);\n}\n.switch.on{background:var(--md-primary);border-color:var(--md-primary);}\n/* 开启：小球非线性滑动并放大（24px），与右边缘保留 4px 空隙；无按压拉伸 */\n.switch.on .switch-thumb{transform:translateX(14px) scale(1);background:var(--md-on-primary);}",
".switch .switch-thumb{\n  position:absolute;\n  width:12px;height:12px;border-radius:50%;\n  background:var(--md-outline);\n  /* 关闭：球在左侧，距左 border 6px（8-2border），用 left 定位 */\n  left:6px;\n  top:50%;transform:translateY(-50%);\n  transition:left var(--md-dur-medium) var(--md-easing-emphasized),\n             width var(--md-dur-medium) var(--md-easing-emphasized),\n             height var(--md-dur-medium) var(--md-easing-emphasized),\n             background-color var(--md-dur-medium) var(--md-easing-standard);\n}\n.switch.on{background:var(--md-primary);border-color:var(--md-primary);}\n/* 开启：球 24px，移到右侧（恢复 0.8.0 状态，无按压拉伸） */\n.switch.on .switch-thumb{left:22px;width:24px;height:24px;background:var(--md-on-primary);}",
1);

// ---- #5 赞助按钮标题字重与其它按钮标题一致 ----
apply(
".support-card .sc-title{font-size:15px;font-weight:600;color:var(--md-on-surface);}",
".support-card .sc-title{font-size:16px;font-weight:400;color:var(--md-on-surface);}",
1);

console.log('0.9.7 patches done, fail =', fail);
if (fail > 0) { console.error('ABORT'); process.exit(1); }
fs.writeFileSync(OUT, html, 'utf8');
console.log('OK: v0.9.7 written, size =', html.length);

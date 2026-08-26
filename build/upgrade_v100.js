// Checklist v0.9.9 -> v1.0.0
const fs = require('fs');
const path = require('path');
const FILE = path.join(__dirname, '..', 'Checklist-v0.9.9.html');

let html = fs.readFileSync(FILE, 'utf8');
let fail = 0;
function apply(oldStr, newStr, expect) {
  const c = html.split(oldStr).length - 1;
  if (c !== expect) { console.error('COUNT MISMATCH (expect ' + expect + ', got ' + c + '): ' + JSON.stringify(oldStr.slice(0, 80))); fail++; return; }
  html = html.split(oldStr).join(newStr);
}
function replaceBlock(startMark, endMark, newText) {
  const s = html.indexOf(startMark);
  const e = html.indexOf(endMark);
  if (s < 0 || e < 0 || s >= e) { console.error('BLOCK MARKERS NOT FOUND: ' + startMark); fail++; return; }
  html = html.slice(0, s) + newText + '\n' + html.slice(e);
}

// ---- 版本 ----
apply("const APP_VERSION = 'Release v0.9.9';", "const APP_VERSION = 'Release v1.0.0';", 1);

// ---- 导出：恢复保存到应用私有目录（/storage/emulated/0/Android/data/<包名>/downloads/），移除全部实验性导出代码 ----
replaceBlock(
'function handleExport(){',
'/* ---------- 导入检查单 ---------- */',
"/* ---------- 导出检查单（.checklist 文件，内容为 JSON） ---------- */\nfunction handleExport(){\n  const editing = Store.state._editing;\n  const cl = Store.state.checklists.find(c=>c.id===editing);\n  if(!cl){ showToast(t('export_fail')); return; }\n  const filename = (cl.name || 'checklist').replace(/[\\\\/:*?\"<>|]/g,'_') + '.checklist';\n  const json = buildExportPayload(cl);\n  // HBuilderX 5+ App（APK）：保存到应用私有目录（Android: /storage/emulated/0/Android/data/<包名>/downloads/）\n  if(window.plus && plus.io){\n    try{\n      plus.io.requestFileSystem(plus.io.PRIVATE_DOC, function(fs){\n        fs.root.getFile(filename, {create:true}, function(fileEntry){\n          fileEntry.createWriter(function(writer){\n            writer.onwrite = function(){ showToast(t('export_success')); };\n            writer.onerror = function(){ showToast(t('export_fail')); };\n            writer.write(json);\n          }, function(){ showToast(t('export_fail')); });\n        }, function(){ downloadViaAnchor(json, filename); });\n      }, function(){ downloadViaAnchor(json, filename); });\n      return;\n    }catch(e){\n      // 桥接不可用时回退网页下载\n    }\n  }\n  downloadViaAnchor(json, filename);\n}\n"
);

// ---- 下拉菜单：支持快速打断（从当前实际高度出发向目标高度过渡） ----
apply(
"function toggleDropdown(dd){\n  const willOpen = !dd.classList.contains('open');\n  const body = dd.querySelector('.dropdown-body');\n  if(!body) return;\n  if(willOpen){\n    dd.classList.add('open');\n    body.style.maxHeight = body.scrollHeight + 'px';\n  }else{\n    body.style.maxHeight = body.scrollHeight + 'px';\n    void body.offsetHeight;\n    body.style.maxHeight = '0px';\n    dd.classList.remove('open');\n  }\n}",
"function toggleDropdown(dd){\n  const body = dd.querySelector('.dropdown-body');\n  if(!body) return;\n  // 支持快速打断：从当前实际高度（含动画中间态）出发，向目标高度过渡\n  const willOpen = !dd.classList.contains('open');\n  const cur = body.getBoundingClientRect().height;\n  const target = willOpen ? body.scrollHeight : 0;\n  body.style.maxHeight = cur + 'px';\n  void body.offsetHeight;\n  body.style.maxHeight = target + 'px';\n  if(willOpen) dd.classList.add('open');\n  else dd.classList.remove('open');\n  // 收起动画结束后清理内联高度，避免内容变化后高度不同步\n  clearTimeout(toggleDropdown._cleanup);\n  toggleDropdown._cleanup = setTimeout(()=>{\n    if(!dd.classList.contains('open')) body.style.maxHeight = '';\n  }, 450);\n}",
1);

// ---- 移除未使用的确认对话框（删除检查单已改为二次点击确认） ----
apply(
"<!-- 弹窗：确认对话框 -->\n<div class=\"modal-scrim\" id=\"dialogScrim\"></div>\n<div class=\"dialog\" id=\"confirmDialog\">\n  <div class=\"dialog-title\" id=\"dialogTitle\"></div>\n  <div class=\"dialog-body\" id=\"dialogBody\"></div>\n  <div class=\"dialog-actions\" id=\"dialogActions\"></div>\n</div>\n",
"",
1);
apply(
"/* 确认对话框（删除二次确认） */\n.dialog{\n  position:fixed;left:50%;top:50%;transform:translate(-50%,-50%) scale(.9);\n  background:var(--md-surface-container-high);color:var(--md-on-surface);\n  border-radius:28px;z-index:101;\n  width:min(360px,88vw);padding:24px;\n  opacity:0;pointer-events:none;\n  transition:transform var(--md-dur-long) var(--md-easing-emphasized-decelerate),opacity var(--md-dur-medium);\n}\n.dialog.visible{transform:translate(-50%,-50%) scale(1);opacity:1;pointer-events:auto;}\n.dialog-title{font-size:22px;font-weight:500;margin-bottom:8px;}\n.dialog-body{font-size:14px;color:var(--md-on-surface-variant);line-height:1.5;margin-bottom:24px;}\n.dialog-actions{display:flex;justify-content:flex-end;gap:8px;}\n",
"",
1);
apply(
"/* ---------- 对话框 ---------- */\nfunction openDialog(){\n  $('#dialogScrim').classList.add('visible');\n  $('#confirmDialog').classList.add('visible');\n}\nfunction closeDialog(){\n  $('#dialogScrim').classList.remove('visible');\n  $('#confirmDialog').classList.remove('visible');\n}\n",
"",
1);
apply(
"      else if($('#confirmDialog').classList.contains('visible')) closeDialog();\n      else if(searchActive) closeSearch();",
"      else if(searchActive) closeSearch();",
1);
apply("  // 对话框\n  $('#dialogScrim').addEventListener('click', closeDialog);\n", "", 1);

// ---- 移除未使用的 CSS（状态层/图标填充/旧重置时间/旧选择菜单/搜索高亮） ----
apply(
"/* ---------- MD3 状态层（hover/focus/press） ---------- */\n.state-layer{position:relative;overflow:hidden;}\n.state-layer::before{\n  content:\"\";position:absolute;inset:0;background:currentColor;opacity:0;\n  transition:opacity var(--md-dur-short) var(--md-easing-standard);\n  pointer-events:none;border-radius:inherit;\n}\n.state-layer:hover::before{opacity:.08;}\n.state-layer:focus-visible::before{opacity:.12;}\n.state-layer:active::before{opacity:.12;}\n",
"",
1);
apply(".icon.fill{font-variation-settings:'FILL' 1,'wght' 400,'GRAD' 0,'opsz' 24;}\n", "", 1);
apply(
"/* 重置时间选择 */\n.duration-row{\n  display:flex;align-items:center;gap:16px;padding:12px 4px;\n}\n.duration-row .dr-label{flex:1;font-size:16px;color:var(--md-on-surface);}\n.duration-row .dr-value{font-size:14px;color:var(--md-primary);font-weight:500;}\n.duration-chips{display:flex;flex-wrap:wrap;gap:8px;padding:8px 4px;}\n",
"",
1);
apply(
"/* 选择菜单（Select / 语言） */\n.select-field{\n  position:relative;margin:8px 16px;\n}\n.select-field select{\n  width:100%;height:56px;padding:0 16px;\n  font-size:16px;color:var(--md-on-surface);\n  background:transparent;\n  border:1px solid var(--md-outline);\n  border-radius:12px;\n  -webkit-appearance:none;appearance:none;\n  cursor:pointer;\n  transition:border-color var(--md-dur-short);\n}\n.select-field select:focus{border-color:var(--md-primary);border-width:2px;padding:0 15px;}\n.select-field .select-arrow{\n  position:absolute;right:12px;top:50%;transform:translateY(-50%);\n  font-size:24px;color:var(--md-on-surface-variant);pointer-events:none;\n}\n.select-field label{\n  position:absolute;left:12px;top:-8px;padding:0 4px;\n  font-size:12px;color:var(--md-on-surface-variant);background:var(--md-surface);\n}\n",
"",
1);
apply(".search-highlight{background:color-mix(in srgb,var(--md-primary) 24%,transparent);border-radius:4px;padding:0 2px;}\n", "", 1);

// ---- Store：移除未使用的订阅接口 ----
apply(
"  listeners:[],\n",
"",
1);
apply(
"  subscribe(fn){ this.listeners.push(fn); },\n  emit(){ this.listeners.forEach(fn=>fn(this.state)); },\n  set(partial){ Object.assign(this.state, partial); this.save(); this.emit(); },",
"  set(partial){ Object.assign(this.state, partial); this.save(); },",
1);
apply("Store.save(); Store.emit();", "Store.save();", 3);

// ---- i18n：移除未使用的键 ----
['add','add_first_item','empty_title','empty_sub','pull_to_reset','release_to_reset','refreshing','back_home','item_icon','delete_confirm_title'].forEach(key=>{
  // 支持值内含转义单引号（如法语 l\'élément）
  const re = new RegExp('\\b' + key + ":'(?:[^'\\\\]|\\\\.)*', ?", 'g');
  html = html.replace(re, '');
});

// ---- 启动优化：脚本位于 body 末尾，直接初始化（省去 DOMContentLoaded 等待） ----
apply("document.addEventListener('DOMContentLoaded', init);", "init();", 1);

console.log('v1.0.0 patches done, fail =', fail);
if (fail > 0) { console.error('ABORT'); process.exit(1); }
fs.writeFileSync(FILE, html, 'utf8');
console.log('OK: v1.0.0 written, size =', html.length);

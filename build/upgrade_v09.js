// Checklist v0.8.0 -> v0.9.0 upgrade runner.
const fs = require('fs');
const path = require('path');
const ROWS = require('./keywords_v09.js');
const CSS_PATCHES = require('./patch_v09_css.js');

const HTML_PATH = path.join(__dirname, '..', 'Checklist-v0.9.0.html');

let html = fs.readFileSync(HTML_PATH, 'utf8');
if (html.indexOf('\r') >= 0) { console.error('CRLF detected, abort'); process.exit(1); }

let fail = 0;
function apply(oldStr, newStr, expect) {
  const count = html.split(oldStr).length - 1;
  if (count !== expect) { console.error('PATCH COUNT MISMATCH (expect ' + expect + ', got ' + count + '): ' + JSON.stringify(oldStr.slice(0, 90))); fail++; return; }
  html = html.split(oldStr).join(newStr);
}
function replaceBlock(startMark, endMark, newText) {
  const s = html.indexOf(startMark);
  const e = html.indexOf(endMark);
  if (s < 0 || e < 0 || s >= e) { console.error('BLOCK MARKERS NOT FOUND: ' + JSON.stringify(startMark) + ' / ' + JSON.stringify(endMark)); fail++; return; }
  html = html.slice(0, s) + newText + '\n' + html.slice(e);
}

/* ================= 简单补丁（JS） ================= */
apply("const APP_VERSION = 'Release v0.8.0';", "const APP_VERSION = 'Release v0.9.0';", 1);

// 4. 图标库分类键改为 id（供本地化分类标题使用）
apply("  '日常': [", "  daily: [", 1);
apply("  '出行': [", "  travel: [", 1);
apply("  '购物': [", "  shopping: [", 1);
apply("  '运动': [", "  sports: [", 1);
apply("  '休闲': [", "  leisure: [", 1);
apply("  '饮食': [", "  food: [", 1);
apply("  '健康': [", "  health: [", 1);
apply("  '工作': [", "  work: [", 1);
apply("  '其他': [", "  other: [", 1);

// 4. 图标选择弹窗分类标题本地化
apply("    grid.appendChild(el('div', {class:'icon-category-title'}, category));", "    grid.appendChild(el('div', {class:'icon-category-title'}, t('cat_'+category)));", 1);

// 5. autoIconFor 匹配逻辑重写（按语言 + 整词边界）
apply(
"function autoIconFor(text){\n  if(!text) return 'checklist';\n  const lower = text.toLowerCase();\n  for(const [pattern, icon] of AUTO_ICON_KEYWORDS){\n    const parts = pattern.split('|');\n    for(const p of parts){\n      if(lower.includes(p.toLowerCase())) return icon;\n    }\n  }\n  return 'checklist';\n}",
"/* 关键词匹配：西文按整词边界（忽略大小写与重音），中文/日文/韩文/俄文等按包含匹配 */\nfunction normText(s){ s = s.toLowerCase(); if(String.prototype.normalize){ s = s.normalize('NFD').replace(/[\u0300-\u036f]/g,''); } return s; }\nconst AUTO_ICON_COMPILED = {};\nfunction compiledAutoIcon(lang){\n  if(AUTO_ICON_COMPILED[lang]) return AUTO_ICON_COMPILED[lang];\n  const list = AUTO_ICON_KEYWORDS[lang] || [];\n  AUTO_ICON_COMPILED[lang] = list.map(([kw, icon])=>[normText(kw), icon]);\n  return AUTO_ICON_COMPILED[lang];\n}\nfunction isLatinKw(k){ return /^[a-z0-9]/.test(k); }\nfunction latinMatch(text, kw){\n  const idx = text.indexOf(kw);\n  if(idx < 0) return false;\n  const isWordChar = c => /^[a-z0-9]$/.test(c);\n  if(idx > 0 && isWordChar(text[idx-1])) return false;\n  const after = text[idx + kw.length];\n  if(after && isWordChar(after)) return false;\n  return true;\n}\nfunction autoIconFor(text){\n  if(!text) return 'checklist';\n  const t = normText(text);\n  const lang = getLang();\n  for(const l of [lang, 'en']){\n    for(const [kw, icon] of compiledAutoIcon(l)){\n      if(isLatinKw(kw) ? latinMatch(t, kw) : t.includes(kw)) return icon;\n    }\n  }\n  return 'checklist';\n}",
1);

// 底栏高亮：编辑/新建模式
apply(
"    const active = (currentPage==='home' && cl.id===Store.state.activeChecklistId) ||\n                   (currentPage==='form' && Store.state._editing===cl.id);",
"    const active = (currentPage==='home' && cl.id===Store.state.activeChecklistId) ||\n                   (currentPage==='form' && formMode==='edit' && Store.state._editing===cl.id);",
1);
apply(
"  const newTabActive = currentPage==='form' && !Store.state._editing;",
"  const newTabActive = currentPage==='form' && formMode==='new';",
1);

// 表单模式变量
apply(
"let formState = {name:'', icon:'auto', resetHours:0, items:[{id:uid(), text:'', icon:'auto'}]};",
"let formState = {name:'', icon:'auto', resetHours:0, items:[{id:uid(), text:'', icon:'auto'}]};\nlet formMode = null; // 'new' | 'edit'：当前表单页所处模式",
1);

// 10. 表单下拉菜单：去掉独立 attachRipple，与设置页 MIT 下拉一致（统一走全局水滴）
apply("      attachRipple(header);\n", "", 1);

// 6. 检查项自动图标切换动画
apply(
"        iconBtn.querySelector('.icon').textContent = hc? autoIconFor(item.text) : 'add_circle';",
"        const newIc = hc? autoIconFor(item.text) : 'add_circle';\n        swapIcon(iconBtn.querySelector('.icon'), newIc);",
1);
apply(
"      iconBtn.querySelector('.icon').textContent = hc? autoIconFor(item.text) : 'add_circle';",
"      const newIc = hc? autoIconFor(item.text) : 'add_circle';\n      swapIcon(iconBtn.querySelector('.icon'), newIc);",
1);

// 6. 图标选择后原地动画更新（不整体重渲染）
apply(
"function selectIcon(iconName){\n  const ctx = iconPickerContext;\n  if(!ctx) return;\n  if(ctx.type==='checklist'){\n    formState.icon = iconName;\n    renderForm();\n  }else if(ctx.type==='item'){\n    const item = formState.items.find(i=>i.id===ctx.itemId);\n    if(item){ item.icon = iconName; renderForm(); }\n  }\n  closeIconPicker();\n}",
"function selectIcon(iconName){\n  const ctx = iconPickerContext;\n  if(!ctx) return;\n  if(ctx.type==='checklist'){\n    formState.icon = iconName;\n    refreshChecklistIconRow();\n  }else if(ctx.type==='item'){\n    const item = formState.items.find(i=>i.id===ctx.itemId);\n    if(item){\n      item.icon = iconName;\n      const fi = $('.form-item[data-id=\"'+item.id+'\"]');\n      if(fi){\n        const btn = fi.querySelector('.fi-icon-btn');\n        if(btn){\n          btn.classList.add('has-icon');\n          swapIcon(btn.querySelector('.icon'), iconName);\n        }else{\n          renderForm();\n        }\n      }else{\n        renderForm();\n      }\n    }\n  }\n  closeIconPicker();\n}",
1);

// 新建/保存/删除后清空编辑模式
apply(
"  Store.state._editing = null;\n  Store.save(); Store.emit();\n  switchPage('home');\n  renderTopbar('home');\n  renderHome();\n  renderBottombar(newCl.id);",
"  Store.state._editing = null;\n  formMode = null;\n  Store.save(); Store.emit();\n  switchPage('home');\n  renderTopbar('home');\n  renderHome();\n  renderBottombar(newCl.id);",
1);
apply(
"  Store.state._editing = null;\n  Store.save(); Store.emit();\n  switchPage('home');\n  renderTopbar('home');\n  renderHome();\n  renderBottombar();",
"  Store.state._editing = null;\n  formMode = null;\n  Store.save(); Store.emit();\n  switchPage('home');\n  renderTopbar('home');\n  renderHome();\n  renderBottombar();",
1);
apply(
"      Store.state.activeChecklistId = Store.state.checklists[0]? Store.state.checklists[0].id : null;\n      Store.state._editing = null;",
"      Store.state.activeChecklistId = Store.state.checklists[0]? Store.state.checklists[0].id : null;\n      Store.state._editing = null;\n      formMode = null;",
1);

// 9. 外链改用 openExternal；增加 Maintain 行；增加咖啡按钮
apply(
"  link.addEventListener('click', e=>{\n    e.preventDefault();\n    window.open(APP_AUTHOR_URL, '_blank', 'noopener');\n  });",
"  link.addEventListener('click', e=>{\n    e.preventDefault();\n    openExternal(APP_AUTHOR_URL);\n  });",
1);
apply(
"  about.appendChild(el('div', {class:'about-glm'}, t('made_by')));",
"  about.appendChild(el('div', {class:'about-glm'}, t('made_by')));\n  about.appendChild(el('div', {class:'about-glm'}, t('maintained_by')));",
1);
apply(
"  // MIT 许可下拉\n  const mitDd = el('div', {class:'dropdown', id:'mitDropdown'});",
"  // 请作者喝咖啡（跳转默认浏览器；简体中文跳转爱发电）\n  const coffeeBtn = el('button', {class:'support-card', onclick:()=>openExternal(getLang()==='zh-CN' ? 'https://afdian.com/a/crazysue' : 'https://buymeacoffee.com/crazysue')});\n  coffeeBtn.appendChild(el('span', {class:'icon sc-icon'}, 'local_cafe'));\n  coffeeBtn.appendChild(el('div', {class:'sc-text'}, [\n    el('div', {class:'sc-title'}, t('coffee_btn')),\n    el('div', {class:'sc-sub'}, t('coffee_sub'))\n  ]));\n  coffeeBtn.appendChild(el('span', {class:'icon sc-arrow'}, 'open_in_new'));\n  attachRipple(coffeeBtn);\n  content.appendChild(coffeeBtn);\n\n  // MIT 许可下拉\n  const mitDd = el('div', {class:'dropdown', id:'mitDropdown'});",
1);

// 1/3/8. 顶栏设置/返回按钮行为
apply(
"  $('#btnSettings').addEventListener('click', ()=>{\n    if(currentPage==='settings'){\n      // 从设置页返回主页\n      switchPage('home');\n      renderTopbar('home');\n      renderHome();\n    }else if(currentPage==='form'){\n      // 从表单页向右翻到设置页\n      renderSettings();\n      switchPage('settings');\n      renderTopbar('settings');\n    }else{\n      // 从主页翻到设置页\n      renderSettings();\n      switchPage('settings');\n      renderTopbar('settings');\n    }\n  });",
"  $('#btnSettings').addEventListener('click', ()=>{\n    if(currentPage==='settings'){\n      // 返回进入设置前的页面\n      goBackFromSettings();\n    }else if(currentPage==='form'){\n      if(formMode==='edit'){\n        // 编辑页：返回检查单页面\n        Store.state._editing = null;\n        formMode = null;\n        switchPage('home');\n        renderTopbar('home');\n        renderHome();\n        renderBottombar();\n      }else{\n        openSettingsFrom('form');\n      }\n    }else{\n      openSettingsFrom('home');\n    }\n  });",
1);

// ESC 键行为
apply(
"      else if(currentPage!=='home'){\n        switchPage('home');\n        renderTopbar('home');\n      }",
"      else if(currentPage==='settings'){\n        goBackFromSettings();\n      }\n      else if(currentPage==='form'){\n        if(formMode==='edit'){ Store.state._editing=null; formMode=null; }\n        switchPage('home');\n        renderTopbar('home');\n        renderHome();\n        renderBottombar();\n      }",
1);

// 10. 咖啡按钮加入全局水波
apply(
"const RIPPLE_SELECTOR = '.btn,.seg-btn,.chip,.settings-item.clickable,.dropdown-header.clickable,.lang-item,.icon-option,.icon-circle-btn,.nav-tab .tab-icon-pill,.icon-btn,.fab,.ci-check,.check-item,.fi-icon-btn,.fi-remove';",
"const RIPPLE_SELECTOR = '.btn,.seg-btn,.chip,.settings-item.clickable,.dropdown-header.clickable,.lang-item,.icon-option,.icon-circle-btn,.nav-tab .tab-icon-pill,.icon-btn,.fab,.ci-check,.check-item,.fi-icon-btn,.fi-remove,.support-card';",
1);

/* ================= i18n 新增键 ================= */
apply(
"    items_count:'项',\n    completed_count:'已完成',\n  },",
"    items_count:'项',\n    completed_count:'已完成',\n    back:'返回',\n    cat_daily:'日常', cat_travel:'出行', cat_shopping:'购物', cat_sports:'运动', cat_leisure:'休闲', cat_food:'饮食', cat_health:'健康', cat_work:'工作', cat_other:'其他',\n    coffee_btn:'给 Sue 狠狠的发电', coffee_sub:'如果你觉得这个应用对你有帮助，请支持我！谢谢你！',\n    maintained_by:'Maintain by DeepSeek V4 Pro',\n  },",
1);
apply(
"    items_count:'項',\n    completed_count:'已完成',\n  },",
"    items_count:'項',\n    completed_count:'已完成',\n    back:'返回',\n    cat_daily:'日常', cat_travel:'出行', cat_shopping:'購物', cat_sports:'運動', cat_leisure:'休閒', cat_food:'飲食', cat_health:'健康', cat_work:'工作', cat_other:'其他',\n    coffee_btn:'給 Sue 買一杯咖啡', coffee_sub:'如果你覺得這個應用對你有幫助，請支持我！謝謝你！',\n    maintained_by:'Maintain by DeepSeek V4 Pro',\n  },",
1);
apply(
"    items_count:'items',\n    completed_count:'completed',\n  },",
"    items_count:'items',\n    completed_count:'completed',\n    back:'Back',\n    cat_daily:'Daily', cat_travel:'Travel', cat_shopping:'Shopping', cat_sports:'Sports', cat_leisure:'Leisure', cat_food:'Food & Drink', cat_health:'Health', cat_work:'Work', cat_other:'Other',\n    coffee_btn:'Buy Sue a Coffee', coffee_sub:'If this app helps you, please support me! Thank you!',\n    maintained_by:'Maintain by DeepSeek V4 Pro',\n  },",
1);
apply(
"    items_count:'項目',\n    completed_count:'完了',\n  },",
"    items_count:'項目',\n    completed_count:'完了',\n    back:'戻る',\n    cat_daily:'日常', cat_travel:'外出', cat_shopping:'買い物', cat_sports:'スポーツ', cat_leisure:'レジャー', cat_food:'食事', cat_health:'健康', cat_work:'仕事', cat_other:'その他',\n    coffee_btn:'Sueにコーヒーを奢る', coffee_sub:'このアプリがお役に立てたら、応援してください！ありがとう！',\n    maintained_by:'Maintain by DeepSeek V4 Pro',\n  },",
1);
apply(
"    items_count:'항목',\n    completed_count:'완료',\n  },",
"    items_count:'항목',\n    completed_count:'완료',\n    back:'뒤로',\n    cat_daily:'일상', cat_travel:'외출', cat_shopping:'쇼핑', cat_sports:'스포츠', cat_leisure:'여가', cat_food:'음식', cat_health:'건강', cat_work:'업무', cat_other:'기타',\n    coffee_btn:'Sue에게 커피 사주기', coffee_sub:'이 앱이 도움이 된다면 저를 응원해 주세요! 감사합니다!',\n    maintained_by:'Maintain by DeepSeek V4 Pro',\n  },",
1);
apply(
"    items_count:'éléments',\n    completed_count:'complétés',\n  },",
"    items_count:'éléments',\n    completed_count:'complétés',\n    back:'Retour',\n    cat_daily:'Quotidien', cat_travel:'Voyage', cat_shopping:'Courses', cat_sports:'Sport', cat_leisure:'Loisirs', cat_food:'Cuisine', cat_health:'Santé', cat_work:'Travail', cat_other:'Autre',\n    coffee_btn:'Offrir un café à Sue', coffee_sub:'Si cette application vous aide, soutenez-moi ! Merci !',\n    maintained_by:'Maintain by DeepSeek V4 Pro',\n  },",
1);
apply(
"    items_count:'Elemente',\n    completed_count:'erledigt',\n  },",
"    items_count:'Elemente',\n    completed_count:'erledigt',\n    back:'Zurück',\n    cat_daily:'Alltag', cat_travel:'Reisen', cat_shopping:'Einkaufen', cat_sports:'Sport', cat_leisure:'Freizeit', cat_food:'Essen', cat_health:'Gesundheit', cat_work:'Arbeit', cat_other:'Sonstiges',\n    coffee_btn:'Sue einen Kaffee kaufen', coffee_sub:'Wenn dir diese App hilft, unterstütze mich bitte! Danke!',\n    maintained_by:'Maintain by DeepSeek V4 Pro',\n  },",
1);
apply(
"    items_count:'elementos',\n    completed_count:'completados',\n  },",
"    items_count:'elementos',\n    completed_count:'completados',\n    back:'Atrás',\n    cat_daily:'Diario', cat_travel:'Viajes', cat_shopping:'Compras', cat_sports:'Deporte', cat_leisure:'Ocio', cat_food:'Comida', cat_health:'Salud', cat_work:'Trabajo', cat_other:'Otros',\n    coffee_btn:'Invita a Sue a un café', coffee_sub:'Si esta app te ayuda, ¡apóyame! ¡Gracias!',\n    maintained_by:'Maintain by DeepSeek V4 Pro',\n  },",
1);
apply(
"    items_count:'пунктов',\n    completed_count:'выполнено',\n  },",
"    items_count:'пунктов',\n    completed_count:'выполнено',\n    back:'Назад',\n    cat_daily:'Повседневное', cat_travel:'Поездки', cat_shopping:'Покупки', cat_sports:'Спорт', cat_leisure:'Досуг', cat_food:'Еда', cat_health:'Здоровье', cat_work:'Работа', cat_other:'Другое',\n    coffee_btn:'Купить Сью кофе', coffee_sub:'Если приложение вам помогает, поддержите меня! Спасибо!',\n    maintained_by:'Maintain by DeepSeek V4 Pro',\n  },",
1);
apply(
"    items_count:'itens',\n    completed_count:'concluídos',\n  },",
"    items_count:'itens',\n    completed_count:'concluídos',\n    back:'Voltar',\n    cat_daily:'Diário', cat_travel:'Viagem', cat_shopping:'Compras', cat_sports:'Esportes', cat_leisure:'Lazer', cat_food:'Comida', cat_health:'Saúde', cat_work:'Trabalho', cat_other:'Outros',\n    coffee_btn:'Pague um café para Sue', coffee_sub:'Se este aplicativo te ajuda, me apoie! Obrigado!',\n    maintained_by:'Maintain by DeepSeek V4 Pro',\n  },",
1);

/* ================= 块替换（JS） ================= */

replaceBlock(
'function renderTopbar(pageType){',
'/* ---------- 获取当前活动检查单 ---------- */',
"/* ---------- 顶栏渲染 ---------- */\nfunction renderTopbar(pageType){\n  const btnConfig = $('#btnConfig');\n  const btnSearch = $('#btnSearch');\n  const btnSettings = $('#btnSettings');\n\n  const setSettingsIcon = (icon, label, active)=>{\n    btnSettings.classList.toggle('is-active', !!active);\n    btnSettings.setAttribute('aria-label', t(label));\n    swapIcon(btnSettings.querySelector('.icon'), icon);\n  };\n\n  if(pageType==='home'){\n    const cl = getActiveChecklist();\n    if(cl){\n      setTopbarTitle(cl.name, t('app_suffix'));\n    }else{\n      setTopbarTitle(t('app_name'), '');\n    }\n    btnConfig.style.display='';\n    btnSearch.style.display='';\n    btnSettings.style.display='';\n    setSettingsIcon('settings', 'settings', false);\n    btnConfig.querySelector('.icon').textContent='menu';\n    btnConfig.setAttribute('aria-label', t('config'));\n    btnSearch.querySelector('.icon').textContent='search';\n    btnSearch.setAttribute('aria-label', t('search'));\n    // 配置按钮在有检查单时可用\n    btnConfig.style.opacity = cl? '1':'.38';\n    btnConfig.style.pointerEvents = cl? 'auto':'none';\n    btnSearch.style.opacity = cl? '1':'.38';\n    btnSearch.style.pointerEvents = cl? 'auto':'none';\n  }else if(pageType==='form'){\n    const editing = formMode==='edit';\n    setTopbarTitle(editing? t('edit_checklist') : t('new_checklist'), '');\n    btnConfig.style.display='none';\n    btnSearch.style.display='none';\n    btnSettings.style.display='';\n    if(editing){\n      // 编辑页：返回按钮（左箭头）\n      setSettingsIcon('arrow_back', 'back', true);\n    }else{\n      // 新建页：设置按钮\n      setSettingsIcon('settings', 'settings', true);\n    }\n  }else if(pageType==='settings'){\n    setTopbarTitle(t('settings'), '');\n    btnConfig.style.display='none';\n    btnSearch.style.display='none';\n    btnSettings.style.display='';\n    // 设置页：返回按钮（左箭头），返回进入设置前的页面\n    setSettingsIcon('arrow_back', 'back', true);\n  }\n  // 重置搜索栏状态\n  if(pageType!=='home'){\n    closeSearch(true);\n  }\n}\n"
);

replaceBlock(
'function renderHome(){',
'/* ---------- 完成检查项（带动画） ----------',
"/* ---------- 主页面渲染 ---------- */\nfunction renderHome(animateItems){\n  const container = $('#listContainer');\n  const resetFab = $('#btnResetList');\n  const cl = getActiveChecklist();\n\n  // 清空\n  container.innerHTML='';\n\n  if(!cl){\n    // 无检查单 - 自动跳到新建页面，不显示空状态\n    resetFab.classList.remove('visible');\n    if(currentPage==='home'){\n      openForm(null);\n    }\n    return;\n  }\n\n  const pendingItems = cl.items.filter(i=>!i.done);\n  if(cl.items.length===0 || pendingItems.length===0){\n    // 全部完成 - 显示重置 FAB\n    showHomeView('alldone');\n    resetFab.classList.add('visible');\n    return;\n  }\n\n  showHomeView('list');\n  resetFab.classList.remove('visible');\n\n  const settings = Store.state.settings;\n  // FLIP：记录旧位置\n  const oldRects = new Map();\n  $$('.check-item', container).forEach(node=>{\n    oldRects.set(node.dataset.id, node.getBoundingClientRect());\n  });\n\n  // 渲染待办项\n  pendingItems.forEach((item, idx)=>{\n    const isFirst = idx===0;\n    const useCustom = isFirst || !settings.firstOnly;\n    const height = useCustom? settings.itemHeight : 64;\n    const iconName = resolveIcon(item.icon, item.text);\n\n    const node = el('div', {class:'check-item', dataset:{id:item.id}});\n    node.style.height = height+'px';\n\n    const iconEl = el('span', {class:'icon ci-icon'}, iconName);\n    const textEl = el('div', {class:'ci-text'}, item.text);\n    const checkBtn = el('button', {class:'ci-check', 'aria-label':t('confirm'), onclick:(e)=>{\n      e.stopPropagation();\n      completeItem(cl.id, item.id);\n    }});\n    checkBtn.appendChild(el('span', {class:'icon ci-check-icon'}, 'check'));\n    // 附加水滴效果\n    attachRipple(checkBtn);\n\n    node.appendChild(iconEl);\n    node.appendChild(textEl);\n    node.appendChild(checkBtn);\n    container.appendChild(node);\n  });\n\n  // 重置后的进入动画（逐条上浮淡入）\n  if(animateItems){\n    $$('.check-item', container).forEach((node, i)=>{\n      node.classList.add('item-enter');\n      node.style.animationDelay = (i*40)+'ms';\n      node.addEventListener('animationend', ()=>node.classList.remove('item-enter'), {once:true});\n    });\n    return;\n  }\n\n  // FLIP 补位动画\n  requestAnimationFrame(()=>{\n    $$('.check-item', container).forEach(node=>{\n      const old = oldRects.get(node.dataset.id);\n      if(old){\n        const neW = node.getBoundingClientRect();\n        const dy = old.top - neW.top;\n        if(Math.abs(dy)>1){\n          node.style.transform = 'translateY('+dy+'px)';\n          node.style.transition='none';\n          requestAnimationFrame(()=>{\n            node.style.transition='';\n            node.style.transform='';\n          });\n        }\n      }\n    });\n  });\n}\n\nfunction showHomeView(view){\n  // 若视图类型相同，仅更新文本（用于语言切换时刷新文案）\n  if(view===currentHomeView){\n    if(view==='alldone'){\n      const dt = $('#allDoneView .done-title'), ds = $('#allDoneView .done-sub');\n      if(dt) dt.textContent = t('all_done_title');\n      if(ds) ds.textContent = t('all_done_sub');\n    }\n    return;\n  }\n  currentHomeView = view;\n\n  // 移除旧的完成视图\n  const oldDone = $('#allDoneView');\n  if(oldDone){ oldDone.classList.remove('show'); setTimeout(()=>oldDone.remove(), 400); }\n\n  if(view==='alldone'){\n    const v = el('div', {class:'all-done', id:'allDoneView'});\n    v.appendChild(el('span', {class:'icon big-icon'}, 'coffee'));\n    v.appendChild(el('div', {class:'done-title'}, t('all_done_title')));\n    v.appendChild(el('div', {class:'done-sub'}, t('all_done_sub')));\n    $('#listScroll').appendChild(v);\n    requestAnimationFrame(()=>v.classList.add('show'));\n  }\n}\n"
);

replaceBlock(
'function resetChecklist(clId){',
'/* ---------- 自动重置检查 ---------- */',
"/* ---------- 重置检查单 ---------- */\nfunction resetChecklist(clId){\n  const cl = Store.state.checklists.find(c=>c.id===clId);\n  if(!cl) return;\n  cl.items.forEach(i=>i.done=false);\n  cl.completedAt = null;\n  Store.save();\n  const doneView = $('#allDoneView');\n  if(doneView){\n    // 咖啡态向下移动并淡出，然后渲染列表\n    doneView.classList.remove('show');\n    doneView.classList.add('leaving');\n    setTimeout(()=>{\n      renderHome(true);\n      renderBottombar();\n    }, 350);\n  }else{\n    renderHome();\n    renderBottombar();\n  }\n  showToast(t('reset_toast'));\n}\n"
);

replaceBlock(
'/* 切换动画 token：用于中断之前的切换动画 */',
'/* ---------- 新建/编辑表单 ---------- */',
"/* 切换动画 token：用于中断之前的切换动画 */\nlet switchAnimToken = 0;\nfunction switchChecklist(clId){\n  // 若目标检查单正在被编辑：保持或回到编辑页面\n  if(Store.state._editing===clId){\n    if(currentPage==='form'){\n      if(formMode==='edit'){\n        // 已在编辑页编辑该检查单：仅同步激活状态\n        if(Store.state.activeChecklistId!==clId) Store.set({activeChecklistId:clId});\n        renderBottombar();\n        return;\n      }\n      openForm(clId);\n      return;\n    }\n    if(currentPage==='home'){\n      openForm(clId);\n      return;\n    }\n  }\n  const oldId = Store.state.activeChecklistId;\n  if(oldId === clId && currentPage === 'home') return;\n  const lists = Store.state.checklists;\n  const oldIdx = lists.findIndex(c=>c.id===oldId);\n  const newIdx = lists.findIndex(c=>c.id===clId);\n  const goRight = newIdx > oldIdx;\n\n  // 中断之前的切换动画\n  switchAnimToken++;\n  const myToken = switchAnimToken;\n\n  Store.set({activeChecklistId:clId});\n  const fromOtherPage = currentPage!=='home';\n  if(fromOtherPage) switchPage('home');\n  renderTopbar('home');\n  renderBottombar();\n  closeSearch(true);\n\n  // 丝滑左右滑动切换：整个滚动区（含咖啡态）滑出 → 渲染新内容 → 滑入\n  const scroller = $('#listScroll');\n  if(scroller && oldId !== clId && !fromOtherPage){\n    const dir = goRight ? -1 : 1;\n    const enterDir = goRight ? 1 : -1;\n    // 1. 旧内容滑出（150ms 加速）\n    scroller.style.transition = 'transform 150ms cubic-bezier(.3,0,.8,.15), opacity 120ms cubic-bezier(.3,0,.8,.15)';\n    scroller.style.transform = 'translateX('+dir*40+'px)';\n    scroller.style.opacity = '0';\n    setTimeout(()=>{\n      if(myToken !== switchAnimToken) return; // 被中断\n      // 2. 渲染新内容并回到顶部\n      renderHome();\n      scroller.style.scrollBehavior='auto';\n      scroller.scrollTop=0;\n      // 3. 从反方向无过渡定位\n      scroller.style.transition = 'none';\n      scroller.style.transform = 'translateX('+enterDir*40+'px)';\n      scroller.style.opacity = '0';\n      // 4. 滑入（300ms 减速）\n      requestAnimationFrame(()=>requestAnimationFrame(()=>{\n        if(myToken !== switchAnimToken) return; // 被中断\n        scroller.style.transition = 'transform 300ms cubic-bezier(.05,.7,.1,1), opacity 250ms cubic-bezier(.05,.7,.1,1)';\n        scroller.style.transform = 'translateX(0)';\n        scroller.style.opacity = '1';\n        setTimeout(()=>{\n          if(myToken !== switchAnimToken) return;\n          scroller.style.transition = '';\n          scroller.style.transform = '';\n          scroller.style.opacity = '';\n          scroller.style.scrollBehavior='';\n        }, 320);\n      }));\n    }, 150);\n  }else{\n    renderHome();\n    if(scroller){\n      scroller.style.scrollBehavior='auto';\n      scroller.scrollTop=0;\n      scroller.style.scrollBehavior='';\n    }\n  }\n}\n"
);

replaceBlock(
'function openForm(checklistId){',
'/* 渲染检查单图标选择行（6常用 + 预览/更多） */',
"/* ---------- 新建/编辑表单 ---------- */\nfunction openForm(checklistId){\n  // checklistId 为 null 表示新建\n  Store.state._editing = checklistId;\n  formMode = checklistId ? 'edit' : 'new';\n  if(checklistId){\n    const cl = Store.state.checklists.find(c=>c.id===checklistId);\n    if(!cl){ openForm(null); return; }\n    Store.state.activeChecklistId = checklistId;\n    Store.save();\n    formState = {\n      name:cl.name,\n      icon:cl.icon||'auto',\n      resetHours:cl.resetHours||0,\n      items: cl.items.map(i=>({id:i.id, text:i.text, icon:i.icon||'auto', done:i.done}))\n    };\n  }else{\n    formState = {name:'', icon:'auto', resetHours:0, items:[{id:uid(), text:'', icon:'auto'}]};\n  }\n  if(currentPage === 'form'){\n    // 已在表单页（如从编辑切到新建）：用淡入动画过渡\n    const content = $('#formContent');\n    content.style.transition = 'opacity 150ms cubic-bezier(.3,0,.8,.15)';\n    content.style.opacity = '0';\n    setTimeout(()=>{\n      renderForm();\n      renderTopbar('form');\n      renderBottombar();\n      content.style.transition = 'none';\n      content.style.opacity = '0';\n      requestAnimationFrame(()=>{\n        content.style.transition = 'opacity 250ms cubic-bezier(.05,.7,.1,1)';\n        content.style.opacity = '1';\n      });\n    }, 150);\n  }else{\n    renderForm();\n    switchPage('form');\n    renderTopbar('form');\n    renderBottombar();\n  }\n}\n"
);

replaceBlock(
'function renderChecklistIconRow(){',
'function renderForm(){',
"function renderChecklistIconRow(){\n  const row = el('div', {class:'icon-circle-row', id:'checklistIconRow'});\n  // 计算当前实际显示的图标\n  const isAuto = formState.icon==='auto';\n  const autoIcon = autoIconFor(formState.name);\n  const autoInCommon = CHECKLIST_COMMON_ICONS.includes(autoIcon);\n\n  CHECKLIST_COMMON_ICONS.forEach(ic=>{\n    // 选中状态：手动选了该图标，或 auto 模式下该图标恰好是自动图标\n    const sel = (!isAuto && formState.icon===ic) || (isAuto && autoInCommon && ic===autoIcon);\n    const btn = el('button', {class:'icon-circle-btn'+(sel?' selected':''), dataset:{icon:ic}, onclick:()=>{\n      // 点击已选中的图标时取消选择（回到 auto）；否则选择该图标\n      if(formState.icon===ic){\n        formState.icon = 'auto';\n      }else{\n        formState.icon = ic;\n      }\n      refreshChecklistIconRow();\n    }});\n    btn.appendChild(el('span', {class:'icon'}, ic));\n    attachRipple(btn);\n    row.appendChild(btn);\n  });\n  // 更多按钮：打开完整图标选择弹窗\n  const moreBtn = el('button', {class:'icon-circle-btn', dataset:{more:'1'}, onclick:()=>openIconPicker('checklist')});\n  moreBtn.appendChild(el('span', {class:'icon'}, 'more_horiz'));\n  attachRipple(moreBtn);\n  row.appendChild(moreBtn);\n  // 如果 auto 模式且自动图标不在常用列表中，在更多按钮前插入高亮预览按钮\n  if(isAuto && !autoInCommon){\n    const previewBtn = el('button', {class:'icon-circle-btn selected preview-btn', dataset:{icon:autoIcon}, onclick:()=>openIconPicker('checklist')});\n    previewBtn.appendChild(el('span', {class:'icon'}, autoIcon));\n    attachRipple(previewBtn);\n    row.insertBefore(previewBtn, moreBtn);\n  }\n  // 如果手动选了非常用图标，也显示预览按钮\n  if(!isAuto && !CHECKLIST_COMMON_ICONS.includes(formState.icon)){\n    const previewBtn = el('button', {class:'icon-circle-btn selected preview-btn', dataset:{icon:formState.icon}, onclick:()=>{\n      // 点击预览按钮取消选择（回到 auto）\n      formState.icon = 'auto';\n      refreshChecklistIconRow();\n    }});\n    previewBtn.appendChild(el('span', {class:'icon'}, formState.icon));\n    attachRipple(previewBtn);\n    row.insertBefore(previewBtn, moreBtn);\n  }\n  return row;\n}\n/* 刷新检查单图标行（原地更新 + 图标切换动画，不重新渲染整个表单，保持输入焦点） */\nfunction refreshChecklistIconRow(){\n  const row = $('#checklistIconRow');\n  if(!row) return;\n  const isAuto = formState.icon==='auto';\n  const autoIcon = autoIconFor(formState.name);\n  const autoInCommon = CHECKLIST_COMMON_ICONS.includes(autoIcon);\n  const moreBtn = row.querySelector('[data-more]');\n  const prev = row.querySelector('.preview-btn');\n  // 更新常用图标选中状态\n  $$('.icon-circle-btn', row).forEach(btn=>{\n    if(btn===moreBtn || btn.classList.contains('preview-btn')) return;\n    const ic = btn.dataset.icon;\n    const sel = (!isAuto && formState.icon===ic) || (isAuto && autoInCommon && ic===autoIcon);\n    btn.classList.toggle('selected', sel);\n  });\n  const wantPreview = (isAuto && !autoInCommon) || (!isAuto && !CHECKLIST_COMMON_ICONS.includes(formState.icon));\n  const wantIcon = isAuto? autoIcon : formState.icon;\n  if(wantPreview){\n    if(prev){\n      prev.classList.add('selected');\n      if(prev.dataset.icon !== wantIcon){\n        prev.dataset.icon = wantIcon;\n        swapIcon(prev.querySelector('.icon'), wantIcon);\n      }\n    }else{\n      // 新建预览按钮：放大淡入\n      const previewBtn = el('button', {class:'icon-circle-btn selected preview-btn pop-in', dataset:{icon:wantIcon}, onclick:()=>{\n        if(isAuto){ openIconPicker('checklist'); }else{ formState.icon='auto'; refreshChecklistIconRow(); }\n      }});\n      previewBtn.appendChild(el('span', {class:'icon'}, wantIcon));\n      attachRipple(previewBtn);\n      row.insertBefore(previewBtn, moreBtn);\n    }\n  }else if(prev){\n    // 移除预览按钮：缩小淡出\n    prev.style.transition = 'transform 200ms var(--md-easing-emphasized-accelerate), opacity 180ms var(--md-easing-standard-accelerate)';\n    prev.style.transform = 'scale(.6)';\n    prev.style.opacity = '0';\n    setTimeout(()=>{ prev.remove(); }, 220);\n  }\n}\n"
);

replaceBlock(
'function handleExport(){',
'/* ---------- 导入检查单 ---------- */',
"/* ---------- 导出检查单（.checklist 文件，内容为 JSON；兼容 HBuilderX 打包 APK） ---------- */\nfunction buildExportPayload(cl){\n  return JSON.stringify({\n    name: cl.name,\n    icon: cl.icon,\n    resetHours: cl.resetHours,\n    items: cl.items.map(i=>({ text:i.text, icon:i.icon }))\n  }, null, 2);\n}\nfunction downloadViaAnchor(json, filename){\n  const blob = new Blob([json], {type:'application/octet-stream'});\n  const url = URL.createObjectURL(blob);\n  const a = document.createElement('a');\n  a.href = url;\n  a.download = filename;\n  a.rel = 'noopener';\n  document.body.appendChild(a);\n  a.click();\n  showToast(t('export_success'));\n  setTimeout(()=>{\n    document.body.removeChild(a);\n    URL.revokeObjectURL(url);\n  }, 1000);\n}\nfunction handleExport(){\n  const editing = Store.state._editing;\n  const cl = Store.state.checklists.find(c=>c.id===editing);\n  if(!cl){ showToast(t('export_fail')); return; }\n  const filename = (cl.name || 'checklist').replace(/[\\\\/:*?\"<>|]/g,'_') + '.checklist';\n  const json = buildExportPayload(cl);\n  // HBuilderX 5+ App（APK）：写入公共下载目录，保证导出可用\n  if(window.plus && window.plus.io){\n    try{\n      const isAndroid = plus.os && plus.os.name === 'Android';\n      const base = (isAndroid && plus.io.PUBLIC_DOWNLOADS) ? plus.io.PUBLIC_DOWNLOADS : plus.io.PRIVATE_DOC;\n      plus.io.requestFileSystem(base, function(fs){\n        fs.root.getFile(filename, {create:true}, function(fileEntry){\n          fileEntry.createWriter(function(writer){\n            writer.onwrite = function(){ showToast(t('export_success')); };\n            writer.onerror = function(){ showToast(t('export_fail')); };\n            writer.write(json);\n          }, function(){ showToast(t('export_fail')); });\n        }, function(){ downloadViaAnchor(json, filename); });\n      }, function(){ downloadViaAnchor(json, filename); });\n      return;\n    }catch(e){\n      downloadViaAnchor(json, filename);\n      return;\n    }\n  }\n  downloadViaAnchor(json, filename);\n}\n"
);

// 1/3/8. 返回辅助 + 外链 + 图标切换动画 + 标题渐隐
apply(
"/* ---------- 页面切换 ---------- */\nlet currentPage = 'home'; // home | form | settings",
"/* ---------- 顶栏返回/设置跳转辅助 ---------- */\nlet settingsFromPage = 'home'; // 从哪个页面进入设置\nfunction openSettingsFrom(fromPage){\n  settingsFromPage = fromPage;\n  renderSettings();\n  switchPage('settings');\n  renderTopbar('settings');\n  renderBottombar();\n}\nfunction goBackFromSettings(){\n  if(settingsFromPage==='form'){\n    renderForm();\n    switchPage('form');\n    renderTopbar('form');\n    renderBottombar();\n  }else{\n    switchPage('home');\n    renderTopbar('home');\n    renderHome();\n    renderBottombar();\n  }\n}\n/* ---------- 外部链接（HBuilderX APK 用系统默认浏览器打开） ---------- */\nfunction openExternal(url){\n  if(window.plus && window.plus.runtime && typeof plus.runtime.openURL==='function'){\n    try{ plus.runtime.openURL(url); return; }catch(e){}\n  }\n  const w = window.open(url, '_blank', 'noopener');\n  if(!w){\n    const a = document.createElement('a');\n    a.href = url; a.target = '_blank'; a.rel = 'noopener';\n    document.body.appendChild(a); a.click(); document.body.removeChild(a);\n  }\n}\n/* ---------- 图标切换动画（放大→换图标→缩回） ---------- */\nfunction swapIcon(iconEl, nextIcon){\n  if(!iconEl || iconEl.textContent === nextIcon) return;\n  const token = (iconEl._swapT = (iconEl._swapT||0)+1);\n  const t = token;\n  iconEl.style.transition = 'transform 110ms var(--md-easing-standard-accelerate)';\n  iconEl.style.transform = 'scale(1.35)';\n  setTimeout(()=>{\n    if(iconEl._swapT !== t) return;\n    iconEl.textContent = nextIcon;\n    iconEl.style.transition = 'transform 240ms var(--md-easing-emphasized-decelerate)';\n    iconEl.style.transform = 'scale(1)';\n    setTimeout(()=>{\n      if(iconEl._swapT === t){ iconEl.style.transition=''; iconEl.style.transform=''; }\n    }, 250);\n  }, 110);\n}\n/* ---------- 顶栏标题渐隐切换 ---------- */\nfunction setTopbarTitle(text, suffix){\n  const wrap = $('#topbarTitle');\n  const tEl = $('#topbarTitleText');\n  const sEl = $('#topbarTitleSuffix');\n  if(tEl.textContent===text && sEl.textContent===suffix) return;\n  wrap.style.transition = 'opacity 100ms var(--md-easing-standard-accelerate)';\n  wrap.style.opacity = '0';\n  setTimeout(()=>{\n    tEl.textContent = text;\n    sEl.textContent = suffix;\n    wrap.style.transition = 'opacity 200ms var(--md-easing-emphasized-decelerate)';\n    wrap.style.opacity = '1';\n    setTimeout(()=>{ wrap.style.transition=''; wrap.style.opacity=''; }, 220);\n  }, 100);\n}\n\n/* ---------- 页面切换 ---------- */\nlet currentPage = 'home'; // home | form | settings",
1);

/* ================= 5. AUTO_ICON_KEYWORDS 块生成 ================= */
(function generateKeywords(){
  const libStart = html.indexOf('const ICON_LIBRARY = {');
  const libEnd = html.indexOf('\n};', libStart);
  if (libStart < 0 || libEnd < 0) { console.error('ICON_LIBRARY not found'); fail++; return; }
  let libObj;
  try { libObj = eval('(' + html.slice(libStart + 'const ICON_LIBRARY = '.length, libEnd) + '})'); }
  catch(e){ console.error('ICON_LIBRARY eval failed: ' + e.message); fail++; return; }
  const ICON_LIST = Object.values(libObj).flat();

  const LANGS = ['zh-CN','zh-TW','en','ja','ko','fr','de','es','ru','pt'];
  const badIcons = new Set();
  ROWS.forEach(([icon, cells])=>{
    if (!ICON_LIST.includes(icon)) badIcons.add(icon);
    LANGS.forEach(l=>{ if(!cells[l] || !cells[l].trim()) console.error('empty cell: ' + icon + ' / ' + l); });
  });
  if (badIcons.size) { console.error('rows referencing icons not in library: ' + [...badIcons].join(',')); fail++; }

  const out = {};
  LANGS.forEach(l=>{ out[l] = []; });
  ROWS.forEach(([icon, cells])=>{
    LANGS.forEach(l=>{
      cells[l].split('|').forEach(kw=>{
        kw = kw.trim();
        if(kw) out[l].push([kw.toLowerCase(), icon]);
      });
    });
  });
  const counts = {};
  LANGS.forEach(l=>{ counts[l] = out[l].length; });
  console.log('keywords per language:', JSON.stringify(counts));
  LANGS.forEach(l=>{ if(counts[l] < 200){ console.error('LANG ' + l + ' below 200 keywords'); fail++; } });

  let block = '/* ---------- 自动图标映射（按语言索引的关键词库） ----------\n   每种语言至少 200 个关键词（zh-CN/zh-TW/en/ja/ko/fr/de/es/ru/pt）。\n   匹配时先查当前语言，再回退英语；西文关键词按整词边界匹配（忽略大小写与重音），\n   中文、日文、韩文、俄文等按子串包含匹配。 */\nconst AUTO_ICON_KEYWORDS = {\n';
  LANGS.forEach((l, i)=>{
    block += "  '" + l + "': " + JSON.stringify(out[l]) + (i < LANGS.length-1 ? ',\n' : '\n');
  });
  block += '};';

  const s = html.indexOf('/* ---------- 自动图标映射（根据关键词选图标）');
  const e = html.indexOf('/* ---------- 多语言 i18n ---------- */');
  if (s < 0 || e < 0 || s >= e) { console.error('AUTO block markers not found'); fail++; return; }
  html = html.slice(0, s) + block + '\n\n' + html.slice(e);
})();

/* ================= CSS 补丁 ================= */
CSS_PATCHES.forEach(([oldStr, newStr, expect])=>apply(oldStr, newStr, expect));

/* ================= 最终校验 ================= */
[
  'Release v0.9.0', 'formMode', 'goBackFromSettings', 'openSettingsFrom', 'openExternal',
  'support-card', 'PUBLIC_DOWNLOADS', '.checklist', "a.download = filename", 'item-enter',
  'grid-area:rail', 'Maintain by DeepSeek V4 Pro', 'arrow_back', 'cat_daily',
  'swapIcon', 'settingsFromPage', 'all-done.leaving', 'AUTO_ICON_KEYWORDS'
].forEach(mark=>{
  if (html.indexOf(mark) < 0) { console.error('FINAL CHECK MISSING: ' + mark); fail++; }
});
// 不应残留
["class:'icon-category-title'}, category)"].forEach(mark=>{
  if (html.indexOf(mark) >= 0) { console.error('FINAL CHECK LEFTOVER: ' + mark); fail++; }
});

if (fail > 0) { console.error('ABORT: ' + fail + ' patch problems, file NOT written'); process.exit(1); }
fs.writeFileSync(HTML_PATH, html, 'utf8');
console.log('OK: upgraded written, size = ' + html.length);

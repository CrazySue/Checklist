# Guia do desenvolvedor da Lista de verificação

> [!TIP]
> Este documento é um guia técnico para programadores: arquitetura, pipeline de construção, testes e armadilhas.  
> Para a apresentação do projeto, recursos e formas de download, consulte o [README](https://github.com/CrazySue/Checklist/blob/main/docs/readme/README-pt.md).  

> Versão atual: `Release v1.0.0` ｜ Repositório: https://github.com/CrazySue/Checklist

---

## 🏗️ Visão geral da arquitetura

### 🧱 Estrutura de ficheiro único

A aplicação é **um único ficheiro HTML** (cerca de 40 MB), dividido internamente em quatro camadas, de cima para baixo:

| Área | Conteúdo |
| --- | --- |
| `<style id="embedded-fonts">` no `<head>` | 3 blocos `@font-face` (HarmonyOS Sans SC 400/500/700 + Material Symbols Rounded), incorporados em base64, `font-display:swap` |
| `<style>` principal no `<head>` | Todo o CSS: tokens de design → estilos de componentes → animações → responsivo (incluindo a barra lateral esquerda `html.landscape` no modo paisagem) |
| `<body>` | Esqueleto da aplicação: barra superior / barra de pesquisa / três contentores de página empilhados com posicionamento absoluto / barra inferior + modais (seletor de ícones, seletor de idioma, Toast) |
| `<script>` | Todo o JavaScript (cerca de 3800 linhas): estado → utilitários → i18n → tema/layout → renderização → formulários → troca de dados → configurações → arranque |

### 🔀 Fluxo de dados

Um modelo híbrido de **"estado centralizado + funções de renderização + animação com manipulação direta do DOM"**:

```text
Interação do utilizador
   │
   ├── Alteração de dados ──→ Store.save() (persistido em localStorage)
   │                          └──→ Chamada explícita de renderXxx() para re-renderizar a área correspondente
   │
   └── Alteração puramente visual (assinalar, mudança de página, ripple) ──→ manipular o DOM / estilos inline diretamente (sem re-renderização)
```

> [!WARNING]
> Qualquer alteração de estado que envolva animação **deve manipular o DOM diretamente** — não dispare uma re-renderização completa.

### 🗂️ Modelo de estado

Persistido sob a chave `checklist_app_state_v1` do `localStorage`:

```js
state = {
  checklists: [
    { id, name, icon, resetHours,          // icon: 'auto' | nome do ícone
      items: [{ id, text, icon, done }],
      completedAt, createdAt }
  ],
  activeChecklistId: id | null,
  settings: {
    theme: 'auto' | 'light' | 'dark',
    itemHeight: 64,        // 56~120
    firstOnly: false,      // aplicar a altura personalizada apenas ao primeiro item
    language: 'auto' | 'zh-CN' | 'zh-TW' | 'en' | 'ja' | 'ko' | 'fr' | 'de' | 'es' | 'ru' | 'pt'
  }
}
```

O estado transitório (não persistido) vive em variáveis ao nível do módulo: `currentPage`, `formMode` (`'new'|'edit'`), `formState`, `settingsFromPage`, `titleFlipDir`, `titleAnimToken`, `switchAnimToken`, `currentHomeView`, etc.

---

## 📂 Estrutura do repositório (GitHub)

```text
.
├── .github/              Código de conduta e modelos de Issue
├── docs/                 Documentação
├── build/                Pipelines de patch, dados-mestre de palavras-chave e suites de testes
├── README.md             Ficheiro README
└── LICENSE.txt           Licença
```

---

## 🚀 Ambiente e primeiros passos nos testes

### 📦 Requisitos de ambiente

- Para executar a aplicação: qualquer navegador moderno / APK empacotado com o HBuilderX;
- Para construir e testar: Node.js ≥ 16 (validado no Node 24); `build/node_modules` inclui a dependência jsdom.

### 🧪 Executar os testes

```bash
node build/_extract099.js && node --check build/_check099.js   # verificação de sintaxe
node build/_sim099.js                                          # simulação de comportamento do utilizador (73 asserções)
node build/_smoke099.js && node build/_smoke099b.js            # testes de regressão
```

Tudo tem de produzir `ALL PASS` e `uncaught errors: 0` para ser considerado aprovado.

---

## 🛠️ Pipeline de construção e fluxo de trabalho de desenvolvimento

### 🔁 Pipeline de patches de versão

Uma atualização de versão = aplicar scripts de patch Node ao HTML da versão anterior. O `apply(old, new, count)` de cada script valida a contagem de correspondências e aborta a escrita se alguma não corresponder.

| Script | Função |
| --- | --- |
| `upgrade_v09.js` + `patch_v09_css.js` + `keywords_v09.js` + `embed_font_v09.js` + `rebuild_v09.js` | 0.8.0 → 0.9.0 |
| `upgrade_v095.js` / `upgrade_v095b.js` | → 0.9.5 |
| `upgrade_v096.js` / `upgrade_v096b.js` | → 0.9.6 |
| `upgrade_v097.js` | → 0.9.7 |
| `upgrade_v098.js` | → 0.9.8 |
| `upgrade_v099.js` + `upgrade_v099b.js` + `upgrade_v099c.js` + `remove_icons_v099.js` | → 0.9.9 |
| `upgrade_v100.js` | → 1.0.0 |

### ✏️ A forma correta de modificar o código

1. Edite diretamente o HTML da versão de destino (ficheiro único, o que vê é o que obtém);
2. **Espelhe a alteração no `upgrade_vXXX.js` correspondente** (para garantir que as versões antigas podem ser reconstruídas de uma só vez);
3. Só faça commit depois de a verificação de sintaxe e a simulação/regressão estarem todas verdes.

### 🎛️ Adicionar/remover ícones e palavras-chave

- Biblioteca de ícones: `ICON_LIBRARY` (chaves de categoria `daily / travel / shopping / sports / leisure / food / health / work / other`);
- Adicionar um ícone: acrescente o nome do ícone ao array da categoria → acrescente `[icon, {idioma: 'palavra-chave|palavra-chave'}]` em `build/keywords_v09.js` → reconstrua o bloco `AUTO_ICON_KEYWORDS`;
- Remover um ícone: elimine-o da biblioteca e dos dados de palavras-chave e reconstrua (consulte `remove_icons_v099.js`);
- Validação: ≥ 200 palavras-chave por idioma; cada nome de ícone tem de existir no tipo de letra incorporado e no `ICON_LIBRARY`.

### 🌍 Adicionar um idioma

Adicione um novo dicionário ao `I18N` (mesmo conjunto de chaves que os outros idiomas) → registe-o em `LANGUAGES` → complete a biblioteca de palavras-chave com ≥ 200 palavras → `getLang()` (auto → correspondência exata → correspondência por prefixo → fallback para zh-CN).

---

## 🧩 Estrutura de código em detalhe

### 🎨 Tokens de design e camadas CSS

```css
:root{
  --brand-1:#10172F; --brand-2:#283558; --brand-3:#525288; --brand-4:#A5A8BA;  /* quatro cores da marca */
  --md-primary:#525288; --md-primary-container:#E1E0FF; …                         /* paleta derivada do MD3 */
  --md-easing-standard / emphasized / accelerated / decelerated;                  /* tokens de movimento */
  --md-dur-short:150ms; --md-dur-medium:250ms; --md-dur-long:400ms;
}
```

Camadas CSS: reset → tipos de letra → tokens → movimento → esqueleto → barra superior → contentores de página → itens da lista → barra inferior → botões/FAB → formulários → pesquisa → configurações → modais/Toast → responsivo. O tema escuro é implementado ao sobrescrever variáveis através de `[data-theme="dark"]`; todas as alterações de cor transitam suavemente através de `*{transition-property:…;transition-duration:.25s}`.

### ⚙️ Mapa de módulos JS

| Área | Funções principais |
| --- | --- |
| Estado | `Store` (load/save/set) |
| Utilitários | `$` `$$` `el` `uid` `attachRipple` `initGlobalRipple` |
| Correspondência de ícones | `normText` `latinMatch` `autoIconFor` `resolveIcon` |
| i18n | `getLang` `t` |
| Tema/layout | `applyTheme` `updateLayout` |
| Barra superior | `renderTopbar` `setTopbarTitle` |
| Página inicial | `renderHome` `showHomeView` `completeItem` `resetChecklist` `checkAutoReset` |
| Barra inferior/mudança de página | `renderBottombar` `switchChecklist` `switchPage` |
| Formulários | `openForm` `renderForm` `renderFormItems` `appendFormItem` `refreshChecklistIconRow` |
| Troca de dados | `handleExport` `downloadViaAnchor` `finishImport` `handleImport` |
| Configurações | `renderSettings` `toggleDropdown` `openLanguageMenu` |
| Modais | `openIconPicker` `renderIconPickerGrid` `selectIcon` |
| Navegação | `openSettingsFrom` `goBackFromSettings` `openExternal` |
| Utilitários de animação | `swapIcon` `popIcon` `smoothCenter` |
| Arranque | `bindEvents` `updateStaticLabels` `init` |

### ✨ Sistema de animação

- **Padrão de token de interrupção**: todas as animações interrompíveis (mudança de página, título, rolagem, troca de ícones) mantêm um token crescente; os callbacks agendados validam primeiro o token e saem silenciosamente quando são interrompidos por uma animação mais recente;
- **Mudança de página/alternância**: o conteúdo antigo desliza para fora 40px com aceleração ao longo de 150ms + desvanecimento → o conteúdo novo desliza para dentro 40px a partir da direção oposta com desaceleração ao longo de 300ms (o mesmo padrão em `switchPage` e `switchChecklist`);
- **Viragem do título**: todo o título vira para fora ao longo de 140ms → vira para dentro com desaceleração ao longo de 240ms, com a direção decidida pela direção da mudança de página (para a frente = para cima, para trás = para baixo);
- **Página de café**: a entrada/saída usa `@keyframes` (fiável no Android); ao alternar entre listas de verificação, é tratado como um "item especial da lista" e vira com a área de rolagem (o caminho `instant` desativa a sua própria animação);
- **FLIP**: concluir um item da lista conduz à contração de altura através de transições CSS, sem re-renderização completa.

---

## 📱 Empacotamento do APK (HBuilderX)

### 📦 Passos

Crie um novo projeto 5+ App (nome do pacote `com.crazysue.checklist`) → coloque o HTML como página de entrada → edite o manifest.json → empacotamento na nuvem/offline → certificado → empacote.

### 🔌 APIs plus utilizadas

| API | Utilização |
| --- | --- |
| `plus.io.requestFileSystem(plus.io.PRIVATE_DOC, …)` | Exporta o .checklist para o diretório privado da aplicação (**não volte à abordagem do diretório público**) |
| `plus.runtime.openURL(url)` | Abre ligações externas no navegador predefinido do sistema |
| `plus.os.name` | Deteção de plataforma (a importação no Android **não** filtra com `accept`) |

### ⚠️ Lista de verificação de armadilhas da plataforma

- A entrada de ficheiros no Android tem de remover o `accept`, caso contrário nenhum ficheiro fica selecionável no seletor do sistema;
- Escrever na pasta pública Download no Android 10+ (caminho File / MediaStore / SAF) falha por completo em alguns dispositivos (ficheiros de 0 bytes) — o v1.0 acabou por recuar para o diretório privado da aplicação;
- `window.open(url,'_blank','noopener')` abre dois separadores — para ligações externas, use âncoras ou `plus.runtime.openURL`;
- `scrollTo({behavior:'smooth'})` falha silenciosamente em WebViews antigas — a rolagem personalizada usa rAF + easing a escrever diretamente em `scrollTop`;
- `screen.orientation` reflete o monitor em vez da janela — a deteção de retrato/paisagem usa apenas a proporção da própria janela;
- As animações críticas de entrada/saída usam `@keyframes` em vez de transições de "estado inicial → troca de classe";
- inline-block colapsa os espaços iniciais — os sufixos do título permanecem inline;
- Remover o ripple imediatamente no pointerup parece rápido demais — deixe-o continuar a tocar até ao fim depois de soltar.

---

## 🧠 Decisões técnicas importantes e armadilhas

| Tópico | Decisão | Justificação |
| --- | --- | --- |
| Modelo de direção das páginas | As páginas Nova/Configurações deslizam sempre para dentro a partir da direita; as páginas de lista de verificação deslizam a partir da esquerda; o "voltar" de Configurações para Nova inverte a direção | Coerente com o modelo mental do utilizador |
| Estado final da animação do título | Todo o título (nome + "Lista de verificação") vira para cima/para baixo em conjunto, aplicado a todas as páginas | A abordagem inicial em duas vias de "viragem do nome + movimento do sufixo" causava problemas recorrentes de teletransporte/sobreposição |
| Página de café | Vira com a área de rolagem na alternância; na reposição, move-se para baixo e desvanece | Aparência unificada de mudança de página |
| Linha em branco automática | O fim tem sempre uma linha automática sem botão de eliminar; limpar o item anterior remove-a com animação; limpar o primeiro item nunca a elimina | Equilíbrio entre a experiência de introdução e "sem botões invisíveis" |
| Exportação | Diretório privado da aplicação (APK) / download por âncora (Web) | Fiável em todas as versões do Android |
| Palavras-chave de ícones | 630+ palavras por idioma, idioma atual em primeiro lugar com fallback para o inglês, correspondência de palavras inteiras para escritas ocidentais | Equilíbrio entre taxa de acerto e falsos positivos |

---

## 🧪 Guia de testes

### 🧰 Cadeia de ferramentas

- **jsdom**: remove os recursos base64 antes de carregar o HTML para acelerar; `beforeParse` injeta sementes de estado e polyfills (`scrollIntoView`/`matchMedia`/`URL.createObjectURL`, etc.);
- **`_sim099.js`**: simulação de comportamento — eventos DOM reais conduzem fluxos de utilizador completos, e os estados intermédios da animação são amostrados para afirmar a temporização;
- **`_smoke099.js` / `_smoke099b.js`**: regressão funcional + verificações ao nível de strings do código.

### 📝 Exemplo de caso de simulação

```js
// beforeParse: semente de estado + mock de geometria de layout
window.localStorage.setItem('checklist_app_state_v1', JSON.stringify(state));
window.Element.prototype.getBoundingClientRect = function(){ /* retorna conforme necessário */ };
// eventos reais conduzem o fluxo + asserções por amostragem de estados intermédios
input.focus(); input.value='beber água';
input.dispatchEvent(new w.Event('input', {bubbles:true}));
await sleep(60); check('a linha automática em branco desaparece com animação', !!document.querySelector('.form-item.removing'));
```

### ✅ Lista de verificação pré-lançamento

- [ ] `node --check` passa na verificação de sintaxe;
- [ ] `_sim099.js` verde duas vezes seguidas;
- [ ] `_smoke099.js` e `_smoke099b.js` totalmente verdes;
- [ ] grep confirma o número de versão, os resíduos de itens eliminados e os marcadores de APIs importantes;
- [ ] Verificação em dispositivo real: exportar/importar/ligações externas/claro e escuro/retrato e paisagem/viragem do título/ripple.

---

## 🎨 Referência rápida das normas de design (MD3)

- Quatro cores do tema: `#10172F` `#283558` `#525288` `#A5A8BA`; o tema claro deriva da semente `#525288` e o tema escuro de `#283558`;
- Camadas de estado: preto transparente a 8% em hover / 12% em active;
- Tipo de letra: HarmonyOS Sans SC (400/500/700, **não subconjunte** — o conteúdo do utilizador pode conter qualquer caractere han);
- Ícones: Material Symbols Rounded (tipo de letra variável, `font-variation-settings` controla FILL/wght), têm de vir do Google Fonts;
- Movimento: só são permitidas viragens para dentro/desvanecimentos/ripple/escala; aparecer ou desaparecer do nada é proibido; easing e durações usam sempre os tokens;
- Interruptor: especificação 0.8.0 (desligado 12px / ligado 24px), sem esticar ao pressionar, transição não linear emphasized.

---

## 📜 Histórico de versões

| Versão | Destaques |
| ----- | ------------------------------------------------------------------------- |
| 0.7.0 | Primeira versão utilizável (grande demais para carregar no GitHub)                                              |
| 0.8.0 | Linha de base da revisão inicial                                                                    |
| 0.9.0 | Foco na barra inferior, mudança de página com a página de café, navegação da página de edição, categorias de ícones localizadas, 200+ palavras-chave/idioma, exportação .checklist, botão de patrocínio, corte do ripple, barra lateral esquerda no modo paisagem, Bold incorporado |
| 0.9.5 | Regras de direção da mudança de página, viragem editar↔nova, especificação do interruptor, linhas em branco automáticas, animação de deslocamento do título                                          |
| 0.9.6 | Direção de voltar nas configurações, exportação/importação no Android, viragem vertical do título, transição do modo escuro, reescrita da deteção de paisagem                                         |
| 0.9.7 | Temporização da animação do título, desvanecimento da página de café, corte de linhas vazias, interruptor a regressar a 0.8.0, fusão de créditos                                          |
| 0.9.8 | Centragem do foco no Android, importação sem accept, cadeia de exportação em três níveis, coreografia unificada do título, ripple mais rápido, otimização de desempenho                                  |
| 0.9.9 | Viragem do título completo em todas as páginas, animação de mudança de página unificada em 40px, limpeza de ícones, transições de tema em todos os elementos, rolagem de foco com easing, interrupção rápida                            |
| 1.0.0 | Exportação de volta ao diretório privado, interrupção rápida no menu suspenso, limpeza de código morto, otimização do arranque —— 🎉 lançamento oficial                                      |

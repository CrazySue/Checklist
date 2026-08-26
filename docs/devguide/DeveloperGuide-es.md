# Guía del desarrollador de Lista de verificación

> [!TIP]
> Este documento es una guía técnica para desarrolladores: arquitectura, canal de compilación, pruebas y errores y lecciones aprendidas.  
> Para la presentación del proyecto, las características y las formas de descarga, consulta el [README](https://github.com/CrazySue/Checklist/blob/main/docs/readme/README-es.md).  

> Versión actual: `Release v1.0.0` ｜ Repositorio: https://github.com/CrazySue/Checklist

---

## 🏗️ Visión general de la arquitectura

### 🧱 Estructura de un solo archivo

La aplicación es **un único archivo HTML** (unos 40 MB) dividido internamente en cuatro capas, de arriba a abajo:

| Zona | Contenido |
| --- | --- |
| `<style id="embedded-fonts">` dentro de `<head>` | 3 bloques `@font-face` (HarmonyOS Sans SC 400/500/700 + Material Symbols Rounded), incrustados en base64, con `font-display:swap` |
| `<style>` principal dentro de `<head>` | Todo el CSS: design tokens → estilos de componentes → animaciones → responsive (incluida la barra lateral izquierda en horizontal con `html.landscape`) |
| `<body>` | Esqueleto de la aplicación: barra superior / barra de búsqueda / tres contenedores de página apilados con posicionamiento absoluto / barra inferior + modales (selector de iconos, selector de idioma, Toast) |
| `<script>` | Todo el JavaScript (unas 3800 líneas): estado → utilidades → i18n → tema/diseño → renderizado → formularios → intercambio de datos → ajustes → inicio |

### 🔀 Flujo de datos

Un modelo híbrido de **«estado centralizado + funciones de renderizado + animación mediante manipulación directa del DOM»**:

```text
Interacción del usuario
   │
   ├── Cambio de datos ──→ Store.save() (persistencia en localStorage)
   │                   └──→ Llamada explícita a renderXxx() para volver a renderizar la zona correspondiente
   │
   └── Cambio puramente visual (marcar, cambio de página, ondas) ──→ manipular el DOM / los estilos en línea directamente (sin volver a renderizar)
```

> [!WARNING]
> Cualquier cambio de estado que implique animación **debe manipular el DOM directamente**: no desencadenes un renderizado completo.

### 🗂️ Modelo de estado

Se persiste en la clave `checklist_app_state_v1` de `localStorage`:

```js
state = {
  checklists: [
    { id, name, icon, resetHours,          // icon: 'auto' | nombre del icono
      items: [{ id, text, icon, done }],
      completedAt, createdAt }
  ],
  activeChecklistId: id | null,
  settings: {
    theme: 'auto' | 'light' | 'dark',
    itemHeight: 64,        // 56~120
    firstOnly: false,      // la altura personalizada solo se aplica al primer elemento
    language: 'auto' | 'zh-CN' | 'zh-TW' | 'en' | 'ja' | 'ko' | 'fr' | 'de' | 'es' | 'ru' | 'pt'
  }
}
```

El estado temporal (no persistido) vive en variables de nivel de módulo: `currentPage`, `formMode` (`'new'|'edit'`), `formState`, `settingsFromPage`, `titleFlipDir`, `titleAnimToken`, `switchAnimToken`, `currentHomeView`, etc.

---

## 📂 Estructura del repositorio (GitHub)

```text
.
├── .github/              Código de conducta y plantillas de issue
├── docs/                 Documentación
├── build/                Canales de parches, datos maestros de palabras clave y suites de pruebas
├── README.md             Archivo README
└── LICENSE.txt           Licencia
```

---

## 🚀 Entorno y primeros pasos con las pruebas

### 📦 Requisitos del entorno

- Ejecutar la aplicación: cualquier navegador moderno / APK empaquetado con HBuilderX;
- Compilar y probar: Node.js ≥ 16 (el proyecto se validó en Node 24); `build/node_modules` incluye la dependencia jsdom.

### 🧪 Ejecutar las pruebas

```bash
node build/_extract099.js && node --check build/_check099.js   # comprobación de sintaxis
node build/_sim099.js                                          # simulación de comportamiento de usuario (73 aserciones)
node build/_smoke099.js && node build/_smoke099b.js            # pruebas de regresión
```

Solo se considera que la prueba ha pasado si todo imprime `ALL PASS` y `uncaught errors: 0`.

---

## 🛠️ Canal de compilación y flujo de trabajo de desarrollo

### 🔁 Canal de parches de versión

Una actualización de versión consiste en aplicar scripts de parche de Node al HTML de la versión anterior. El `apply(old, new, count)` de cada script valida el número de coincidencias y aborta la escritura si alguna no coincide.

| Script | Propósito |
| --- | --- |
| `upgrade_v09.js` + `patch_v09_css.js` + `keywords_v09.js` + `embed_font_v09.js` + `rebuild_v09.js` | 0.8.0 → 0.9.0 |
| `upgrade_v095.js` / `upgrade_v095b.js` | → 0.9.5 |
| `upgrade_v096.js` / `upgrade_v096b.js` | → 0.9.6 |
| `upgrade_v097.js` | → 0.9.7 |
| `upgrade_v098.js` | → 0.9.8 |
| `upgrade_v099.js` + `upgrade_v099b.js` + `upgrade_v099c.js` + `remove_icons_v099.js` | → 0.9.9 |
| `upgrade_v100.js` | → 1.0.0 |

### ✏️ La forma correcta de modificar el código

1. Edita directamente el HTML de la versión objetivo (un solo archivo, WYSIWYG);
2. **Refleja el cambio en el `upgrade_vXXX.js` correspondiente** (para poder reconstruir desde versiones antiguas de una sola vez);
3. Haz el commit solo cuando la comprobación de sintaxis y las simulaciones/regresiones estén todas en verde.

### 🎛️ Añadir y eliminar iconos y palabras clave

- Biblioteca de iconos: `ICON_LIBRARY` (claves de categoría `daily / travel / shopping / sports / leisure / food / health / work / other`);
- Añadir un icono: añade el nombre del icono a la matriz de su categoría → añade `[icon, {idioma: 'palabra clave|palabra clave'}]` en `build/keywords_v09.js` → reconstruye el bloque `AUTO_ICON_KEYWORDS`;
- Eliminar un icono: elimínalo de la biblioteca y de los datos de palabras clave y reconstruye (consulta `remove_icons_v099.js`);
- Validación: ≥ 200 palabras clave por idioma; el nombre del icono debe existir en la fuente incrustada y en `ICON_LIBRARY`.

### 🌍 Añadir un idioma

Añade un diccionario nuevo a `I18N` (con el mismo conjunto de claves que los demás idiomas) → regístralo en `LANGUAGES` → completa la biblioteca de palabras clave con ≥ 200 términos → `getLang()` (auto → coincidencia exacta → coincidencia por prefijo → recurre a zh-CN).

---

## 🧩 Estructura del código en detalle

### 🎨 Design tokens y capas CSS

```css
:root{
  --brand-1:#10172F; --brand-2:#283558; --brand-3:#525288; --brand-4:#A5A8BA;  /* cuatro colores de marca */
  --md-primary:#525288; --md-primary-container:#E1E0FF; …                         /* paleta derivada de MD3 */
  --md-easing-standard / emphasized / accelerated / decelerated;                  /* tokens de movimiento */
  --md-dur-short:150ms; --md-dur-medium:250ms; --md-dur-long:400ms;
}
```

Capas CSS: reset → fuentes → tokens → movimiento → esqueleto → barra superior → contenedores de página → elementos de lista → barra inferior → botones/FAB → formularios → búsqueda → ajustes → modales/Toast → responsive. El tema oscuro se implementa anulando las variables con `[data-theme="dark"]`; todos los cambios de color se suavizan con `*{transition-property:…;transition-duration:.25s}`.

### ⚙️ Mapa de módulos JS

| Sección | Funciones clave |
| --- | --- |
| Estado | `Store` (load/save/set) |
| Utilidades | `$` `$$` `el` `uid` `attachRipple` `initGlobalRipple` |
| Coincidencia de iconos | `normText` `latinMatch` `autoIconFor` `resolveIcon` |
| i18n | `getLang` `t` |
| Tema/diseño | `applyTheme` `updateLayout` |
| Barra superior | `renderTopbar` `setTopbarTitle` |
| Página principal | `renderHome` `showHomeView` `completeItem` `resetChecklist` `checkAutoReset` |
| Barra inferior/cambio de página | `renderBottombar` `switchChecklist` `switchPage` |
| Formularios | `openForm` `renderForm` `renderFormItems` `appendFormItem` `refreshChecklistIconRow` |
| Intercambio de datos | `handleExport` `downloadViaAnchor` `finishImport` `handleImport` |
| Ajustes | `renderSettings` `toggleDropdown` `openLanguageMenu` |
| Modales | `openIconPicker` `renderIconPickerGrid` `selectIcon` |
| Navegación | `openSettingsFrom` `goBackFromSettings` `openExternal` |
| Utilidades de animación | `swapIcon` `popIcon` `smoothCenter` |
| Arranque | `bindEvents` `updateStaticLabels` `init` |

### ✨ Sistema de animaciones

- **Patrón de token de interrupción**: todas las animaciones interrumpibles (cambio de página, título, desplazamiento, intercambio de iconos) tienen un token incremental; la devolución de llamada programada valida primero el token y, si una animación más reciente la interrumpe, sale en silencio;
- **Cambio de página/cambio de lista**: el contenido anterior se desliza 40px hacia fuera con aceleración durante 150ms + se desvanece → el contenido nuevo se desliza 40px hacia dentro desde la dirección opuesta con desaceleración durante 300ms (el mismo patrón en `switchPage` y `switchChecklist`);
- **Volteo del título**: todo el título se voltea hacia fuera durante 140ms → se voltea hacia dentro con desaceleración durante 240ms, con la dirección determinada por el cambio de página (hacia delante = hacia arriba, hacia atrás = hacia abajo);
- **Página de café**: la aparición/salida usa `@keyframes` (fiable en Android); al cambiar de lista de verificación se trata como un «elemento de lista especial» que se voltea con la zona de desplazamiento (la ruta `instant` desactiva su propia animación);
- **FLIP**: al completar un elemento de la lista, la contracción de altura la impulsa una transición CSS, sin volver a renderizar todo.

---

## 📱 Empaquetado APK (HBuilderX)

### 📦 Pasos

Crea un proyecto 5+ App nuevo (nombre del paquete `com.crazysue.checklist`) → coloca el HTML como página de entrada → edita manifest.json → empaquetado en la nube/sin conexión → certificado → empaqueta.

### 🔌 APIs plus utilizadas

| API | Uso |
| --- | --- |
| `plus.io.requestFileSystem(plus.io.PRIVATE_DOC, …)` | Exporta el .checklist al directorio privado de la aplicación (**no vuelvas a cambiar al enfoque del directorio público**) |
| `plus.runtime.openURL(url)` | Abre los enlaces externos en el navegador predeterminado del sistema |
| `plus.os.name` | Detección de plataforma (al importar en Android **sin filtrar con accept**) |

### ⚠️ Errores comunes por plataforma

- La entrada de archivos en Android debe quitar `accept`; de lo contrario, ningún archivo se puede seleccionar en el selector del sistema;
- Escribir en la carpeta pública de Descargas en Android 10+ (ruta File / MediaStore / SAF) falla por completo en algunos dispositivos (archivos de 0 bytes) — v1.0 finalmente recurrió al directorio privado de la aplicación;
- `window.open(url,'_blank','noopener')` abre dos pestañas: usa anclas o `plus.runtime.openURL` para los enlaces externos;
- `scrollTo({behavior:'smooth'})` falla silenciosamente en WebViews antiguos: el desplazamiento personalizado usa rAF + easing y escribe directamente en `scrollTop`;
- `screen.orientation` refleja el monitor y no la ventana: la detección de vertical/horizontal usa solo la proporción de aspecto de la propia ventana;
- Las animaciones clave de aparición/salida usan `@keyframes` en lugar de una transición de «estado inicial → cambio de clase»;
- inline-block contrae los espacios en blanco iniciales: el sufijo del título se mantiene inline;
- Quitar la onda inmediatamente en pointerup se siente demasiado rápido: sigue reproduciéndose hasta terminar después de soltar.

---

## 🧠 Decisiones técnicas clave y errores y lecciones aprendidas

| Tema | Decisión | Justificación |
| --- | --- | --- |
| Modelo de dirección de página | Las páginas Nueva/Ajustes siempre se deslizan desde la derecha; la página de la lista de verificación se desliza desde la izquierda; «volver» desde Ajustes a la página Nueva invierte la dirección | Coherente con el modelo mental del usuario |
| Estado final de la animación del título | Todo el título (nombre + «Lista de verificación») se voltea hacia arriba/abajo a la vez, aplicado en todas las páginas | El enfoque dual inicial de «nombre volteándose + sufijo moviéndose» causaba problemas recurrentes de teletransporte y solapamiento |
| Página de café | Se voltea con la zona de desplazamiento al cambiar de lista de verificación; al restablecer, se desplaza hacia abajo y se desvanece | Aspecto unificado del cambio de página |
| Fila en blanco automática | Al final siempre hay una fila automática sin botón de eliminar; se elimina con una animación al vaciar el elemento anterior; vaciar el primer elemento no lo elimina | El equilibrio entre la experiencia de escritura y «sin botones invisibles» |
| Exportación | Directorio privado de la aplicación (APK) / descarga con ancla (Web) | Fiable en todas las versiones de Android |
| Palabras clave de iconos | 630+ términos por idioma, con prioridad al idioma actual y recurso al inglés, coincidencia de palabras completas en escrituras occidentales | El equilibrio entre la tasa de aciertos y los falsos positivos |

---

## 🧪 Guía de pruebas

### 🧰 Cadena de herramientas

- **jsdom**: elimina los recursos base64 antes de cargar el HTML para acelerar; `beforeParse` inyecta la semilla de estado y los polyfills (`scrollIntoView`/`matchMedia`/`URL.createObjectURL`, etc.);
- **`_sim099.js`**: simulación de comportamiento: eventos DOM reales impulsan flujos de usuario completos, y se muestrean los estados intermedios de la animación para verificar la sincronización;
- **`_smoke099.js` / `_smoke099b.js`**: regresión funcional + comprobaciones a nivel de cadenas de código.

### 📝 Ejemplo de caso simulado

```js
// beforeParse: semilla de estado + mock de la geometría de diseño
window.localStorage.setItem('checklist_app_state_v1', JSON.stringify(state));
window.Element.prototype.getBoundingClientRect = function(){ /* devuelve según sea necesario */ };
// eventos reales impulsan el flujo + aserciones de muestreo de estados intermedios
input.focus(); input.value='beber agua';
input.dispatchEvent(new w.Event('input', {bubbles:true}));
await sleep(60); check('la fila en blanco automática se elimina con animación', !!document.querySelector('.form-item.removing'));
```

### ✅ Lista de comprobación previa a la publicación

- [ ] `node --check` supera la comprobación de sintaxis;
- [ ] `_sim099.js` en verde dos veces seguidas;
- [ ] `_smoke099.js` y `_smoke099b.js` en verde;
- [ ] grep confirma el número de versión, los restos de elementos eliminados y los marcadores de API clave;
- [ ] Verificación en un dispositivo real: exportación/importación/enlaces externos/modo claro-oscuro/vertical-horizontal/volteo del título/ondas.

---

## 🎨 Referencia rápida de especificaciones de diseño (MD3)

- Cuatro colores de tema: `#10172F` `#283558` `#525288` `#A5A8BA`; el tema claro se deriva de la semilla `#525288` y el oscuro, de `#283558`;
- Capas de estado: negro transparente al 8 % en hover / al 12 % en active;
- Fuente: HarmonyOS Sans SC (400/500/700, **no crees subconjuntos**: el contenido del usuario puede contener cualquier carácter han);
- Iconos: Material Symbols Rounded (fuente variable, `font-variation-settings` controla FILL/wght), deben provenir de Google Fonts;
- Movimiento: solo se permiten volteo hacia dentro/aparición con fundido/ondas/escalado; queda prohibido aparecer o desaparecer de la nada; el easing y las duraciones siempre usan tokens;
- Interruptor: especificación de 0.8.0 (apagado 12px / encendido 24px), sin estiramiento al pulsar, transición no lineal emphasized.

---

## 📜 Historial de versiones

| Versión | Aspectos destacados |
| ----- | ------------------------------------------------------------------------- |
| 0.7.0 | Primera versión utilizable (demasiado grande para subirla a GitHub)                                              |
| 0.8.0 | Línea base de la revisión inicial                                                                    |
| 0.9.0 | Enfoque de la barra inferior, cambio de página con la página de café, navegación de la página de edición, localización de las categorías de iconos, 200+ palabras clave por idioma, exportación .checklist, botón de patrocinio, recorte de ondas, barra lateral izquierda en horizontal, Bold incrustado |
| 0.9.5 | Reglas de dirección del cambio de página, volteo entre editar↔nueva, especificación del interruptor, filas en blanco automáticas, animación de desplazamiento del título                                          |
| 0.9.6 | Dirección de «volver» en Ajustes, exportación/importación en Android, volteo del título hacia arriba/abajo, transición de modo oscuro, reescritura de la detección de vertical/horizontal                                         |
| 0.9.7 | Sincronización de la animación del título, desvanecimiento de la página de café, recorte de filas en blanco, el interruptor vuelve a la especificación de 0.8.0, fusión de atribuciones                                          |
| 0.9.8 | Centrado del foco en Android, importación sin accept, cadena de exportación de tres niveles, coreografía unificada del título, ondas más rápidas, optimización del rendimiento                                  |
| 0.9.9 | Volteo del título completo en todas las páginas, animación de cambio de página unificada a 40px, limpieza de iconos, transiciones de tema en todos los elementos, desplazamiento con easing al enfocar, interrupción rápida                            |
| 1.0.0 | La exportación vuelve al directorio privado, interrupción rápida del desplegable, limpieza de código muerto, optimización del inicio —— 🎉 versión oficial                                      |

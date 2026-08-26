# Lista de verificación

![background](../background.png)

> Una lista de tareas pendientes con estilo MD3 para no volver a olvidar nada jamás.

[![Download Release](https://img.shields.io/badge/Download-Release-blue.svg)](https://github.com/CrazySue/Checklist/releases) [![License MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://github.com/CrazySue/Checklist/blob/main/LICENSE.txt) [![Platform Android](https://img.shields.io/badge/Platform-Android-green.svg)](https://github.com/CrazySue/Checklist/releases) [![Made by GLM-5.2](https://img.shields.io/badge/Made_by-GLM5.2-red.svg)](https://github.com/zai-org/GLM-5) [![Maintain by DeepSeek V4 Pro](https://img.shields.io/badge/Maintain_by-DeepSeek_V4_Pro-orange.svg)](https://github.com/deepseek-ai/DeepSeek-V4)

[English](README-en.md) | [简体中文](README-zh_CN.md) | [繁體中文](README-zh_TW.md) | [日本語](README-ja.md) | [한국어](README-ko.md) | [Français](README-fr.md) | [Deutsch](README-de.md) | Español | [Русский](README-ru.md) | [Português](README-pt.md)

**Lista de verificación** es una aplicación de lista de tareas pendientes que usa el lenguaje de diseño MD3.

---

## ✨ Características

- **Archivo único**: toda la aplicación es un único archivo HTML con las fuentes, la fuente de iconos y el icono de la aplicación incrustados: haz doble clic y se ejecuta sin conexión;
- **Lenguaje de diseño MD3**: design tokens completos de MD3, capas de estado, ondas y animaciones con easing no lineal;
- **Localización**: compatibilidad con 10 idiomas (简体中文、繁體中文、English、日本語、한국어、Français、Deutsch、Español、Русский、Português);
- **Selección inteligente de iconos**: hace coincidir automáticamente el icono según el elemento de la lista / el nombre de la lista de verificación (índice de 630+ palabras clave por idioma);
- **Restablecimiento automático**: una vez completado todo, se puede configurar el restablecimiento automático por tiempo para empezar un nuevo día;
- **Compartir fácil**: exporta / importa archivos .checklist (JSON por dentro) y los datos nunca se pierden;
- **Adaptación a vertical/horizontal**: barra inferior en vertical, barra de navegación izquierda en horizontal;
- **Modo oscuro**: sigue al sistema / claro / oscuro, con transiciones suaves en toda la interfaz.

---

## 📱 Capturas de pantalla

| ![Pantalla principal](../pictures/picture-1.png)  | ![Edición de lista](../pictures/picture-2.png) | ![Ajustes](../pictures/picture-3.png) |
| ------------------------------- | -------------------------------- | ----------------------------- |
| ![Selector de iconos](../pictures/picture-4.png) | ![Búsqueda](../pictures/picture-5.png)    | ![Hecho](../pictures/picture-6.png) |

---

## 📥 Descarga

- Para la última versión, descarga el APK desde [GitHub Releases](https://github.com/CrazySue/Checklist/releases);
- También puedes usar la versión web directamente: abre el archivo HTML del repositorio y se ejecuta;

---

## 🎥 Antecedentes

Hoy en día la gente tiene cada vez más cosas que hacer: asistir a fiestas de cumpleaños, ir al cine con amigos... Por eso, muchas aplicaciones de calendario ya integran funciones de agenda para recordar a la gente las cosas importantes.

Pero el problema no está resuelto: ¿sales de casa y olvidas la tarjeta de transporte? ¿terminas la jornada y olvidas presentar el informe de trabajo? Son las «pequeñas cosas» que componen las «grandes cosas» las que frenan el progreso de la gente.

Por eso, Sue, que tanto ha sufrido con este problema, decidió desarrollar una lista de tareas pendientes para solucionarlo: *Lista de verificación* no te recuerda las grandes cosas —porque muchas aplicaciones de calendario lo hacen mejor y es difícil olvidarlas—, sino que te permite convertir las pequeñas tareas que requieren muchos pasos en una lista que vas tachando una a una, **para no volver a olvidar nada jamás**.

---

## 🛠️ Empezar a compilar

*Lista de verificación* es una aplicación 5+ App escrita en HTML, que HBuilderX empaqueta como instalador APK.

> [!NOTE]
> Como existen innumerables métodos y tutoriales para empaquetar HTML con HBuilderX, aquí solo se muestra el proceso de compilación simplificado; para más detalles, consulta la [documentación de HBuilderX](https://hx.dcloud.net.cn/).

Para empaquetar tú mismo el archivo HTML como instalador para tu sistema operativo:

1. [Descarga HBuilderX](https://www.dcloud.io/hbuilderx.html).
2. Crea un nuevo proyecto 5+ App.
3. Sustituye index.html por el archivo HTML que quieras empaquetar.
4. Edita en manifest.json las opciones que necesites cambiar.
5. Usa el empaquetado en la nube o el empaquetado sin conexión.
6. Sube el certificado de la aplicación (el empaquetado en la nube puede usar un certificado en la nube).
7. Empaqueta.

---

## 🧭 Participa en el desarrollo

¿Quieres leer el código, corregir bugs o añadir funciones? Consulta:

- [Guía del desarrollador](https://github.com/CrazySue/Checklist/blob/main/docs/devguide/DeveloperGuide-es.md) — arquitectura, canal de compilación, pruebas y errores y lecciones aprendidas;
- [CONTRIBUTING.md](https://github.com/CrazySue/Checklist/blob/main/.github/CONTRIBUTING.md) — guía de contribución.

---

## 📊 Estado del proyecto

![Alt](https://repobeats.axiom.co/api/embed/973db86aa4cd093504f231f7853d6b984558f943.svg "Repobeats analytics image")

---

## 📜 Licencia de código abierto

Este proyecto se distribuye bajo la **Licencia MIT**, que permite a cualquier persona usar, copiar, modificar, fusionar, publicar, distribuir, sublicenciar y/o vender copias del software. Consulta el archivo [LICENSE](https://github.com/CrazySue/Checklist/blob/main/LICENSE.txt) para más detalles.

Este proyecto utiliza el siguiente software de código abierto:

- El sistema de iconos [Material Symbols Rounded](https://github.com/material-components/material-web) de Google
- El lenguaje de diseño [Material Design 3](https://github.com/material-components/material-web) de Google
- La familia de fuentes [HarmonyOS Sans](https://github.com/huawei-fonts/HarmonyOS-Sans#) de Huawei

---

## 💌 Acerca de

- 💡 Concepción: [Crazy Sue](https://github.com/CrazySue)
- ⌨️ Programación: [GLM-5.2](https://github.com/zai-org/GLM-5)
- 🛠️ Mantenimiento: [DeepSeek V4 Pro](https://github.com/deepseek-ai/DeepSeek-V4)

---

*No volver a olvidar nada jamás.*

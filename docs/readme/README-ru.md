# Чек-лист

![background](/background.png)

> Список дел в стиле MD3 — чтобы больше никогда ничего не забывать.

[![Download Release](https://img.shields.io/badge/Download-Release-blue.svg)](https://github.com/CrazySue/Checklist/releases) [![License MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://github.com/CrazySue/Checklist/blob/main/LICENSE.txt) [![Platform Android](https://img.shields.io/badge/Platform-Android-green.svg)](https://github.com/CrazySue/Checklist/releases) [![Made by GLM-5.2](https://img.shields.io/badge/Made_by-GLM5.2-red.svg)](https://github.com/zai-org/GLM-5) [![Maintain by DeepSeek V4 Pro](https://img.shields.io/badge/Maintain_by-DeepSeek_V4_Pro-orange.svg)](https://github.com/deepseek-ai/DeepSeek-V4)

[English](README-en.md) | [简体中文](README-zh_CN.md) | [繁體中文](README-zh_TW.md) | [日本語](README-ja.md) | [한국어](README-ko.md) | [Français](README-fr.md) | [Deutsch](README-de.md) | [Español](README-es.md) | Русский | [Português](README-pt.md)

**Чек-лист** — это приложение со списком дел, созданное на языке дизайна MD3.

---

## ✨ Возможности

- **Один файл**: всё приложение — это один HTML-файл со встроенными шрифтами, иконочным шрифтом и иконкой приложения — двойной щелчок, и оно работает офлайн;
- **Язык дизайна MD3**: полный набор дизайн-токенов MD3, слои состояний, волны, анимации с нелинейным сглаживанием;
- **Локализация**: поддержка 10 языков （简体中文、繁體中文、English、日本語、한국어、Français、Deutsch、Español、Русский、Português）；
- **Умный подбор иконок**: иконка подбирается автоматически по названию пункта списка / чек-листа (индекс из 630+ ключевых слов на каждый язык);
- **Автоматический сброс**: когда все пункты выполнены, можно настроить автоматический сброс по таймеру — чтобы встретить новый день;
- **Лёгкий обмен**: экспорт / импорт файлов .checklist (внутри — JSON), данные никогда не теряются;
- **Адаптация к книжной/альбомной ориентации**: в книжной — нижняя панель, в альбомной — боковая навигация слева;
- **Тёмная тема**: по системе / светлая / тёмная, плавный переход во всём интерфейсе.

---

## 📱 Скриншоты

| ![Главный экран](/pictures/picture-1.png)  | ![Редактирование чек-листа](/pictures/picture-2.png) | ![Настройки](/pictures/picture-3.png) |
| ------------------------------- | -------------------------------- | ----------------------------- |
| ![Выбор иконки](/pictures/picture-4.png) | ![Поиск](/pictures/picture-5.png)    | ![Готово](/pictures/picture-6.png) |

---

## 📥 Загрузка

- Последнюю версию APK можно скачать на странице [GitHub Releases](https://github.com/CrazySue/Checklist/releases);
- Можно также пользоваться веб-версией: просто откройте HTML-файл из репозитория, и он заработает;

---

## 🎥 Предыстория

Дела у людей становятся всё многочисленнее: день рождения, кино с друзьями… Поэтому многие календарные приложения давно встроили функцию расписания, чтобы напоминать людям о чём-то важном.

Но проблема так и не решена: вышел из дома и забыл проездной? После работы забыл сдать рабочий отчёт? Людей тормозят как раз те «мелочи», из которых складываются «большие дела».

Именно поэтому Sue, которая натерпелась от этой проблемы, решила создать список дел, чтобы её решить: «Чек-лист» не будет напоминать вам о больших делах — с этим календарные приложения справляются лучше, да и забыть их трудно, — а позволит разбить требующие многих шагов мелочи на список и вычёркивать их по одной, **чтобы больше никогда ничего не забывать**.

---

## 🛠️ Начало сборки

«Чек-лист» — это 5+ App, написанный на HTML и упаковываемый в APK-установщик с помощью HBuilderX.

> [!NOTE]
> Способов и руководств по упаковке HTML в HBuilderX не счесть, поэтому здесь приведён лишь упрощённый способ сборки; подробности — в [документации HBuilderX](https://hx.dcloud.net.cn/).

Чтобы самостоятельно упаковать HTML-файл в установочный пакет для своей операционной системы:

1. [Скачайте HBuilderX](https://www.dcloud.io/hbuilderx.html).
2. Создайте новый проект 5+ App.
3. Замените index.html на HTML-файл, который нужно упаковать.
4. Отредактируйте нужные параметры в manifest.json.
5. Используйте облачную или локальную сборку.
6. Загрузите сертификат приложения (при облачной сборке можно воспользоваться облачным сертификатом).
7. Соберите пакет.

---

## 🧭 Участие в разработке

Хотите почитать код, исправить баг или добавить функцию? Загляните сюда:

- [Руководство разработчика](https://github.com/CrazySue/Checklist/blob/main/docs/devguide/DeveloperGuide-ru.md) — архитектура, конвейер сборки, тестирование и заметки о граблях;
- [CONTRIBUTING.md](https://github.com/CrazySue/Checklist/blob/main/.github/CONTRIBUTING.md) — руководство для контрибьюторов.

---

## 📊 Статус проекта

![Alt](https://repobeats.axiom.co/api/embed/973db86aa4cd093504f231f7853d6b984558f943.svg "Repobeats analytics image")

---

## 📜 Открытая лицензия

Проект распространяется по лицензии **MIT License**, которая разрешает любому лицу использовать, копировать, изменять, объединять, публиковать, распространять, сублицензировать и/или продавать копии этого программного обеспечения; подробности — в файле [LICENSE](https://github.com/CrazySue/Checklist/blob/main/LICENSE.txt).

В проекте используется следующее открытое программное обеспечение:

- Иконочная система [Material Symbols Rounded](https://github.com/material-components/material-web) от Google
- Язык дизайна [Material Design 3](https://github.com/material-components/material-web) от Google
- Семейство шрифтов [HarmonyOS Sans](https://github.com/huawei-fonts/HarmonyOS-Sans#) от Huawei

---

## 💌 О проекте

- 💡 Концепция: [Crazy Sue](https://github.com/CrazySue)
- ⌨️ Программирование: [GLM-5.2](https://github.com/zai-org/GLM-5)
- 🛠️ Сопровождение: [DeepSeek V4 Pro](https://github.com/deepseek-ai/DeepSeek-V4)

---

*Больше никогда ничего не забывать.*

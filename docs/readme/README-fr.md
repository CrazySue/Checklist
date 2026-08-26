# Liste de contrôle

![background](../background.png)

> Une liste de tâches de style MD3 — ne plus jamais rien oublier.

[![Download Release](https://img.shields.io/badge/Download-Release-blue.svg)](https://github.com/CrazySue/Checklist/releases) [![License MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://github.com/CrazySue/Checklist/blob/main/LICENSE.txt) [![Platform Android](https://img.shields.io/badge/Platform-Android-green.svg)](https://github.com/CrazySue/Checklist/releases) [![Made by GLM-5.2](https://img.shields.io/badge/Made_by-GLM5.2-red.svg)](https://github.com/zai-org/GLM-5) [![Maintain by DeepSeek V4 Pro](https://img.shields.io/badge/Maintain_by-DeepSeek_V4_Pro-orange.svg)](https://github.com/deepseek-ai/DeepSeek-V4)

[English](README-en.md) | [简体中文](README-zh_CN.md) | [繁體中文](README-zh_TW.md) | [日本語](README-ja.md) | [한국어](README-ko.md) | Français | [Deutsch](README-de.md) | [Español](README-es.md) | [Русский](README-ru.md) | [Português](README-pt.md)

**Liste de contrôle** est une application de liste de tâches qui utilise le langage de design MD3.

---

## ✨ Fonctionnalités

- **Fichier unique** : toute l'application tient dans un seul fichier HTML — polices, police d'icônes et icône de l'application intégrées — double-cliquez dessus pour l'exécuter hors ligne ;
- **Langage de design MD3** : jetons de design MD3 complets, couches d'état, ondulations et animations à easing non linéaire ;
- **Localisation** : prise en charge de 10 langues （简体中文、繁體中文、English、日本語、한국어、Français、Deutsch、Español、Русский、Português）；
- **Sélection intelligente d'icônes** : les icônes sont automatiquement assorties au nom de l'élément de liste / de la liste de contrôle (index de 630+ mots-clés par langue) ;
- **Réinitialisation automatique** : une fois tout terminé, une réinitialisation automatique peut être programmée sur une minuterie, prête à accueillir une nouvelle journée ;
- **Partage facile** : export / import de fichiers .checklist (du JSON en interne) — vos données ne se perdent jamais ;
- **Adaptation portrait/paysage** : barre inférieure en portrait, barre de navigation latérale gauche en paysage ;
- **Mode sombre** : suit le système / clair / sombre, avec des transitions fluides sur toute l'interface.

---

## 📱 Captures d'écran

| ![Accueil](../pictures/picture-1.png)  | ![Modification de la liste de contrôle](../pictures/picture-2.png) | ![Paramètres](../pictures/picture-3.png) |
| ------------------------------- | -------------------------------- | ----------------------------- |
| ![Sélection d'icônes](../pictures/picture-4.png) | ![Recherche](../pictures/picture-5.png)    | ![Terminé](../pictures/picture-6.png) |

---

## 📥 Téléchargement

- Téléchargez l'APK de la dernière version depuis [GitHub Releases](https://github.com/CrazySue/Checklist/releases) ;
- Vous pouvez aussi utiliser directement la version web : ouvrez le fichier HTML du dépôt et elle s'exécute ;

---

## 🎥 Contexte du projet

Aujourd'hui, les gens ont de plus en plus de choses à gérer — anniversaires, séances de cinéma entre amis… C'est pourquoi de nombreuses applications de calendrier intègrent déjà des fonctions d'agenda, pour rappeler à chacun de ne pas oublier les grandes occasions.

Mais le problème n'est pas résolu : vous êtes sorti en oubliant votre carte de transport ? Vous avez oublié de soumettre votre journal de travail après le travail ? Ce sont au contraire ces « petites choses » qui composent les « grandes » qui ralentissent les gens.

C'est pourquoi Sue, qui en a beaucoup souffert, a décidé de développer une liste de tâches pour résoudre ce problème : *Liste de contrôle* ne vous rappellera pas de faire les grandes choses — car de nombreuses applications de calendrier s'en chargent mieux, et vous les oubliez de toute façon rarement — mais vous permet de lister les petites choses qui demandent de nombreuses étapes, en les cochant une à une, **pour ne plus jamais rien oublier**.

---

## 🛠️ Mise en route

*Liste de contrôle* est une 5+ App écrite en HTML, empaquetée en APK avec HBuilderX.

> [!NOTE]
> Les méthodes et tutoriels pour empaqueter du HTML avec HBuilderX sont innombrables ; seule une méthode de construction simplifiée est donc listée ici. Pour plus de détails, consultez la [documentation HBuilderX](https://hx.dcloud.net.cn/).

Pour empaqueter vous-même le fichier HTML en installateur pour votre système d'exploitation :

1. [Téléchargez HBuilderX](https://www.dcloud.io/hbuilderx.html).
2. Créez un nouveau projet 5+ App.
3. Remplacez index.html par le fichier HTML à empaqueter.
4. Modifiez dans manifest.json les options que vous souhaitez changer.
5. Utilisez le packaging cloud ou le packaging hors ligne.
6. Téléversez un certificat d'application (le packaging cloud peut utiliser un certificat cloud).
7. Empaquetez.

---

## 🧭 Participer au développement

Envie de lire le code, de corriger des bugs ou d'ajouter des fonctionnalités ? Consultez :

- [Guide du développeur](https://github.com/CrazySue/Checklist/blob/main/docs/devguide/DeveloperGuide-fr.md) — architecture, pipeline de construction, tests et pièges ;
- [CONTRIBUTING.md](https://github.com/CrazySue/Checklist/blob/main/.github/CONTRIBUTING.md) — le guide de contribution.

---

## 📊 État du projet

![Alt](https://repobeats.axiom.co/api/embed/973db86aa4cd093504f231f7853d6b984558f943.svg "Repobeats analytics image")

---

## 📜 Licence open source

Ce projet est distribué sous la **MIT License**, qui autorise quiconque à utiliser, copier, modifier, fusionner, publier, distribuer, sous-licencier et/ou vendre des copies de ce logiciel. Voir le fichier [LICENSE](https://github.com/CrazySue/Checklist/blob/main/LICENSE.txt).

Ce projet utilise les logiciels open source suivants :

- Le système d'icônes [Material Symbols Rounded](https://github.com/material-components/material-web) de Google
- Le langage de design [Material Design 3](https://github.com/material-components/material-web) de Google
- La famille de polices [HarmonyOS Sans](https://github.com/huawei-fonts/HarmonyOS-Sans#) de Huawei

---

## 💌 À propos

- 💡 Concept : [Crazy Sue](https://github.com/CrazySue)
- ⌨️ Programmation : [GLM-5.2](https://github.com/zai-org/GLM-5)
- 🛠️ Maintenance : [DeepSeek V4 Pro](https://github.com/deepseek-ai/DeepSeek-V4)

---

*Ne plus jamais rien oublier.*

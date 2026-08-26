# Contribution Guidelines

Hello! Thank you for your interest in contributing to *Checklist*. This guide will help you get started.

## 0. 📖 Prerequisites

Before you start contributing, please make sure that you have:

- Read the project [README](https://github.com/CrazySue/Checklist/edit/main/README.md) to get a general understanding of the project.
- Carefully read and comply with the [LICENSE](https://github.com/CrazySue/Checklist/blob/main/LICENSE).
- Carefully read and comply with the [Code of Conduct](https://github.com/CrazySue/Checklist/blob/main/.github/CODE_OF_CONDUCT.md).
- Carefully read the [Developer Guide](https://github.com/CrazySue/Checklist/blob/main/docs/DeveloperGuide-en.md).
- Searched existing [Issues](https://github.com/CrazySue/Checklist/issues) and [Pull Requests](https://github.com/CrazySue/Checklist/pulls) to avoid duplicate work.

## 1. 🛠️ Fork this repository

1. Click the **Fork** button at the top right of the [Checklist](https://github.com/CrazySue/Checklist) page.
2. Modify the basic information (if needed) and click the **Create fork** button below.

## 2. 📂 Choose your contribution area

<details>

<summary>💻 Code</summary>

### 1. 💻 Code

##### Accepted contributions:

- Meaningful new features
- Bug fixes for existing code
- Performance optimisations for existing code
- API improvements for existing code
- Comment improvements and documentation supplements for existing code

##### We do not accept:

- Large‑scale refactoring submitted without prior discussion

##### When writing code, please:

- Use modern HTML syntax (HTML5 and later)
- Maintain code readability and consistent style
- Use meaningful variable names
- Avoid duplicated code
- Add necessary comments
- Remove debugging code
- Do not submit minified/compressed code

##### Before submitting your contribution, please double‑check that:

- It runs correctly
- There are no console errors
- It does not affect other functionality
- Basic testing has been completed

</details>

<details>

<summary>🌐 Localisation</summary>

### 2. 🌐 Localisation

We are looking for people who can help translate *Checklist* into languages other than Simplified Chinese. If you are interested, please read on.

##### Requirements for becoming a translator:

- You must be **proficient** in Simplified Chinese.
- For example, if you can watch videos in Simplified Chinese on Bilibili and understand them, your Simplified Chinese proficiency is high. If you need a translation tool to understand sentences, your proficiency is not high.
- You must be a native speaker of the **target** language. (If you are not a native speaker but believe your language skills are fluent enough, you may also apply. Please bear in mind that taking some language courses does not make you fluent. If you would not change your smartphone’s system language to the target language, your level is not sufficient!)

##### Accepted contributions:

- Support for new languages
- Corrections to errors in existing language translations

##### When contributing localisation translations, please:

- Use consistent terminology
- Do not submit machine‑translated text directly without review
- Keep punctuation consistent
- Do not modify variable names

##### Contribution steps:

1. Locate the multilingual section in the project files (in the `Release v1.0.0` version, the multilingual section is at line **1050** of the project file).
2. In the language file, you will see items formatted like `app_name:'Checklist'",`.
3. Only modify the text inside the single quotes to the right of the colon.
4. Repeat step 3 until all lines are translated.

</details>

<details>

<summary>💡 Other</summary>

### 💡 Other

Have a different contribution idea? If so, please [contact us](mailto:bugs.crazysue@gmail.com) to discuss your contribution.

</details>

## 3. 📡 Submit

As usual, commit your contribution to your forked repository. Different contribution areas correspond to different file locations:

```text
.
├── .github/              Code of Conduct and Issue templates
├── docs/                 Documentation
├── build/                Patch pipelines, keyword master data, and test suites
├── README.md             Readme file
└── LICENSE.txt           License
```

Place your contribution in the appropriate folder.

## 4. 🔗 Create a Pull Request

Navigate to the [Checklist](https://github.com/CrazySue/Checklist) page, click the **Pull requests** tab, then click the **New pull request** button. Click the **Compare across forks** link and select your forked repository.

Review the changes, then click the **Create pull request** button.

## 5. 🎉 Wow! You did it!

Congratulations! You have completed your contribution to this project. Now you can wait for us to review your pull request.
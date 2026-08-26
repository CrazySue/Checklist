# 贡献指南

你好！感谢你有兴趣为《检查单》贡献力量。本指南将帮助你入门。

## 0. 📖 先决条件

在开始贡献前，请确保你已经：

- 阅读本项目的 [README](https://github.com/CrazySue/Checklist/edit/main/README.md) 文件，对本项目有大致了解。
- 仔细阅读并遵守 [LICENSE](https://github.com/CrazySue/Checklist/blob/main/LICENSE)。
- 仔细阅读并遵守 [行为准则](https://github.com/CrazySue/Checklist/blob/main/.github/CODE_OF_CONDUCT.md)。
- 仔细阅读 [开发指北](https://github.com/CrazySue/Checklist/blob/main/docs/DeveloperGuide-en.md)。
- 搜索已有的 [Issue](https://github.com/CrazySue/Checklist/issues) 和 [Pull Request](https://github.com/CrazySue/Checklist/pulls)，避免重复工作。

## 1. 🛠️ Fork 本项目

1. 点击 [Checklist](https://github.com/CrazySue/Checklist) 页面右上角的 **Fork** 按钮。
2. 修改完基本信息（如果有需要）后，点击下面的 **Create fork** 按钮。

## 2. 📂 选择贡献方向

<details>

<summary>💻 Code</summary>

### 1. 💻 代码

##### 允许贡献：

- 有意义的新功能
- 对已有代码的 Bug 修复
- 对已有代码的性能优化
- 对已有代码的 API 改进
- 对已有代码的注释完善和文档补充

##### 我们不接受：

- 提交未经讨论的大规模重构

##### 在编写代码时，请：

- 使用现代的 HTML 语法（HTML5及更高版本）
- 保证代码可读性和风格统一
- 使用有意义的变量名称
- 避免重复代码
- 添加必要的注释
- 删除调试代码
- 不提交压缩后的代码

##### 在提交贡献前，请再次确认：

- 能够正常运行
- 无 Console Error
- 不影响其它功能
- 已完成基本测试

</details>

<details>

<summary>🌐 Localisation</summary>

### 2. 🌐 本地化

我们正在寻找能够帮助将《检查单》翻译成简体中文以外其他语言的人。如果你对此感兴趣，请继续阅读。

##### 成为翻译者的要求：

- 你必须**精通**简体中文。
- 例如，如果你能看懂 Bilibili 上的简体中文视频，那么你的简体中文水平就很高。如果你需要借助翻译才能理解句子，那么你的简体中文水平就不高。
- 你必须是**目标**语言的母语人士。（如果你不是母语人士，但认为自己的语言水平足够流利，也可以申请加入。请记住，参加一些语言课程并不能让您达到流利的程度。如果你不会把智能手机的系统语言改成目标语言，那就说明你的语言水平还不够！）

##### 允许贡献：

- 新语言支持
- 已有的语言的错误修正

##### 在贡献本地化翻译时，请：

- 用词统一
- 不使用机器翻译原文直接提交
- 保持标点一致
- 不修改变量名称

##### 贡献步骤：

1. 在工程文件中找到多语言板块（在 `Release v1.0.0` 版本，多语言板块位于工程文件的第**1050**行）。
2. 在语言文件中，你会看到类似于 `app_name:'检查单'",` 这样格式的项。
3. 请仅修改冒号右边单引号内的文字。
4. 重复第3步，直到完成所有行的翻译。

</details>

<details>

<summary>💡 Other</summary>
### 💡 其他

有其他的贡献方向吗？如果是这样，请 [联系我们](mailto:bugs.crazysue@gmail.com) 以进行贡献。

</details>

## 3. 📡 提交

像往常那样，将你的贡献提交到你的 fork 仓库。不同的贡献方向对应了不同的文件存放位置：

```text
.
├── .github/              行为准则与 Issue 模板
├── docs/                 文档
├── build/                补丁管线、关键词主数据与测试套件
├── README.md             自述文件
└── LICENSE.txt           许可证
```

将你的贡献放在合适的文件夹下。

## 4. 🔗 创建 Pull Request

导航到 [Checklist](https://github.com/CrazySue/Checklist) 页面，点击 **Pull requests** 选项卡，然后点击 **New pull request** 按钮，点击 **Compare across forks** 链接，选择你的 fork 仓库。

审查更改，然后点击 **Create pull request** 按钮。

## 5. 🎉 哇哦！你做到了！

恭喜你！你完成了对本项目的贡献。现在你可以等待我们审阅你的拉取请求。
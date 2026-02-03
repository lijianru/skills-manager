# Skills Manager CLI

![License](https://img.shields.io/badge/license-MIT-blue.svg)

[English](README.md) | [中文](README_zh-CN.md)

**Skills Manager** 是一个专为开发者设计的 CLI 工具，用于从 GitHub 管理和分发 AI 编程助手的“技能”（配置、规则、Prompts 等）。

## 💡 动机 (Motivation)

开发者经常从 GitHub 寻找优质的 Cursor Rules 或 Copilot Prompts。然而，手动克隆、更新以及将这些配置分发到不同的 IDE（Cursor, Windsurf, Antigravity）是一项繁琐且难以维护的工作。

**Skills Manager** 解决了这个问题。它提供了一个统一的命令行界面，让你可以：
1.  **集中管理**：所有 Skills 统一存储，避免到处散落。
2.  **多 IDE 适配**：一键将 Skills 分发到 Cursor、Windsurf 或 Antigravity 的特定配置目录。
3.  **保持更新**：一条命令即可同步远程仓库的最新变更。

## ✨ 功能特性

*   **⚡️ 快速安装**: 从远程 Git 仓库克隆 Skills。
*   **🎯 按需分发**: 交互式选择仅安装仓库中的特定子目录（例如只安装 `awesome-cursor-rules` 中的 `python` 规则）。
*   **🔄 同步机制**: 采用文件复制策略，确保所有 IDE 都能完美读取，无惧软链接兼容性问题。
*   **🛠️ IDE 集成**: 内置以下编辑器/工具的路径检测，自动适配全局/项目配置：
    *   **Cursor**
    *   **Windsurf**
    *   **Antigravity**
    *   **Open Code**
    *   **Claude**
    *   **GitHub Copilot**
    *   **Kiro**
    *   **Codex**
*   **📦 集中更新**: `skm update` 一键拉取最新代码并自动覆盖更新所有已安装副本。

## 🚀 快速开始

### 1. 安装

```bash
npm install -g skills-manager
# 或者使用短命令别名
skm --help
```

### 2. 使用

**场景**：我想安装 `awesome-cursor-rules` 仓库，并将其中的 `python` 和 `nextjs` 规则应用到我的 Cursor 编辑器中。

```bash
skm install https://github.com/patrickjmcd/awesome-cursor-rules.git
```

**交互流程**：
1.  工具自动克隆仓库。
2.  选择子目录：勾选 `rules/python` 和 `rules/nextjs`。
3.  选择目标 IDE：选择 **Cursor**。
4.  选择安装模式：选择 **Global Install** (自动存入 `~/.cursor/rules/`)。

完成！

## 📖 使用指南

### 创建本地技能 (Create)
快速创建一个新的本地 Skill，生成模板文件并自动打开文件夹供编辑。

```bash
skm create <技能名称>
```

### 安装新技能 (Install)

```bash
skm install <git-url> [本地名称]
```

### 链接现有技能 (Link)

如果你已经安装了一个大的合集仓库，想从中添加更多 Skills：

```bash
skm link [仓库名称]
```
*支持选择目标为“自定义项目路径”，工具会自动追加对应的 IDE 技能目录（如 `.cursor/rules`）。*

### 查看列表 (List)

查看所有已安装的仓库及其分发情况：

```bash
skm list
```

### 更新技能 (Update)

拉取远程变更并自动同步（覆盖）本地所有副本：

```bash
# 更新所有
skm update

# 更新指定仓库
skm update my-skills
```

### 移除技能 (Remove)

删除仓库及所有分发副本：

```bash
skm remove my-skills
```

## 📄 开源协议 (License)

[MIT](LICENSE)

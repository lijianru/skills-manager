# Skills Manager CLI

![License](https://img.shields.io/badge/license-MIT-blue.svg)

[English](README.md) | [中文](README_zh-CN.md)

**Skills Manager** is a CLI tool designed to manage and distribute coding assistant "skills" (configurations, rules, prompts) from GitHub to your local IDEs.

## 💡 Motivation

Developers often source high-quality Cursor Rules or AI Prompts from GitHub repositories. However, manually cloning, updating, and linking these files to various IDEs (Cursor, Windsurf, Antigravity) is tedious and error-prone.

**Skills Manager** streamlines this workflow. It acts as a package manager for your AI skills:
1.  **Centralized Hub**: Stores all skills in one place (`~/.skills-manager/skills`).
2.  **IDE Ready**: Distributes skills to Cursor, Windsurf, or Antigravity with zero friction.
3.  **Always Up-to-Date**: Syncs remote changes to all your local installed copies with a single command.

## ✨ Features

*   **⚡️ Install**: Clone skills from any remote Git repository.
*   **🎯 Selective**: Interactively select specific sub-directories to install (e.g., just the `python` rules from a massive mono-repo).
*   **🔄 Sync Strategy**: Uses **file copying** instead of symlinks to ensure 100% compatibility with all IDEs.
*   **🛠️ IDE Integrations**: Built-in path detection for:
    *   **Cursor**
    *   **Windsurf**
    *   **Antigravity**
    *   **Open Code**
    *   **Claude**
    *   **GitHub Copilot**
    *   **Kiro**
    *   **Codex**
*   **📦 Auto-Update**: Run `skm update` to pull changes and automatically overwrite/sync all installed copies.

## 🚀 Quick Start

### 1. Installation

```bash
npm install -g skills-manager
# You can now use the 'skm' alias
skm --help
```

### 2. Usage Example

**Goal**: Install `awesome-cursor-rules` and apply the `python` rules to your global Cursor configuration.

```bash
skm install https://github.com/patrickjmcd/awesome-cursor-rules.git
```

**Interactive Flow**:
1.  **Clone**: The tool downloads the repo.
2.  **Select**: You check `rules/python` from the list.
3.  **Target**: You select **Cursor**.
4.  **Mode**: You select **Global Install**.

The tool automatically copies the files to `~/.cursor/rules/python`.

## 📖 Command Reference

### Create a Local Skill
Scaffold a new local skill in the `my-local-skills` collection.
Great for creating your own personal skills library.

```bash
skm create <name>
```

### Install & Distribute

Download a repo and interactively choose what to install and where.

```bash
skm install <git-url> [reference-name]
```

### Link / Distribute Existing

Add more skills from a repository you've already installed.

```bash
skm link [repo-name]
# If run with no args, prompts to select a repo
skm link
```

*Supports Custom Project paths: Select a project root, and `skm` will append the correct IDE folder (e.g., `.cursor/skills`).*

### List

View installed repositories and where their skills are distributed.

```bash
skm list
```

### Update

Pull the latest changes from Git and **overwrite** all local copies to keep them in sync.

```bash
# Update everything
skm update

# Update specific repo
skm update my-skills
```

### Remove

Delete a repository and all its distributed copies.

```bash
skm remove my-skills
```

## 📄 License

[MIT](LICENSE)

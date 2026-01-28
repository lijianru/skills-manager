# Skills Manager CLI

[English](#english) | [中文](#chinese)

<a name="english"></a>

## 🇬🇧 English

**Skills Manager** is a CLI tool designed for developers to manage coding assistant "skills" (configurations, rules, prompts stored in Git repositories). It simplifies the process of installing, updating, and linking these skills to your local projects or IDE configuration folders.

### Features

*   **Install**: Clone skills from remote Git repositories.
*   **Selective Linking**: Interactively select which specific sub-skills (folders) to link.
*   **IDE Integration**: Built-in presets for **Cursor**, **Windsurf**, and **Antigravity** to automatically detect global rule directories.
*   **Link**: Add links to skills from already installed repositories at any time.
*   **Update**: Keep your skills up-to-date with a single command.
*   **Manage**: List installed skills and remove them when no longer needed.
*   **Centralized Storage**: All skills are stored in `~/.skills-manager/skills`.

### Installation

```bash
# Install dependencies
pnpm install

# Build the project
pnpm run build

# Link globally (optional)
npm link
```

### Usage

#### Install a Skill
Download a skill and interactively link selected sub-skills.
```bash
skills-manager install <git-url> [name]
# Example
skills-manager install https://github.com/user/awesome-cursor-rules.git
```
*   **Interactive Flow**:
    1.  Select skills to link.
    2.  Select target IDE (or Custom).
    3.  Choose Global Install (auto-path) or Project Install.

#### Link Existing Skills
Link specific skills from a repository you have already installed.
```bash
skills-manager link [repo-name]
```

#### List Installed Skills
View all skills and their current links.
```bash
skills-manager list
```

#### Update Skills
Pull the latest changes from the remote repository.
```bash
# Update all skills
skills-manager update

# Update a specific skill
skills-manager update my-skill
```

#### Remove a Skill
Delete the skill and its symlinks.
```bash
skills-manager remove my-skill
```

---

<a name="chinese"></a>

## 🇨🇳 中文

**Skills Manager** 是一个专为开发者设计的 CLI 工具，用于通过 Git 仓库管理 AI 编程助手的“技能”（配置、规则、Prompts 等）。它简化了技能的安装、更新以及链接到本地项目或 IDE 配置目录的过程。

### 功能特性

*   **安装 (Install)**: 从远程 Git 仓库克隆技能。
*   **按需链接 (Selective Linking)**: 支持交互式选择仅链接仓库中的特定子目录。
*   **IDE 集成**: 内置 **Cursor**, **Windsurf**, **Antigravity** 预设，支持自动检测其全局规则目录。
*   **链接 (Link)**: 随时从已安装的仓库中追加链接其他技能。
*   **更新 (Update)**: 一键更新所有已安装的技能。
*   **管理 (Manage)**: 查看已安装的技能列表，或移除不再需要的技能。
*   **集中存储**: 所有技能统一存储在 `~/.skills-manager/skills` 目录下。

### 安装说明

```bash
# 安装依赖
pnpm install

# 构建项目
pnpm run build

# 全局软链 (可选)
npm link
```

### 使用指南

#### 安装技能
下载一个技能并交互式选择需要链接的子目录。
```bash
skills-manager install <git-url> [名称]
# 示例
skills-manager install https://github.com/user/awesome-cursor-rules.git
```
*   **交互流程**:
    1.  选择需要链接的 Skills。
    2.  选择目标 IDE (如 Cursor)。
    3.  选择全局安装 (自动路径) 或 项目安装。

#### 链接已安装的技能
从已安装的仓库中选择并链接更多技能。
```bash
skills-manager link [仓库名称]
```

#### 查看已安装技能
列出所有管理中的技能及其链接状态。
```bash
skills-manager list
```

#### 更新技能
从远程仓库拉取最新代码。
```bash
# 更新所有技能
skills-manager update

# 更新指定技能
skills-manager update my-skill
```

#### 移除技能
删除技能文件及其对应的软链接。
```bash
skills-manager remove my-skill
```

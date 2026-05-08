# 项目说明

# my-diary 项目记忆


## 项目简介
MY-DIARY 是一个个人日记 Web 应用项目。

---

## Skills 使用规则

在处理任何任务前，**先读取本文件中的项目记忆 / 项目规则**，再开始分析和执行。

在执行以下任务前，**必须先读取对应的 SKILL.md 文件**，然后再开始工作。

### 前端开发
- 创建或修改任何 UI 组件、页面、样式时  
  → 先读取 `.claude/skills/frontend-design/SKILL.md`

- 构建 Web 应用功能模块、页面路由、应用架构时  
  → 先读取 `.claude/skills/web-artifacts-builder/SKILL.md`

### 测试
- 编写或执行 Web 应用测试、E2E 测试、功能测试时  
  → 先读取 `.claude/skills/webapp-testing/SKILL.md`

### 文档生成
- 生成或编辑 `.docx` Word 文档时  
  → 先读取 `.claude/skills/docx/SKILL.md`

- 生成或处理 `.pdf` 文件时  
  → 先读取 `.claude/skills/pdf/SKILL.md`

- 生成或编辑 `.pptx` 演示文稿时  
  → 先读取 `.claude/skills/pptx/SKILL.md`

- 生成或处理 `.xlsx` 表格文件时  
  → 先读取 `.claude/skills/xlsx/SKILL.md`

- 多人协作文档编辑场景时  
  → 先读取 `.claude/skills/doc-coauthoring/SKILL.md`

### API 与集成
- 调用 Claude API、构建 AI 相关功能时  
  → 先读取 `.claude/skills/claude-api/SKILL.md`

- 构建或集成 MCP 工具、MCP Server 时  
  → 先读取 `.claude/skills/mcp-builder/SKILL.md`

### Skill 管理
- 创建新 Skill 或优化现有 Skill 时  
  → 先读取 `.claude/skills/skill-creator/SKILL.md`

- 查找适合当前任务的 Skill 时  
  → 先读取 `.claude/skills/find-skills/SKILL.md`

---

## 通用开发规范

- 语言：优先使用中文注释
- 代码风格：保持与现有 `src/` 目录一致
- 提交前：确保没有 TypeScript / ESLint 报错

---

## 目录结构说明

```
MY-DIARY/
├── .claude/
│   └── skills/          # Claude Skill 指导文件
├── src/                 # 源代码
├── public/              # 静态资源
└── dist/                # 构建产物（勿手动修改）
```




## 技术栈
- React + Vite + TypeScript
- Supabase（Auth + Database）
- 环境：Windows + PowerShell + VS Code + Claude Code 插件

## 需求文档
详见 ./日记App_MVP需求文档.md

## 已完成功能
- [x] 注册/登录流程完整可用
  - 注册成功后直接跳转日记首页，无需二次登录
  - Supabase 已关闭 Confirm email（记得在控制台 Save）
  - AuthContext.tsx 处理了无 session 时自动重新登录的兜底逻辑

## 已知问题 / 注意事项
- Supabase 控制台修改设置后必须点 Save，否则不生效
- 不要开启自定义 SMTP，否则发信失败会导致注册 500 报错

## 下一步（待开发）
- 提前说一下今天会做什么：

- Supabase 创建项目 + 数据库表
- 注册、登录、退出页面
- 将日记数据从本地存储迁移到云数据库
- 每个用户只能看到自己的日记
- 重新部署Vercel



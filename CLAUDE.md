# my-diary 项目记忆

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
- 待补充...
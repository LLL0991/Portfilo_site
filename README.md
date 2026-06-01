# Liang Portfolio

双语作品集网站脚手架（Next.js + TypeScript + Tailwind + next-intl）。

## 本地运行

```bash
cd ~/Desktop/Liang_portfolio
npm run dev
```

浏览器打开：

- 中文（默认）：http://localhost:3000/zh
- English：http://localhost:3000/en

## 项目结构

```
src/
  app/[locale]/          # 页面（首页 / 作品 / 关于 / 联系）
  components/            # UI 组件
  content/projects/      # 项目数据（JSON，后续可换 MDX）
  messages/              # 界面文案 zh.json / en.json
  i18n/                  # 双语路由配置
public/images/projects/  # 项目封面图
```

## 导航

当前导航仅包含：**作品 · 关于 · 联系**（不含 Play，按你的安排预留）。

## 已安装、待接入

- `gsap` / `@gsap/react` — 滚动与进场动效
- `lenis` — 平滑滚动（已在 `SmoothScroll` 中启用）

## 下一步建议

1. 在 Figma 定稿后替换 `globals.css` 中的颜色与字体
2. 把 `content/projects/index.json` 补全为你的真实项目
3. 封面图放入 `public/images/projects/`
4. 添加 `/work/[slug]` 案例详情页
5. 按需接入 GSAP ScrollTrigger

## 部署

推荐 [Vercel](https://vercel.com)：`git push` 后自动构建。

# Luluverse

个人操作系统 — Learn · Think · Create · Live

## 在线访问（云端部署）

将代码推送到 GitHub 后，可一键部署为公开网站：

### 1. 推送到 GitHub

```bash
git add .
git commit -m "deploy luluverse"
git push origin main
```

### 2. 开启 GitHub Pages

1. 打开仓库 → **Settings** → **Pages**
2. **Source** 选择 **GitHub Actions**
3. 推送代码后，Actions 会自动部署
4. 部署完成后访问：`https://你的用户名.github.io/luluverse/`

## 云端数据共享

网站部署后，数据默认仍在各设备本地。要**多设备同步 / 与他人共享数据**，需配置免费 Supabase 数据库：

### 1. 创建 Supabase 项目

1. 注册 [supabase.com](https://supabase.com)
2. 新建项目
3. 进入 **SQL Editor**，运行项目中的 `supabase-setup.sql`
4. 在 **Settings → API** 复制：
   - Project URL
   - `anon` `public` key

### 2. 在 Luluverse 中配置

1. 打开 **⚙️ 设置** → **云端同步**
2. 填入 Supabase URL 和 Anon Key
3. 点击 **创建新工作区**，获得 6 位共享代码
4. 在其他设备打开同一网站，输入代码后 **加入工作区**

### 3. 共享给他人

将网站链接 + 工作区代码发给对方，对方加入后即可同步笔记、项目等全部数据。

> 工作区代码即访问凭证，请勿公开泄露。

## 本地开发

```bash
python -m http.server 8080
```

浏览器访问 http://localhost:8080

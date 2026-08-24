# Aevren Heartbar

一个显示在 ChatGPT 正文前面的动态「砚底心音」MCP Apps 卡片。

## 手机部署

1. 把本文件夹上传到一个 GitHub 仓库。
2. 在 Render 新建 **Blueprint**，连接该仓库；它会读取 `render.yaml`。
3. 部署完成后复制 Render 发放的地址，并在末尾加 `/mcp`：

   `https://你的服务名.onrender.com/mcp`

4. ChatGPT → Settings → Security and login → Developer mode。
5. 打开 `https://chatgpt.com/plugins`，点加号，新建连接并粘贴 `/mcp` 地址。
6. 新开 Work 对话，启用该插件后发送：「显示 Aevren 的砚底心音，再回复我。」

健康检查地址为：`https://你的服务名.onrender.com/health`

## 本地测试

需要 Node.js 20 或更高版本。

```bash
npm install
npm start
```

然后访问 `http://127.0.0.1:2091/health`。

## 说明

- 工具是只读的，不使用 OpenAI API Key。
- 卡片字段由当前对话中的模型生成。
- MCP 工具是否调用仍由模型决定；若想提高出现率，请在插件技能或对话指令中明确要求先调用 `show_aevren_heartbar`。

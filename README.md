# 🌐 Discord TranslateBot
<div align="center">

[![Email](https://img.shields.io/badge/Email-jiaoyue0325%40jiaoyue.gay-EA4335?style=for-the-badge&logo=gmail&logoColor=white)](mailto:jiaoyue0325@jiaoyue.gay)
[![Discord](https://img.shields.io/badge/Discord-%E6%8E%88%E6%AC%8A%E5%B8%B3%E8%99%9F-5865F2?style=for-the-badge&logo=discord&logoColor=white)](https://discord.com/oauth2/authorize?client_id=1540739835801632938&integration_type=1&scope=applications.commands)

一款強大且靈活的 Discord AI 翻譯機器人，支援本地 **Ollama**（如 Qwen 2.5）與雲端 **Google Gemini** 雙引擎切換，提供流暢的訊息即時翻譯與繁簡字體轉換。

支援 Discord **User Apps（使用者安裝）**，你可以將機器人直接綁定在個人帳號上，在任何伺服器、群組或私訊中隨時使用！

---

## ✨ 主要特色

- 🤖 **雙 AI 引擎支援**：可自由選擇使用本地端 **Ollama**（預設 `qwen2.5:latest`）或 Google **Gemini API**（如 `gemini-2.5-flash`）。
- 👤 **支援 User Apps（個人安裝）**：無論是在私訊 (DM)、群組或未加入該機器人的伺服器中，只要右鍵即可隨時翻譯。
- 🖱️ **訊息右鍵捷徑**：直接在想翻譯的訊息上右鍵 ➔「應用程式 (Apps)」➔「**翻譯此訊息**」，迅速取得譯文。
- ⚙️ **頻道自訂語言**：使用 `/翻譯` 指令即可隨時設定目標語言（繁體中文、簡體中文、English、日本語、한국어 等）。
- 🔒 **私密回應 (Ephemeral)**：翻譯結果預設僅自己可見，不打擾頻道其他成員聊天。
- 📝 **繁簡精準轉換**：針對中文繁簡轉換進行專門提示詞優化，保持用詞原汁原味與表情符號（XD、OwO 等），不擅自替換習慣用語。

---

## 📖 使用教學

### 1. 設定目標語言
在對話框輸入 `/翻譯` 斜線指令：
- **`target_lang`（必填）**：選擇想要翻譯成哪種語言（如 `繁體中文`、`English`、`日本語` 等）。
- **`source_lang`（選填）**：來源語言（預設為「自動偵測」）。

### 2. 翻譯訊息
1. 在任何文字訊息上點擊**滑鼠右鍵**（手機版長按訊息）。
2. 選擇 **「應用程式 (Apps)」** ➔ **「翻譯此訊息」**。
3. 機器人將立即回傳該訊息的翻譯內容。

---

## 🛠️ 自架與開發指南

如果你想自行部署這台機器人，請參考以下步驟：

### 必備環境
- [Node.js](https://nodejs.org/) (建議 v18 以上，支援原生 Fetch API)
- [Ollama](https://ollama.ai/)（若使用本地模型）或 [Google AI Studio API Key](https://aistudio.google.com/)（若使用 Gemini）

### 1. 取得專案原始碼與安裝依賴
```bash
git clone https://github.com/jiaoyue-team/discord-translatebot.git
cd discord-translatebot
npm install
```

### 2. 設定環境變數 (`.env`)
在專案根目錄建立 `.env` 檔案，填入你的 Discord Bot 資訊：
```env
DISCORD_TOKEN=你的_DISCORD_BOT_TOKEN
CLIENT_ID=你的_DISCORD_APPLICATION_CLIENT_ID
```

### 3. 設定翻譯引擎 (`config.js`)
編輯 `config.js`，依需求調整翻譯後端：

```javascript
module.exports = {
  // 本地 Ollama 設定
  ollama: {
    url: "http://127.0.0.1:11434",
    model: "qwen2.5:latest"
  },
  // Google Gemini 設定
  gemini: {
    enabled: false, // 改為 true 啟用 Gemini
    model: "gemini-2.5-flash",
    token: "你的_GEMINI_API_KEY" // 啟用時請填入 API Key
  }
};
```

### 4. 啟動機器人
```bash
npm start
```
啟動後，機器人會自動向 Discord 註冊全域應用程式指令（包含 `/翻譯` 及右鍵訊息選單 `翻譯此訊息`）。

---

## ⚠️ 免責聲明 (Disclaimer)

所有翻譯與轉換結果皆由 AI 自動生成，內容可能存在誤差或不準確之處，僅供日常參考與交流輔助使用。


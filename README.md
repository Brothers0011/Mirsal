<div align="center">

# 🤖 Mirsal AI - WhatsApp Auto-Responder

[![License](https://img.shields.io/badge/License-Custom_Non--Commercial-blue.svg?style=for-the-badge)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-18.x-green.svg?style=for-the-badge)](https://nodejs.org)
[![OpenRouter API](https://img.shields.io/badge/AI-OpenRouter-orange.svg?style=for-the-badge)](https://openrouter.ai/)
[![WhatsApp Web JS](https://img.shields.io/badge/WhatsApp-wwebjs-25D366?style=for-the-badge&logo=whatsapp&logoColor=white)](https://wwebjs.dev/)

Mirsal is an intelligent, automated WhatsApp response agent built with **Node.js** and powered by cutting-edge AI via the **OpenRouter API** (`google/gemini-2.5-flash-lite` / `gemini-pro`). By deeply understanding context, the system autonomously categorizes incoming messages and replies with highly tailored responses. Whether it's an Islamic greeting, a time-specific social interaction, or festive holiday wishes, Mirsal ensures your chats are handled gracefully.

</div>

---

## ✨ Features

- 🧠 **AI-Powered Categorization**: Leverages external Intelligence (Gemini via OpenRouter) to contextually classify and respond to messages, while smartly ignoring irrelevant chatter.
- 🎛️ **Interactive CLI Dashboard**: An intuitive control panel powered by `inquirer` allowing you to toggle modes dynamically and seamlessly in real-time.
- 🎯 **Dynamic Reply Modes**:
  - 🕌 **Salam Mode**: Gracefully acknowledges and responds to Islamic greetings.
  - 🌅 **Welcome Day / 🌃 Night / 🌗 Both**: Reacts contextually to everyday social greetings based on your preferences.
  - 🎉 **Eid Mode**: Instantly spreads festivity through customizable text or elegant image-based replies.
- 🟢 **Presence Management**: Integrated "Always Online" mode to keep your digital availability robust.

## ⚠️ License & Commercial Use Restriction

This project is proudly **Open Source for non-commercial use only**.

> You are welcome to use, study, copy, modify, and distribute this software for personal and educational purposes.  
> **Commercial utilization is strictly prohibited** without obtaining prior written permission from the owner. For exhaustive terms and details, kindly review the [LICENSE](LICENSE) file.

## 🛠️ Prerequisites

Before venturing forth, please secure the following prerequisites:

- 🟢 **[Node.js](https://nodejs.org/)** (v16.x or strictly higher)
- 📦 **`npm`** (Node Package Manager - bundled with Node.js)
- 🔑 A valid **OpenRouter API Key** to breathe analytical life into the bot.
- 📱 A secondary WhatsApp account (or your primary one) ready to scan the authentication QR code.

## 🚀 Installation & Setup

1. **Clone & Navigate**
   Extract or clone the project and traverse into the root directory utilizing your terminal.

2. **Install Dependencies**
   ```bash
   npm install
   ```
   *This operation instantiates necessary dependencies precisely outlined in `package.json` (such as `whatsapp-web.js`, `axios`, `inquirer`, and `qrcode-terminal`).*

3. **Initialize the Eid Media Directory**
   Upon initial execution, an `eid_images` folder will organically emerge if absent. Populate this directory with artistic `.jpg`, `.jpeg`, `.png`, or `.gif` imagery that the bot will broadcast when configured to image-based **Eid Mode**.

## 🎮 Running the Application

1. **Ignite the Engine:**
   ```bash
   node index.js
   ```

2. **First-Time Configuration:**
   - You will be courteously prompted to supply your **API Key** (confidentially safeguarded within `config.json`).
   - Subsequently, a vivid QR Code materializes in your terminal.

3. **Device Linkage:**
   - Launch WhatsApp on your mobile device.
   - Proceed to **Linked Devices** -> **Link a Device**.
   - Scan the terminal's QR code.

4. **Command CLI Panel:**
   Once authenticated, command the bot seamlessly via the dynamic real-time dashboard:
   ```text
     ◈── CONTROL PANEL ──◈
     Salam:🟢 | Day:🔴 | Night:🔴 | Both:🔴 | Eid:🟢
   ```

## ⚙️ Configuration (`config.json`)

Mirsal automatically maintains a resilient `config.json` preferences matrix at its root structure. This includes:
- **API Credentials**
- **Active Module States** (`salamMode`, `welcomeDay`, `welcomeNight`, `eidMode`)
- **Behavior Settings** (`alwaysOnline`, `replyMode`, `eidReplyType`: Image/Text)

## 🏗️ Technical Stack

- **[whatsapp-web.js](https://wwebjs.dev/)**: The heartbeat for WhatsApp Web API interaction via robust Puppeteer instances.
- **[axios](https://axios-http.com/)**: Seamless, promise-based HTTP requests funneling to OpenRouter.
- **[qrcode-terminal](https://www.npmjs.com/package/qrcode-terminal)**: Renders the vital authentication QR code directly within standard terminal bounds.
- **[inquirer](https://www.npmjs.com/package/inquirer)**: Powers up the interactive, stateful terminal dashboard arrays.

---

> **Disclaimer:** This tool is not affiliated with, authorized, maintained, sponsored, or endorsed by WhatsApp or any of its affiliates or subsidiaries. This is an independent and unofficial software.

<br>

<div align="center">

Made with love by its developers ❤️

</div>

# Mirsal AI - WhatsApp Auto-Responder 🤖

![License](https://img.shields.io/badge/License-Custom_Non--Commercial-blue.svg)
![Node.js](https://img.shields.io/badge/Node.js-18.x-green.svg)

Mirsal is an intelligent, automated WhatsApp response agent built with Node.js and powered by AI via the OpenRouter API (using `google/gemini-pro` / `gemini-2.5-flash-lite`). The system automatically categorizes incoming messages and replies with relevant context-aware responses, including Islamic greetings (Salam), daily greetings, and holiday wishes (Eid).

## 🌟 Features

- **AI-Powered Categorization:** Intelligently classifies messages into specific greeting categories or skips them if irrelevant using external AI models.
- **Interactive CLI Dashboard:** Control panel built with `inquirer` to toggle various modes in real-time.
- **Dynamic Reply Modes:**
  - `Salam Mode`: Responds to Islamic greetings.
  - `Welcome Day / Night / Both`: Responds contextually to daily social greetings.
  - `Eid Mode`: Sends text or image-based replies for holidays.
- **Presence Management:** Configurable "Always Online" mode.

## ⚠️ License and Commercial Use Restriction

This project is **Open Source for non-commercial use only**.
You are permitted to use, copy, modify, and distribute this software for personal and educational purposes. **Any commercial use is strictly prohibited** without prior written permission from the owner. For complete terms and detailed information, please read the [LICENSE](LICENSE) file.

## 🛠️ Prerequisites

Before you begin, ensure you have the following installed on your machine:

- **[Node.js](https://nodejs.org/)** (v16.x or higher is recommended)
- **`npm`** (Node Package Manager - comes with Node.js)
- A valid **OpenRouter API Key** for the AI model to function.
- A secondary WhatsApp account (or your main one) to scan the authentication QR code.

## 📦 Installation & Setup

1. **Clone the repository or extract the project files:**
   Open your terminal and navigate to the project's root directory.

2. **Install the required libraries:**
   ```bash
   npm install
   ```
   *This command will install necessary dependencies defined in `package.json`, including `whatsapp-web.js`, `axios`, `inquirer`, and `qrcode-terminal`.*

3. **Initialize the Eid Images folder:**
   The project will automatically create an `eid_images` folder on its first run if it doesn't exist. You can populate this folder with `.jpg`, `.jpeg`, `.png`, or `.gif` images that the bot will use when replying in `Eid Mode` (provided the image reply type is selected).

## 🚀 Running the Project

1. **Start the application:**
   ```bash
   node index.js
   ```

2. **Initial Configuration:**
   - On the very first run, you will be prompted to enter your **API Key** (which will be stored securely in the `config.json` file).
   - A QR Code will then be generated in the terminal.

3. **Link Your WhatsApp:**
   - Open WhatsApp on your phone.
   - Go to **Linked Devices** -> **Link a Device**.
   - Scan the QR code displayed in your terminal.

4. **Control Panel:**
   Once successfully authenticated, you will see a Command Line Interface (CLI) menu where you can enable or disable different response modes dynamically.

```text
  ◈── CONTROL PANEL ──◈
  Salam:🟢 | Day:🔴 | Night:🔴 | Both:🔴 | Eid:🟢
```

## ⚙️ Configuration (`config.json`)

The bot generates and manages a `config.json` file inside the root directory to store your preferences, such as:
- API credentials
- Active modules toggles (`salamMode`, `welcomeDay`, `welcomeNight`, `eidMode`)
- Detailed bot behavior settings (`alwaysOnline`, `replyMode`, `eidReplyType`: Image vs. Text)

## 🏗️ Technical Stack

- **[whatsapp-web.js](https://wwebjs.dev/)**: Core library for WhatsApp Web API interaction via Puppeteer.
- **[axios](https://axios-http.com/)**: Handles HTTP requests to the OpenRouter/Gemini API for intent classification.
- **[qrcode-terminal](https://www.npmjs.com/package/qrcode-terminal)**: Renders the authentication QR code directly in the Command Line Interface.
- **[inquirer](https://www.npmjs.com/package/inquirer)**: Powers the interactive, stateful terminal dashboard.

---

**Disclaimer:** This tool is not affiliated with, authorized, maintained, sponsored, or endorsed by WhatsApp or any of its affiliates or subsidiaries. This is an independent and unofficial software.

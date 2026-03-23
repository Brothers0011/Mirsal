<div align="center">

# 🤖 Mirsal AI - WhatsApp Auto-Responder

[![License](https://img.shields.io/badge/License-Custom_Non--Commercial-blue.svg?style=for-the-badge)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-18.x-green.svg?style=for-the-badge)](https://nodejs.org)
[![OpenRouter API](https://img.shields.io/badge/AI-OpenRouter-orange.svg?style=for-the-badge)](https://openrouter.ai/)
[![Google Gemini](https://img.shields.io/badge/Vision-Google_Gemini-4285F4?style=for-the-badge&logo=google-gemini&logoColor=white)](https://aistudio.google.com/)
[![WhatsApp Web JS](https://img.shields.io/badge/WhatsApp-wwebjs-25D366?style=for-the-badge&logo=whatsapp&logoColor=white)](https://wwebjs.dev/)

Mirsal is an intelligent, automated WhatsApp response agent built with **Node.js** and powered by cutting-edge AI via **OpenRouter** and **Google AI Studio**. By deeply understanding context, the system autonomously categorizes incoming text, images, and stickers to provide highly tailored responses. Whether it's an Islamic greeting, a morning wish, or a festive Eid sticker, Mirsal ensures your chats are handled with human-like precision.

</div>

---

## ✨ Features

- 🧠 **Multimodal AI Analysis**: 
  - **Text**: Contextual classification via `gemini-2.5-flash-lite`.
  - **Images**: Visual understanding via `gemini-2.5-flash` to recognize greetings inside photos.
  - **Stickers**: Automatic conversion and analysis of stickers to identify their intent.
- 🎛️ **Interactive CLI Dashboard**: An intuitive, premium-styled control panel allowing you to toggle modes and settings in real-time.
- 🎯 **Contextual Response Modes**:
  - 🕌 **Salam Mode**: Responds to Islamic greetings with traditional replies.
  - 🌅 **Social Greetings**: Specific handling for Morning (**Sabah**), Evening (**Masa**), and general welcomes.
  - 🎉 **Eid Mode**: Spreads joy through customizable text or random image-based replies.
- 🟢 **Always Online**: Keeps your WhatsApp status active and available.
- 🛡️ **Smart Filtering**: Automatically ignores group chats, broadcast lists, and gibberish messages.

## ⚠️ License & Commercial Use Restriction

This project is **Open Source for non-commercial use only**.

> You are welcome to use, study, copy, modify, and distribute this software for personal and educational purposes.  
> **Commercial utilization is strictly prohibited** without obtaining prior written permission. See [LICENSE](LICENSE) for details.

## 🛠️ Prerequisites

To run Mirsal, you will need:

- 🟢 **Node.js** (v18.x or higher)
- 🔑 **OpenRouter API Key** (for text analysis)
- 🔑 **Google Gemini API Key** (for image/sticker vision analysis)
- 📱 A WhatsApp account to link via QR code.

## 🚀 Installation & Setup

1. **Clone & Install**
   ```bash
   npm install
   ```

2. **Populate Media**
   Place your Eid celebration images in the `eid_images` folder (created automatically on first run). These will be used for image-reply mode.

3. **Launch**
   ```bash
   node index.js
   ```

4. **Configuration**
   On the first run, the bot will ask for your API keys. They are securely saved in `config.json`.

## 🎮 How it Works

Mirsal doesn't just "reply"; it **analyzes**:

1. **Message Arrives**: Could be text, an image, or a sticker.
2. **Vision/Text Analysis**: If it's a visual message, it's processed by the **Gemini 2.5 Flash** vision model.
3. **Classification**: The AI detects the intent (e.g., `eid`, `w_day`, `salam`).
4. **Smart Reply**: Based on your active modes, Mirsal picks a random, culturally appropriate reply (Text or Image).

## ⚙️ Settings (`config.json`)

Configure your bot directly through the CLI or by editing `config.json`:
- `imageAnalysis`: Toggle AI analysis for incoming photos.
- `stickerAnalysis`: Toggle AI analysis for incoming stickers.
- `eidReplyType`: Choose between `text` or `image` for Eid responses.
- `alwaysOnline`: Persistence management.

---

> **Disclaimer:** This tool is an independent and unofficial software. It is not affiliated with or endorsed by WhatsApp Inc.

<br>

<div align="center">

Made with love by its developers ❤️

</div>


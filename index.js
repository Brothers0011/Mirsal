const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const inquirer = require('inquirer');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const CONFIG_FILE = './config.json';
const EID_FOLDER = './eid_images';

if (!fs.existsSync(EID_FOLDER)) fs.mkdirSync(EID_FOLDER);

let config = {
    salamMode: false, welcomeDay: false, welcomeNight: false, welcomeBoth: false, eidMode: false,
    apiKey: '',
    googleApiKey: 'AIzaSyCYj9jcz_r03RsCQQhB47m-3YnqvW0AYew',
    settings: {
        alwaysOnline: false,
        replyMode: true,
        eidReplyType: 'text',
        imageAnalysis: false
    }
};

if (fs.existsSync(CONFIG_FILE)) {
    try {
        const loaded = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
        config = { ...config, ...loaded, settings: { ...config.settings, ...loaded.settings } };
    } catch (e) { }
}
function saveConfig() { fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2)); }

const AI_MODEL = "google/gemini-2.5-flash-lite"; // OpenRouter للتصنيف النصي
const VISION_MODEL = "gemini-2.5-flash"; // Google AI Studio للصور (الإصدار الأحدث والأذكى)
let lastMain = 'salam', lastSet = 'alwaysOnline', onlineInt = null, client;
const getStatus = (v) => v ? '🟢' : '🔴';

const ask = (m, c, d) => inquirer.prompt([{
    type: 'list', name: 'a', message: m, choices: c, default: d,
    prefix: '', suffix: '', loop: false
}]);

// دالة التصنيف النصي (عبر OpenRouter - بنظام القواعد الصارم لمنع الأخطاء)
async function classifyMessage(text) {
    if (!config.apiKey) return 'hadith';
    try {
        const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
            model: AI_MODEL,
            messages: [{
                role: "system",
                content: `Classify the message into EXACTLY one word: 'salam', 'w_day', 'w_night', 'w_both', 'eid', or 'hadith'.
                
                RULES:
                1. 'salam': ONLY for clear Islamic greetings like "السلام عليكم".
                2. 'w_day', 'w_night', 'w_both': ONLY for clear social greetings (صباح الخير, هلا, إلخ).
                3. 'eid': ONLY for holiday greetings.
                4. 'hadith': FOR EVERYTHING ELSE. This includes:
                   - Random letters or repeated characters (e.g., "اا", "وو", "يي", "هههه", "؟").
                   - Personal questions (كيف حالك, شو اخبارك).
                   - Random words, links, or files.
                
                CRITICAL: If the message is just 1 or 2 repeated letters or doesn't make sense, ALWAYS classify as 'hadith'. 
                Respond ONLY with the category word.`
            }, { role: "user", content: text }],
            max_tokens: 5, temperature: 0
        }, {
            headers: { 'Authorization': `Bearer ${config.apiKey}`, 'Content-Type': 'application/json' },
            timeout: 5000
        });
        return response.data?.choices?.[0]?.message?.content.toLowerCase().trim().replace(/[^\w]/g, '') || 'hadith';
    } catch (e) { return 'hadith'; }
}

// دالة تحليل الصور (عبر Google AI Studio مباشرة - بنظام فحص بصري دقيق)
async function classifyImageMessage(media) {
    if (!config.googleApiKey) return 'hadith';
    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${VISION_MODEL}:generateContent?key=${config.googleApiKey}`;
        
        const response = await axios.post(url, {
            contents: [{
                parts: [
                    { 
                        text: `TASK: Classify this image into EXACTLY one of these categories: 'salam', 'w_day', 'w_night', 'w_both', 'eid', or 'hadith'.

CATEGORIES & VISUAL SIGNS:
1. 'eid': Look for holiday greetings. Keywords: "عيد مبارك", "كل عام وأنتم بخير", "عساكم من عواده", "Eid Mubarak". Visuals: Balloons, crescent moons, sheep (Adha), mosque silhouettes, or festive greeting cards.
2. 'salam': Look for Islamic greeting text like "السلام عليكم ورحمة الله وبركاته" or "صباح السلام".
3. 'w_day': Look for morning cards. Keywords: "صباح الخير", "صباح النور", "Good Morning". Visuals: Sun, coffee, flowers with morning text.
4. 'w_night': Look for evening cards. Keywords: "مساء الخير", "مساء النور", "تصبح على خير". Visuals: Moon, stars, candles with evening text.
5. 'w_both': General welcome images/cards like "هلا", "مرحبا", "Welcome", or social greeting cards without time specific text.
6. 'hadith': For everything else - photos of people, food, objects, nature (without greeting text), memes, or screenshots.

CRITICAL RULE: Respond ONLY with the single category word. If there is ANY doubt between a social card and a regular photo, choose 'hadith'.` 
                    },
                    {
                        inline_data: {
                            mime_type: media.mimetype,
                            data: media.data
                        }
                    }
                ]
            }]
        }, { timeout: 15000 });

        const result = response.data?.candidates?.[0]?.content?.parts?.[0]?.text?.toLowerCase().trim().replace(/[^\w]/g, '') || 'hadith';
        const validCategories = ['salam', 'w_day', 'w_night', 'w_both', 'eid', 'hadith'];
        return validCategories.includes(result) ? result : 'hadith';
    } catch (e) {
        return 'hadith';
    }
}

async function startApp() {
    if (!config.apiKey) {
        console.clear();
        console.log('\x1b[33mSetup required: Please configure API keys in Settings.\x1b[0m');
    }

    client = new Client({
        authStrategy: new LocalAuth(),
        puppeteer: { headless: "new", args: ['--no-sandbox', '--disable-gpu', '--no-zygote'] }
    });

    client.on('qr', q => { console.clear(); qrcode.generate(q, { small: true }); });
    client.on('ready', () => { if (config.settings.alwaysOnline) manageOnline(true); renderMenu(); });

    client.on('message', async m => {
        if (m.from.includes('@g.us') || m.from === 'status@broadcast') return;

        try {
            const isImageMsg = m.hasMedia && m.type === 'image';

            // تحليل الصور: (عبر Google API)
            if (isImageMsg && config.eidMode && config.settings.imageAnalysis) {
                let media;
                try { media = await m.downloadMedia(); } catch (e) { return; }
                if (!media) return;

                const cat = await classifyImageMessage(media);
                const sender = m.from.split('@')[0];

                console.log(`\n\x1b[90m[${new Date().toLocaleTimeString()}]\x1b[0m \x1b[35m@${sender}\x1b[0m: \x1b[90m[Image Message]\x1b[0m`);
                console.log(`\x1b[33m   └─ Google Vision AI: ${cat}\x1b[0m`);

                if (cat === 'eid') {
                    let r = null;
                    let isImageReply = false;

                    if (config.settings.eidReplyType === 'image') {
                        const files = fs.readdirSync(EID_FOLDER).filter(f => /\.(jpg|jpeg|png|gif|webp)$/i.test(f));
                        if (files.length > 0) {
                            const randomImg = files[Math.floor(Math.random() * files.length)];
                            r = MessageMedia.fromFilePath(path.join(EID_FOLDER, randomImg));
                            isImageReply = true;
                        } else {
                            r = "وأنتم بخير وصحة وعافية، تقبل الله منا ومنكم.";
                        }
                    } else {
                        r = "وأنتم بخير وصحة وعافية، تقبل الله منا ومنكم.";
                    }

                    console.log(`\x1b[33m   └─ Status: ✅ ${isImageReply ? 'Replied Image' : 'Replied Text'}\x1b[0m`);
                    if (!isImageReply) {
                        const chat = await m.getChat();
                        await chat.sendStateTyping();
                    }
                    await client.sendMessage(m.from, r, config.settings.replyMode ? { quotedMessageId: m.id._serialized } : {});
                } else {
                    console.log(`\x1b[33m   └─ Status: ⏭️ Skipped\x1b[0m`);
                }
                return;
            }

            if (!m.body) return;

            const cat = await classifyMessage(m.body);
            let r = null;
            let isImageReply = false;

            if (cat === 'salam' && config.salamMode) r = 'وعليكم السلام ورحمة الله وبركاته، حياك الله.';
            else if (cat === 'w_day' && config.welcomeDay) r = 'صباح النور والسرور، يا مية أهلاً.';
            else if (cat === 'w_night' && config.welcomeNight) r = 'مساء الورد والياسمين، حياك الله.';
            else if (cat === 'w_both' && config.welcomeBoth) r = 'يا هلا والله، منور يا غالي.';
            else if (cat === 'eid' && config.eidMode) {
                if (config.settings.eidReplyType === 'image') {
                    const files = fs.readdirSync(EID_FOLDER).filter(f => /\.(jpg|jpeg|png|gif|webp)$/i.test(f));
                    if (files.length > 0) {
                        const randomImg = files[Math.floor(Math.random() * files.length)];
                        r = MessageMedia.fromFilePath(path.join(EID_FOLDER, randomImg));
                        isImageReply = true;
                    } else { r = "وأنتم بخير وصحة وعافية، تقبل الله منا ومنكم."; }
                } else { r = "وأنتم بخير وصحة وعافية، تقبل الله منا ومنكم."; }
            }

            const sender = m.from.split('@')[0];
            const statusIcon = r ? '✅' : '⏭️';
            console.log(`\n\x1b[90m[${new Date().toLocaleTimeString()}]\x1b[0m \x1b[36m@${sender}\x1b[0m: "${m.body}"`);
            console.log(`\x1b[33m   └─ AI: ${cat} | Status: ${statusIcon} ${r ? (isImageReply ? 'Replied Image' : 'Replied Text') : 'Skipped'}\x1b[0m`);

            if (r) {
                const chat = await m.getChat();
                if (!isImageReply) await chat.sendStateTyping();
                await client.sendMessage(m.from, r, config.settings.replyMode ? { quotedMessageId: m.id._serialized } : {});
            }
        } catch (err) { }
    });

    process.on('unhandledRejection', error => { if (!error.message.includes('context destroyed')) return; });
    client.initialize();
}

async function renderMenu() {
    console.clear();
    const statusLine = `Salam:${getStatus(config.salamMode)} | Day:${getStatus(config.welcomeDay)} | Night:${getStatus(config.welcomeNight)} | Both:${getStatus(config.welcomeBoth)} | Eid:${getStatus(config.eidMode)}`;
    const header = `\x1b[1m\x1b[32m✅ CONNECTED | MIRSAL AI\x1b[0m\n\n  ◈── CONTROL PANEL ──◈\n  ${statusLine}\n`;

    const { a } = await ask(header + '  Choose Action:', [
        { name: `${getStatus(config.salamMode)} Salam Mode`, value: 'salam' },
        { name: `${getStatus(config.welcomeDay)} Welcome Day`, value: 'w_day' },
        { name: `${getStatus(config.welcomeNight)} Welcome Night`, value: 'w_night' },
        { name: `${getStatus(config.welcomeBoth)} Welcome Both`, value: 'w_both' },
        { name: `${getStatus(config.eidMode)} Eid Mode`, value: 'eid' },
        { name: '⚙️ Settings', value: 'settings' },
        { name: '🚪 Exit', value: 'exit' }
    ], lastMain);

    lastMain = a;
    if (a === 'salam') config.salamMode = !config.salamMode;
    else if (a === 'w_day') config.welcomeDay = !config.welcomeDay;
    else if (a === 'w_night') config.welcomeNight = !config.welcomeNight;
    else if (a === 'w_both') config.welcomeBoth = !config.welcomeBoth;
    else if (a === 'eid') config.eidMode = !config.eidMode;
    else if (a === 'settings') return renderSettings();
    else if (a === 'exit') process.exit();

    saveConfig(); renderMenu();
}

async function renderSettings() {
    console.clear();
    const eidTypeLabel = config.settings.eidReplyType === 'text' ? '📝 Text' : '🖼️ Image';
    const header = `\n  ◈── SETTINGS ──◈\n`;

    const choices = [
        { name: `${getStatus(config.settings.alwaysOnline)} Always Online`, value: 'online' },
        { name: `${getStatus(config.settings.replyMode)} Reply Mode (Quote)`, value: 'reply' },
        { name: `🎉 Eid Reply Type: [ ${eidTypeLabel} ]`, value: 'eid_type' },
    ];

    if (config.eidMode) {
        choices.push({
            name: `${getStatus(config.settings.imageAnalysis)} Image Analysis  \x1b[90m(Direct Google API)\x1b[0m`,
            value: 'image_analysis'
        });
    }

    choices.push(
        { name: '🔑 Update OpenRouter API Key', value: 'key_or' },
        { name: '🔑 Update Google AI Studio Key', value: 'key_google' },
        { name: '⬅️ Back', value: 'back' }
    );

    const { a } = await ask(header + '  Adjust Preferences:', choices, lastSet);

    lastSet = a;
    if (a === 'online') { config.settings.alwaysOnline = !config.settings.alwaysOnline; manageOnline(config.settings.alwaysOnline); }
    else if (a === 'reply') config.settings.replyMode = !config.settings.replyMode;
    else if (a === 'eid_type') config.settings.eidReplyType = config.settings.eidReplyType === 'text' ? 'image' : 'text';
    else if (a === 'image_analysis') config.settings.imageAnalysis = !config.settings.imageAnalysis;
    else if (a === 'key_or') {
        const { k } = await inquirer.prompt([{ type: 'password', name: 'k', message: 'Enter OpenRouter Key:', mask: '*' }]);
        if (k) config.apiKey = k;
    }
    else if (a === 'key_google') {
        const { k } = await inquirer.prompt([{ type: 'password', name: 'k', message: 'Enter Google API Key:', mask: '*' }]);
        if (k) config.googleApiKey = k;
    }
    else if (a === 'back') return renderMenu();

    saveConfig(); renderSettings();
}

function manageOnline(start) {
    if (onlineInt) clearInterval(onlineInt);
    if (start) onlineInt = setInterval(() => { if (client?.pupPage) client.sendPresenceAvailable().catch(() => { }); }, 5000);
}

startApp();
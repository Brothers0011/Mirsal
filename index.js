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

const AI_MODEL = "google/gemini-2.5-flash-lite";
const VISION_MODEL = "meta-llama/llama-3.2-11b-vision-instruct";
let lastMain = 'salam', lastSet = 'alwaysOnline', onlineInt = null, client;
const getStatus = (v) => v ? '🟢' : '🔴';

const ask = (m, c, d) => inquirer.prompt([{
    type: 'list', name: 'a', message: m, choices: c, default: d,
    prefix: '', suffix: '', loop: false
}]);

// دالة التصنيف المحدثة لمنع تصنيف الحروف العشوائية كسلام
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

// دالة تحليل الصور عبر نموذج الرؤية
async function classifyImageMessage(media) {
    if (!config.apiKey) return 'hadith';
    try {
        const base64Data = media.data;
        const mimeType = media.mimetype || 'image/jpeg';

        const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
            model: VISION_MODEL,
            messages: [{
                role: "user",
                content: [
                    {
                        type: "text",
                        text: `Analyze this image and classify it into EXACTLY one word from these categories: 'salam', 'w_day', 'w_night', 'w_both', 'eid', or 'hadith'.
                        
                        RULES:
                        1. 'salam': If the image contains Islamic greeting text like "السلام عليكم".
                        2. 'w_day': If the image contains morning greeting (صباح الخير, Good Morning).
                        3. 'w_night': If the image contains evening/night greeting (مساء الخير, Good Evening/Night).
                        4. 'w_both': If the image contains a general day greeting (هلا, مرحبا) without time specifics.
                        5. 'eid': If the image is an Eid greeting, holiday celebration, or contains text like (عيد مبارك, كل عام وأنتم بخير, Eid Mubarak).
                        6. 'hadith': For everything else - regular photos, memes, nature, people, objects, etc.
                        
                        Respond ONLY with the single category word, nothing else.`
                    },
                    {
                        type: "image_url",
                        image_url: {
                            url: `data:${mimeType};base64,${base64Data}`
                        }
                    }
                ]
            }],
            max_tokens: 10,
            temperature: 0
        }, {
            headers: {
                'Authorization': `Bearer ${config.apiKey}`,
                'Content-Type': 'application/json'
            },
            timeout: 15000
        });

        const result = response.data?.choices?.[0]?.message?.content?.toLowerCase().trim().replace(/[^\w]/g, '') || 'hadith';
        const validCategories = ['salam', 'w_day', 'w_night', 'w_both', 'eid', 'hadith'];
        return validCategories.includes(result) ? result : 'hadith';
    } catch (e) {
        return 'hadith';
    }
}

async function startApp() {
    if (!config.apiKey) {
        console.clear();
        const { key } = await inquirer.prompt([{ type: 'password', name: 'key', message: 'Enter API Key:', mask: '*' }]);
        config.apiKey = key; saveConfig();
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
            const hasMedia = m.hasMedia && ['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(m.type === 'image' ? 'image/jpeg' : m._data?.mimetype);
            const isImageMsg = m.hasMedia && m.type === 'image';

            // تحليل الصور: فقط إذا كان eid mode مفعّل وimage analysis مفعّل
            if (isImageMsg && config.eidMode && config.settings.imageAnalysis) {
                let media;
                try { media = await m.downloadMedia(); } catch (e) { return; }
                if (!media) return;

                const cat = await classifyImageMessage(media);
                const sender = m.from.split('@')[0];

                console.log(`\n\x1b[90m[${new Date().toLocaleTimeString()}]\x1b[0m \x1b[35m@${sender}\x1b[0m: \x1b[90m[Image Message]\x1b[0m`);
                console.log(`\x1b[33m   └─ Vision AI: ${cat}\x1b[0m`);

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

                    const statusIcon = '✅';
                    console.log(`\x1b[33m   └─ Status: ${statusIcon} ${isImageReply ? 'Replied Image' : 'Replied Text'}\x1b[0m`);

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

            // الرسائل النصية العادية
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
                    } else {
                        r = "وأنتم بخير وصحة وعافية، تقبل الله منا ومنكم.";
                    }
                } else {
                    r = "وأنتم بخير وصحة وعافية، تقبل الله منا ومنكم.";
                }
            }

            const sender = m.from.split('@')[0];
            const statusIcon = r ? '✅' : '⏭️';
            console.log(`\n\x1b[90m[${new Date().toLocaleTimeString()}]\x1b[0m \x1b[36m@${sender}\x1b[0m: "${m.body}"`);
            console.log(`\x1b[33m   └─ AI: ${cat} | Status: ${statusIcon} ${r ? (isImageReply ? 'Replied Image' : 'Replied Text') : 'Skipped'}\x1b[0m`);

            if (r) {
                const chat = await m.getChat();
                if (!isImageReply) {
                    await chat.sendStateTyping();
                }
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
    const header = `\x1b[1m\x1b[32m✅ CONNECTED | MIRAL AI\x1b[0m\n\n  ◈── CONTROL PANEL ──◈\n  ${statusLine}\n`;

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

    // بناء قائمة الإعدادات - يظهر Image Analysis فقط إذا كان Eid Mode مفعّلاً
    const choices = [
        { name: `${getStatus(config.settings.alwaysOnline)} Always Online`, value: 'online' },
        { name: `${getStatus(config.settings.replyMode)} Reply Mode (Quote)`, value: 'reply' },
        { name: `🎉 Eid Reply Type: [ ${eidTypeLabel} ]`, value: 'eid_type' },
    ];

    if (config.eidMode) {
        choices.push({
            name: `${getStatus(config.settings.imageAnalysis)} Image Analysis  \x1b[90m(Vision AI للصور)\x1b[0m`,
            value: 'image_analysis'
        });
    }

    choices.push({ name: '⬅️ Back', value: 'back' });

    const { a } = await ask(header + '  Adjust Preferences:', choices, lastSet);

    lastSet = a;
    if (a === 'online') { config.settings.alwaysOnline = !config.settings.alwaysOnline; manageOnline(config.settings.alwaysOnline); }
    else if (a === 'reply') config.settings.replyMode = !config.settings.replyMode;
    else if (a === 'eid_type') config.settings.eidReplyType = config.settings.eidReplyType === 'text' ? 'image' : 'text';
    else if (a === 'image_analysis') config.settings.imageAnalysis = !config.settings.imageAnalysis;
    else if (a === 'back') return renderMenu();

    saveConfig(); renderSettings();
}

function manageOnline(start) {
    if (onlineInt) clearInterval(onlineInt);
    if (start) onlineInt = setInterval(() => { if (client?.pupPage) client.sendPresenceAvailable().catch(() => { }); }, 5000);
}

startApp();
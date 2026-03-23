const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const inquirer = require('inquirer');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const CONFIG_FILE = './config.json';
const EID_FOLDER = './eid_images';

if (!fs.existsSync(EID_FOLDER)) fs.mkdirSync(EID_FOLDER);

const REPLIES = {
    salam: [
        "و عليكم السلام و رحمة الله و بركاته",
        "و عليكم السلام و رحمة الله",
        "و عليكم السلام"
    ],
    w_day: [
        "صباح النور", "صباح الورد", "يسعد صباحك", "صباح الخير", "صباح الرضا", "يا أهلاً", // الأردن
        "صباح النور", "صباح الخير", "يسعد صباحك", "طاب صباحك", "حيّاك بصباحك", "صباح السعادة", // الإمارات
        "صباح الخير", "صباح النور", "يسعد صباحك", "صباح الورد", "هلا بصباحك", "طاب صباحك", // البحرين
        "صباح النور", "صباح الخير", "نهارك زين", "نهار مبروك", "صباح الفل", "طاب يومك", // تونس
        "صباح الخير", "صباح النور", "نهارك مبروك", "يسعد صباحك", "طاب يومك", "أهلاً بك", // الجزائر
        "صباح النور", "صباح الخير", "صباح السعادة", "بارك الله بصباحك", "يسعد صباحك", "طاب صباحك", // جزر القمر
        "صباح الخير", "صباح النور", "حيّاك بصباحك", "يسعد صباحك", "طاب صباحك", "صباح السعادة", // جيبوتي
        "صباح النور", "صباح الخير", "يسعد صباحك", "حيّاك الله", "صباح الرضا", "يا هلا", // السعودية
        "صباح الخير", "صباح النور", "حبابك بصباحك", "يسعد صباحك", "طاب صباحك", "حبابك عشرة", // السودان
        "صباح النور", "صباح الورد", "يسعد صباحك", "يا مية هلا بصباحك", "صباح الخير", "طاب يومك", // سوريا
        "صباح الخير", "صباح النور", "بارك الله بيومك", "يسعد صباحك", "طاب صباحك", "يا أهلاً", // الصومال
        "صباح النور", "صباح الخير", "صباح العافية", "يسعد صباحك", "يا هلا بك", "طاب يومك", // العراق
        "صباح الخير", "صباح النور", "حيّاك بصباحك", "طاب صباحك", "يسعد صباحك", "يا مرحبا", // عُمان
        "صباح النور", "صباح الورد", "يسعد صباحك", "صباح الخير", "طاب يومك", "يا مية هلا", // فلسطين
        "صباح النور", "صباح الخير", "يسعد صباحك", "حيّاك بصباحك", "طاب صباحك", "يا مرحبا", // قطر
        "صباح الخير", "صباح النور", "يسعد صباحك", "حيّاك الله", "طاب صباحك", "يا هلا", // الكويت
        "صباح النور", "صباح الورد", "يسعد صباحك", "صباح الخير", "يا مية أهلاً", "طاب يومك", // لبنان
        "صباح الخير", "صباح النور", "يومك مبروك", "يسعد صباحك", "طاب صباحك", "يا مرحب", // ليبيا
        "صباح النور", "صباح الورد", "يا صباح الفل", "يسعد صباحك", "يا باشا", "أجمل صباح", // مصر
        "صباح النور", "صباح الخير", "نهارك مبروك", "طاب يومك", "يسعد صباحك", "أهلاً بك", // المغرب
        "صباح الخير", "صباح النور", "بارك الله بيومك", "يسعد صباحك", "طاب صباحك", "يا أهلاً", // موريتانيا
        "صباح النور", "صباح الخير", "حيّاك بصباحك", "يسعد صباحك", "طاب صباحك", "يا أصيل" // اليمن
    ],
    w_night: [
        "مساء النور", "مساء الورد", "يسعد مساك", "مساء الخير", "مساء الرضا", "يا أهلاً", // الأردن
        "مساء النور", "مساء الخير", "يسعد مساك", "طاب مساك", "حيّاك بمسائك", "مساء السعادة", // الإمارات
        "مساء الخير", "مساء النور", "يسعد مساك", "مساء الورد", "هلا بمسائك", "طاب مساك", // البحرين
        "مساء النور", "مساء الخير", "ليلتك زينة", "ليلة مبروك", "مساء المحبة", "طابت ليلتك", // تونس
        "مساء الخير", "مساء النور", "ليلة مبروك", "يسعد مساك", "طابت ليلتك", "أهلاً بك", // الجزائر
        "مساء النور", "مساء الخير", "مساء السعادة", "بارك الله بمسائك", "يسعد مساك", "طاب مساك", // جزر القمر
        "مساء الخير", "مساء النور", "حيّاك بمسائك", "يسعد مساك", "طاب مساك", "مساء السعادة", // جيبوتي
        "مساء النور", "مساء الخير", "يسعد مساك", "حيّاك بمسائك", "مساء الرضا", "يا هلا", // السعودية
        "مساء الخير", "مساء النور", "حبابك بمسائك", "يسعد مساك", "طاب مساك", "حبابك عشرة", // السودان
        "مساء النور", "مساء الورد", "يسعد مساك", "يا مية هلا بمسائك", "مساء الخير", "طابت ليلتك", // سوريا
        "مساء الخير", "مساء النور", "بارك الله بليلتك", "يسعد مساك", "طاب مساك", "يا أهلاً", // الصومال
        "مساء النور", "مساء الخير", "مساء العافية", "يسعد مساك", "يا هلا بك", "طابت ليلتك", // العراق
        "مساء الخير", "مساء النور", "حيّاك بمسائك", "طاب مساك", "يسعد مساك", "يا مرحبا", // عُمان
        "مساء النور", "مساء الورد", "يسعد مساك", "مساء الخير", "طابت ليلتك", "يا مية هلا", // فلسطين
        "مساء النور", "مساء الخير", "يسعد مساك", "حيّاك بمسائك", "طاب مساك", "يا مرحبا", // قطر
        "مساء الخير", "مساء النور", "يسعد مساك", "حيّاك الله بمسائك", "طاب مساك", "يا هلا", // الكويت
        "مساء النور", "مساء الورد", "يسعد مساك", "مساء الخير", "يا مية أهلاً", "طابت ليلتك", // لبنان
        " مساء الخير", "مساء النور", "ليلة مبروك", "يسعد مساك", "طاب مساك", "يا مرحب", // ليبيا
        "مساء النور", "مساء الورد", "يا مساء الفل", "يسعد مساك", "يا باشا", "ليلة سعيدة", // مصر
        "مساء النور", "مساء الخير", "ليلة سعيدة", "طابت ليلتك", "يسعد مساك", "أهلاً بك", // المغرب
        "مساء الخير", "مساء النور", "بارك الله بليلتك", "يسعد مساك", "طاب مساك", "يا أهلاً", // موريتانيا
        "مساء النور", "مساء الخير", "حيّاك بمسائك", "يسعد مساك", "طاب مساك", "يا أصيل" // اليمن
    ],
    w_both: [
        "هلا بيك", "يا هلا", "أهلاً وسهلاً", "نورتنا", "حيّاك", "مراحب", // الأردن
        "حيّاك الله", "يا مرحبا", "هلا والله", "منور", "أهلاً بك", "طال عمرك", // الإمارات
        "يا هلا", "حيّاك الله", "نورتنا", "مرحبا بيك", "هلا والله", "أهلاً بك", // البحرين
        "يا مرحبا", "أهلاً بك", "نورتنا", "أهلاً وسهلاً", "هلا بيك", "يا أهلاً", // تونس
        "أهلاً بك", "أهلاً وسهلاً", "نورتنا", "مرحبا خويا", "يا هلا", "حيّاك", // الجزائر
        "أهلاً بك", "حيّاك الله", "نورت جزرنا", "بارك الله فيك", "يا هلا", "أهلاً بك", // جزر القمر
        "يا هلا", "مرحبا بك", "نورتنا", "حيّاك", "أهلاً وسهلاً", "مراحب", // جيبوتي
        "حيّاك الله", "يا هلا ومسهلا", "نورت الدنيا", "هلا بك", "مرحبا", "يا هلا", // السعودية
        "حبابك", "ألف مرحب", "نورت البيت", "يا هلا بيك", "أهلاً", "حبابك عشرة", // السودان
        "يا مية هلا", "أهلاً وسهلاً", "نورت والله", "يا هلا وغلا", "أهلاً بك", "حيّاك الله", // سوريا
        "مرحب بيك", "أهلاً بيك", "نورت", "بارك الله فيك", "يا هلا", "مراحب", // الصومال
        "حي الله أصلك", "يا هلا بيك", "نورت العراق", "حي هالطول", "هلا بك", "أهلاً بك", // العراق
        "حيّاك الله", "يا مرحبا", "نورت السلطنة", "هلا والله", "يا هلا بك", "أهلاً بك", // عُمان
        "يا مية هلا", "أهلاً بيك", "نورتنا والله", "حيّاك الله", "مراحب", "يا طيب", // فلسطين
        "يا مرحبا", "حيّاك الله", "نورت قطرك", "هلا والله", "يا هلا", "أهلاً بك", // قطر
        "حيّاك الله", "يا هلا", "نورت كويتنا", "هلا بك", "مرحبا", "يا أصيل", // الكويت
        "يا مية أهلاً", "أهلاً وسهلاً", "نورت يا طيب", "يا هلا غلا", "مراحب", "أهلاً بيك", // لبنان
        "يا مرحب بك", "أهلاً بيك", "نورت ليبيا", "يومك مبروك", "يا هلا", "أهلاً بك", // ليبيا
        "يا الف أهلاً", "أهلاً بك", "منور الدنيا", "منور يا باشا", "يا هلا", "حيّاك", // مصر
        "يا مرحباً", "أهلاً وسهلاً", "نورت المغرب", "يا هلا بك", "مرحبا خويا", "أهلاً بك", // المغرب
        "أهلاً بك", "حيّاك الله", "نورت الموريتان", "بارك الله فيك", "يا هلا", "أهلاً بك", // موريتانيا
        "يا مية مرحبا", "يا هلا بيك", "نورت اليمن", "حيّاك الله", "يا أصيل", "يا أهلاً" // اليمن
    ],
    eid: [
        "وأنت بخير", "كل عام وأنت بخير", "عيد مبارك", "عساك من عواده", "تقبل الله منك", "ينعاد بالخير", // الأردن
        "عيدك مبارك", "وأنت بخير وصحة", "عساك من عواده", "تقبل الله طاعتك", "كل عام وأنت بخير", "طاب عيدك", // الإمارات
        "عيد مبارك", "وأنت بخير", "عساك من عواده", "كل عام وأنت طيب", "منور العيد", "تقبل الله طاعتك", // البحرين
        "عيدك مبروك", "سنين دايمة", "كل عام وأنت بخير", "ينعاد بالخير", "عيد مبارك", "طاب عيدك", // تونس
        "عيدك مبروك", "كل عام وأنت بخير", "تعيد وتزيد", "ينعاد بالصحة", "عيد مبارك", "طاب عيدك", // الجزائر
        "عيد مبارك", "وأنت بخير", "تقبل الله طاعتك", "كل عام وأنت بخير", "ينعاد بالخير", "طاب عيدك", // جزر القمر
        "عيد مبارك", "ينعاد عليك", "عساك من عواده", "كل عام وأنت طيب", "تقبل الله طاعتك", "طاب عيدك", // جيبوتي
        "وأنت بخير", "كل عام وأنت بخير", "عيدك مبارك", "عساك من عواده", "تقبل الله منك", "منور العيد", // السعودية
        "عيد مبارك", "كل سنة وأنت طيب", "تقبل الله منك", "ينعاد بالخير", "وأنت بخير والبلاد", "طاب عيدك", // السودان
        "وأنت بخير", "كل عام وأنت بخير", "عساك من عواده", "ينعاد بالصحة", "تقبل الله طاعتك", "طاب عيدك", // سوريا
        "عيد مبارك", "وأنت بخير", "تقبل الله أعمالك", "كل عام وأنت بخير", "ينعاد بالخير", "طاب عيدك", // الصومال
        "أيامك سعيدة", "عيدك مبروك", "كل عام وأنت بخير", "عساك من عواده", "ينعاد بالسرور", "طاب عيدك", // العراق
        "سنين دايمة", "عيد مبارك", "عساك من عواده", "كل عام وأنت بخير", "تقبل الله طاعتك", "طاب عيدك", // عُمان
        "وأنت بخير", "ينعاد بالخير والنصر", "كل عام وأنت بخير", "تقبل الله منك", "عيد مبارك", "طاب عيدك", // فلسطين
        "عيد مبارك", "كل عام وأنت بخير", "عساك من عواده", "تقبل الله طاعتك", "منور العيد", "طاب عيدك", // قطر
        "عيدك مبارك", "وأنت بخير", "عساك من عواده", "ينعاد بالخير والسرور", "كل عام وأنت طيب", "طاب عيدك", // الكويت
        "وأنت بخير", "كل عام وأنت بخير", "ينعاد بالحب", "عيد مبارك", "ينعاد بالفرح", "طاب عيدك", // لبنان
        "عيدك مبروك", "سنين دايمة", "كل عام وأنت بخير", "تقبل الله طاعتك", "ينعاد بالصحة", "طاب عيدك", // ليبيا
        "وأنت طيب", "كل سنة وأنت طيب", "عيد مبارك", "ينعاد بالخير", "تقبل الله طاعتك", "كل سنة وأنت بخير", // مصر
        "عيد مبروك", "بكل خير إن شاء الله", "سنين دايمة", "تعيد وتزيد", "وأنت بخير", "طاب عيدك", // المغرب
        "عيد مبارك", "وأنت بخير", "كل عام وأنت بخير", "تقبل الله منك", "ينعاد بالخير", "طاب عيدك", // موريتانيا
        "عيد مبارك", "كل سنة وأنت طيب", "عساك من عواده", "تقبل الله طاعتك", "يا مية مرحبا بالعيد", "طاب عيدك" // اليمن
    ]
};

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

const AI_MODEL = "google/gemini-2.5-flash-lite"; 
const VISION_MODEL = "gemini-2.5-flash"; 
let lastMain = 'salam', lastSet = 'alwaysOnline', onlineInt = null, client;
const getStatus = (v) => v ? '🟢' : '🔴';

const ask = (m, c, d) => inquirer.prompt([{
    type: 'list', name: 'a', message: m, choices: c, default: d,
    prefix: '', suffix: '', loop: false, pageSize: 20
}]);

async function classifyMessage(text) {
    if (!config.apiKey) return 'hadith';
    try {
        const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
            model: AI_MODEL,
            messages: [{
                role: "system",
                content: `You are a STRICT and PRECISE text classifier. Your job is to identify greetings ONLY.
- 'salam': Clear Islamic greetings (Assalamu Alaikum, Salam, etc.).
- 'w_day': Specific morning greetings (Sabah Al Khair, etc.).
- 'w_night': Specific night greetings (Masa Al Khair, etc.).
- 'w_both': Clear general welcomes (Hala, Marhaba).
- 'eid': Eid congratulations ONLY.
- 'summary': Requests to summarize videos/links.
- 'hadith': EVERYTHING ELSE.

CRITICAL RULES:
1. If the text is very short (1-3 characters) or gibberish like 'aa', 'ss', 'x', '...', ALWAYS classify as 'hadith'.
2. If the text is just a typo, a single word that isn't a greeting, or ambiguous, ALWAYS classify as 'hadith'.
3. Do NOT try to guess if the user meant a greeting. If it is not a 100% clear greeting, it is 'hadith'. 
Respond with ONLY the category word.`
            }, { role: "user", content: text }],
            max_tokens: 5, temperature: 0
        }, {
            headers: { 'Authorization': `Bearer ${config.apiKey}`, 'Content-Type': 'application/json' },
            timeout: 5000
        });
        return response.data?.choices?.[0]?.message?.content.toLowerCase().trim().replace(/[^\w]/g, '') || 'hadith';
    } catch (e) { return 'hadith'; }
}

async function classifyImageMessage(media) {
    if (!config.googleApiKey) return 'hadith';
    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${VISION_MODEL}:generateContent?key=${config.googleApiKey}`;
        const response = await axios.post(url, {
            contents: [{
                parts: [
                    { text: `TASK: Classify this image into EXACTLY one: 'salam', 'w_day', 'w_night', 'w_both', 'eid', or 'hadith'. Respond ONLY with the single category word.` },
                    { inline_data: { mime_type: media.mimetype, data: media.data } }
                ]
            }]
        }, { timeout: 15000 });
        const result = response.data?.candidates?.[0]?.content?.parts?.[0]?.text?.toLowerCase().trim().replace(/[^\w]/g, '') || 'hadith';
        const validCategories = ['salam', 'w_day', 'w_night', 'w_both', 'eid', 'hadith'];
        return validCategories.includes(result) ? result : 'hadith';
    } catch (e) { return 'hadith'; }
}

async function startApp() {
    client = new Client({
        authStrategy: new LocalAuth(),
        puppeteer: { headless: "new", args: ['--no-sandbox', '--disable-gpu', '--no-zygote'] }
    });

    client.on('qr', q => { console.clear(); qrcode.generate(q, { small: true }); });
    client.on('ready', () => { if (config.settings.alwaysOnline) manageOnline(true); renderMenu(); });

    client.on('message', async m => {
        if (m.from.includes('@g.us') || m.from === 'status@broadcast') return;
        try {
            const contact = await m.getContact();
            const senderName = contact.pushname || contact.name || m.from.split('@')[0];
            const isImageMsg = m.hasMedia && m.type === 'image';

            if (isImageMsg && config.eidMode && config.settings.imageAnalysis) {
                let media; try { media = await m.downloadMedia(); } catch (e) { return; }
                if (!media) return;
                const cat = await classifyImageMessage(media);
                
                if (cat === 'eid') {
                    let r = null; let isImageReply = false;
                    if (config.settings.eidReplyType === 'image') {
                        const files = fs.readdirSync(EID_FOLDER).filter(f => /\.(jpg|jpeg|png|gif|webp)$/i.test(f));
                        if (files.length > 0) {
                            const randomImg = files[Math.floor(Math.random() * files.length)];
                            r = MessageMedia.fromFilePath(path.join(EID_FOLDER, randomImg)); isImageReply = true;
                        } else { r = REPLIES.eid[Math.floor(Math.random() * REPLIES.eid.length)]; }
                    } else { r = REPLIES.eid[Math.floor(Math.random() * REPLIES.eid.length)]; }
                    
                    if (r) {
                        console.log(`\x1b[32m[IMAGE] From: ${senderName} | Category: EID | Action: REPLIED\x1b[0m`);
                        if (!isImageReply) { const chat = await m.getChat(); await chat.sendStateTyping(); }
                        await client.sendMessage(m.from, r, config.settings.replyMode ? { quotedMessageId: m.id._serialized } : {});
                    }
                } else {
                    console.log(`\x1b[33m[IMAGE] From: ${senderName} | Category: ${cat.toUpperCase()} | Action: SKIPPED\x1b[0m`);
                }
                return;
            }

            if (!m.body) return;
            const cat = await classifyMessage(m.body);
            let r = null; let isImageReply = false;

            if (cat === 'salam' && config.salamMode) r = REPLIES.salam[Math.floor(Math.random() * REPLIES.salam.length)];
            else if (cat === 'w_day' && config.welcomeDay) r = REPLIES.w_day[Math.floor(Math.random() * REPLIES.w_day.length)];
            else if (cat === 'w_night' && config.welcomeNight) r = REPLIES.w_night[Math.floor(Math.random() * REPLIES.w_night.length)];
            else if (cat === 'w_both' && config.welcomeBoth) r = REPLIES.w_both[Math.floor(Math.random() * REPLIES.w_both.length)];
            else if (cat === 'eid' && config.eidMode) {
                if (config.settings.eidReplyType === 'image') {
                    const files = fs.readdirSync(EID_FOLDER).filter(f => /\.(jpg|jpeg|png|gif|webp)$/i.test(f));
                    if (files.length > 0) {
                        const randomImg = files[Math.floor(Math.random() * files.length)];
                        r = MessageMedia.fromFilePath(path.join(EID_FOLDER, randomImg)); isImageReply = true;
                    } else { r = REPLIES.eid[Math.floor(Math.random() * REPLIES.eid.length)]; }
                } else { r = REPLIES.eid[Math.floor(Math.random() * REPLIES.eid.length)]; }
            }

            if (r) {
                console.log(`\x1b[32m[TEXT]  From: ${senderName} | Msg: "${m.body.substring(0,25)}..." | Category: ${cat.toUpperCase()} | Action: REPLIED\x1b[0m`);
                const chat = await m.getChat(); if (!isImageReply) await chat.sendStateTyping();
                await client.sendMessage(m.from, r, config.settings.replyMode ? { quotedMessageId: m.id._serialized } : {});
            } else {
                console.log(`\x1b[33m[TEXT]  From: ${senderName} | Msg: "${m.body.substring(0,25)}..." | Category: ${cat.toUpperCase()} | Action: SKIPPED\x1b[0m`);
            }
        } catch (err) { }
    });
    client.initialize();
}

async function renderMenu() {
    console.clear();
    const statusLine = ` ┃  Salam: ${getStatus(config.salamMode)}  ┃  Day: ${getStatus(config.welcomeDay)}  ┃  Night: ${getStatus(config.welcomeNight)}  ┃  Both: ${getStatus(config.welcomeBoth)}  ┃  Eid: ${getStatus(config.eidMode)}  ┃`;
    const header = `
  \x1b[1m\x1b[32m╔════════════════════════════════════════════════════════════╗
  ║                📦 CONNECTED | MIRSAL AI                    ║
  ╚════════════════════════════════════════════════════════════╝\x1b[0m

  \x1b[36m◈ SYSTEM STATUS ◈\x1b[0m
  ${statusLine}

  \x1b[33m◈ CONTROL PANEL ◈\x1b[0m`;
    
    const { a } = await ask(header, [
        { name: `${getStatus(config.salamMode)}  Salam Mode`, value: 'salam' },
        new inquirer.Separator(' '),
        { name: `${getStatus(config.welcomeDay)}  Welcome Day`, value: 'w_day' },
        new inquirer.Separator(' '),
        { name: `${getStatus(config.welcomeNight)}  Welcome Night`, value: 'w_night' },
        new inquirer.Separator(' '),
        { name: `${getStatus(config.welcomeBoth)}  Welcome Both`, value: 'w_both' },
        new inquirer.Separator(' '),
        { name: `${getStatus(config.eidMode)}  Eid Mode`, value: 'eid' },
        new inquirer.Separator('────────────────────────────'),
        { name: '⚙️   Settings', value: 'settings' },
        new inquirer.Separator(' '),
        { name: '🚪  Exit', value: 'exit' },
        new inquirer.Separator(' ')
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
    const eidTypeLabel = config.settings.eidReplyType === 'text' ? '📝  Text' : '🖼️  Image';
    const header = `
  \x1b[1m\x1b[34m╔════════════════════════════════════════════════════════════╗
  ║                ⚙️  SYSTEM SETTINGS                          ║
  ╚════════════════════════════════════════════════════════════╝\x1b[0m

  \x1b[33m◈ PREFERENCES ◈\x1b[0m`;

    const choices = [
        { name: `${getStatus(config.settings.alwaysOnline)}  Always Online`, value: 'online' },
        new inquirer.Separator(' '),
        { name: `${getStatus(config.settings.replyMode)}  Reply Mode (Quote)`, value: 'reply' },
        new inquirer.Separator(' '),
        { name: `🎉  Eid Reply Type: [ ${eidTypeLabel} ]`, value: 'eid_type' },
        new inquirer.Separator(' ')
    ];
    
    if (config.eidMode) {
        choices.push({ name: `${getStatus(config.settings.imageAnalysis)}  Image Analysis`, value: 'image_analysis' });
        choices.push(new inquirer.Separator(' '));
    }

    choices.push(
        new inquirer.Separator('────────────────────────────'),
        { name: '🔑  Update OpenRouter Key', value: 'key_or' },
        new inquirer.Separator(' '),
        { name: '🔑  Update Google API Key', value: 'key_google' },
        new inquirer.Separator(' '),
        { name: '⬅️   Back to Menu', value: 'back' },
        new inquirer.Separator(' ')
    );

    const { a } = await ask(header, choices, lastSet);
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
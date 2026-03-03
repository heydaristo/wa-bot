const config = require('../../config');
const { formatUptime, getTimeGreeting } = require('../../src/lib/formatter');
const { getCommandsByCategory, getCategories } = require('../../src/lib/plugins');
const { getDatabase } = require('../../src/lib/database');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const { generateWAMessageFromContent, proto } = require('ourin');
/**
 * Credits & Thanks to
 * Developer = Lucky Archz ( Zann )
 * Lead owner = HyuuSATAN
 * Owner = Keisya
 * Designer = Danzzz
 * Wileys = Penyedia baileys
 * Penyedia API
 * Penyedia Scraper
 * 
 * JANGAN HAPUS/GANTI CREDITS & THANKS TO
 * JANGAN DIJUAL YA MEKS
 * 
 
 */

const pluginConfig = {
    name: 'menu',
    alias: ['help', 'bantuan', 'commands', 'm'],
    category: 'main',
    description: 'Menampilkan menu utama bot',
    usage: '.menu',
    example: '.menu',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
};

const CATEGORY_EMOJIS = {
    owner: '👑', main: '🏠', utility: '🔧', fun: '🎮', group: '👥',
    download: '📥', search: '🔍', tools: '🛠️', sticker: '🖼️',
    ai: '🤖', game: '🎯', media: '🎬', info: 'ℹ️', religi: '☪️',
    panel: '🖥️', user: '📊', linode: '☁️', random: '🎲', canvas: '🎨', vps: '🌊',
    cek: '🔎', economy: '💰', premium: '💎', ephoto: '📸', jpm: '📨',
    pushkontak: '📲', store: '🏪', rpg: '⚔️'
};

function toSmallCaps(text) {
    const smallCaps = {
        'a': 'ᴀ', 'b': 'ʙ', 'c': 'ᴄ', 'd': 'ᴅ', 'e': 'ᴇ', 'f': 'ꜰ', 'g': 'ɢ',
        'h': 'ʜ', 'i': 'ɪ', 'j': 'ᴊ', 'k': 'ᴋ', 'l': 'ʟ', 'm': 'ᴍ', 'n': 'ɴ',
        'o': 'ᴏ', 'p': 'ᴘ', 'q': 'ǫ', 'r': 'ʀ', 's': 's', 't': 'ᴛ', 'u': 'ᴜ',
        'v': 'ᴠ', 'w': 'ᴡ', 'x': 'x', 'y': 'ʏ', 'z': 'ᴢ'
    };
    return text.toLowerCase().split('').map(c => smallCaps[c] || c).join('');
}

function buildMenuText(m, botConfig, db, uptime, botMode = 'md') {
    const prefix = botConfig.command?.prefix || '.';
    const user = db.getUser(m.sender);
    const timeHelper = require('../../src/lib/timeHelper');
    const timeStr = timeHelper.formatTime('HH:mm');
    const dateStr = timeHelper.formatFull('dddd, DD MMMM YYYY');

    const categories = getCategories();
    const commandsByCategory = getCommandsByCategory();

    let totalCommands = 0;
    for (const category of categories) {
        totalCommands += (commandsByCategory[category] || []).length;
    }

    const { getCaseCount, getCasesByCategory } = require('../../case/ourin');
    const totalCases = getCaseCount();
    const casesByCategory = getCasesByCategory();
    const totalFeatures = totalCommands + totalCases;

    let userRole = 'User', roleEmoji = '👤';
    if (m.isOwner) { userRole = 'Owner'; roleEmoji = '👑'; }
    else if (m.isPremium) { userRole = 'Premium'; roleEmoji = '💎'; }

    const uptimeFormatted = formatUptime(uptime);
    const totalUsers = db.getUserCount();

    let txt = `Hai *@${m.pushName || "User"}* 🪸\n\n`;
    txt += `Aku ${botConfig.bot?.name || 'Ourin-AI'}, bot WhatsApp yang siap bantu kamu.\n\n`;
    txt += `Kamu bisa pakai aku buat cari info, ambil data, atau bantu hal-hal sederhana langsung lewat WhatsApp — praktis tanpa ribet.\n`;

    txt += `\n╭─〔 🤖 *ʙᴏᴛ ɪɴꜰᴏ* 〕\n`;
    txt += `*│* 🖐 ɴᴀᴍᴀ     : *${botConfig.bot?.name || 'Ourin-AI'}*\n`;
    txt += `*│* 🔑 ᴠᴇʀsɪ    : *v${botConfig.bot?.version || '1.2.0'}*\n`;
    txt += `*│* ⚙️ ᴍᴏᴅᴇ     : *${(botConfig.mode || 'public').toUpperCase()}*\n`;
    txt += `*│* 🧶 ᴘʀᴇꜰɪx    : *[ ${prefix} ]*\n`;
    txt += `*│* ⏱ ᴜᴘᴛɪᴍᴇ   : *${uptimeFormatted}*\n`;
    txt += `*│* 👥 ᴛᴏᴛᴀʟ    : *${totalUsers} Users*\n`;
    txt += `*│* 🏷 ɢʀᴏᴜᴘ     : *${botMode.toUpperCase()}*\n`;
    txt += `*│* 👑 ᴏᴡɴᴇʀ    : *${botConfig.owner?.name || 'Ourin-AI'}*\n`;
    txt += `╰────────────────⬣\n\n`;

    txt += `╭─〔 👤 *ᴜsᴇʀ ɪɴꜰᴏ* 〕\n`;
    txt += `*│* 🙋 ɴᴀᴍᴀ     : *${m.pushName}*\n`;
    txt += `*│* 🎭 ʀᴏʟᴇ     : *${roleEmoji} ${userRole}*\n`;
    txt += `*│* 🎟 ʟɪᴍɪᴛ    : *${m.isOwner || m.isPremium ? '∞ Unlimited' : (user?.limit ?? 25)}*\n`;
    txt += `*│* 🕒 ᴡᴀᴋᴛᴜ    : *${timeStr} WIB*\n`;
    txt += `*│* 📅 ᴛᴀɴɢɢᴀʟ  : *${dateStr}*\n`;
    txt += `╰────────────────⬣\n\n`;

    const categoryOrder = ['owner', 'main', 'utility', 'tools', 'fun', 'game', 'download', 'search',
        'sticker', 'media', 'ai', 'group', 'religi', 'info', 'cek', 'economy', 'user',
        'canvas', 'random', 'premium', 'ephoto', 'jpm', 'pushkontak', 'panel', 'store'];
    const sortedCategories = [...categories].sort((a, b) => {
        const indexA = categoryOrder.indexOf(a);
        const indexB = categoryOrder.indexOf(b);
        return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
    });

    let modeAllowedMap = {
        md: null,
        store: ['main', 'group', 'sticker', 'owner', 'store'],
        pushkontak: ['main', 'group', 'sticker', 'owner', 'pushkontak']
    };
    let modeExcludeMap = {
        md: ['panel', 'pushkontak', 'store'],
        store: null,
        pushkontak: null
    };

    try {
        const botmodePlugin = require('../group/botmode');
        if (botmodePlugin && botmodePlugin.MODES) {
            const modes = botmodePlugin.MODES;
            modeAllowedMap = {};
            modeExcludeMap = {};
            for (const [key, val] of Object.entries(modes)) {
                modeAllowedMap[key] = val.allowedCategories;
                modeExcludeMap[key] = val.excludeCategories;
            }
        }
    } catch (e) { }

    const allowedCategories = modeAllowedMap[botMode];
    const excludeCategories = modeExcludeMap[botMode] || [];

    txt += `📂 *ᴅᴀꜰᴛᴀʀ ᴍᴇɴᴜ*\n`

    for (const category of sortedCategories) {
        if (category === 'owner' && !m.isOwner) continue;
        if (allowedCategories && !allowedCategories.includes(category.toLowerCase())) continue;
        if (excludeCategories && excludeCategories.includes(category.toLowerCase())) continue;

        const pluginCmds = commandsByCategory[category] || [];
        const caseCmds = casesByCategory[category] || [];
        const totalCmds = pluginCmds.length + caseCmds.length;
        if (totalCmds === 0) continue;

        const emoji = CATEGORY_EMOJIS[category] || '📁';
        txt += `- \`◦\` ${prefix}${toSmallCaps(`menucat ${category}`)} ${emoji}\n`;
    }
    return txt;
}

async function handler(m, { sock, config: botConfig, db, uptime }) {
    const savedVariant = db.setting('menuVariant');
    const menuVariant = savedVariant || botConfig.ui?.menuVariant || 2;
    const groupData = m.isGroup ? (db.getGroup(m.chat) || {}) : {};
    const botMode = groupData.botMode || 'md';
    const text = buildMenuText(m, botConfig, db, uptime, botMode);

    const imagePath = path.join(process.cwd(), 'assets', 'images', 'ourin.jpg');
    const thumbPath = path.join(process.cwd(), 'assets', 'images', 'ourin2.jpg');
    const videoPath = path.join(process.cwd(), 'assets', 'video', 'ourin.mp4');

    let imageBuffer = fs.existsSync(imagePath) ? fs.readFileSync(imagePath) : null;
    let thumbBuffer = fs.existsSync(thumbPath) ? fs.readFileSync(thumbPath) : null;
    let videoBuffer = fs.existsSync(videoPath) ? fs.readFileSync(videoPath) : null;

    try {
        switch (menuVariant) {
            case 1:
            case 2:
            case 3:
            case 6:
            case 11:
            default:
                if (imageBuffer) {
                    await sock.sendMessage(m.chat, {
                        image: imageBuffer,
                        caption: text,
                        mentions: [m.sender],
                        annotations: []
                    });
                } else {
                    await sock.sendMessage(m.chat, {
                        text: text,
                        mentions: [m.sender]
                    });
                }
                break;

            case 4:
                if (videoBuffer) {
                    await sock.sendMessage(m.chat, {
                        video: videoBuffer,
                        caption: text,
                        gifPlayback: true,
                        mentions: [m.sender],
                        annotations: []
                    });
                } else if (imageBuffer) {
                    await sock.sendMessage(m.chat, {
                        image: imageBuffer,
                        caption: text,
                        mentions: [m.sender],
                        annotations: []
                    });
                } else {
                    await sock.sendMessage(m.chat, { text, mentions: [m.sender] });
                }
                break;

            case 5: {
                const prefix = botConfig.command?.prefix || '.';

                const categories = getCategories();
                const commandsByCategory = getCommandsByCategory();
                const categoryOrder = ['owner', 'main', 'utility', 'tools', 'fun', 'game',
                    'download', 'search', 'sticker', 'media', 'ai', 'group', 'religi', 'info',
                    'jpm', 'pushkontak', 'panel', 'user'];
                const sortedCats = [...categories].sort((a, b) => {
                    const iA = categoryOrder.indexOf(a), iB = categoryOrder.indexOf(b);
                    return (iA === -1 ? 999 : iA) - (iB === -1 ? 999 : iB);
                });

                const toMonoUpperBold = (t) => {
                    const chars = {
                        'A': '𝗔', 'B': '𝗕', 'C': '𝗖', 'D': '𝗗', 'E': '𝗘', 'F': '𝗙', 'G': '𝗚',
                        'H': '𝗛', 'I': '𝗜', 'J': '𝗝', 'K': '𝗞', 'L': '𝗟', 'M': '𝗠', 'N': '𝗡',
                        'O': '𝗢', 'P': '𝗣', 'Q': '𝗤', 'R': '𝗥', 'S': '𝗦', 'T': '𝗧', 'U': '𝗨',
                        'V': '𝗩', 'W': '𝗪', 'X': '𝗫', 'Y': '𝗬', 'Z': '𝗭'
                    };
                    return t.toUpperCase().split('').map(c => chars[c] || c).join('');
                };

                const modeExcludeMap = { md: ['panel', 'pushkontak', 'store'] };
                const excludeCats = modeExcludeMap[botMode] || [];
                const categoryRows = [];

                for (const cat of sortedCats) {
                    if (cat === 'owner' && !m.isOwner) continue;
                    if (excludeCats.includes(cat.toLowerCase())) continue;
                    const cmds = commandsByCategory[cat] || [];
                    if (cmds.length === 0) continue;
                    const emoji = CATEGORY_EMOJIS[cat] || '📁';
                    categoryRows.push({
                        title: `${emoji} ${toMonoUpperBold(cat)}`,
                        id: `${prefix}menucat ${cat}`,
                        description: `${cmds.length} commands`
                    });
                }

                try {
                    const { generateWAMessageFromContent, proto, prepareWAMessageMedia } = require('ourin');

                    const buttons = [
                        {
                            name: 'single_select',
                            buttonParamsJson: JSON.stringify({
                                title: '📁 ᴘɪʟɪʜ ᴍᴇɴᴜ',
                                sections: [{ title: '📋 PILIH CATEGORY', rows: categoryRows }]
                            })
                        },
                        {
                            name: 'quick_reply',
                            buttonParamsJson: JSON.stringify({ display_text: '📊 SEMUA MENU', id: `${prefix}allmenu` })
                        }
                    ];

                    let headerMedia = null;
                    if (imageBuffer) {
                        try {
                            const { prepareWAMessageMedia } = require('ourin');
                            headerMedia = await prepareWAMessageMedia({ image: imageBuffer }, { upload: sock.waUploadToServer });
                        } catch (e) { }
                    }

                    const msg = generateWAMessageFromContent(m.chat, {
                        viewOnceMessage: {
                            message: {
                                interactiveMessage: proto.Message.InteractiveMessage.fromObject({
                                    body: proto.Message.InteractiveMessage.Body.fromObject({ text }),
                                    footer: proto.Message.InteractiveMessage.Footer.fromObject({
                                        text: `© ${botConfig.bot?.name || 'Ourin-AI'} | ${sortedCats.length} Categories`
                                    }),
                                    header: proto.Message.InteractiveMessage.Header.fromObject({
                                        title: `${botConfig.bot?.name || 'Ourin-AI'}`,
                                        hasMediaAttachment: !!headerMedia,
                                        ...(headerMedia || {})
                                    }),
                                    nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({ buttons }),
                                    contextInfo: { mentionedJid: [m.sender] }
                                })
                            }
                        }
                    }, { userJid: m.sender });

                    await sock.relayMessage(m.chat, msg.message, { messageId: msg.key.id });
                } catch (btnError) {
                    console.error('[Menu V5] Button error:', btnError.message);
                    if (imageBuffer) await sock.sendMessage(m.chat, { image: imageBuffer, caption: text, mentions: [m.sender], annotations: [] });
                    else await sock.sendMessage(m.chat, { text, mentions: [m.sender] });
                }
                break;
            }

            case 7: {
                try {
                    const { prepareWAMessageMedia } = require('ourin');
                    const prefixV7 = botConfig.command?.prefix || '.';
                    const categoriesV7 = getCategories();
                    const cmdsByCatV7 = getCommandsByCategory();
                    const sortedCatsV7 = [...categoriesV7].sort((a, b) => {
                        const order = ['main', 'utility', 'tools', 'fun', 'game', 'download', 'search', 'sticker', 'media', 'ai', 'group', 'religi', 'info'];
                        return (order.indexOf(a) === -1 ? 999 : order.indexOf(a)) - (order.indexOf(b) === -1 ? 999 : order.indexOf(b));
                    });
                    const excludeV7 = ['panel', 'pushkontak', 'store'];
                    const carouselCards = [];

                    for (const cat of sortedCatsV7) {
                        if (cat === 'owner' && !m.isOwner) continue;
                        if (excludeV7.includes(cat.toLowerCase())) continue;
                        const cmds = cmdsByCatV7[cat] || [];
                        if (cmds.length === 0) continue;
                        const emoji = CATEGORY_EMOJIS[cat] || '📁';

                        let cardBody = `━━━━━━━━━━━━━━━\n`;
                        for (const cmd of cmds.slice(0, 15)) {
                            cardBody += `◦ \`${prefixV7}${toSmallCaps(cmd)}\`\n`;
                        }
                        if (cmds.length > 15) cardBody += `\n_...dan ${cmds.length - 15} command lainnya_`;
                        cardBody += `\n\n> Total: ${cmds.length} commands`;

                        let cardMedia = null;
                        try {
                            const defaultV7Path = path.join(process.cwd(), 'assets', 'images', 'ourin-v7.jpg');
                            const catThumbPath = path.join(process.cwd(), 'assets', 'images', `cat-${cat}.jpg`);
                            let sourceImage = fs.existsSync(catThumbPath) ? fs.readFileSync(catThumbPath)
                                : (fs.existsSync(defaultV7Path) ? fs.readFileSync(defaultV7Path) : thumbBuffer);
                            if (sourceImage) {
                                const resized = await sharp(sourceImage).resize(300, 300, { fit: 'cover' }).jpeg({ quality: 80 }).toBuffer();
                                cardMedia = await prepareWAMessageMedia({ image: resized }, { upload: sock.waUploadToServer });
                            }
                        } catch (e) { }

                        carouselCards.push({
                            header: proto.Message.InteractiveMessage.Header.fromObject({
                                title: `${emoji} ${toSmallCaps(cat).toUpperCase()}`,
                                hasMediaAttachment: !!cardMedia, ...(cardMedia || {})
                            }),
                            body: proto.Message.InteractiveMessage.Body.fromObject({ text: cardBody }),
                            footer: proto.Message.InteractiveMessage.Footer.create({ text: `${botConfig.bot?.name || 'Ourin'} • ${cat}` }),
                            nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({
                                buttons: [{ name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: `📋 Lihat ${toSmallCaps(cat)}`, id: `${prefixV7}menucat ${cat}` }) }]
                            })
                        });
                    }

                    if (carouselCards.length === 0) {
                        await sock.sendMessage(m.chat, { text, mentions: [m.sender] });
                        break;
                    }

                    const msg = await generateWAMessageFromContent(m.chat, {
                        viewOnceMessage: {
                            message: {
                                interactiveMessage: proto.Message.InteractiveMessage.fromObject({
                                    body: proto.Message.InteractiveMessage.Body.fromObject({
                                        text: `${getTimeGreeting()} *${m.pushName}!*\n\n> Geser untuk melihat kategori menu`
                                    }),
                                    footer: proto.Message.InteractiveMessage.Footer.fromObject({
                                        text: `${botConfig.bot?.name || 'Ourin'} v${botConfig.bot?.version || '1.0'}`
                                    }),
                                    carouselMessage: proto.Message.InteractiveMessage.CarouselMessage.fromObject({ cards: carouselCards })
                                })
                            }
                        }
                    }, { userJid: m.sender });

                    await sock.relayMessage(m.chat, msg.message, { messageId: msg.key.id });
                } catch (e) {
                    console.error('[Menu V7] Carousel error:', e.message);
                    if (imageBuffer) await sock.sendMessage(m.chat, { image: imageBuffer, caption: text, mentions: [m.sender], annotations: [] });
                    else await sock.sendMessage(m.chat, { text, mentions: [m.sender] });
                }
                break;
            }

            case 8: {
                const timeHelperV8 = require('../../src/lib/timeHelper');
                const timeV8 = timeHelperV8.formatTime('HH:mm');
                const dateV8 = timeHelperV8.formatFull('DD/MM/YYYY');
                const userV8 = db.getUser(m.sender);
                const uptimeV8 = formatUptime(uptime);
                const categoriesV8 = getCategories();
                const cmdsByCatV8 = getCommandsByCategory();
                let totalCmdV8 = 0;
                for (const cat of categoriesV8) totalCmdV8 += (cmdsByCatV8[cat] || []).length;

                let roleV8 = '𝙐𝙨𝙚𝙧', emojiV8 = '◈';
                if (m.isOwner) { roleV8 = '𝙊𝙬𝙣𝙚𝙧'; emojiV8 = '♚'; }
                else if (m.isPremium) { roleV8 = '𝙋𝙧𝙚𝙢𝙞𝙪𝙢'; emojiV8 = '✦'; }

                const prefixV8 = botConfig.command?.prefix || '.';
                const catOrderV8 = ['main', 'ai', 'download', 'search', 'tools', 'fun', 'game', 'sticker', 'canvas', 'group', 'media', 'user', 'rpg', 'owner'];
                const sortedCatsV8 = [...categoriesV8].sort((a, b) => {
                    const iA = catOrderV8.indexOf(a.toLowerCase()), iB = catOrderV8.indexOf(b.toLowerCase());
                    return (iA === -1 ? 999 : iA) - (iB === -1 ? 999 : iB);
                });
                const excludeV8 = ['panel', 'pushkontak', 'store'];

                const sparkles = ['✦', '✧', '⋆', '˚', '✵', '⊹'];
                const rnd = () => sparkles[Math.floor(Math.random() * sparkles.length)];

                let menuV8 = `${rnd()}━━━━━━━━━━━━━━━━━━━━━${rnd()}\n`;
                menuV8 += `*${botConfig.bot?.name || '𝗢𝗨𝗥𝗜𝗡-𝗔𝗜'}*\n`;
                menuV8 += `${rnd()}━━━━━━━━━━━━━━━━━━━━━${rnd()}\n\n`;
                menuV8 += `┏━━━〔 ${emojiV8} *𝗣𝗥𝗢𝗙𝗜𝗟𝗘* 〕━━━┓\n┃ 👤 *${m.pushName}*\n┃ 🏷️ ${roleV8}\n┃ ⏰ ${timeV8} WIB\n┃ 📅 ${dateV8}\n┗━━━━━━━━━━━━━━━┛\n\n`;
                menuV8 += `┏━━〔 ⚡ *𝗦𝗬𝗦𝗧𝗘𝗠 𝗦𝗧𝗔𝗧𝗦* 〕━━┓\n┃ 🎫 Limit   ➤ ${m.isOwner || m.isPremium ? '∞ Unlimited' : `${userV8?.limit ?? 25}/25`}\n┃ ⏱️ Uptime  ➤ ${uptimeV8}\n┃ 🔧 Mode    ➤ ${botMode.toUpperCase()}\n┃ 📊 Total   ➤ ${totalCmdV8} Commands\n┃ 👥 Users   ➤ ${db.getUserCount()} Aktif\n┗━━━━━━━━━━━━━━━━━━━━━━┛\n\n`;
                menuV8 += `╭══════════════════════╮\n║  📋 *𝗖𝗢𝗠𝗠𝗔𝗡𝗗 𝗟𝗜𝗦𝗧*    ║\n╰══════════════════════╯\n\n`;

                for (const cat of sortedCatsV8) {
                    if (cat === 'owner' && !m.isOwner) continue;
                    if (excludeV8.includes(cat.toLowerCase())) continue;
                    const cmdsV8 = cmdsByCatV8[cat] || [];
                    if (cmdsV8.length === 0) continue;
                    const emojiCat = CATEGORY_EMOJIS[cat] || '▣';
                    menuV8 += `┌─────「 ${emojiCat} *${cat.toUpperCase()}* 」\n│ ✦ Total: ${cmdsV8.length} commands\n│\n`;
                    for (const cmd of cmdsV8) menuV8 += `│ ├➤ ${prefixV8}${cmd}\n`;
                    menuV8 += `│\n└───────────────────\n\n`;
                }

                menuV8 += `╭━━〔 💡 *𝗧𝗜𝗣𝗦* 〕━━╮\n│ ❸ Gunakan prefix *${prefixV8}* sebelum command\n╰━━━━━━━━━━━━━━━━━━╯\n\n`;
                menuV8 += `> ${rnd()} *${botConfig.bot?.name}* v${botConfig.bot?.version || '1.7.1'} ${rnd()}`;

                const imgV8Path = path.join(process.cwd(), 'assets', 'images', 'ourin-v8.jpg');
                const imgV8 = fs.existsSync(imgV8Path) ? fs.readFileSync(imgV8Path) : imageBuffer;
                if (imgV8) {
                    await sock.sendMessage(m.chat, { image: imgV8, caption: menuV8, mentions: [m.sender], annotations: [] });
                } else {
                    await sock.sendMessage(m.chat, { text: menuV8, mentions: [m.sender] });
                }
                break;
            }

            case 9: {
                try {
                    const { prepareWAMessageMedia } = require('ourin');
                    const prefixV9 = botConfig.command?.prefix || '.';
                    const categoriesV9 = getCategories();
                    const cmdsByCatV9 = getCommandsByCategory();
                    const { getCasesByCategory: getCasesCatV9 } = require('../../case/ourin');
                    const casesCatV9 = getCasesCatV9();

                    const sortedCatsV9 = [...categoriesV9].sort((a, b) => {
                        const order = ['main', 'owner', 'utility', 'tools', 'fun', 'game', 'download', 'search', 'sticker', 'media', 'ai', 'group', 'religi', 'info', 'cek', 'economy', 'user', 'canvas', 'random', 'premium', 'ephoto', 'jpm'];
                        return (order.indexOf(a) === -1 ? 999 : order.indexOf(a)) - (order.indexOf(b) === -1 ? 999 : order.indexOf(b));
                    });
                    const excludeV9 = ['panel', 'pushkontak', 'store'];
                    const menuRowsV9 = [];

                    for (const cat of sortedCatsV9) {
                        if (cat === 'owner' && !m.isOwner) continue;
                        if (excludeV9.includes(cat.toLowerCase())) continue;
                        const total = (cmdsByCatV9[cat] || []).length + (casesCatV9[cat] || []).length;
                        if (total === 0) continue;
                        menuRowsV9.push({
                            title: `${CATEGORY_EMOJIS[cat] || '📁'} ${cat.toUpperCase()}`,
                            description: `${total} commands`,
                            id: `${prefixV9}menucat ${cat}`
                        });
                    }

                    let headerMediaV9 = null;
                    try {
                        const imgV9Path = path.join(process.cwd(), 'assets', 'images', 'ourin-v9.jpg');
                        const src = fs.existsSync(imgV9Path) ? fs.readFileSync(imgV9Path) : imageBuffer;
                        if (src) {
                            const resized = await sharp(src).resize(300, 300, { fit: 'cover' }).jpeg({ quality: 80 }).toBuffer();
                            headerMediaV9 = await prepareWAMessageMedia({ image: resized }, { upload: sock.waUploadToServer });
                        }
                    } catch (e) { }

                    const buttonsV9 = [
                        { name: "single_select", buttonParamsJson: JSON.stringify({ has_multiple_buttons: true }) },
                        { name: "quick_reply", buttonParamsJson: JSON.stringify({ display_text: "🧾 Tampilkan Semua Menu", id: `${m.prefix}allmenu` }) }
                    ];

                    const msgV9 = generateWAMessageFromContent(m.chat, {
                        viewOnceMessage: {
                            message: {
                                interactiveMessage: proto.Message.InteractiveMessage.fromObject({
                                    body: proto.Message.InteractiveMessage.Body.fromObject({ text }),
                                    footer: proto.Message.InteractiveMessage.Footer.fromObject({ text: `© ${botConfig.bot?.name || 'Ourin-AI'} v${botConfig.bot?.version || '1.9.0'}` }),
                                    header: proto.Message.InteractiveMessage.Header.fromObject({ hasMediaAttachment: !!headerMediaV9, ...(headerMediaV9 || {}) }),
                                    nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({
                                        messageParamsJson: JSON.stringify({
                                            bottom_sheet: { in_thread_buttons_energi: 2, divider_indices: [1, 2, 3, 4, 5, 999], list_title: botConfig.bot?.name || 'Ourin-AI', button_title: '🍀 ριℓιн кαтєgσяι' }
                                        }),
                                        buttons: buttonsV9
                                    }),
                                    contextInfo: { mentionedJid: [m.sender] }
                                })
                            }
                        }
                    }, { userJid: m.sender });

                    await sock.relayMessage(m.chat, msgV9.message, { messageId: msgV9.key.id });
                } catch (v9Error) {
                    console.error('[Menu V9] Error:', v9Error.message);
                    if (imageBuffer) await sock.sendMessage(m.chat, { image: imageBuffer, caption: text, mentions: [m.sender], annotations: [] });
                    else await sock.sendMessage(m.chat, { text, mentions: [m.sender] });
                }
                break;
            }

            case 10: {
                try {
                    const { prepareWAMessageMedia } = require('ourin');
                    const prefixV10 = botConfig.command?.prefix || '.';
                    const categoriesV10 = getCategories();
                    const cmdsByCatV10 = getCommandsByCategory();
                    const uptimeFmtV10 = formatUptime(uptime);

                    let totalCmdV10 = 0;
                    for (const cat of categoriesV10) totalCmdV10 += (cmdsByCatV10[cat] || []).length;
                    const { getCasesByCategory, getCaseCount } = require('../../case/ourin');
                    totalCmdV10 += getCaseCount();

                    const footerV10 = `Hai *@${m.pushName || "User"}* 🪸\n\nAku ${botConfig.bot?.name || 'Ourin-AI'}, bot WhatsApp yang siap bantu kamu.\n\n─────────────────────────\nNama    : ${botConfig.bot?.name || 'Ourin-AI'}\nVersi : v${botConfig.bot?.version || '1.9.0'}\nRuntime : Node.js ${process.version}\nBot Up  : ${uptimeFmtV10}\nOwner   : ${botConfig.owner?.name || 'Lucky Archz'}\n─────────────────────────`;

                    const buttonsV10 = [{ name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: botConfig.bot?.name || 'Ourin-AI', id: `${m.prefix}allmenu` }) }];

                    let productImageV10 = null;
                    try {
                        const imgV10Path = path.join(process.cwd(), 'assets', 'images', 'ourin-v9.jpg');
                        const src = fs.existsSync(imgV10Path) ? fs.readFileSync(imgV10Path) : (imageBuffer || thumbBuffer);
                        if (src) {
                            const resized = await sharp(src).resize(736, 890, { fit: 'cover' }).jpeg({ quality: 85 }).toBuffer();
                            productImageV10 = await prepareWAMessageMedia({ image: resized }, { upload: sock.waUploadToServer });
                        }
                    } catch (e) { }

                    const msgV10 = generateWAMessageFromContent(m.chat, {
                        viewOnceMessage: {
                            message: {
                                interactiveMessage: proto.Message.InteractiveMessage.fromObject({
                                    header: proto.Message.InteractiveMessage.Header.fromObject({
                                        title: `${botConfig.bot?.name || 'Ourin-AI'} Menu`,
                                        hasMediaAttachment: !!productImageV10, ...(productImageV10 || {})
                                    }),
                                    body: proto.Message.InteractiveMessage.Body.fromObject({ text: `*© ${botConfig.bot?.name || 'Ourin-AI'} 2026*` }),
                                    footer: proto.Message.InteractiveMessage.Footer.fromObject({ text: footerV10 }),
                                    nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({ buttons: buttonsV10 }),
                                    contextInfo: { mentionedJid: [m.sender] }
                                })
                            }
                        }
                    }, { userJid: m.sender });

                    await sock.relayMessage(m.chat, msgV10.message, { messageId: msgV10.key.id });
                } catch (v10Error) {
                    console.error('[Menu V10] Error:', v10Error.message);
                    if (imageBuffer) await sock.sendMessage(m.chat, { image: imageBuffer, caption: text, mentions: [m.sender], annotations: [] });
                    else await sock.sendMessage(m.chat, { text, mentions: [m.sender] });
                }
                break;
            }
        }

    } catch (error) {
        console.error('[Menu] Error on command execution:', error.message);
    }
}

module.exports = {
    config: pluginConfig,
    handler
};
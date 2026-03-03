const config = require('../../config');
const { downloadMediaMessage } = require('ourin');
const fs = require('fs');

const pluginConfig = {
    name: 'jodohin',
    alias: ['cp'],
    category: 'random',
    description: 'Menjodohkan dua member grup secara random',
    usage: '.jodohin',
    isGroup: true,
    isBotAdmin: false,
    isAdmin: false,
    cooldown: 10,
    energi: 2,
    isEnabled: true
};

async function handler(m, { sock }) {
    if (!m.isGroup) return m.reply(config.messages.groupOnly);

    const groupMetadata = await sock.groupMetadata(m.chat);
    const participants = groupMetadata.participants;
    
    if (participants.length < 2) return m.reply('❌ Member grup kurang dari 2 orang!');

    const member = participants.map(u => u.id);
    const orang = member[Math.floor(Math.random() * member.length)];
    const jodoh = member[Math.floor(Math.random() * member.length)];
    const text = `@${orang.split('@')[0]} ❤️ @${jodoh.split('@')[0]}\nCieeee, What's Going On❤️💖👀`;
    let thumbnail = null;
    try {
        thumbnail = await sock.profilePictureUrl(m.sender, 'image');
    } catch {}
    const contextInfo = {
        mentionedJid: [orang, jodoh]
    };

    await sock.sendMessage(m.chat, {
        text: text,
        contextInfo: contextInfo
    }, { quoted: m });
}

module.exports = {
    config: pluginConfig,
    handler
};

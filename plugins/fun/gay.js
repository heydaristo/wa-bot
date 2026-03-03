const config = require('../../config');

const pluginConfig = {
    name: 'gay',
    alias: ['howgay'],
    category: 'fun',
    description: 'Menunjuk member paling gay di grup',
    usage: '.gay',
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
    const member = participants.map(u => u.id);
    const orang = member[Math.floor(Math.random() * member.length)];
    const text = `*@${orang.split('@')[0]} Adalah Orang Paling Gay Di Group Ini*`;
    let thumbnail = null;
    try {
        thumbnail = await sock.profilePictureUrl(m.sender, 'image');
    } catch {}
    const contextInfo = {
        mentionedJid: [orang]
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

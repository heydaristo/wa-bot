const { getDatabase } = require('../../src/lib/database')
const config = require('../../config')

const pluginConfig = {
    name: 'intro',
    alias: ['perkenalan', 'selamatdatang'],
    category: 'group',
    description: 'Tampilkan pesan intro grup',
    usage: '.intro',
    example: '.intro',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    cooldown: 10,
    energi: 0,
    isEnabled: true
}

const DEFAULT_INTRO = `╭━━━━━━━━━━━━━━━━━╮
┃  👋 *ᴡᴇʟᴄᴏᴍᴇ!*
╰━━━━━━━━━━━━━━━━━╯

Halo @user! 👋

Selamat datang di *@group*!

╭┈┈⬡「 📋 *ɪɴғᴏ* 」
┃ 👥 Members: *@count*
┃ 📅 Tanggal: *@date*
┃ ⏰ Waktu: *@time*
╰┈┈┈┈┈┈┈┈⬡

> _Silakan perkenalkan diri dan ikuti aturan grup!_`

function parsePlaceholders(text, m, groupMeta) {
    const moment = require('moment-timezone')
    const now = moment().tz('Asia/Jakarta')
    const dateStr = now.format('D MMMM YYYY')
    const timeStr = now.format('HH:mm')
    
    return text
        .replace(/@user/gi, `@${m.sender.split('@')[0]}`)
        .replace(/@group/gi, groupMeta?.subject || 'Grup')
        .replace(/@count/gi, groupMeta?.participants?.length || '0')
        .replace(/@date/gi, dateStr)
        .replace(/@time/gi, timeStr)
        .replace(/@desc/gi, groupMeta?.desc || 'Tidak ada deskripsi')
        .replace(/@botname/gi, config.bot?.name || 'Ourin-AI')
}

async function handler(m, { sock }) {
    const db = getDatabase()
    const groupData = db.getGroup(m.chat) || db.setGroup(m.chat)
    const groupMeta = await sock.groupMetadata(m.chat)
    
    const introText = groupData.intro || DEFAULT_INTRO
    const parsed = parsePlaceholders(introText, m, groupMeta)
    
    await sock.sendMessage(m.chat, {
        text: parsed,
        mentions: [m.sender],
        contextInfo: {
            mentionedJid: [m.sender]}
    }, { quoted: m })
}

module.exports = {
    config: pluginConfig,
    handler,
    parsePlaceholders,
    DEFAULT_INTRO
}

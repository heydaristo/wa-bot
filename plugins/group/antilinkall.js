const { getDatabase } = require('../../src/lib/database')
const config = require('../../config')

const pluginConfig = {
    name: 'antilinkall',
    alias: ['alall', 'antialllink'],
    category: 'group',
    description: 'Anti semua jenis link',
    usage: '.antilinkall <on/off/metode> [kick/remove]',
    example: '.antilinkall on',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    cooldown: 3,
    energi: 0,
    isEnabled: true,
    isAdmin: true,
    isBotAdmin: true
}

const LINK_REGEX = /https?:\/\/[^\s<>"{}|\\^`[\]]+|www\.[^\s<>"{}|\\^`[\]]+/gi

function containsAnyLink(text) {
    if (!text || typeof text !== 'string') return { hasLink: false, link: null }
    
    const matches = text.match(LINK_REGEX)
    if (matches && matches.length > 0) {
        return { hasLink: true, link: matches[0] }
    }
    
    return { hasLink: false, link: null }
}

async function checkAntilinkAll(m, sock, db) {
    if (!m.isGroup) return false
    if (m.isAdmin || m.isOwner || m.fromMe) return false
    
    const groupData = db.getGroup(m.chat) || {}
    if (groupData.antilinkall !== 'on') return false
    
    const body = m.body || m.text || ''
    const { hasLink, link } = containsAnyLink(body)
    
    if (!hasLink) return false
    
    const mode = groupData.antilinkallMode || 'remove'
    
    try {
        await sock.sendMessage(m.chat, { delete: m.key })
    } catch {}
    
    if (mode === 'kick') {
        try {
            await sock.groupParticipantsUpdate(m.chat, [m.sender], 'remove')
            
            await sock.sendMessage(m.chat, {
                text: `╭┈┈⬡「 🔗 *ᴀɴᴛɪʟɪɴᴋ ᴀʟʟ* 」
┃
┃ ㊗ ᴜsᴇʀ: @${m.sender.split('@')[0]}
┃ ㊗ ʟɪɴᴋ: \`${link.substring(0, 50)}...\`
┃ ㊗ ᴀᴄᴛɪᴏɴ: *KICKED*
┃
╰┈┈⬡

> _User dikeluarkan karena mengirim link!_`,
                mentions: [m.sender],
                contextInfo: {}
            })
        } catch {}
    } else {
        await sock.sendMessage(m.chat, {
            text: `╭┈┈⬡「 🔗 *ᴀɴᴛɪʟɪɴᴋ ᴀʟʟ* 」
┃
┃ ㊗ ᴜsᴇʀ: @${m.sender.split('@')[0]}
┃ ㊗ ᴀᴄᴛɪᴏɴ: *DELETED*
┃
╰┈┈⬡

> _Pesan dihapus karena mengandung link!_`,
            mentions: [m.sender],
            contextInfo: {}
        })
    }
    
    return true
}

async function handler(m, { sock }) {
    const db = getDatabase()
    const option = m.text?.toLowerCase()?.trim()
    
    if (!option) {
        const groupData = db.getGroup(m.chat) || {}
        const status = groupData.antilinkall || 'off'
        const mode = groupData.antilinkallMode || 'remove'
        
        return m.reply(
            `🔗 *ᴀɴᴛɪʟɪɴᴋ ᴀʟʟ*\n\n` +
            `╭┈┈⬡「 📋 *sᴛᴀᴛᴜs* 」\n` +
            `┃ ◦ Status: *${status.toUpperCase()}*\n` +
            `┃ ◦ Mode: *${mode.toUpperCase()}*\n` +
            `╰┈┈⬡\n\n` +
            `> Mendeteksi semua jenis link (http/https/www)\n\n` +
            `*ᴄᴀʀᴀ ᴘᴀᴋᴀɪ:*\n` +
            `> \`${m.prefix}antilinkall on\` - Aktifkan\n` +
            `> \`${m.prefix}antilinkall off\` - Nonaktifkan\n` +
            `> \`${m.prefix}antilinkall metode kick\` - Mode kick user\n` +
            `> \`${m.prefix}antilinkall metode remove\` - Mode hapus pesan`
        )
    }
    
    if (option === 'on') {
        db.setGroup(m.chat, { antilinkall: 'on' })
        return m.reply(`✅ *ᴀɴᴛɪʟɪɴᴋ ᴀʟʟ* diaktifkan!\n\n> Semua link akan dihapus otomatis.`)
    }
    
    if (option === 'off') {
        db.setGroup(m.chat, { antilinkall: 'off' })
        return m.reply(`❌ *ᴀɴᴛɪʟɪɴᴋ ᴀʟʟ* dinonaktifkan!`)
    }
    
    if (option.startsWith('metode')) {
        const method = m.args?.[1]?.toLowerCase()
        if (method === 'kick') {
            db.setGroup(m.chat, { antilinkall: 'on', antilinkallMode: 'kick' })
            return m.reply(`✅ *ᴀɴᴛɪʟɪɴᴋ ᴀʟʟ* mode KICK diaktifkan!\n\n> User yang kirim link akan di-kick.`)
        } else if (method === 'remove' || method === 'delete') {
            db.setGroup(m.chat, { antilinkall: 'on', antilinkallMode: 'remove' })
            return m.reply(`✅ *ᴀɴᴛɪʟɪɴᴋ ᴀʟʟ* mode DELETE diaktifkan!\n\n> Pesan dengan link akan dihapus.`)
        } else {
            return m.reply(`❌ Metode tidak valid! Gunakan: \`kick\` atau \`remove\`\n\n> Contoh: \`${m.prefix}antilinkall metode kick\``)
        }
    }
    
    if (option === 'kick') {
        db.setGroup(m.chat, { antilinkall: 'on', antilinkallMode: 'kick' })
        return m.reply(`✅ *ᴀɴᴛɪʟɪɴᴋ ᴀʟʟ* mode KICK diaktifkan!\n\n> User yang kirim link akan di-kick.`)
    }
    
    if (option === 'remove' || option === 'delete') {
        db.setGroup(m.chat, { antilinkall: 'on', antilinkallMode: 'remove' })
        return m.reply(`✅ *ᴀɴᴛɪʟɪɴᴋ ᴀʟʟ* mode DELETE diaktifkan!\n\n> Pesan dengan link akan dihapus.`)
    }
    
    return m.reply(`❌ Opsi tidak valid! Gunakan: \`on\`, \`off\`, \`metode kick\`, \`metode remove\``)
}

module.exports = {
    config: pluginConfig,
    handler,
    checkAntilinkAll
}

const { getDatabase } = require('../../src/lib/database')
const config = require('../../config')

const pluginConfig = {
    name: 'antidocument',
    alias: ['antidoc', 'nodocument', 'nodoc'],
    category: 'group',
    description: 'Mengatur antidocument di grup',
    usage: '.antidocument <on/off>',
    example: '.antidocument on',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    isAdmin: true,
    isBotAdmin: true,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function checkAntidocument(m, sock, db) {
    if (!m.isGroup) return false
    if (m.isAdmin || m.isOwner || m.fromMe) return false
    
    const groupData = db.getGroup(m.chat) || {}
    if (!groupData.antidocument) return false
    
    const isDocument = m.isDocument || m.type === 'documentMessage' || m.type === 'documentWithCaptionMessage'
    if (!isDocument) return false
    
    try {
        await sock.sendMessage(m.chat, { delete: m.key })
    } catch {}
    
    await sock.sendMessage(m.chat, {
        text: `╭┈┈⬡「 📄 *ᴀɴᴛɪᴅᴏᴄᴜᴍᴇɴᴛ* 」
┃
┃ ㊗ ᴜsᴇʀ: @${m.sender.split('@')[0]}
┃ ㊗ ᴛʏᴘᴇ: Document/File
┃ ㊗ ᴀᴄᴛɪᴏɴ: Dihapus
┃
╰┈┈⬡

> _Dokumen tidak diperbolehkan di grup ini!_`,
        mentions: [m.sender],
        contextInfo: {}
    })
    
    return true
}

async function handler(m, { sock }) {
    const db = getDatabase()
    const args = m.args || []
    const action = args[0]?.toLowerCase()
    
    const groupData = db.getGroup(m.chat) || {}
    
    if (!action) {
        const status = groupData.antidocument ? '✅ ON' : '❌ OFF'
        
        await m.reply(
            `╭┈┈⬡「 📄 *ᴀɴᴛɪᴅᴏᴄᴜᴍᴇɴᴛ* 」
┃
┃ ㊗ sᴛᴀᴛᴜs: *${status}*
┃ ㊗ ᴍᴏᴅᴇ: Hapus pesan
┃
╰┈┈⬡

> *Cara Penggunaan:*
> \`.antidocument on\` → Aktifkan
> \`.antidocument off\` → Nonaktifkan

> _Blokir dokumen/file di grup_`
        )
        return
    }
    
    if (action === 'on') {
        db.setGroup(m.chat, { antidocument: true })
        m.react('✅')
        await m.reply(
            `╭┈┈⬡「 📄 *ᴀɴᴛɪᴅᴏᴄᴜᴍᴇɴᴛ* 」
┃
┃ ㊗ sᴛᴀᴛᴜs: *✅ AKTIF*
┃ ㊗ ᴀᴄᴛɪᴏɴ: Hapus pesan
┃
╰┈┈⬡

> _Dokumen akan dihapus otomatis!_`
        )
        return
    }
    
    if (action === 'off') {
        db.setGroup(m.chat, { antidocument: false })
        m.react('❌')
        await m.reply(
            `╭┈┈⬡「 📄 *ᴀɴᴛɪᴅᴏᴄᴜᴍᴇɴᴛ* 」
┃
┃ ㊗ sᴛᴀᴛᴜs: *❌ NONAKTIF*
┃
╰┈┈⬡`
        )
        return
    }
    
    await m.reply(`❌ Gunakan \`.antidocument on\` atau \`.antidocument off\``)
}

module.exports = {
    config: pluginConfig,
    handler,
    checkAntidocument
}

const { getDatabase } = require('../../src/lib/database')

const pluginConfig = {
    name: 'selfadmin',
    alias: ['adminself', 'adminonly'],
    category: 'owner',
    description: 'Mode bot hanya bisa diakses admin grup, owner, atau fromMe',
    usage: '.selfadmin',
    example: '.selfadmin',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    const db = getDatabase()
    const currentMode = db.setting('selfAdmin') || false
    
    if (currentMode) {
        db.setting('selfAdmin', false)
        m.react('❌')
        return m.reply(
            `❌ *sᴇʟꜰᴀᴅᴍɪɴ ɴᴏɴᴀᴋᴛɪꜰ*\n\n` +
            `> Bot bisa diakses semua orang\n` +
            `> Mode: Public`
        )
    } else {
        db.setting('selfAdmin', true)
        db.setting('publicAdmin', false)
        m.react('✅')
        return m.reply(
            `✅ *sᴇʟꜰᴀᴅᴍɪɴ ᴀᴋᴛɪꜰ*\n\n` +
            `╭┈┈⬡「 🔒 *ᴀᴋsᴇs* 」\n` +
            `┃ ✅ Admin grup\n` +
            `┃ ✅ Owner bot\n` +
            `┃ ✅ Bot sendiri (fromMe)\n` +
            `┃ ❌ Member biasa\n` +
            `╰┈┈⬡\n\n` +
            `> Ketik lagi untuk menonaktifkan`
        )
    }
}

module.exports = {
    config: pluginConfig,
    handler
}

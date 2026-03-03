const { stopAllJadibots, getActiveJadibots } = require('../../src/lib/jadibotManager')
const config = require('../../config')

const pluginConfig = {
    name: 'stopalljadibot',
    alias: ['stopsemuajadibot', 'killalljadibots'],
    category: 'owner',
    description: 'Hentikan semua jadibot yang aktif',
    usage: '.stopalljadibot',
    example: '.stopalljadibot',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 10,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    const active = getActiveJadibots()
    
    if (active.length === 0) {
        return m.reply(`❌ Tidak ada jadibot yang aktif`)
    }
    
    m.react('⏳')
    
    try {
        const stopped = await stopAllJadibots()
        
        m.react('✅')
        
        await sock.sendMessage(m.chat, {
            text: `✅ *sᴇᴍᴜᴀ ᴊᴀᴅɪʙᴏᴛ ᴅɪʜᴇɴᴛɪᴋᴀɴ*\n\n` +
                `> Total: *${stopped.length}* jadibot\n\n` +
                `> Session disimpan, bisa diaktifkan lagi nanti`,
            contextInfo: {}
        }, { quoted: m })
    } catch (error) {
        m.react('❌')
        await m.reply(`❌ *ɢᴀɢᴀʟ*\n\n> ${error.message}`)
    }
}

module.exports = {
    config: pluginConfig,
    handler
}

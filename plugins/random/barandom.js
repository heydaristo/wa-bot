const axios = require('axios')
const config = require('../../config')

const pluginConfig = {
    name: 'barandom',
    alias: ['bluearchive', 'ba'],
    category: 'random',
    description: 'Random gambar Blue Archive',
    usage: '.barandom',
    example: '.barandom',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 1,
    isEnabled: true
}

async function handler(m, { sock }) {
    const api = 'https://api.nexray.web.id/random/ba'
    await m.react('🎴')
    
    try {
        const res = await axios.get(api, { responseType: 'arraybuffer' })
        const buf = Buffer.from(res.data)
        
        await sock.sendMessage(m.chat, {
            image: buf,
            caption: `🎴 *ʙʟᴜᴇ ᴀʀᴄʜɪᴠᴇ ʀᴀɴᴅᴏᴍ*`,
            contextInfo: {}
        }, { quoted: m })
        
        await m.react('✅')
    } catch (e) {
        await m.react('❌')
        await m.reply(`❌ *ɢᴀɢᴀʟ*\n\n> ${e.message}`)
    }
}

module.exports = {
    config: pluginConfig,
    handler
}

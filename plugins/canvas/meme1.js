const axios = require('axios')
const config = require('../../config')

const pluginConfig = {
    name: 'meme1',
    alias: ['drakememe'],
    category: 'canvas',
    description: 'Membuat meme drake format',
    usage: '.meme1 <text1>|<text2>',
    example: '.meme1 Tidur|Main HP',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 10,
    energi: 1,
    isEnabled: true
}

async function handler(m, { sock }) {
    const input = m.text?.trim() || ''
    const parts = input.split('|').map(s => s.trim())
    
    if (parts.length < 2 || !parts[0] || !parts[1]) {
        return m.reply(
            `🎭 *ᴍᴇᴍᴇ ᴅʀᴀᴋᴇ*\n\n` +
            `> Masukkan 2 teks dengan pemisah |\n\n` +
            `> Contoh: \`${m.prefix}meme1 Tidur|Main HP\``
        )
    }
    
    const text1 = parts[0]
    const text2 = parts[1]
    
    const apikey = config.APIkey?.lolhuman
    if (!apikey) {
        return m.reply(`❌ API key lolhuman tidak dikonfigurasi!`)
    }
    
    m.react('🎭')
    
    try {
        const apiUrl = `https://api.lolhuman.xyz/api/meme8?apikey=${apikey}&text1=${encodeURIComponent(text1)}&text2=${encodeURIComponent(text2)}`
        const response = await axios.get(apiUrl, { 
            responseType: 'arraybuffer',
            timeout: 30000 
        })
        
        await sock.sendMessage(m.chat, {
            image: Buffer.from(response.data),
            caption: `🎭 *ᴍᴇᴍᴇ ᴅʀᴀᴋᴇ*`
        }, { quoted: m })
        
        m.react('✅')
        
    } catch (err) {
        m.react('❌')
        m.reply(`❌ *ᴇʀʀᴏʀ*\n\n> ${err.message}`)
    }
}

module.exports = {
    config: pluginConfig,
    handler
}

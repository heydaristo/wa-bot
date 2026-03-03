const axios = require('axios')

const pluginConfig = {
    name: 'removetext',
    alias: ['erasertext', 'hapustext', 'deletetext'],
    category: 'canvas',
    description: 'Generate efek eraser menghapus teks',
    usage: '.removetext <text>',
    example: '.removetext Hello',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    const text = m.args.join(' ')
    
    if (!text) {
        return m.reply(`🧹 *ʀᴇᴍᴏᴠᴇ ᴛᴇxᴛ*\n\n> Masukkan teks\n\n\`Contoh: ${m.prefix}removetext Hello\``)
    }
    
    if (text.length > 20) {
        return m.reply(`❌ Teks maksimal 20 karakter!`)
    }
    
    m.react('🧹')
    
    try {
        const url = `https://api.nekolabs.web.id/canvas/ephoto/eraser-deleting-text?text=${encodeURIComponent(text)}`
        const res = await axios.get(url, {
            responseType: 'arraybuffer',
            timeout: 30000
        })
        
        m.react('✅')
        
        await sock.sendMessage(m.chat, {
            image: Buffer.from(res.data),
            caption: `🧹 *ʀᴇᴍᴏᴠᴇ ᴛᴇxᴛ*`
        }, { quoted: m })
        
    } catch (error) {
        m.react('❌')
        m.reply(`❌ *ᴇʀʀᴏʀ*\n\n> ${error.message}`)
    }
}

module.exports = {
    config: pluginConfig,
    handler
}

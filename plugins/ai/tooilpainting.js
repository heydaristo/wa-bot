const nanoBanana = require('../../src/scraper/nanobanana')

const pluginConfig = {
    name: 'tooilpainting',
    alias: ['oilpainting', 'tooil', 'oil'],
    category: 'ai',
    description: 'Ubah foto menjadi gaya lukisan minyak (oil painting)',
    usage: '.tooilpainting (reply/kirim gambar)',
    example: '.tooilpainting',
    isOwner: false,
    isPremium: true,
    isGroup: false,
    isPrivate: false,
    cooldown: 60,
    energi: 3,
    isEnabled: true
}

const PROMPT = `Transform this image into a classical oil painting style. 
Apply thick brushstrokes, rich colors, and the texture of traditional oil paint on canvas. 
Keep the original composition but make it look like a masterpiece painting 
with visible brushwork, artistic color blending, and that timeless gallery-quality aesthetic.`

async function handler(m, { sock }) {
    const isImage = m.isImage || (m.quoted && (m.quoted.isImage || m.quoted.type === 'imageMessage'))
    
    if (!isImage) {
        return m.reply(
            `🖼️ *ᴛᴏ ᴏɪʟ ᴘᴀɪɴᴛɪɴɢ*\n\n` +
            `> Kirim/reply gambar untuk diubah ke gaya lukisan minyak\n\n` +
            `\`${m.prefix}tooilpainting\``
        )
    }
    
    m.react('⏳')
    
    try {
        let buffer
        if (m.quoted && m.quoted.isMedia) {
            buffer = await m.quoted.download()
        } else if (m.isMedia) {
            buffer = await m.download()
        }
        
        if (!buffer) {
            m.react('❌')
            return m.reply(`❌ Gagal mendownload gambar`)
        }
        
        await m.reply(
            `⏳ *ᴍᴇᴍᴘʀᴏsᴇs...*\n\n` +
            `> Mengubah gambar ke gaya oil painting\n` +
            `> Proses ini memakan waktu 1-3 menit\n\n` +
            `_Powered by NanoBanana AI_`
        )
        
        const result = await nanoBanana(buffer, PROMPT, {
            resolution: '4K',
            steps: 25,
            guidance_scale: 8
        })
        
        m.react('✅')
        
        await sock.sendMessage(m.chat, {
            image: result,
            caption: `🖼️ *ᴛᴏ ᴏɪʟ ᴘᴀɪɴᴛɪɴɢ*\n\n> Gaya: Classical Oil Painting\n> _Powered by NanoBanana AI_`
        }, { quoted: m })
        
    } catch (error) {
        m.react('❌')
        m.reply(`❌ *ᴇʀʀᴏʀ*\n\n> ${error.message}\n\n_Coba lagi nanti_`)
    }
}

module.exports = {
    config: pluginConfig,
    handler
}

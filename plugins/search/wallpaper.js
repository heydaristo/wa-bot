const wallpaperSearch = require('../../src/scraper/wallpapersearch')

const pluginConfig = {
    name: 'wallpaper',
    alias: ['wp', 'wallpapersearch', 'wpsearch'],
    category: 'search',
    description: 'Mencari wallpaper HD',
    usage: '.wallpaper <query>',
    example: '.wallpaper mountain',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 10,
    energi: 1,
    isEnabled: true
}

async function handler(m, { sock }) {
    const query = m.args.join(' ')
    if (!query) {
        return m.reply(`🖼️ *ᴡᴀʟʟᴘᴀᴘᴇʀ sᴇᴀʀᴄʜ*\n\n> Masukkan kata kunci pencarian\n\n\`Contoh: ${m.prefix}wallpaper mountain\``)
    }
    
    m.react('🔍')
    
    try {
        const result = await wallpaperSearch(query)
        
        if (!result.success || !result.results?.length) {
            m.react('❌')
            return m.reply(`❌ *ɢᴀɢᴀʟ*\n\n> Tidak ditemukan wallpaper untuk "${query}"`)
        }
        
        const random = result.results[Math.floor(Math.random() * result.results.length)]
        
        m.react('🖼️')
        
        await sock.sendMessage(m.chat, {
            image: { url: random.image },
            caption: `🖼️ *ᴡᴀʟʟᴘᴀᴘᴇʀ*\n\n` +
                `╭┈┈⬡「 📋 *ᴅᴇᴛᴀɪʟ* 」\n` +
                `┃ 🏷️ ᴛɪᴛʟᴇ: \`${random.title || 'Unknown'}\`\n` +
                `┃ 📐 ʀᴇsᴏʟᴜᴛɪᴏɴ: \`${random.resolution || '-'}\`\n` +
                `┃ 🔗 sᴏᴜʀᴄᴇ: \`WallpaperFlare\`\n` +
                `╰┈┈⬡\n\n` +
                `> ᴛᴏᴛᴀʟ ʀᴇsᴜʟᴛ: \`${result.total}\` ᴡᴀʟʟᴘᴀᴘᴇʀ`
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

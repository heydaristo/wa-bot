const axios = require('axios')
const config = require('../../config')

const pluginConfig = {
    name: 'pacarsertifikat',
    alias: ['sertifikatpacar', 'certpacar', 'pacarcert'],
    category: 'canvas',
    description: 'Membuat sertifikat pacar',
    usage: '.pacarsertifikat <nama1> <nama2>',
    example: '.pacarsertifikat Budi Ani',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 10,
    energi: 1,
    isEnabled: true
}

async function handler(m, { sock }) {
    const args = m.args || []
    
    if (args.length < 2) {
        return m.reply(
            `💑 *sᴇʀᴛɪꜰɪᴋᴀᴛ ᴘᴀᴄᴀʀ*\n\n` +
            `╭┈┈⬡「 📋 *ᴄᴀʀᴀ ᴘᴀᴋᴀɪ* 」\n` +
            `┃ ◦ \`${m.prefix}pacarsertifikat <nama1> <nama2>\`\n` +
            `╰┈┈⬡\n\n` +
            `> Contoh: \`${m.prefix}pacarsertifikat Budi Ani\``
        )
    }
    
    const name1 = args[0]
    const name2 = args.slice(1).join(' ')
    
    m.react('💑')
    
    try {
        const apiKey = config.APIkey?.lolhuman
        
        if (!apiKey) {
            throw new Error('API Key tidak ditemukan di config')
        }
        
        const apiUrl = `https://api.lolhuman.xyz/api/pacarserti?apikey=${apiKey}&name1=${encodeURIComponent(name1)}&name2=${encodeURIComponent(name2)}`
        
        const response = await axios.get(apiUrl, {
            responseType: 'arraybuffer',
            timeout: 60000
        })
        
        await sock.sendMessage(m.chat, {
            image: Buffer.from(response.data),
            caption: `💑 *sᴇʀᴛɪꜰɪᴋᴀᴛ ᴘᴀᴄᴀʀ*\n\n` +
                `╭┈┈⬡「 💕 *ɪɴꜰᴏ* 」\n` +
                `┃ ◦ Nama 1: *${name1}*\n` +
                `┃ ◦ Nama 2: *${name2}*\n` +
                `╰┈┈⬡\n\n` +
                `> Selamat atas hubungan kalian! 🎉`
        }, { quoted: m })
        
        m.react('✅')
        
    } catch (error) {
        m.react('❌')
        m.reply(`❌ *ᴇʀʀᴏʀ*\n\n> ${error.message}`)
    }
}

module.exports = {
    config: pluginConfig,
    handler
}

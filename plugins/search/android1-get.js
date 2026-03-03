const axios = require('axios')
const config = require('../../config')

const pluginConfig = {
    name: 'android1-get',
    alias: ['an1get', 'an1dl'],
    category: 'search',
    description: 'Download APK dari Android1',
    usage: '.android1-get <url>',
    example: '.android1-get https://an1.com/xxx',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 15,
    energi: 1,
    isEnabled: true
}

const NEOXR_APIKEY = config.APIkey?.neoxr || 'Milik-Bot-OurinMD'

async function handler(m, { sock }) {
    const url = m.text?.trim()
    
    if (!url || !url.includes('an1.com')) {
        return m.reply(`❌ URL tidak valid! Harus URL dari an1.com`)
    }
    
    m.react('📥')
    
    try {
        const { data } = await axios.get(`https://api.neoxr.eu/api/an1-get?url=${encodeURIComponent(url)}&apikey=${NEOXR_APIKEY}`, {
            timeout: 60000
        })
        
        if (!data?.status || !data?.data) {
            throw new Error('Gagal mengambil detail APK')
        }
        
        const app = data.data
        let caption = `📱 *ᴀɴᴅʀᴏɪᴅ1 ᴅᴏᴡɴʟᴏᴀᴅ*\n\n`
        caption += `╭┈┈⬡「 📋 *ɪɴꜰᴏ* 」\n`
        caption += `┃ 📛 *${app.name}*\n`
        caption += `┃ 📱 Requirement: ${app.requirement}\n`
        caption += `┃ 🏷️ Version: ${app.version}\n`
        caption += `┃ 📦 Size: ${app.size}\n`
        caption += `┃ ⭐ Rating: ${app.rating}/5\n`
        caption += `┃ 📅 Published: ${app.published}\n`
        caption += `┃ 📊 ${app.installed}\n`
        caption += `╰┈┈⬡\n\n`
        
        if (app.description) {
            caption += `> ${app.description.substring(0, 200)}${app.description.length > 200 ? '...' : ''}\n\n`
        }
        
        if (app.url) {
            caption += `> 📥 Mengirim file APK...`
            
            await sock.sendMessage(m.chat, {
                text: caption,
                contextInfo: {}
            }, { quoted: m })
            
            const fileName = `${app.name.replace(/[^a-zA-Z0-9]/g, '_')}.apk`
            
            await sock.sendMessage(m.chat, {
                document: { url: app.url },
                fileName: fileName,
                mimetype: 'application/vnd.android.package-archive',
                contextInfo: {}
            }, { quoted: m })
            
            m.react('✅')
        } else {
            caption += `> ⚠️ Download URL tidak tersedia`
            
            await sock.sendMessage(m.chat, {
                text: caption,
                contextInfo: {},
                interactiveButtons: [{
                    name: 'cta_url',
                    buttonParamsJson: JSON.stringify({
                        display_text: '🌐 Buka di Browser',
                        url: url
                    })
                }]
            }, { quoted: m })
            
            m.react('⚠️')
        }
        
    } catch (err) {
        m.react('❌')
        return m.reply(`❌ *ᴇʀʀᴏʀ*\n\n> ${err.message}`)
    }
}

module.exports = {
    config: pluginConfig,
    handler
}

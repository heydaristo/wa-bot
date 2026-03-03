const axios = require('axios')
const FormData = require('form-data')

const pluginConfig = {
    name: 'fakediscord',
    alias: ['dcfake', 'discordfake', 'fakedc'],
    category: 'canvas',
    description: 'Membuat fake Discord chat',
    usage: '.fakediscord <nama>|<pesan> (reply/kirim foto)',
    example: '.fakediscord Misaki|Hai aku discord user',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 10,
    energi: 1,
    isEnabled: true
}

async function uploadToTempfiles(buffer) {
    const form = new FormData()
    form.append('file', buffer, { filename: 'image.jpg', contentType: 'image/jpeg' })
    
    const response = await axios.post('https://tmpfiles.org/api/v1/upload', form, {
        headers: form.getHeaders(),
        timeout: 30000
    })
    
    if (response.data?.data?.url) {
        return response.data.data.url.replace('tmpfiles.org/', 'tmpfiles.org/dl/')
    }
    throw new Error('Upload gagal')
}

async function handler(m, { sock }) {
    const input = m.text?.trim() || ''
    const parts = input.split('|').map(s => s.trim())
    
    if (parts.length < 2 || !parts[0] || !parts[1]) {
        return m.reply(
            `💬 *ꜰᴀᴋᴇ ᴅɪsᴄᴏʀᴅ ᴄʜᴀᴛ*\n\n` +
            `> Masukkan nama dan pesan\n\n` +
            `*ᴄᴀʀᴀ ᴘᴀᴋᴀɪ:*\n` +
            `> 1. Kirim foto + caption \`${m.prefix}fakediscord <nama>|<pesan>\`\n` +
            `> 2. Reply foto dengan \`${m.prefix}fakediscord <nama>|<pesan>\`\n\n` +
            `> Contoh: \`${m.prefix}fakediscord Misaki|Hai aku discord user\``
        )
    }
    
    const name = parts[0]
    const text = parts[1]
    
    let buffer = null
    
    if (m.quoted && (m.quoted.type === 'imageMessage' || m.quoted.mtype === 'imageMessage')) {
        try {
            buffer = await m.quoted.download()
        } catch (e) {
            return m.reply(`❌ Gagal download gambar: ${e.message}`)
        }
    } else if (m.isMedia && m.type === 'imageMessage') {
        try {
            buffer = await m.download()
        } catch (e) {
            return m.reply(`❌ Gagal download gambar: ${e.message}`)
        }
    }
    
    if (!buffer) {
        return m.reply(`❌ Kirim/reply gambar untuk dijadikan avatar!`)
    }
    
    m.react('💬')
    await m.reply(`⏳ *ᴍᴇᴍᴘʀᴏsᴇs ꜰᴀᴋᴇ ᴅɪsᴄᴏʀᴅ...*`)
    
    try {
        const imageUrl = await uploadToTempfiles(buffer)
        
        const apiUrl = `https://zelapioffciall.koyeb.app/canvas/fakediscord?name=${encodeURIComponent(name)}&text=${encodeURIComponent(text)}&url=${encodeURIComponent(imageUrl)}`
        const response = await axios.get(apiUrl, { 
            responseType: 'arraybuffer',
            timeout: 60000 
        })
        
        await sock.sendMessage(m.chat, {
            image: Buffer.from(response.data),
            caption: `💬 *ꜰᴀᴋᴇ ᴅɪsᴄᴏʀᴅ ᴄʜᴀᴛ*\n\n> ${name}: ${text}`
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

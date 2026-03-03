const axios = require('axios')

const pluginConfig = {
    name: 'gura',
    alias: ['gawr'],
    category: 'canvas',
    description: 'Apply efek Gawr Gura ke gambar',
    usage: '.gura (reply/caption gambar)',
    example: '.gura',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 10,
    energi: 1,
    isEnabled: true
}

async function handler(m, { sock }) {
    let mediaMsg = null
    let downloadFn = null
    
    if (m.isImage || m.message?.imageMessage) {
        mediaMsg = m
        downloadFn = m.download
    } else if (m.quoted?.isImage || m.quoted?.message?.imageMessage) {
        mediaMsg = m.quoted
        downloadFn = m.quoted.download
    }
    
    if (!mediaMsg) {
        return m.reply(`🦈 *ɢᴜʀᴀ ᴇғғᴇᴄᴛ*\n\n> Kirim/reply gambar dengan command ini`)
    }
    
    m.react('🦈')
    
    try {
        const buffer = await downloadFn()
        const formData = new FormData()
        formData.append('file', new Blob([buffer]), 'image.jpg')
        
        const uploadRes = await axios.post('https://tmpfiles.org/api/v1/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        })
        
        let imageUrl = uploadRes.data.data.url.replace('tmpfiles.org/', 'tmpfiles.org/dl/')
        
        const apiUrl = `https://api.nexray.web.id/canvas/gura?url=${encodeURIComponent(imageUrl)}`
        const response = await axios.get(apiUrl, { responseType: 'arraybuffer' })
        
        await sock.sendMessage(m.chat, {
            image: Buffer.from(response.data),
            caption: `🦈 *ɢᴀᴡʀ ɢᴜʀᴀ ᴇғғᴇᴄᴛ*`
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

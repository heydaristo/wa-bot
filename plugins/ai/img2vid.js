const axios = require('axios')
const fs = require('fs')
const path = require('path')
const FormData = require('form-data')
const { downloadContentFromMessage } = require('ourin')
const config = require('../../config')

const NEOXR_APIKEY = config.APIkey?.neoxr || 'Milik-Bot-OurinMD'

const pluginConfig = {
    name: 'img2vid',
    alias: ['image2video', 'animateimg', 'animatephoto'],
    category: 'ai',
    description: 'Ubah gambar jadi video dengan AI',
    usage: '.img2vid <prompt> (reply gambar)',
    example: '.img2vid Animate my photo',
    isOwner: false,
    isPremium: true,
    isGroup: false,
    isPrivate: false,
    cooldown: 60,
    energi: 5,
    isEnabled: true
}

async function uploadToTmpFiles(buffer, filename) {
    const form = new FormData()
    form.append('file', buffer, { filename })
    
    const res = await axios.post('https://tmpfiles.org/api/v1/upload', form, {
        headers: form.getHeaders(),
        timeout: 60000
    })
    
    if (res.data?.data?.url) {
        return res.data.data.url.replace('tmpfiles.org/', 'tmpfiles.org/dl/')
    }
    throw new Error('Failed to upload to tmpfiles.org')
}

async function handler(m, { sock }) {
    const prompt = m.text?.trim() || 'Animate my photo'
    
    if (!m.quoted && !m.isMedia) {
        return m.reply(
            `🎬 *ɪᴍᴀɢᴇ ᴛᴏ ᴠɪᴅᴇᴏ ᴀɪ*\n\n` +
            `> Reply gambar dengan prompt untuk animate\n\n` +
            `*Format:*\n` +
            `> \`${m.prefix}img2vid <prompt>\`\n\n` +
            `*Contoh:*\n` +
            `> \`${m.prefix}img2vid Animate my photo\`\n` +
            `> \`${m.prefix}img2vid Make it dance\``
        )
    }
    
    const quoted = m.quoted
    let mediaMessage = null
    
    if (quoted?.type === 'imageMessage') {
        mediaMessage = quoted
    } else if (m.type === 'imageMessage') {
        mediaMessage = m
    }
    
    if (!mediaMessage) {
        return m.reply(`❌ Reply gambar untuk membuat video!`)
    }
    
    m.react('⏳')
    await m.reply(`⏳ *ᴍᴇɴɢᴜɴᴅᴜʜ ɢᴀᴍʙᴀʀ...*`)
    
    try {
        const stream = await downloadContentFromMessage(
            mediaMessage.message[mediaMessage.type],
            'image'
        )
        
        const chunks = []
        for await (const chunk of stream) {
            chunks.push(chunk)
        }
        const buffer = Buffer.concat(chunks)
        
        await m.reply(`📤 *ᴍᴇɴɢᴜᴘʟᴏᴀᴅ ɢᴀᴍʙᴀʀ...*`)
        
        const imageUrl = await uploadToTmpFiles(buffer, `img2vid_${Date.now()}.jpg`)
        
        await m.reply(`🎬 *ᴍᴇᴍʙᴜᴀᴛ ᴠɪᴅᴇᴏ...*\n\n> Prompt: ${prompt}\n> Tunggu 20-60 detik...`)
        
        const apiUrl = `https://api.neoxr.eu/api/img2vid?image=${encodeURIComponent(imageUrl)}&prompt=${encodeURIComponent(prompt)}&apikey=${NEOXR_APIKEY}`
        
        const res = await axios.get(apiUrl)
        
        if (!res.data?.status || !res.data?.data?.url) {
            m.react('❌')
            return m.reply(`❌ Gagal membuat video!`)
        }
        
        const videoUrl = res.data.data.url
        
        await sock.sendMessage(m.chat, {
            video: { url: videoUrl },
            caption: `🎬 *ɪᴍᴀɢᴇ ᴛᴏ ᴠɪᴅᴇᴏ ᴀɪ*\n\n> Prompt: ${prompt}`,
            contextInfo: {}
        }, { quoted: m })
        
        m.react('✅')
        
    } catch (err) {
        console.error('[Img2Vid] Error:', err.message)
        m.react('❌')
        return m.reply(`❌ *ɢᴀɢᴀʟ*\n\n> ${err.message}`)
    }
}

module.exports = {
    config: pluginConfig,
    handler
}

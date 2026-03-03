const axios = require('axios')
const { uploadImage } = require('../../src/lib/uploader')

const pluginConfig = {
    name: 'towhite',
    alias: ['white', 'putihkan', 'putih', 'toputih'],
    category: 'ai',
    description: 'Ubah gambar ke skin tone lebih terang/cerah',
    usage: '.towhite (reply gambar)',
    example: '.towhite',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 30,
    energi: 2,
    isEnabled: true
}

async function handler(m, { sock }) {
    const isImage = m.isImage || (m.quoted && m.quoted.type === 'imageMessage')

    if (!isImage) {
        return m.reply(`🤍 *ᴡʜɪᴛᴇ sᴛʏʟᴇ*\n\n> Kirim/reply gambar\n\n\`${m.prefix}towhite\``)
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

        const imageUrl = await uploadImage(buffer, 'image.jpg')

        const url = `https://api-faa.my.id/faa/toputih?url=${encodeURIComponent(imageUrl)}`
        const res = await axios.get(url, {
            responseType: 'arraybuffer',
            timeout: 120000
        })

        m.react('✅')

        await sock.sendMessage(m.chat, {
            image: Buffer.from(res.data),
            caption: `🤍 *ᴡʜɪᴛᴇ sᴛʏʟᴇ*`
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
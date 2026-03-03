/**
 * Credits & Thanks to
 * Developer = Lucky Archz ( Zann )
 * Lead owner = HyuuSATAN
 * Owner = Keisya
 * Designer = Danzzz
 *
 * JANGAN HAPUS/GANTI CREDITS & THANKS TO
 * JANGAN DIJUAL YA MEK
 *
 */

const axios = require('axios')

const pluginConfig = {
    name: 'ai4chat',
    alias: ['ai'],
    category: 'ai',
    description: 'Chat dengan AI (GLM)',
    usage: '.ai <pertanyaan>',
    example: '.ai Apa itu JavaScript?',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 1,
    isEnabled: true
}

async function handler(m, { sock }) {
    const text = m.args.join(' ').trim()

    if (!text) {
        // FIX: Pakai sock.sendMessage bukan m.reply() agar tidak muncul card/forward
        return sock.sendMessage(m.chat, {
            text:
                `🤖 *ᴀɪᴄʜᴀᴛ*\n\n` +
                `> Masukkan pertanyaan\n\n` +
                `\`Contoh: ${m.prefix}ai Apa itu JavaScript?\``
        })
    }

    m.react('🤖')

    try {
        const url = `https://zelapioffciall.koyeb.app/ai/glm?text=${encodeURIComponent(text)}`
        const { data } = await axios.get(url, { timeout: 60000 })

        const result = data?.result?.response || data?.result || data?.response || null
        if (!result) throw new Error('Respon AI kosong atau tidak valid')

        m.react('✅')

        // FIX: Pakai sock.sendMessage bukan m.reply() agar tidak muncul card/forward
        await sock.sendMessage(m.chat, {
            text: `🤖 \`\`\`${result}\`\`\``
        })

    } catch (error) {
        m.react('❌')
        await sock.sendMessage(m.chat, {
            text: `❌ *ᴇʀʀᴏʀ*\n\n> ${error.message}`
        })
    }
}

module.exports = {
    config: pluginConfig,
    handler
}
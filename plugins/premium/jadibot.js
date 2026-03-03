const { startJadibot, isJadibotActive } = require('../../src/lib/jadibotManager')
const config = require('../../config')

const pluginConfig = {
    name: 'jadibot',
    alias: ['jbot', 'rentbot'],
    category: 'premium',
    description: 'Jadikan nomor kamu sebagai bot sementara',
    usage: '.jadibot',
    example: '.jadibot',
    isOwner: false,
    isPremium: true,
    isGroup: false,
    isPrivate: false,
    cooldown: 30,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    const userJid = m.sender
    
    if (isJadibotActive(userJid)) {
        return m.reply(
            `❌ *ᴊᴀᴅɪʙᴏᴛ sᴜᴅᴀʜ ᴀᴋᴛɪꜰ!*\n\n` +
            `> Nomor kamu sudah menjadi bot.\n\n` +
            `> Ketik \`${m.prefix}stopjadibot\` untuk menghentikan`
        )
    }
    
    await sock.sendMessage(m.chat, {
        text: `🤖 *ᴊᴀᴅɪʙᴏᴛ*\n\n` +
            `> Memulai proses jadibot...\n` +
            `> Tunggu sebentar untuk mendapatkan *Pairing Code*\n\n` +
            `⚠️ *ᴘᴇʀɪɴɢᴀᴛᴀɴ:*\n` +
            `> Bot sementara akan expired jika restart\n` +
            `> Gunakan dengan bijak!`,
        contextInfo: {}
    }, { quoted: m })
    
    m.react('⏳')
    
    try {
        const result = await startJadibot(sock, m, userJid, true)
        
        if (result.pairingCode) {
            m.react('✅')
        }
    } catch (error) {
        m.react('❌')
        await m.reply(`❌ *ɢᴀɢᴀʟ*\n\n> ${error.message}`)
    }
}

module.exports = {
    config: pluginConfig,
    handler
}

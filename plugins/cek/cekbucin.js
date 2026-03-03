const pluginConfig = {
    name: 'cekbucin',
    alias: ['bucin'],
    category: 'cek',
    description: 'Cek seberapa bucin kamu',
    usage: '.cekbucin @user atau .cekbucin <nama>',
    example: '.cekbucin @Budi',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock, db }) {
    const mentioned = m.mentionedJid ||
                      m.message?.extendedTextMessage?.contextInfo?.mentionedJid ||
                      []

    let nama
    let targetJid = null
    let username = null

    if (mentioned.length >= 1) {
        targetJid = mentioned[0]

        try {
            const user = db.getUser(targetJid)
            if (user?.name) {
                username = user.name
            }
        } catch {}

        if (!username) username = m.pushName || 'User'
        nama = username

    } else {
        nama = m.text?.trim() || m.pushName || 'Kamu'
        targetJid = m.sender
        username = nama
    }

    const percent = Math.floor(Math.random() * 101)

    let desc = ''
    if (percent >= 90) {
        desc = 'BUCIN AKUT! Udah gabisa diselamatkan 😭💔'
    } else if (percent >= 70) {
        desc = 'Bucin parah nih~ 🥺'
    } else if (percent >= 50) {
        desc = 'Lumayan bucin 💕'
    } else if (percent >= 30) {
        desc = 'Sedikit bucin 😊'
    } else {
        desc = 'Santai aja, gak bucin 😎'
    }

    let txt = `💔 *ᴄᴇᴋ ʙᴜᴄɪɴ*\n\n`
    txt += `> 👤 Nama: *@${username}*\n`
    txt += `> 📊 Tingkat: *${percent}%* Bucin\n\n`
    txt += `> ${desc}`

    const mentions = [targetJid]

    await sock.sendMessage(m.chat, { text: txt, mentions }, { quoted: m })
}

module.exports = {
    config: pluginConfig,
    handler
}
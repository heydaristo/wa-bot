const pluginConfig = {
    name: 'cekmesum',
    alias: ['mesum', 'hentai'],
    category: 'cek',
    description: 'Cek seberapa mesum kamu',
    usage: '.cekmesum @user atau .cekmesum <nama>',
    example: '.cekmesum @Budi',
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
        desc = 'MESUM AKUT! Tobat mas! 😳🔞'
    } else if (percent >= 70) {
        desc = 'Mesum banget! 👀'
    } else if (percent >= 50) {
        desc = 'Lumayan mesum 😏'
    } else if (percent >= 30) {
        desc = 'Sedikit mesum 🙈'
    } else {
        desc = 'Polos dan suci! 😇'
    }

    let txt = `🙈 *ᴄᴇᴋ ᴍᴇsᴜᴍ*\n\n`
    txt += `> 👤 Nama: *@${username}*\n`
    txt += `> 📊 Tingkat: *${percent}%* Mesum\n\n`
    txt += `> ${desc}`

    const mentions = [targetJid]

    await sock.sendMessage(m.chat, { text: txt, mentions }, { quoted: m })
}

module.exports = {
    config: pluginConfig,
    handler
}
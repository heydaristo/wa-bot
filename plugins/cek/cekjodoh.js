const pluginConfig = {
    name: 'cekjodoh',
    alias: ['jodoh', 'match'],
    category: 'cek',
    description: 'Cek kecocokan jodoh',
    usage: '.cekjodoh @user1 @user2',
    example: '.cekjodoh @Budi @Ani',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock, db }) {
    const input = m.text?.trim() || ''

    const mentioned = m.mentionedJid ||
                      m.message?.extendedTextMessage?.contextInfo?.mentionedJid ||
                      []

    let nama1, nama2
    let mentionList = []

    const getName = (jid) => {
        const number = jid.split('@')[0].split(':')[0]

        try {
            const user = db.getUser(jid)
            if (user?.name && user.name !== number) return user.name
        } catch {}

        if (jid === m.sender && m.pushName) return m.pushName

        return null
    }

    if (mentioned.length >= 2) {
        const number1 = mentioned[0].split('@')[0].split(':')[0]
        const number2 = mentioned[1].split('@')[0].split(':')[0]

        const dbNama1 = getName(mentioned[0])
        const dbNama2 = getName(mentioned[1])

        // Selalu gunakan @nomor agar WhatsApp highlight sebagai mention
        // Jika ada nama di db, tampilkan: Nama (@nomor)
        nama1 = dbNama1 ? `${dbNama1} (@${number1})` : `@${number1}`
        nama2 = dbNama2 ? `${dbNama2} (@${number2})` : `@${number2}`

        mentionList = [mentioned[0], mentioned[1]]
    } else {
        const parts = input.split(/[&,]/).map(s => s.trim()).filter(s => s)
        if (parts.length < 2) {
            return m.reply(`💕 *ᴄᴇᴋ ᴊᴏᴅᴏʜ*\n\n> Masukkan 2 nama!\n\n> Contoh:\n> ${m.prefix}cekjodoh Budi & Ani\n> ${m.prefix}cekjodoh @user1 @user2`)
        }
        nama1 = parts[0]
        nama2 = parts[1]
    }

    const percent = Math.floor(Math.random() * 101)

    let desc = ''
    if (percent >= 90) desc = 'Jodoh banget! Langsung nikah aja! 💍'
    else if (percent >= 70) desc = 'Cocok banget! 💕'
    else if (percent >= 50) desc = 'Lumayan cocok~ 😊'
    else if (percent >= 30) desc = 'Hmm, perlu usaha lebih 🤔'
    else desc = 'Mungkin cari yang lain? 😅'

    let txt = `💕 *ᴄᴇᴋ ᴊᴏᴅᴏʜ*\n\n`
    txt += `> 👤 ${nama1} ❤️ ${nama2}\n`
    txt += `> 📊 Kecocokan: *${percent}%*\n\n`
    txt += `> ${desc}`

    await sock.sendMessage(m.chat, { 
        text: txt, 
        mentions: mentionList 
    }, { quoted: m })
}

module.exports = {
    config: pluginConfig,
    handler
}
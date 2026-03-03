const pluginConfig = {
    name: 'cekintrovert',
    alias: ['introvert'],
    category: 'cek',
    description: 'Cek tingkat introvert kamu',
    usage: '.cekintrovert <nama>',
    example: '.cekintrovert Budi',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function handler(m) {
    const nama = m.text?.trim() || m.pushName || 'Kamu'
    const percent = Math.floor(Math.random() * 101)
    
    let desc = ''
    if (percent >= 90) desc = 'Rumah adalah surga! Stay home~ 🏠'
    else if (percent >= 70) desc = 'Social battery terbatas 🔋'
    else if (percent >= 50) desc = 'Ambivert, balance~ ⚖️'
    else if (percent >= 30) desc = 'Cukup social butterfly 🦋'
    else desc = 'Extrovert mode ON! 🎉'
    
    let txt = `🏠 *ᴄᴇᴋ ɪɴᴛʀᴏᴠᴇʀᴛ*\n\n`
    txt += `> 👤 Nama: *${nama}*\n`
    txt += `> 📊 Tingkat: *${percent}%*\n\n`
    txt += `> ${desc}`
    
    await m.reply(txt)
}

module.exports = { config: pluginConfig, handler }

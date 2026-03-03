const pluginConfig = {
    name: 'cekkarma',
    alias: ['karma'],
    category: 'cek',
    description: 'Cek tingkat karma kamu',
    usage: '.cekkarma <nama>',
    example: '.cekkarma Budi',
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
    if (percent >= 80) desc = 'Karma baik! Surga menantimu~ ✨'
    else if (percent >= 60) desc = 'Cukup baik, terus tingkatkan! 🙏'
    else if (percent >= 40) desc = 'Netral, perbanyak kebaikan~ ⚖️'
    else if (percent >= 20) desc = 'Hati-hati dengan karma buruk! ⚠️'
    else desc = 'Wah perlu banyak tobat nih... 😱'
    
    let txt = `☯️ *ᴄᴇᴋ ᴋᴀʀᴍᴀ*\n\n`
    txt += `> 👤 Nama: *${nama}*\n`
    txt += `> 📊 Karma: *${percent}%*\n\n`
    txt += `> ${desc}`
    
    await m.reply(txt)
}

module.exports = { config: pluginConfig, handler }

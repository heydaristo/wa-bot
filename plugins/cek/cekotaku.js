const pluginConfig = {
    name: 'cekotaku',
    alias: ['otaku'],
    category: 'cek',
    description: 'Cek tingkat otaku kamu',
    usage: '.cekotaku <nama>',
    example: '.cekotaku Budi',
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
    if (percent >= 90) desc = 'SUGOI! True otaku desu! 🎌✨'
    else if (percent >= 70) desc = 'Weeb level tinggi~ 🇯🇵'
    else if (percent >= 50) desc = 'Casual anime enjoyer 📺'
    else if (percent >= 30) desc = 'Tau anime dikit-dikit 🤔'
    else desc = 'Normie detected! 😂'
    
    let txt = `🎌 *ᴄᴇᴋ ᴏᴛᴀᴋᴜ*\n\n`
    txt += `> 👤 Nama: *${nama}*\n`
    txt += `> 📊 Tingkat: *${percent}%*\n\n`
    txt += `> ${desc}`
    
    await m.reply(txt)
}

module.exports = { config: pluginConfig, handler }

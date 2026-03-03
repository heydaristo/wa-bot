const pluginConfig = {
    name: 'cekrezeki',
    alias: ['rezeki', 'fortune'],
    category: 'cek',
    description: 'Cek tingkat rezeki kamu hari ini',
    usage: '.cekrezeki <nama>',
    example: '.cekrezeki Budi',
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
    if (percent >= 90) desc = 'Rezeki melimpah! Jackpot! 💰🎉'
    else if (percent >= 70) desc = 'Rezeki lancar hari ini~ 💵'
    else if (percent >= 50) desc = 'Rezeki cukup, bersyukurlah 🙏'
    else if (percent >= 30) desc = 'Rezeki pas-pasan 😅'
    else desc = 'Sabar ya, rezeki akan datang~ 🫂'
    
    let txt = `💰 *ᴄᴇᴋ ʀᴇᴢᴇᴋɪ*\n\n`
    txt += `> 👤 Nama: *${nama}*\n`
    txt += `> 📊 Tingkat: *${percent}%*\n\n`
    txt += `> ${desc}`
    
    await m.reply(txt)
}

module.exports = { config: pluginConfig, handler }

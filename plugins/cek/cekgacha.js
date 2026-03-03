const pluginConfig = {
    name: 'cekgacha',
    alias: ['gacha', 'luck'],
    category: 'cek',
    description: 'Cek hoki gacha kamu',
    usage: '.cekgacha <nama>',
    example: '.cekgacha Budi',
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
    if (percent >= 90) desc = 'HOKI PARAH! SSR GUARANTEED! ✨💎'
    else if (percent >= 70) desc = 'Lucky! Pasti dapet SR keatas! 🍀'
    else if (percent >= 50) desc = 'Hoki-hoki dikit 😊'
    else if (percent >= 30) desc = 'Hmm... pray harder! 🙏'
    else desc = 'SIAL! Nanti aja gachanya! 💔'
    
    let txt = `🎰 *ᴄᴇᴋ ʜᴏᴋɪ ɢᴀᴄʜᴀ*\n\n`
    txt += `> 👤 Nama: *${nama}*\n`
    txt += `> 📊 Tingkat: *${percent}%*\n\n`
    txt += `> ${desc}`
    
    await m.reply(txt)
}

module.exports = { config: pluginConfig, handler }

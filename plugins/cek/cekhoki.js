const pluginConfig = {
    name: 'cekhoki',
    alias: ['hoki', 'lucky'],
    category: 'cek',
    description: 'Cek seberapa hoki kamu',
    usage: '.cekhoki <nama>',
    example: '.cekhoki Budi',
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
    if (percent >= 90) {
        desc = 'HOKI DEWA! Main gacha pasti menang! 🍀✨'
    } else if (percent >= 70) {
        desc = 'Hoki banget! 🎰'
    } else if (percent >= 50) {
        desc = 'Lumayan hoki 🍀'
    } else if (percent >= 30) {
        desc = 'Sedikit hoki 😊'
    } else {
        desc = 'Sabar ya, lagi apes 😅'
    }
    
    let txt = `🍀 *ᴄᴇᴋ ʜᴏᴋɪ*\n\n`
    txt += `> 👤 Nama: *${nama}*\n`
    txt += `> 📊 Tingkat: *${percent}%* Hoki\n\n`
    txt += `> ${desc}`
    
    await m.reply(txt)
}

module.exports = {
    config: pluginConfig,
    handler
}

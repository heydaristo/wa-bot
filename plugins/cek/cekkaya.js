const pluginConfig = {
    name: 'cekkaya',
    alias: ['kaya', 'rich'],
    category: 'cek',
    description: 'Cek seberapa kaya kamu',
    usage: '.cekkaya <nama>',
    example: '.cekkaya Budi',
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
    let emoji = ''
    if (percent >= 90) {
        desc = 'Sultan! Crazy rich! 💎'
        emoji = '👑'
    } else if (percent >= 70) {
        desc = 'Tajir melintir! 💰'
        emoji = '💎'
    } else if (percent >= 50) {
        desc = 'Lumayan berada 💵'
        emoji = '💰'
    } else if (percent >= 30) {
        desc = 'Cukup lah buat hidup 😊'
        emoji = '💵'
    } else {
        desc = 'Semangat nabung! 🙏'
        emoji = '🪙'
    }
    
    let txt = `${emoji} *ᴄᴇᴋ ᴋᴀʏᴀ*\n\n`
    txt += `> 👤 Nama: *${nama}*\n`
    txt += `> 📊 Tingkat: *${percent}%* Kaya\n\n`
    txt += `> ${desc}`
    
    await m.reply(txt)
}

module.exports = {
    config: pluginConfig,
    handler
}

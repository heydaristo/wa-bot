const pluginConfig = {
    name: 'ceksexy',
    alias: ['sexy', 'hot'],
    category: 'cek',
    description: 'Cek seberapa sexy kamu',
    usage: '.ceksexy <nama>',
    example: '.ceksexy Budi',
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
        desc = 'SEXY ABIS! 🔥🔥🔥'
    } else if (percent >= 70) {
        desc = 'Hot banget! 😏'
    } else if (percent >= 50) {
        desc = 'Lumayan menggoda~ 😊'
    } else if (percent >= 30) {
        desc = 'Biasa aja sih 🙂'
    } else {
        desc = 'Mungkin cute bukan sexy 😅'
    }
    
    let txt = `🔥 *ᴄᴇᴋ sᴇxʏ*\n\n`
    txt += `> 👤 Nama: *${nama}*\n`
    txt += `> 📊 Tingkat: *${percent}%* Sexy\n\n`
    txt += `> ${desc}`
    
    await m.reply(txt)
}

module.exports = {
    config: pluginConfig,
    handler
}

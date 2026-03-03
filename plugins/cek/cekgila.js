const pluginConfig = {
    name: 'cekgila',
    alias: ['gila', 'crazy'],
    category: 'cek',
    description: 'Cek seberapa gila kamu',
    usage: '.cekgila <nama>',
    example: '.cekgila Budi',
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
        desc = 'GILA BENERAN! Masuk RSJ! 🤪'
    } else if (percent >= 70) {
        desc = 'Hampir gila 😵'
    } else if (percent >= 50) {
        desc = 'Lumayan waras 😅'
    } else if (percent >= 30) {
        desc: 'Normal kok 🙂'
    } else {
        desc = 'Waras banget! 😇'
    }
    
    let txt = `🤪 *ᴄᴇᴋ ɢɪʟᴀ*\n\n`
    txt += `> 👤 Nama: *${nama}*\n`
    txt += `> 📊 Tingkat: *${percent}%* Gila\n\n`
    txt += `> ${desc}`
    
    await m.reply(txt)
}

module.exports = {
    config: pluginConfig,
    handler
}

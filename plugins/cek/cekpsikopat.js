const pluginConfig = {
    name: 'cekpsikopat',
    alias: ['psikopat', 'psycho'],
    category: 'cek',
    description: 'Cek seberapa psikopat kamu',
    usage: '.cekpsikopat <nama>',
    example: '.cekpsikopat Budi',
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
        desc = 'PSIKOPAT AKUT! Jauhi! 😈'
    } else if (percent >= 70) {
        desc = 'Hati-hati sama orang ini 👀'
    } else if (percent >= 50) {
        desc = 'Ada sisi gelapnya 🌑'
    } else if (percent >= 30) {
        desc = 'Sedikit misterius 🤔'
    } else {
        desc = 'Normal dan baik hati 😇'
    }
    
    let txt = `😈 *ᴄᴇᴋ ᴘsɪᴋᴏᴘᴀᴛ*\n\n`
    txt += `> 👤 Nama: *${nama}*\n`
    txt += `> 📊 Tingkat: *${percent}%* Psikopat\n\n`
    txt += `> ${desc}`
    
    await m.reply(txt)
}

module.exports = {
    config: pluginConfig,
    handler
}

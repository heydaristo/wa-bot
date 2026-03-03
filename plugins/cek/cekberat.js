const pluginConfig = {
    name: 'cekberat',
    alias: ['berat', 'weight'],
    category: 'cek',
    description: 'Cek berat badan random',
    usage: '.cekberat <nama>',
    example: '.cekberat Budi',
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
    const berat = Math.floor(Math.random() * 60) + 40
    
    let desc = ''
    if (berat >= 90) {
        desc = 'Big boy/girl! 💪'
    } else if (berat >= 70) {
        desc = 'Berisi dan sehat! 😊'
    } else if (berat >= 55) {
        desc = 'Ideal banget! 👍'
    } else if (berat >= 45) {
        desc = 'Langsing nih~ 🌸'
    } else {
        desc = 'Kurus banget, makan yang banyak! 🍔'
    }
    
    let txt = `⚖️ *ᴄᴇᴋ ʙᴇʀᴀᴛ*\n\n`
    txt += `> 👤 Nama: *${nama}*\n`
    txt += `> 📊 Berat: *${berat} kg*\n\n`
    txt += `> ${desc}`
    
    await m.reply(txt)
}

module.exports = {
    config: pluginConfig,
    handler
}

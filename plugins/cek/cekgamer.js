const pluginConfig = {
    name: 'cekgamer',
    alias: ['gamer', 'pro'],
    category: 'cek',
    description: 'Cek seberapa pro gamer kamu',
    usage: '.cekgamer <nama>',
    example: '.cekgamer Budi',
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
        desc = 'PRO PLAYER! Esports level! 🏆'
    } else if (percent >= 70) {
        desc = 'Jago banget! 🎮'
    } else if (percent >= 50) {
        desc = 'Lumayan pro 👍'
    } else if (percent >= 30) {
        desc = 'Masih noob nih 😅'
    } else {
        desc = 'Mending main masak-masakan 🍳'
    }
    
    let txt = `🎮 *ᴄᴇᴋ ɢᴀᴍᴇʀ*\n\n`
    txt += `> 👤 Nama: *${nama}*\n`
    txt += `> 📊 Tingkat: *${percent}%* Pro\n\n`
    txt += `> ${desc}`
    
    await m.reply(txt)
}

module.exports = {
    config: pluginConfig,
    handler
}

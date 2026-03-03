const pluginConfig = {
    name: 'cekumur',
    alias: ['umur', 'age'],
    category: 'cek',
    description: 'Cek umur mental kamu',
    usage: '.cekumur <nama>',
    example: '.cekumur Budi',
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
    const percent = Math.floor(Math.random() * 80) + 5
    
    let desc = ''
    if (percent >= 60) desc = 'Bijaksana seperti orang tua! 🧓'
    else if (percent >= 40) desc = 'Dewasa dan matang~ 🧑'
    else if (percent >= 20) desc = 'Jiwa muda! 🧒'
    else desc = 'Masih seperti anak kecil~ 👶'
    
    let txt = `🎂 *ᴄᴇᴋ ᴜᴍᴜʀ ᴍᴇɴᴛᴀʟ*\n\n`
    txt += `> 👤 Nama: *${nama}*\n`
    txt += `> 📊 Umur Mental: *${percent} Tahun*\n\n`
    txt += `> ${desc}`
    
    await m.reply(txt)
}

module.exports = { config: pluginConfig, handler }

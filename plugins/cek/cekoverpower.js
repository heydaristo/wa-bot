const pluginConfig = {
    name: 'cekoverpower',
    alias: ['overpower', 'op'],
    category: 'cek',
    description: 'Cek tingkat overpower kamu',
    usage: '.cekoverpower <nama>',
    example: '.cekoverpower Budi',
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
    if (percent >= 90) desc = 'OVERPOWER BANGET! LEGEND! 👑🔥'
    else if (percent >= 70) desc = 'Kuat banget nih! 💪'
    else if (percent >= 50) desc = 'Lumayan strong~ 😎'
    else if (percent >= 30) desc = 'Biasa aja sih 🤔'
    else desc = 'Masih perlu latihan 📝'
    
    let txt = `👑 *ᴄᴇᴋ ᴏᴠᴇʀᴘᴏᴡᴇʀ*\n\n`
    txt += `> 👤 Nama: *${nama}*\n`
    txt += `> 📊 Tingkat: *${percent}%*\n\n`
    txt += `> ${desc}`
    
    await m.reply(txt)
}

module.exports = { config: pluginConfig, handler }

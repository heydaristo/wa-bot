const pluginConfig = {
    name: 'cekgabut',
    alias: ['gabut', 'bored'],
    category: 'cek',
    description: 'Cek tingkat keGabutan kamu',
    usage: '.cekgabut <nama>',
    example: '.cekgabut Budi',
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
    if (percent >= 90) desc = 'GABUT LEVEL MAX! Main bot aja~ 🥱'
    else if (percent >= 70) desc = 'Gabut parah nih! 😴'
    else if (percent >= 50) desc = 'Lumayan gabut 😅'
    else if (percent >= 30) desc = 'Agak sibuk dikit 📝'
    else desc = 'Sibuk banget! Produktif! 💼'
    
    let txt = `🥱 *ᴄᴇᴋ ᴋᴇɢᴀʙᴜᴛᴀɴ*\n\n`
    txt += `> 👤 Nama: *${nama}*\n`
    txt += `> 📊 Tingkat: *${percent}%*\n\n`
    txt += `> ${desc}`
    
    await m.reply(txt)
}

module.exports = { config: pluginConfig, handler }

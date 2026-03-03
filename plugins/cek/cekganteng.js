const pluginConfig = {
    name: 'cekganteng',
    alias: ['ganteng', 'handsome'],
    category: 'cek',
    description: 'Cek seberapa ganteng kamu',
    usage: '.cekganteng <nama>',
    example: '.cekganteng Budi',
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
        desc = 'Ganteng maksimal! 😍🔥'
    } else if (percent >= 70) {
        desc = 'Ganteng banget! 😎'
    } else if (percent >= 50) {
        desc = 'Lumayan ganteng~ 👍'
    } else if (percent >= 30) {
        desc = 'Biasa aja sih 😅'
    } else {
        desc = 'Mungkin inner beauty? 🤭'
    }
    
    let txt = `😎 *ᴄᴇᴋ ɢᴀɴᴛᴇɴɢ*\n\n`
    txt += `> 👤 Nama: *${nama}*\n`
    txt += `> 📊 Tingkat: *${percent}%* Ganteng\n\n`
    txt += `> ${desc}`
    
    await m.reply(txt)
}

module.exports = {
    config: pluginConfig,
    handler
}

const pluginConfig = {
    name: 'cekbaik',
    alias: ['baik', 'kind'],
    category: 'cek',
    description: 'Cek seberapa baik kamu',
    usage: '.cekbaik <nama>',
    example: '.cekbaik Budi',
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
        desc = 'MALAIKAT! Baik banget! 😇✨'
    } else if (percent >= 70) {
        desc = 'Baik hati banget! 💝'
    } else if (percent >= 50) {
        desc = 'Lumayan baik 😊'
    } else if (percent >= 30) {
        desc = 'Sedikit baik 🙂'
    } else {
        desc = 'Hmm, perlu introspeksi? 🤔'
    }
    
    let txt = `😇 *ᴄᴇᴋ ʙᴀɪᴋ*\n\n`
    txt += `> 👤 Nama: *${nama}*\n`
    txt += `> 📊 Tingkat: *${percent}%* Baik\n\n`
    txt += `> ${desc}`
    
    await m.reply(txt)
}

module.exports = {
    config: pluginConfig,
    handler
}

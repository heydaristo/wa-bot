const pluginConfig = {
    name: 'cekimut',
    alias: ['imut', 'cute'],
    category: 'cek',
    description: 'Cek seberapa imut kamu',
    usage: '.cekimut <nama>',
    example: '.cekimut Ani',
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
        desc = 'IMUT BANGET! Kawaii~~ 🥺💕'
    } else if (percent >= 70) {
        desc = 'Imutnya kebangetan! 😍'
    } else if (percent >= 50) {
        desc = 'Lumayan imut~ 🌸'
    } else if (percent >= 30) {
        desc = 'Ada imutnya dikit 😊'
    } else {
        desc = 'Mungkin cool bukan imut? 😎'
    }
    
    let txt = `🥺 *ᴄᴇᴋ ɪᴍᴜᴛ*\n\n`
    txt += `> 👤 Nama: *${nama}*\n`
    txt += `> 📊 Tingkat: *${percent}%* Imut\n\n`
    txt += `> ${desc}`
    
    await m.reply(txt)
}

module.exports = {
    config: pluginConfig,
    handler
}

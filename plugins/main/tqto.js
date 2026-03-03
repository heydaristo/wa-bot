const config = require('../../config')
const path = require('path')
const fs = require('fs')

const pluginConfig = {
    name: 'tqto',
    alias: ['thanksto', 'credits', 'kredit'],
    category: 'main',
    description: 'Menampilkan daftar kontributor bot',
    usage: '.tqto',
    example: '.tqto',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    const botName = config.bot?.name || 'Ourin-AI'
    const version = config.bot?.version || '1.0.0'
    const developer = config.bot?.developer || 'Lucky Archz'
    
    const credits = [
        { name: 'hyuuSATAN', role: 'Staff', icon: '👨‍💻' },
        { name: 'Zann', role: 'Developer', icon: '👨‍💻' },
        { name: 'Sanxz', role: 'Tangan Kanan', icon: '👨‍💻' },
        { name: 'Dinz', role: 'Tangan Kanan', icon: '👨‍💻' },
        { name: 'Forone Store', role: 'Tangan Kanan', icon: '🛒' },
        { name: 'Rakaa', role: 'Tangan Kanan', icon: '🛒' },
        { name: 'Tama', role: 'Tangan Kanan', icon: '🛒' },
        { name: 'Syura Store', role: 'Tangan Kanan', icon: '👩‍💻' },
        { name: 'Lyoraaa', role: 'Owner', icon: '👩‍💻' },
        { name: 'Danzzz', role: 'Owner', icon: '👨‍💻' },
        { name: 'Muzan', role: 'Owner', icon: '👨‍💻' },
        { name: 'Baim', role: 'Moderator', icon: '👨‍💻' },
        { name: 'Fahmi', role: 'Moderator', icon: '👨‍💻' },
        { name: 'panceo', role: 'Partner', icon: '🛒' },
        { name: 'Dashxz', role: 'Partner', icon: '🛒' },
        { name: 'This JanzZ', role: 'Partner', icon: '🛒' },
        { name: 'nopal', role: 'Partner', icon: '🛒' },
        { name: 'tuadit', role: 'Partner', icon: '🛒' },
        { name: 'andry', role: 'Partner', icon: '🛒' },
        { name: 'kingdanz', role: 'Partner', icon: '🛒' },
        { name: 'patih', role: 'Partner', icon: '🛒' },
        { name: 'Ryuu', role: 'Partner', icon: '🛒' },
        { name: 'Pororo', role: 'Partner', icon: '🛒' },
        { name: 'Janzz', role: 'Partner', icon: '🛒' },
        { name: 'Morvic', role: 'Partner', icon: '🛒' },
        { name: 'zylnzee', role: 'Partner', icon: '🛒' },
        { name: 'Farhan', role: 'Partner', icon: '🛒' },
        { name: 'Kiram', role: 'Partner', icon: '🛒' },
        { name: 'Minerva', role: 'Partner', icon: '🛒' },
        { name: 'Riam', role: 'Partner', icon: '🛒' },
        { name: 'Febri', role: 'Partner', icon: '🛒' },
        { name: 'Kuze', role: 'Partner', icon: '🛒' },
        { name: 'Oscar Dani', role: 'Partner', icon: '🛒' },
        { name: 'Udun', role: 'Partner', icon: '🛒' },
        { name: 'Zanspiw', role: 'Youtuber', icon: '🌐' },
        { name: 'Danzz Nano', role: 'Youtuber', icon: '🌐' },
        { name: 'Youtuber Lain yang udah review', role: 'Youtuber', icon: '🌐' },
        { name: 'Kalian Semua', role: 'Best', icon: '🌐' },
        { name: 'Open Source Community', role: 'Libraries & Tools', icon: '🌐' }

    ]
    
    const specialThanks = [
        'Semua tester dan bug reporter',
        'User yang memberikan feedback',
        'Komunitas WhatsApp Bot Indonesia'
    ]
    
    let txt = `✨ *ᴛʜᴀɴᴋs ᴛᴏ*\n\n`
    txt += `> Terima kasih kepada semua yang berkontribusi!\n\n`
    
    txt += `╭─「 👥 *ᴄᴏɴᴛʀɪʙᴜᴛᴏʀs* 」\n`
    credits.forEach((c, i) => {
        txt += `┃ ${c.icon} \`${c.name}\`\n`
        txt += `┃    └ *${c.role}*\n`
        if (i < credits.length - 1) txt += `┃\n`
    })
    txt += `╰───────────────\n\n`
    
    txt += `╭─「 💖 *sᴘᴇᴄɪᴀʟ ᴛʜᴀɴᴋs* 」\n`
    specialThanks.forEach((t, i) => {
        txt += `┃ ⭐ ${t}\n`
    })
    txt += `╰───────────────\n\n`
    
    txt += `╭─「 📋 *ɪɴꜰᴏ ʙᴏᴛ* 」\n`
    txt += `┃ 🤖 \`ɴᴀᴍᴀ\`: *${botName}*\n`
    txt += `┃ 📦 \`ᴠᴇʀsɪ\`: *${version}*\n`
    txt += `┃ 👨‍💻 \`ᴅᴇᴠ\`: *${developer}*\n`
    txt += `╰───────────────\n\n`
    
    txt += `> Made with ❤️ by the team`
    
    let thumbPath = path.join(process.cwd(), 'assets', 'images', 'ourin.jpg')
    let thumbBuffer = null
    if (fs.existsSync(thumbPath)) {
        thumbBuffer = fs.readFileSync(thumbPath)
    }
    
    const contextInfo = {
        mentionedJid: []externalAdReply: {
            title: `✨ Thanks To - ${botName}`,
            body: `v${version} • Credits & Contributors`,
            sourceUrl: saluranLink,
            mediaType: 1,
            showAdAttribution: false,
            renderLargerThumbnail: true
        }
    }
    
    if (thumbBuffer) {
        contextInfo.externalAdReply.thumbnail = thumbBuffer
    }
    
    const fakeQuoted = {
        key: {
            fromMe: false,
            participant: '0@s.whatsapp.net',
            remoteJid: 'status@broadcast'
        },
        message: {
            extendedTextMessage: {
                text: `✨ ${botName} Credits`,
                contextInfo: {}
            }
        }
    }
    
    await sock.sendMessage(m.chat, {
        text: txt,
        contextInfo: contextInfo
    }, { quoted: fakeQuoted })
}

module.exports = {
    config: pluginConfig,
    handler
}

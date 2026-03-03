const { getDatabase } = require('../../src/lib/database')
const config = require('../../config')
const path = require('path')
const fs = require('fs')

const pluginConfig = {
    name: 'casino',
    alias: ['judi', 'gamble'],
    category: 'rpg',
    description: 'Bermain casino untuk judi',
    usage: '.casino <jumlah>',
    example: '.casino 10000',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 10,
    energi: 1,
    isEnabled: true
}

let thumbRpg = null
try {
    const thumbPath = path.join(process.cwd(), 'assets', 'images', 'ourin-rpg.jpg')
    if (fs.existsSync(thumbPath)) thumbRpg = fs.readFileSync(thumbPath)
} catch (e) {}

function getContextInfo(title = '🎰 *ᴄᴀsɪɴᴏ*', body = 'Gambling') {
    const contextInfo = {}
    
    if (thumbRpg) {
        contextInfo.externalAdReply = {
            title: title,
            body: body,
            thumbnail: thumbRpg,
            mediaType: 1,
            renderLargerThumbnail: false
        }
    }
    
    return contextInfo
}

async function handler(m, { sock }) {
    const db = getDatabase()
    const user = db.getUser(m.sender)
    const args = m.args || []
    
    let bet = args[0]
    
    if (!bet) {
        return m.reply(
            `⚠️ *ᴄᴀʀᴀ ᴘᴀᴋᴀɪ*\n\n` +
            `> \`${m.prefix}casino <jumlah>\`\n\n` +
            `> Contoh:\n` +
            `> \`${m.prefix}casino 10000\`\n` +
            `> \`${m.prefix}casino all\``
        )
    }
    
    if (/^all$/i.test(bet)) {
        bet = user.koin || 0
    } else {
        bet = parseInt(bet)
    }
    
    if (isNaN(bet) || bet < 1000) {
        return m.reply(`❌ *ᴍɪɴɪᴍᴀʟ ʙᴇᴛ*\n\n> Minimal taruhan Rp 1.000`)
    }
    
    if (bet > (user.koin || 0)) {
        return m.reply(
            `❌ *sᴀʟᴅᴏ ᴛɪᴅᴀᴋ ᴄᴜᴋᴜᴘ*\n\n` +
            `> Saldo kamu: Rp ${(user.koin || 0).toLocaleString('id-ID')}\n` +
            `> Taruhan: Rp ${bet.toLocaleString('id-ID')}`
        )
    }
    
    await m.react('🎰')
    await m.reply(`🎰 *ᴍᴇᴍᴜᴛᴀʀ ʀᴏᴅᴀ...*`)
    await new Promise(r => setTimeout(r, 2000))
    
    const playerScore = Math.floor(Math.random() * 100)
    const botScore = Math.floor(Math.random() * 100)
    
    let result, emoji, moneyChange
    
    if (playerScore > botScore) {
        result = 'MENANG'
        emoji = '🎉'
        moneyChange = bet
        user.koin = (user.koin || 0) + bet
    } else if (playerScore < botScore) {
        result = 'KALAH'
        emoji = '💔'
        moneyChange = -bet
        user.koin = (user.koin || 0) - bet
    } else {
        result = 'SERI'
        emoji = '🤝'
        moneyChange = 0
    }
    
    db.save()
    
    await m.react(emoji)
    
    let txt = `🎰 *ᴄᴀsɪɴᴏ ʀᴇsᴜʟᴛ*\n\n`
    txt += `╭┈┈⬡「 🎲 *sᴋᴏʀ* 」\n`
    txt += `┃ 👤 Kamu: *${playerScore}* poin\n`
    txt += `┃ 🤖 Bot: *${botScore}* poin\n`
    txt += `┃ ─────────\n`
    txt += `┃ ${emoji} Hasil: *${result}*\n`
    if (moneyChange !== 0) {
        txt += `┃ 💵 ${moneyChange > 0 ? '+' : ''}Rp ${moneyChange.toLocaleString('id-ID')}\n`
    }
    txt += `╰┈┈┈┈┈┈┈┈⬡\n\n`
    txt += `> Saldo: Rp ${(user.koin || 0).toLocaleString('id-ID')}`
    
    await sock.sendMessage(m.chat, {
        text: txt,
        contextInfo: getContextInfo(`🎰 *${result}*`, `${moneyChange > 0 ? '+' : ''}Rp ${moneyChange.toLocaleString('id-ID')}`)
    }, { quoted: m })
}

module.exports = {
    config: pluginConfig,
    handler
}

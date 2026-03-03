const config = require('../../config')
const { formatUptime, getTimeGreeting } = require('../../src/lib/formatter')
const { getCommandsByCategory, getCategories, getPlugin } = require('../../src/lib/plugins')
const { getCasesByCategory, getCaseCount } = require('../../case/ourin')
const fs = require('fs')
const path = require('path')
const moment = require('moment-timezone')

const pluginConfig = {
    name: 'allmenu',
    alias: ['fullmenu', 'am', 'allcommand', 'semua'],
    category: 'main',
    description: 'Menampilkan semua command lengkap per kategori',
    usage: '.allmenu',
    cooldown: 5,
    isEnabled: true
}

const CATEGORY_EMOJIS = {
    owner: '👑', main: '🏠', utility: '🔧', fun: '🎮', group: '👥',
    download: '📥', search: '🔍', tools: '🛠️', sticker: '🖼️',
    ai: '🤖', game: '🎯', media: '🎬', info: 'ℹ️', religi: '☪️',
    panel: '🖥️', user: '📊', random: '🎲', premium: '💎'
}

function toSmallCaps(text = '') {
    const map = {
        a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ꜰ',g:'ɢ',h:'ʜ',
        i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',
        p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',
        w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'
    }
    return text.toLowerCase().split('').map(c => map[c] || c).join('')
}

function getCommandSymbols(cmd) {
    const plugin = getPlugin(cmd)
    if (!plugin?.config) return ''

    const s = []
    if (plugin.config.isOwner) s.push('Ⓞ')
    if (plugin.config.isPremium) s.push('ⓟ')
    if (plugin.config.limit > 0) s.push('Ⓛ')
    if (plugin.config.isAdmin) s.push('Ⓐ')

    return s.length ? ` ${s.join(' ')}` : ''
}

function context(m) {
    return { mentionedJid: [m.sender] }
}

async function handler(m, { sock, db, uptime }) {
    const prefix = config.command?.prefix || '.'
    const categories = getCategories()
    const cmds = getCommandsByCategory()
    const cases = getCasesByCategory()

    let text = `Hai *@${m.pushName || 'User'}* 🪸  
Aku *${config.bot?.name || 'Ourin-AI'}*, bot WhatsApp siap bantu kamu 🤍

╭┈┈⬡「 📖 *ᴋᴇᴛᴇʀᴀɴɢᴀɴ* 」
┃ Ⓞ Owner Only
┃ ⓟ Premium
┃ Ⓛ Limit
┃ Ⓐ Admin
╰┈┈┈┈┈┈┈┈⬡

`

    for (const cat of categories) {
        if (cat === 'owner' && !m.isOwner) continue

        const list = [
            ...(cmds[cat] || []),
            ...(cases[cat] || [])
        ]

        if (!list.length) continue

        text += `╭┈┈⬡「 ${CATEGORY_EMOJIS[cat] || '📋'} *${toSmallCaps(cat)}* 」\n`
        for (const c of list) {
            text += `┃ ◦ *${prefix}${toSmallCaps(c)}*${getCommandSymbols(c)}\n`
        }
        text += `╰┈┈┈┈┈┈┈┈⬡\n\n`
    }

    text += `_© ${config.bot?.name || 'Ourin-AI'} | ${moment().tz('Asia/Jakarta').year()}_\n`
    text += `_ᴅᴇᴠᴇʟᴏᴘᴇʀ: ${config.bot?.developer || 'Lucky Archz'}_`

    const img = path.join(process.cwd(), 'assets/images/ourin.jpg')

    try {
        if (fs.existsSync(img)) {
            await sock.sendMessage(m.chat, {
                image: fs.readFileSync(img),
                caption: text,
                contextInfo: context(m)
            }, { quoted: m })
        } else {
            await m.reply(text)
        }
    } catch (e) {
        console.error('[ALLMENU ERROR]', e)
        await m.reply(text)
    }
}

module.exports = {
    config: pluginConfig,
    handler
}
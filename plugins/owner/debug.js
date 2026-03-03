const pluginConfig = {
    name: 'debuggroup',
    alias: [],
    category: 'owner',
    isOwner: true,
    isGroup: true,
    isEnabled: true,
    cooldown: 3,
    energi: 0
}

async function handler(m, { sock }) {
    const groupMeta = await sock.groupMetadata(m.chat)
    const participants = groupMeta.participants.slice(0, 3)
    
    const info = participants.map(p => JSON.stringify(p)).join('\n\n')
    await m.reply('```\n' + info + '\n```')
}

module.exports = { config: pluginConfig, handler }
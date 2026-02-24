const fs = require("fs")
const path = require("path")

// folder emoji svg (hasil copy dari @twemoji/svg)
const EMOJI_DIR = path.join(__dirname, "../public/twemoji")

// ================= CONFIG =================
const MAX_WIDTH = 480
const BASE_FONT = 64
const MIN_FONT = 32
const LINE_HEIGHT_RATIO = 1.05
// =========================================

// ==== util deteksi emoji (NON stateful) ====
function isEmoji(ch) {
    return /\p{Extended_Pictographic}/u.test(ch)
}

// ==== hitung lebar karakter (KONSISTEN) ====
function charWidth(ch, fontSize) {
    return isEmoji(ch) ? fontSize : fontSize * 0.6
}

// ==== wrap text (BERDASARKAN KARAKTER, AMAN) ====
function wrapText(text, fontSize) {
    const words = text.split(" ")
    let lines = []
    let current = ""

    for (const word of words) {
        const test = current ? current + " " + word : word
        if (test.length * fontSize * 0.6 > MAX_WIDTH) {
            lines.push(current)
            current = word
        } else {
            current = test
        }
    }

    if (current) lines.push(current)
    return lines
}

function splitTextAndEmoji(text) {
    return text.match(/\p{Extended_Pictographic}|\P{Extended_Pictographic}+/gu) || []
}
// ==== auto font-size ====
function calculateFontSize(text) {
    let size = BASE_FONT
    while (size >= MIN_FONT) {
        if (wrapText(text, size).length <= 2) return size
        size -= 2
    }
    return MIN_FONT
}

// ==== render satu baris ====
function renderLine(line, y, fontSize) {
    return `
<text
  x="256"
  y="${y}"
  text-anchor="middle"
  dominant-baseline="hanging"
  font-size="${fontSize}"
  font-family="Impact, Arial Black, sans-serif"
  fill="white"
  stroke="black"
  stroke-width="${fontSize * 0.15}"
  paint-order="stroke"
>${line}</text>
`
}
// ================= MAIN BUILDER =================
function buildStickerSvg(topText, bottomText = "") {
    let svg = ""

    // 🔥 GUARD ANTI DOUBLE
    if (bottomText === topText) {
        bottomText = ""
    }

    if (topText) {
        topText = topText.toUpperCase()
        const fontSize = calculateFontSize(topText)
        const lines = wrapText(topText, fontSize)

        lines.forEach((line, i) => {
            svg += renderLine(
                line,
                10 + i * fontSize * LINE_HEIGHT_RATIO,
                fontSize
            )
        })
    }

    if (bottomText) {
        bottomText = bottomText.toUpperCase()
        const fontSize = calculateFontSize(bottomText)
        const lines = wrapText(bottomText, fontSize)
        const startY = 512 - (lines.length * fontSize * LINE_HEIGHT_RATIO) - 10

        lines.forEach((line, i) => {
            svg += renderLine(
                line,
                startY + i * fontSize * LINE_HEIGHT_RATIO,
                fontSize
            )
        })
    }

    return `
<svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
${svg}
</svg>`
}
module.exports = { buildStickerSvg }
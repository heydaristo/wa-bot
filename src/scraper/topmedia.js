const https = require("https")

const API_KEY = "2bab22b1f8414bcca00a267de76721a9"

const DEFAULT_SPEAKER = "001526de-3826-11ee-a861-00163e2ac61b"

function generateCustomTTS(speakerId, text) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      text: text,
      speaker: speakerId || DEFAULT_SPEAKER,
      emotion: "Happy"
    })

    const options = {
      hostname: "api.topmediai.com",
      path: "/v1/text2speech",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": API_KEY,
        "Content-Length": Buffer.byteLength(postData)
      }
    }

    const req = https.request(options, res => {
      let data = ""
      res.on("data", chunk => data += chunk)
      res.on("end", () => {
        try {
          const json = JSON.parse(data)

          if (!json?.data?.oss_url) {
            console.error("[TopMediai] Response gagal:", JSON.stringify(json))
            const errMsg = json?.message || json?.msg || json?.error || "No audio URL"
            return reject(new Error(`TopMediai: ${errMsg}`))
          }

          resolve(json.data.oss_url)
        } catch (e) {
          console.error("[TopMediai] Parse error:", e.message, "| Raw:", data.substring(0, 200))
          reject(e)
        }
      })
    })

    req.on("error", (e) => {
      console.error("[TopMediai] Request error:", e.message)
      reject(e)
    })

    req.setTimeout(15000, () => {
      req.destroy()
      reject(new Error("TopMediai: Request timeout"))
    })

    req.write(postData)
    req.end()
  })
}

module.exports = generateCustomTTS
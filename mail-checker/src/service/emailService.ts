import Imap from "imap"
import { simpleParser } from "mailparser"
import { parseStringPromise } from "xml2js"

const imapConfig = {
  user: "email",
  password: "password",
  host: "imap.hostinger.com",
  port: 993,
  tls: true,
}

const imap = new Imap(imapConfig)

export function checkEmails() {
  imap.once("ready", () => {
    imap.openBox("INBOX", false, (err, box) => {
      if (err) throw err
      const today = new Date()
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)
      const todayString = today.toISOString().substring(0, 10)
      const yesterdayString = yesterday.toISOString().substring(0, 10)

      imap.search(["UNSEEN", ["SINCE", yesterdayString]], (err, results) => {
        if (err || !results.length) {
          //console.log("No new mails.")
          imap.end()
          return
        }
        const f = imap.fetch(results, { bodies: [""] })
        f.on("message", (msg) => {
          msg.on("body", (stream: any) => {
            simpleParser(stream, async (err, parsed) => {
              if (err) throw err

              //console.log("attachments:", parsed.attachments)

              // Procesa los archivos adjuntos
              if (parsed.attachments) {
                parsed.attachments.forEach(async (attachment) => {
                  if (
                    attachment.contentType === "application/xml" ||
                    attachment?.filename?.endsWith(".xml")
                  ) {
                    const xml = attachment.content.toString("utf8")
                    const json = await parseStringPromise(xml)
                    //console.log("Parsed XML to JSON:", json)
                    // Aquí podrías almacenar el JSON en una base de datos
                  }
                })
              } else {
                //console.log("No attachments found.")
              }
            })
          })
        })

        f.once("end", () => {
          //console.log("Done fetching all messages!")
          imap.end()
        })
      })
    })
  })

  imap.once("error", (err: any) => {
    //console.log("IMAP error:", err)
  })

  imap.connect()
}

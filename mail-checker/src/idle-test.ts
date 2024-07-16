import Imap from "imap"
import { simpleParser } from "mailparser"
import { parseStringPromise } from "xml2js"

const imapConfig = {
  user: "email",
  password: "password",
  host: "imap.hostinger.com",
  port: 993,
  tls: true,
  imap: true,
}

const imap = new Imap(imapConfig)

function openInbox(cb: (err: Error | null, box?: Imap.Box) => void) {
  imap.openBox("INBOX", false, cb)
}

imap.once("ready", () => {
  openInbox((err, box) => {
    if (err) throw err
    imap.on("mail", () => {
      console.log("New mail has arrived!")
      // Fetch new emails

      const f = imap.seq.fetch(box?.messages?.total + ":*", {
        // Assuming 'box' is available here
        bodies: "",
        struct: true,
      })

      f.on("message", (msg) => {
        msg.on("body", (stream: any, info: any) => {
          console.log("attachments:", info, stream.attachments)
          simpleParser(stream, async (err, parsed) => {
            if (err) throw err

            console.log("attachments:", parsed.attachments)

            // Procesa los archivos adjuntos
            if (parsed.attachments) {
              parsed.attachments.forEach(async (attachment) => {
                if (
                  attachment.contentType === "application/xml" ||
                  attachment?.filename?.endsWith(".xml")
                ) {
                  const xml = attachment.content.toString("utf8")
                  const json = await parseStringPromise(xml)
                  console.log("Parsed XML to JSON:", json)
                  // Aquí podrías almacenar el JSON en una base de datos
                  console.log("process the json")
                }
              })
            } else {
              console.log("No attachments found.")
            }
          })
        })
      })

      f.once("error", (err: any) => {
        console.log("Fetch error:", err)
      })
    })
  })
})

imap.once("error", (err: any) => {
  console.log("IMAP error:", err)
})

imap.connect()

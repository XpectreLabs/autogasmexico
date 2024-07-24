import Imap from "imap"
import { simpleParser } from "mailparser"
import { parseStringPromise } from "xml2js"
const xmlJs = require('xml-js');

const imapConfig = {
  user: "autogas_cliente@xpectrelabs.com",
  password: "Xp3ct123l@bs20_",
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
      //console.log("New mail has arrived!")
      // Fetch new emails

      const f = imap.seq.fetch(box?.messages?.total + ":*", {
        // Assuming 'box' is available here
        bodies: "",
        struct: true,
      })

      f.on("message", (msg) => {
        msg.on("body", (stream: any, info: any) => {
          //console.log("attachments:", info, stream.attachments)
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
                  let dataJson;
                  const xml = attachment.content.toString("utf8")
                  //console.log("Xml",xml)

                  const json = await parseStringPromise(xml)
                  dataJson = JSON.parse(xmlJs.xml2json((xml), {compact: true, spaces: 4}));

                  //console.log("Parsed XML to JSON:", json)
                  //console.log("Parsed XML to JSON 2:", dataJson)
                  // Aquí podrías almacenar el JSON en una base de datos
                  //console.log("process the json")
                  //console.log(json['cfdi:Comprobante']['cfdi:Emisor']);

                  const rfc = dataJson['cfdi:Comprobante']['cfdi:Emisor']['_attributes'].Rfc;
                  console.log("Rfc:"+rfc);

                  let scriptURL = "http://localhost:3001/api/v1/compras/cargarXMLCorreo";
                  const data = {dataJson};

                  if(rfc==='AME050309Q32')
                  {
                    scriptURL = "http://localhost:3001/api/v1/ingresos/cargarXMLCorreo";

                    fetch(scriptURL, {
                      method: 'POST',
                      body: JSON.stringify(data),
                      headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                      },
                    })
                    .then((resp) => resp.json())
                    .then(function(data) {
                      if(data.message==="success") {
                        console.log("La factura de venta ha sido guardada");
                      }
                    })
                    .catch(error => {
                      console.log("Posiblemente no es factura de venta");
                      console.error('Error!', error.message);
                    });
                  }
                  else {
                    fetch(scriptURL, {
                      method: 'POST',
                      body: JSON.stringify(data),
                      headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                      },
                    })
                    .then((resp) => resp.json())
                    .then(function(data) {
                      if(data.message==="success") {
                        console.log("La factura de compra ha sido guardada");
                      }
                    })
                    .catch(error => {
                      console.log("Posiblemente no es factura de compra");
                      console.error('Error!', error.message);
                    });
                  }
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

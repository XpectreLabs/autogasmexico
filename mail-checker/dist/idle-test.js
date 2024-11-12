"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const imap_1 = __importDefault(require("imap"));
const mailparser_1 = require("mailparser");
const xml2js_1 = require("xml2js");
const xmlJs = require('xml-js');
const imapConfig = {
    host: "imap.hostinger.com",
    port: 993,
    tls: true,
    imap: true,
};
const imap = new imap_1.default(imapConfig);
function openInbox(cb) {
    imap.openBox("INBOX", false, cb);
}
imap.once("ready", () => {
    openInbox((err, box) => {
        if (err)
            throw err;
        imap.on("mail", () => {
            ////console.log("New mail has arrived!")
            // Fetch new emails
            var _a;
            const f = imap.seq.fetch(((_a = box === null || box === void 0 ? void 0 : box.messages) === null || _a === void 0 ? void 0 : _a.total) + ":*", {
                // Assuming 'box' is available here
                bodies: "",
                struct: true,
            });
            f.on("message", (msg) => {
                msg.on("body", (stream, info) => {
                    ////console.log("attachments:", info, stream.attachments)
                    (0, mailparser_1.simpleParser)(stream, (err, parsed) => __awaiter(void 0, void 0, void 0, function* () {
                        if (err)
                            throw err;
                        ////console.log("attachments:", parsed.attachments)
                        // Procesa los archivos adjuntos
                        if (parsed.attachments) {
                            parsed.attachments.forEach((attachment) => __awaiter(void 0, void 0, void 0, function* () {
                                var _a;
                                if (attachment.contentType === "application/xml" ||
                                    ((_a = attachment === null || attachment === void 0 ? void 0 : attachment.filename) === null || _a === void 0 ? void 0 : _a.endsWith(".xml"))) {
                                    let dataJson;
                                    const xml = attachment.content.toString("utf8");
                                    ////console.log("Xml",xml)
                                    const json = yield (0, xml2js_1.parseStringPromise)(xml);
                                    dataJson = JSON.parse(xmlJs.xml2json((xml), { compact: true, spaces: 4 }));
                                    ////console.log("Parsed XML to JSON:", json)
                                    ////console.log("Parsed XML to JSON 2:", dataJson)
                                    // Aquí podrías almacenar el JSON en una base de datos
                                    ////console.log("process the json")
                                    ////console.log(json['cfdi:Comprobante']['cfdi:Emisor']);
                                    const rfc = dataJson['cfdi:Comprobante']['cfdi:Emisor']['_attributes'].Rfc;
                                    //console.log("Rfc:" + rfc);
                                    let scriptURL = "http://44.212.165.114:3001/api/v1/compras/cargarXMLCorreo";
                                    const data = { dataJson };
                                    if (rfc === 'AME050309Q32') {
                                        scriptURL = "http://44.212.165.114:3001/api/v1/ingresos/cargarXMLCorreo";
                                        fetch(scriptURL, {
                                            method: 'POST',
                                            body: JSON.stringify(data),
                                            headers: {
                                                'Accept': 'application/json',
                                                'Content-Type': 'application/json',
                                            },
                                        })
                                            .then((resp) => resp.json())
                                            .then(function (data) {
                                            if (data.message === "success") {
                                                //console.log("La factura de venta ha sido guardada");
                                            }
                                            else if (data.message === "schema")
                                                //console.log("Error:" + data.error);
                                        })
                                            .catch(error => {
                                            //console.log("Posiblemente no es factura de venta");
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
                                            .then(function (data) {
                                            if (data.message === "success") {
                                                //console.log("La factura de compra ha sido guardada");
                                            }
                                            else if (data.message === "schema")
                                                //console.log("Error:" + data.error);
                                        })
                                            .catch(error => {
                                            //console.log("Posiblemente no es factura de compra");
                                            console.error('Error!', error.message);
                                        });
                                    }
                                }
                            }));
                        }
                        else {
                            //console.log("No attachments found.");
                        }
                    }));
                });
            });
            f.once("error", (err) => {
                //console.log("Fetch error:", err);
            });
        });
    });
});
imap.once("error", (err) => {
    //console.log("IMAP error:", err);
});
imap.connect();

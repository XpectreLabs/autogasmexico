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
exports.checkEmails = checkEmails;
const imap_1 = __importDefault(require("imap"));
const mailparser_1 = require("mailparser");
const xml2js_1 = require("xml2js");
const imapConfig = {
    user: "email",
    password: "password",
    host: "imap.hostinger.com",
    port: 993,
    tls: true,
};
const imap = new imap_1.default(imapConfig);
function checkEmails() {
    imap.once("ready", () => {
        imap.openBox("INBOX", false, (err, box) => {
            if (err)
                throw err;
            const today = new Date();
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);
            const todayString = today.toISOString().substring(0, 10);
            const yesterdayString = yesterday.toISOString().substring(0, 10);
            imap.search(["UNSEEN", ["SINCE", yesterdayString]], (err, results) => {
                if (err || !results.length) {
                    console.log("No new mails.");
                    imap.end();
                    return;
                }
                const f = imap.fetch(results, { bodies: [""] });
                f.on("message", (msg) => {
                    msg.on("body", (stream) => {
                        (0, mailparser_1.simpleParser)(stream, (err, parsed) => __awaiter(this, void 0, void 0, function* () {
                            if (err)
                                throw err;
                            console.log("attachments:", parsed.attachments);
                            // Procesa los archivos adjuntos
                            if (parsed.attachments) {
                                parsed.attachments.forEach((attachment) => __awaiter(this, void 0, void 0, function* () {
                                    var _a;
                                    if (attachment.contentType === "application/xml" ||
                                        ((_a = attachment === null || attachment === void 0 ? void 0 : attachment.filename) === null || _a === void 0 ? void 0 : _a.endsWith(".xml"))) {
                                        const xml = attachment.content.toString("utf8");
                                        const json = yield (0, xml2js_1.parseStringPromise)(xml);
                                        console.log("Parsed XML to JSON:", json);
                                        // Aquí podrías almacenar el JSON en una base de datos
                                    }
                                }));
                            }
                            else {
                                console.log("No attachments found.");
                            }
                        }));
                    });
                });
                f.once("end", () => {
                    console.log("Done fetching all messages!");
                    imap.end();
                });
            });
        });
    });
    imap.once("error", (err) => {
        console.log("IMAP error:", err);
    });
    imap.connect();
}

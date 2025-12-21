import nodemailer from "nodemailer";
import formidable from "formidable";
import fs from "fs";

export const config = {
  api: { bodyParser: false }, // wichtig für Datei-Uploads
};

function parseForm(req) {
  const form = formidable({
    multiples: true,
    maxFileSize: 25 * 1024 * 1024, // 25MB pro Datei (bei Bedarf anpassen)
    keepExtensions: true,
  });

  return new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) reject(err);
      else resolve({ fields, files });
    });
  });
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { fields, files } = await parseForm(req);

    const fullName = String(fields.fullName || "").trim();
    const email = String(fields.email || "").trim();
    const phone = String(fields.phone || "").trim();
    const moveIn = String(fields.moveIn || "").trim();
    const persons = String(fields.persons || "").trim();
    const citizenship = String(fields.citizenship || "").trim();
    const message = String(fields.message || "").trim();
    const consent = fields.consent;

    if (!fullName || !email || !persons || !citizenship) {
      return res.status(400).json({ error: "Pflichtfelder fehlen." });
    }
    if (!consent) {
      return res.status(400).json({ error: "DSGVO-Einwilligung fehlt." });
    }

    // Dateien normalisieren (files.files kann single oder array sein)
    let uploadFiles = files.files;
    if (!uploadFiles) uploadFiles = [];
    if (!Array.isArray(uploadFiles)) uploadFiles = [uploadFiles];

    const attachments = uploadFiles.map((f) => ({
      filename: f.originalFilename || "upload",
      content: fs.readFileSync(f.filepath),
      contentType: f.mimetype || "application/octet-stream",
    }));

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const toEmail = process.env.TO_EMAIL;      // eure Empfängeradresse
    const fromEmail = process.env.FROM_EMAIL;  // Absender (muss oft zur Domain passen)

    const subject = `Wohnungsbewerbung – ${fullName}`;

    const text = [
      "Neue Wohnungsbewerbung:",
      "",
      `Name: ${fullName}`,
      `E-Mail: ${email}`,
      `Telefon: ${phone || "-"}`,
      `Einzugsdatum: ${moveIn || "-"}`,
      `Personen: ${persons}`,
      `Bürgerschaft: ${citizenship}`,
      "",
      "Nachricht:",
      message || "-",
      "",
      `Anhänge: ${attachments.length}`,
    ].join("\n");

    await transporter.sendMail({
      from: fromEmail,
      to: toEmail,
      replyTo: email, // Rückantwort geht an Bewerber
      subject,
      text,
      attachments,
    });

    return res.status(200).json({ ok: true });
  } catch (e) {
    return res.status(500).json({ error: "Serverfehler beim Versand." });
  }
}
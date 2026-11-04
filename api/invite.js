
const { airtable } = require("./_airtable");

module.exports = async (req, res) => {
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const token = String(req.query.token || "").trim();

  if (!token) {
    return res.status(400).json({
      error: "Add meg a meghívókódodat!"
    });
  }

  try {
    const formula = `AND({Token}='${token.replace(/'/g, "\\'")}',{Active}=1)`;

    const result = await airtable(
      `?maxRecords=1&filterByFormula=${encodeURIComponent(formula)}`
    );

    const guest = result.records?.[0];

    if (!guest) {
      return res.status(404).json({
        error: "Ez a meghívó nem érvényes."
      });
    }

    return res.status(200).json({
      valid: true,
      guest: guest.fields["Guest Name"],
      rsvp: guest.fields.RSVP || "Még nem válaszolt"
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "Szerverhiba. Próbáld újra később."
    });
  }
};

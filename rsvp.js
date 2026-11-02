
const { airtable } = require("./_airtable");

module.exports = async (req, res) => {
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  const { token, answer, plusOne, message } = req.body || {};

  if (
    !token ||
    !["Igen, ott leszek!", "Sajnos nem tudok menni."].includes(answer)
  ) {
    return res.status(400).json({
      error: "Érvénytelen válasz."
    });
  }

  try {
    const safeToken = String(token).replace(/'/g, "\\'");
    const formula = `AND({Token}='${safeToken}',{Active}=1)`;

    const found = await airtable(
      `?maxRecords=1&filterByFormula=${encodeURIComponent(formula)}`
    );

    const guest = found.records?.[0];

    if (!guest) {
      return res.status(404).json({
        error: "Érvénytelen meghívó."
      });
    }

    await airtable(`/${guest.id}`, {
      method: "PATCH",
      body: JSON.stringify({
        fields: {
          RSVP: answer,
          PlusOne: answer.startsWith("Igen")
            ? Math.max(0, Math.min(1, Number(plusOne) || 0))
            : 0,
          Message: String(message || "").slice(0, 500)
        }
      })
    });

    return res.status(200).json({
      ok: true,
      message: "A válaszodat elmentettük! ✨"
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "Nem sikerült menteni a választ."
    });
  }
};

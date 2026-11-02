
const AIRTABLE_API = "https://api.airtable.com/v0";

async function airtable(path = "", options = {}) {
  const token = process.env.AIRTABLE_PAT;
  const baseId = process.env.AIRTABLE_BASE_ID;
  const table = process.env.AIRTABLE_TABLE_NAME || "Guests";

  if (!token || !baseId) {
    throw new Error("Airtable configuration missing!");
  }

  const url =
    `${AIRTABLE_API}/${baseId}/${encodeURIComponent(table)}${path}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(options.headers || {})
    }
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.error?.message || "Airtable error"
    );
  }

  return data;
}

module.exports = { airtable };

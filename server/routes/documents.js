const { Router } = require("express");
const prismic = require("@prismicio/client");
const { getToken } = require("../lib/assets");

const router = Router();

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// POST /documents — migrate slices, types, and documents to destination repo
router.post("/", async (req, res) => {
  const { newAssets } = req.body;
  const sourceToken = getToken();
  const destToken = process.env.Destination_Access_Token;

  try {
    // Migrate shared slices
    const slicesRes = await fetch("https://customtypes.prismic.io/slices", {
      headers: {
        repository: process.env.Source_Repo,
        Authorization: `Bearer ${sourceToken}`,
      },
    });
    const slices = await slicesRes.json();

    for (const slice of slices) {
      await fetch("https://customtypes.prismic.io/slices/insert", {
        method: "POST",
        headers: {
          repository: process.env.Destination_Repo,
          Authorization: `Bearer ${destToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(slice),
      });
    }
    console.log(`Migrated ${slices.length} slices`);

    // Migrate custom types
    const typesRes = await fetch("https://customtypes.prismic.io/customtypes", {
      headers: {
        repository: process.env.Source_Repo,
        Authorization: `Bearer ${sourceToken}`,
      },
    });
    const types = await typesRes.json();

    for (const type of types) {
      await fetch("https://customtypes.prismic.io/customtypes/insert", {
        method: "POST",
        headers: {
          repository: process.env.Destination_Repo,
          Authorization: `Bearer ${destToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(type),
      });
    }
    console.log(`Migrated ${types.length} custom types`);

    // Migrate documents
    const client = prismic.createClient(process.env.Source_Repo, {});
    const allDocuments = await client.dangerouslyGetAll();
    let failures = 0;

    for (let i = 0; i < allDocuments.length; i++) {
      let document = JSON.stringify(allDocuments[i]);
      const documentName =
        allDocuments[i].data?.title?.[0]?.text || `document ${i}`;

      for (const asset of newAssets) {
        document = document.replaceAll(asset.prevID, asset.id);
      }

      const r = await fetch("https://migration.prismic.io/documents", {
        method: "POST",
        headers: {
          repository: process.env.Destination_Repo,
          "x-api-key": process.env.Migration_Api_Key,
          "Content-Type": "application/json",
          Authorization: `Bearer ${destToken}`,
        },
        body: JSON.stringify({ ...JSON.parse(document), title: documentName }),
      });

      const ans = await r.text();
      console.log(`Document insert response:`, ans);
      if (!ans.includes(`"id":`)) failures++;

      await delay(1500);
    }

    return res.status(200).json({
      done: true,
      nbrDocs: allDocuments.length,
      failures,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ reason: "server error", err });
  }
});

module.exports = router;

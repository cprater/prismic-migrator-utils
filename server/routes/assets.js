const { Router } = require("express");
const { downloadAsset, uploadAsset, getToken } = require("../lib/assets");

const router = Router();

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// GET /assets — fetch all assets from source repo
router.get("/", async (req, res) => {
  try {
    const token = getToken();
    const ans = await fetch("https://asset-api.prismic.io/assets?limit=1000", {
      headers: {
        repository: process.env.Source_Repo,
        Authorization: `Bearer ${token}`,
      },
    });
    const assets = await ans.text();
    return res.status(200).json({ assets });
  } catch (err) {
    console.error(err);
    return res.status(400).json({ reason: "server error", err });
  }
});

// POST /assets — download assets locally
router.post("/", async (req, res) => {
  try {
    const { assets } = req.body;
    for (const item of assets.items) {
      if (!item?.url) continue;
      await downloadAsset(item.url, item.id, item.filename);
    }
    return res.status(200).json({ reason: "done" });
  } catch (err) {
    console.error(err);
    return res.status(400).json({ reason: "server error", err });
  }
});

// PUT /assets — upload assets to destination repo
router.put("/", async (req, res) => {
  const { assets } = req.body;
  const newAssets = [];
  try {
    for (let i = 0; i < assets.items.length; i++) {
      await uploadAsset(assets.items[i].id, assets.items[i].filename, assets, newAssets, i);
      await delay(1500);
    }
    return res.status(200).json({ newAssets });
  } catch (err) {
    console.error(err);
    return res.status(400).json({ reason: "server error", err });
  }
});

module.exports = router;

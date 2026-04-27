const { Router } = require("express");


const router = Router();


router.post("/publish", async (req, res) => {
  console.log('PUBLISH HOOK CALLED WITH HEADERS', req.headers);
  console.log('PUBLISH CALLED WITH BODY', req.body)

  return res.status(200).json({ reason: "hook received" });
});

module.exports = router;
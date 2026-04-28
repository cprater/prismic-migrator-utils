const { Router } = require("express");
const migrateDocuments = require("../lib/documents");


const router = Router();

// Example create payload
// {
//   "type": "api-update",
//   "masterRef": "ae-6hBAAACIActyd",
//   "releases": {},
//   "masks": {},
//   "tags": {
//     "addition": [
//       {
//         "id": "boom"
//       }
//     ]
//   },
//   "locales": {},
//   "experiments": {},
//   "documents": [
//     "ae-6TxAAACIActxD"
//   ],
//   "domain": "stage-test",
//   "apiUrl": "https://stage-test.prismic.io/api",
//   "secret": null
// }

// Example update payload
// {
//   "type": "api-update",
//   "masterRef": "ae-7QhAAACAAct2t",
//   "releases": {},
//   "masks": {},
//   "tags": {},
//   "locales": {},
//   "experiments": {},
//   "documents": [
//     "ae-KOxAAACAAcpSJ"
//   ],
//   "domain": "stage-test",
//   "apiUrl": "https://stage-test.prismic.io/api",
//   "secret": null
// }


router.post("/publish", async (req, res) => {
  const documentIds = req.body.documents || [];

  if (documentIds.length === 0) {
    return res.status(200).json({ reason: "No documents to update" });
  }

  await migrateDocuments(documentIds);

  return res.status(200).json({ reason: "hook received" });
});

module.exports = router;
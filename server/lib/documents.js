
const prismic = require("@prismicio/client");

const migrateDocuments = async (documentIds) => {
  const client = prismic.createClient(process.env.Source_Repo, {});
  const allDocuments = await client.getAllByIDs(documentIds);
  let failures = 0;

  for (let i = 0; i < allDocuments.length; i++) {
    let document = JSON.stringify(allDocuments[i]);

    console.log('Whats the title?', allDocuments[i].data);

    const documentName =
      allDocuments[i].data?.title?.[0]?.text || `document ${i}`;

    // for (const asset of newAssets) {
    //   document = document.replaceAll(asset.prevID, asset.id);
    // }

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
};

module.exports = migrateDocuments;
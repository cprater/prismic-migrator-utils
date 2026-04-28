
const prismic = require("@prismicio/client");


const getDocumentName = (document, i) => {
  switch (document.type) {
    case 'rate_plan':
      return document.data.rate_name[0].text;
    case 'rate_specs':
      return document.data.spec[0].text;
    default:
      return 'document ' + i;
  }
};

const migrateDocuments = async (documentIds) => {
  const client = prismic.createClient(process.env.Source_Repo, {});
  const allDocuments = await client.getAllByIDs(documentIds);
  // let failures = 0;

  for (let i = 0; i < allDocuments.length; i++) {
    let document = JSON.stringify(allDocuments[i]);

    const documentName = getDocumentName(allDocuments[i], i);

    // TODO: figure out handling assets
    // for (const asset of newAssets) {
    //   document = document.replaceAll(asset.prevID, asset.id);
    // }

    const r = await fetch("https://migration.prismic.io/documents", {
      method: "POST",
      headers: {
        repository: process.env.Destination_Repo,
        "x-api-key": process.env.Migration_Api_Key,
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.Destination_Access_Token}`,
      },
      body: JSON.stringify({ ...JSON.parse(document), title: documentName }),
    });

    console.log('Document insert response status:', r.status);

    if (!r.ok) {
      console.error(`Failed to migrate document ${documentName} with id ${allDocuments[i].id}. Status: ${r.status}`);

      const ans = await r.text();
      console.log('Error response body:', ans);
    }

    // if (!ans.includes(`"id":`)) failures++;
  }
};

module.exports = migrateDocuments;
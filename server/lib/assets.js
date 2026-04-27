const fs = require("fs");
const path = require("path");
const https = require("https");
const axios = require("axios");
const FormData = require("form-data");

const dirPath = "./images";

const downloadAsset = async (imageUrl, imageId, imageName) => {
  return new Promise((resolve, reject) => {
    const folderName = `${dirPath}/${imageId}`;
    try {
      if (!fs.existsSync(folderName)) {
        fs.mkdirSync(folderName, { recursive: true });
      }
    } catch (err) {
      console.error(err);
    }

    const file = fs.createWriteStream(path.join(folderName, imageName));
    https
      .get(imageUrl, (response) => {
        response.pipe(file);
        file.on("finish", () => {
          file.close();
          console.log(`Image downloaded as ${imageName}`);
          resolve({ msg: `Image downloaded as ${imageName}` });
        });
      })
      .on("error", (err) => {
        fs.unlink(path.join(folderName, imageName), () => {});
        console.error(`Error downloading image: ${err.message}`);
        reject({ err: `Error downloading image: ${err.message}` });
      });
  });
};

const uploadAsset = async (fileId, filename, assets, newAssets, i) => {
  return new Promise((resolve, reject) => {
    const token = process.env.Destination_Access_Token;
    const data = new FormData();
    data.append(
      "file",
      fs.createReadStream(
        `${process.env.Project_Path}/images/${fileId}/${filename}`
      )
    );

    const config = {
      method: "post",
      maxBodyLength: Infinity,
      url: "https://asset-api.prismic.io/assets",
      headers: {
        repository: process.env.Destination_Repo,
        Authorization: `Bearer ${token}`,
        ...data.getHeaders(),
      },
      data,
    };

    axios
      .request(config)
      .then((response) => {
        newAssets.push({ ...response.data, prevID: assets.items[i].id });
        resolve({ msg: JSON.stringify(response.data) });
      })
      .catch((error) => {
        console.error(error);
        reject({ err: error });
      });
  });
};

const getToken = () => process.env.Source_Access_Token;

module.exports = { downloadAsset, uploadAsset, getToken };

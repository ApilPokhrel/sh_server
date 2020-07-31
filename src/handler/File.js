const multer = require("multer");
const storage = multer.memoryStorage();
const AWS = require("aws-sdk");
const sharp = require("sharp");

exports.upload = multer({
  storage: storage,
  fileFilter(req, file, next) {
    console.log("File here...");
    const isPhoto = file.mimetype.startsWith("image/");
    const isVideo = file.mimetype.startsWith("video/");
    if (isPhoto || isVideo) {
      next(null, true);
    } else {
      next({ message: "type of file is not supported" }, false);
    }
  }
}).array("file", 12);

exports.uploadToS3 = (fileName, buffer, type) => {
  let credentials = {
    accessKeyId: process.env.AWS_ACCESS,
    secretAccessKey: process.env.AWS_SECRET,
    region: process.env.AWS_REGION
  };

  const s3 = new AWS.S3(credentials);

  if (type.startsWith("image/")) {
    var sizes = [
      {
        path: "large",
        x: 1360,
        y: 510,
        quality: 70
      },
      {
        path: "510x340",
        x: 510,
        y: 340,
        quality: 90
      },
      {
        path: "medium",
        x: 300,
        y: 300,
        quality: 90
      },
      {
        path: "small",
        x: 100,
        y: 100,
        quality: 100
      }
    ];

    for (let s of sizes) {
      sharp(buffer)
        .resize(s.x, s.y)
        .toFormat("jpeg")
        .jpeg({ quality: s.quality })
        .toBuffer()
        .then(data => {
          let newName = `${fileName}_${s.path}.jpg`;
          var params = {
            Bucket: "commerceup",
            Key: newName,
            Body: data,
            ACL: "public-read",
            ContentType: "image/jpeg"
          };

          s3.upload(params, function (err, data) {
            if (err) {
              console.log("Error uploading data: ", err);
            } else {
              console.log("Successfully uploaded data to myBucket/myKey");
            }
          });
        })
        .catch(err => {
          console.log(err);
        });
    }
  } else {
    let newName = `${fileName}.${type.split("/")[1]}`;
    var params = {
      Bucket: "commerceup",
      Key: newName,
      Body: buffer,
      ACL: "public-read"
    };

    s3.upload(params, function (err, data) {
      if (err) {
        console.log("Error uploading data: ", err);
      } else {
        console.log("Successfully uploaded data to myBucket/myKey");
      }
    });
  }
};

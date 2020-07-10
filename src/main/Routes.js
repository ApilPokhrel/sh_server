const router = require("express").Router();
const user = require("./user/Routes");
const auth = require("./auth/Routes");
const category = require("./category/Routes");
const product = require("./product/Routes");
const File = require("../handler/File");
const multer = require("multer");
const tag = require("./tag/Routes");
const banner = require("./banner/Routes");
const post = require("./post/Routes");
const review = require("./review/Routes");
const contact = require("./contact/Routes");

router.post("/upload-test", (req, res, next) => {
  File.upload(req, res, async function (err) {
    if (err instanceof multer.MulterError) {
      console.log("Multer error ", err);
    } else if (err) {
      console.log("Error while uploading ", err);
    } else {
      for (let f of req.files) {
        await File.uploadToS3(`${Date.now()}`, f.buffer, f.mimetype);
      }
    }
    res.json("success");
    // Everything went fine.
  });
});

const AWS = require("aws-sdk");

router.post("/compare-test", (req, res, next) => {
  const bucket = "rumsan-test"; // the bucketname without s3://
  const photo_source = "rekognition/license.jpg";
  const photo_target = "JPEG_20200128_175457_";
  let credentials = {
    accessKeyId: process.env.AWS_ACCESS,
    secretAccessKey: process.env.AWS_SECRET,
    region: process.env.AWS_REGION
  };

  console.log(credentials);

  // const config = new AWS.Config(credentials);

  const client = new AWS.Rekognition(credentials);
  const params = {
    SourceImage: {
      S3Object: {
        Bucket: bucket,
        Name: photo_source
      }
    },
    TargetImage: {
      S3Object: {
        Bucket: bucket,
        Name: photo_target
      }
    },
    SimilarityThreshold: 70
  };
  client.compareFaces(params, function (err, response) {
    if (err) {
      //res.end();
      console.log(err, err.stack); // an error occurred
    } else {
      response.FaceMatches.forEach(data => {
        let position = data.Face.BoundingBox;
        let similarity = data.Similarity;
        console.log(
          `The face at: ${position.Left}, ${position.Top} matches with ${similarity} % confidence`
        );
        res.json({ position, similarity });
      }); // for response.faceDetails
    } // if
  });
});

router.use("/user", user);
router.use("/auth", auth);
router.use("/category", category);
router.use("/product", product);
router.use("/tag", tag);
router.use("/banner", banner);
router.use("/post", post);
router.use("/review", review);
router.use("/contact", contact);

module.exports = router;

const express = require("express");
const auth = require("../auth");
const jwt_decode = require("jwt-decode");
const mediaController = require("./media.controller");
const mediaRouter = express.Router();

const upload = require("./common");
const { uploadFile, getFileStream } = require("./s3");
const fs = require("fs");
const util = require("util");
const unlinkFile = util.promisify(fs.unlink);

mediaRouter.get("/get_file/:key", (req, res) => {
  const key = req.params.key;
  const readStream = getFileStream(key);
  readStream.pipe(res);
});

mediaRouter.get("/list/:creditid", auth.required, function (req, res, next) {
  const creditid = req.params.creditid;
  mediaController.getMediaByCredit(creditid, function (err, result) {
    res.json(result);
  });
});

mediaRouter.delete("/:id", auth.required, function (req, res, next) {
  const id = req.params.id;
  mediaController.deleteMedia(id, function (err, result) {
    res.json(result);
  });
});

mediaRouter.post(
  "/upload/:creditid",
  auth.required,
  upload.array("files"),
  async function (req, res, next) {
    const creditid = req.params.creditid;

    req.files.forEach(async (file) => {
      // uploading to AWS S3
      const s3Response = await uploadFile(file);

      // Deleting from local if uploaded in S3 bucket
      await unlinkFile(file.path);
      //Insertamos en la base de datos
      await mediaController.addFileToDb(
        file,
        s3Response,
        creditid,
        function (err, result) {}
      );
    });

    res.send({
      status: "success",
      message: "Archivo subido con exito",
      data: req.files,
    });
  }
);

module.exports = mediaRouter;

import express from "express";
import sharp from "sharp";
import got from "got";

const app = express();
const port = 3000;

app.use(express.json());

const parseIntOrAlt = (value, alternativeValue) => {
  alternativeValue = alternativeValue || null;
  return value ? parseInt(value) : alternativeValue;
};

app.get("/resize", async (req, res) => {
  try {
    let { url, width, height } = req.query;
    console.log(`Resizing image from ${url} to ${width} x ${height}`);

    await got
      .stream(url, {
        responseType: "buffer",
        https: { rejectUnauthorized: false },
      })
      .on("error", (err) => {
        res.statusCode = 500;
        res.end(`Error fetching the image: ${err.message}`);
      })
      .pipe(
        sharp() // Configure sharp to apply resizing or other transformations here
          .on("error", (err) => {
            res.statusCode = 500;
            res.end(`Error resizing the image: ${err.message}`);
          })
          .resize(parseIntOrAlt(width), parseIntOrAlt(height)),
      )
      .pipe(res);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error resizing image");
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

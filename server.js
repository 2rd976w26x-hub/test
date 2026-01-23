const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Serve everything in the repo as static files
app.use(express.static(path.join(__dirname)));

// Default route opens the preview page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "dev", "cardkit_preview.html"));
});

app.listen(PORT, () => {
  console.log(`Static server running on port ${PORT}`);
});

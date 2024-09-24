const express = require("express");
const ShortId = require("shortid");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.urlencoded({ extended: true })); 
app.use(express.json()); 

const PORT = process.env.PORT || 3000;


app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// In-memory database for storing URLs
const urlDatabase = {};

// Serve static files like CSS
app.use(express.static(path.join(__dirname, "public")));

// Serve the HTML form to the client
app.get("/", (req, res) => {
  res.render("index"); // Render the form page
});

// Handle URL shortening requests
app.post("/shorten", (req, res) => {
	const originalUrl = req.body.name;
  
	if (!originalUrl) {
	  return res.status(400).send("URL is required");
	}
  
	const shortUrl = ShortId.generate();
	urlDatabase[shortUrl] = originalUrl;
  
	// Detect if app is running locally or on Vercel
	const baseUrl = process.env.VERCEL_URL 
	  ? `https://${process.env.VERCEL_URL}` 
	  : `http://localhost:${PORT}`;
  
	console.log(`New URL created: ${originalUrl} => ${shortUrl}`);
  
	res.render("result", {
	  originalUrl,
	  shortUrl: `${baseUrl}/${shortUrl}`,  // Use dynamic base URL
	});
  });
  

// Handle redirection of short URLs
app.get("/:shortUrl", (req, res) => {
  const shortUrl = req.params.shortUrl;
  const originalUrl = urlDatabase[shortUrl];

  if (originalUrl) {
    res.redirect(originalUrl); // Redirect to the original URL
  } else {
    res.status(404).send("URL not found");
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});

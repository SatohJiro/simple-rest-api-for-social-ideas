require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const admin = require("firebase-admin");
const twilio = require("twilio");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const cors = require("cors");

const app = express();
const port = process.env.PORT || 3000;

// Firebase setup
const serviceAccount = require("./serviceAccountKey.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.FIREBASE_DATABASE_URL,
});
const db = admin.firestore();

// Twilio setup
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// Google Generative AI setup
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors({ origin: "*" }));

// Routes
app.post("/createNewAccessCode", async (req, res) => {
  const { phoneNumber } = req.body;
  const accessCode = Math.floor(100000 + Math.random() * 900000).toString();

  try {
    await db
      .collection("users")
      .doc(phoneNumber)
      .set({ accessCode }, { merge: true });
    await twilioClient.messages.create({
      body: `Your access code is: ${accessCode}`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: `+1${phoneNumber}`,
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/validateAccessCode", async (req, res) => {
  const { accessCode, phoneNumber } = req.body;

  try {
    const userDoc = await db.collection("users").doc(phoneNumber).get();
    if (!userDoc.exists) {
      return res.status(404).json({ message: "Phone number not correct" });
    }

    const userData = userDoc.data();
    if (userData.accessCode === accessCode) {
      await db.collection("users").doc(phoneNumber).update({ accessCode: "" });
      res.json({ success: true });
    } else {
      res.status(400).json({ message: "Invalid access code" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/generatePostCaptions", async (req, res) => {
  const { socialNetwork, subject, tone } = req.body;
  const prompt = `
    Generate 5 post captions for the following:
    - Social Network: ${socialNetwork}
    - Subject: ${subject}
    - Tone: ${tone}
    
    Please format the output as a JSON object. Not use character " inside caption. Exactly like the below
    Example:
    {
      data: ["caption1", "caption2", "caption3", "caption4",...],
    }
  `;
  try {
    const result = await model.generateContent(prompt);
    const captions = JSON.parse(result.response.text());
    res.status(200).json(captions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/getPostIdeas", async (req, res) => {
  const { topic } = req.body;
  const prompt = `
    Generate 10 post-captions ideas for the following topic:
    - topic: ${topic}
    
    Please format the output as a JSON object. Exactly like the below
    Example:
    {
      data: ["idea1", "idea2", "idea3", "idea4",...],
    }
  `;
  try {
    const result = await model.generateContent(prompt);
    const ideas = JSON.parse(result.response.text());
    res.status(200).json(ideas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/createCaptionsFromIdeas", async (req, res) => {
  const { idea } = req.body;
  const prompt = `
    Create List 5 of captions for the idea: ${idea}
    
    Please format the output as a JSON object. Exactly like the below
    Example:
    {
      data: ["caption1", "caption2", "caption3", "caption4",...],
    }
  `;
  try {
    const result = await model.generateContent(prompt);
    const captions = JSON.parse(result.response.text());
    res.json(captions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/saveGeneratedContent", async (req, res) => {
  const { topic, data } = req.body;
  const phoneNumber = req.headers["phone_number"];
  try {
    await db.collection("contents").add({ phoneNumber, topic, data });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/getUserGeneratedContents", async (req, res) => {
  const phoneNumber = req.query.phone_number;
  try {
    const snapshot = await db
      .collection("contents")
      .where("phoneNumber", "==", phoneNumber)
      .get();
    const contents = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    res.json(contents);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/unsaveContent", async (req, res) => {
  const { captionId } = req.body;
  try {
    await db.collection("contents").doc(captionId).delete();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

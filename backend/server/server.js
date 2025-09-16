import express from "express";
import cors from "cors";

const app = express();

// middleware
app.use(cors());
app.use(express.json());

// simple GET route (check if backend works)
app.get("/", (req, res) => {
  res.json({ message: "Backend is running properly!" });
});

// API route for evaluation submission
app.post("/api/submit", (req, res) => {
  console.log("✅ Received evaluation:", req.body);

  res.json({
    success: true,
    message: "Evaluation submitted successfully!",
    data: req.body,
  });
});

// start server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🚀 Backend running at http://localhost:${PORT}`);
});

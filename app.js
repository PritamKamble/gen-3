require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const { jsPDF } = require("jspdf"); // For generating PDF

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.send(`
    <html>
      <head><title>Resume Generator</title></head>
      <body>
        <h1>AI Resume Generator</h1>
        <form action="/generate" method="POST">
          <label>Name:</label><br>
          <input type="text" name="name" required /><br><br>

          <label>Email:</label><br>
          <input type="email" name="email" required /><br><br>

          <label>Education:</label><br>
          <textarea name="education" rows="2" required></textarea><br><br>

          <label>Skills:</label><br>
          <textarea name="skills" rows="3" required></textarea><br><br>

          <label>Projects:</label><br>
          <textarea name="projects" rows="3"></textarea><br><br>

          <button type="submit">Generate Resume</button>
        </form>
      </body>
    </html>
  `);
});

app.post("/generate", async (req, res) => {
  const { name, email, education, skills, projects } = req.body;

  const prompt = `
  Create a professional fresher resume in plain text format:
  Name: ${name}
  Email: ${email}
  Education: ${education}
  Skills: ${skills}
  Projects: ${projects}

  Format it cleanly with sections: Education, Skills, Projects.
  `;

  try {
    // Call GROQ LLM API
    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "openai/gpt-oss-20b", // Example Groq model
        messages: [{ role: "user", content: prompt }]
      },
      {
        headers: {
          "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    const resumeText = response.data.choices[0].message.content;

    // Save as PDF
    const doc = new jsPDF();
    doc.setFont("times", "normal");
    const splitText = doc.splitTextToSize(resumeText, 180);
    doc.text(splitText, 10, 10);

    const pdfBase64 = doc.output("datauristring");

    res.send(`
      <html>
        <head><title>Your Resume</title></head>
        <body>
          <h1>Generated Resume</h1>
          <pre>${resumeText}</pre>
          <a href="${pdfBase64}" download="resume.pdf">
            <button>Download PDF</button>
          </a>
          <br><br>
          <a href="/">Back</a>
        </body>
      </html>
    `);
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.send("Error generating resume. Please try again.");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

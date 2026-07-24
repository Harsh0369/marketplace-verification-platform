const fs = require('fs');
const Tesseract = require('tesseract.js');

async function test() {
  try {
    const files = fs.readdirSync('C:/Users/harsh/Downloads').filter(f => f.endsWith('.jpg') || f.endsWith('.png'));
    for (const f of files.slice(0, 15)) {
      console.log(`\n--- Testing ${f} ---`);
      const buffer = fs.readFileSync(`C:/Users/harsh/Downloads/${f}`);
      try {
        const result = await Tesseract.recognize(buffer, 'eng');
        console.log("Extracted text:", JSON.stringify(result.data.text));
      } catch (e) {
        console.log("Tesseract error:", e.message);
      }
    }
  } catch (err) {
    console.error(err);
  }
}
test();

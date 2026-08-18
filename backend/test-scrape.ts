import { env } from './src/config/env.config';
import { extractWithLLM } from './src/agent/extractor/llm.provider';

const test = async () => {
  console.log('--- TESTING LLM ARRAY EXTRACTION ---');
  
  const mockHTML = `
    <html>
      <body>
        <h1>Upcoming Tech Grants</h1>
        <div class="grant">
          <h2>Google Women in Tech Scholarship</h2>
          <p>Deadline: 2026-12-01</p>
          <p>Amount: $10,000</p>
          <a href="https://google.com/scholarship">Apply Here</a>
        </div>
        <div class="grant">
          <h2>Open Source Developer Fellowship</h2>
          <p>Deadline: 2026-10-15</p>
          <p>Amount: $5,000</p>
          <a href="https://opensource.org/fellowship">Apply Here</a>
        </div>
      </body>
    </html>
  `;

  try {
    const result = await extractWithLLM(mockHTML);
    console.log(`\n✅ SUCCESS! Extracted ${result.length} opportunities from the HTML.`);
    console.dir(result, { depth: null });
  } catch (err: any) {
    console.error(`\n❌ FAILED: ${err.message}`);
  }

  console.log('Done.');
  process.exit(0);
};

test().catch(err => console.error(err));

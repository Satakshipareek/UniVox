import 'dotenv/config';
import app from './app.js';
import { connectDatabase } from './config/db.js';
const port = Number(process.env.PORT || 5000);
try {
  await connectDatabase(); // Do not accept requests until MongoDB is ready.
  app.listen(port, () => console.log(`CampusVoice API listening on http://localhost:${port}`));
} catch (error) {
  console.error(`Startup failed: ${error.message}`);
  process.exit(1);
}

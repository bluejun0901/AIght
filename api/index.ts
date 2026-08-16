// Use the runtime extension for Node ESM. TypeScript resolves this to
// server.ts during compilation, while Vercel emits and loads server.js.
import app from '../server.js';

export default app;

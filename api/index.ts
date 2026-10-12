import { createRequire } from "module";
import path from "path";
import { fileURLToPath } from "url";

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const appModule = require(path.resolve(__dirname, "../server/dist/index.js"));
const app = appModule.default || appModule.app || appModule;

export default app;

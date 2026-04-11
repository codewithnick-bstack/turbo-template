import app from "./app";
import { env } from "./env";

if (process.env.NODE_ENV !== "test") {
  app.listen(env.PORT, () => {
    console.log(`API listening on http://localhost:${env.PORT}`);
  });
}

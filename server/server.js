const Koa = require("koa");
const bodyparser = require("koa-bodyparser");
const session = require("koa-session");
const { jsonify, logger, timer } = require("./middleware");
const URL = require("url");
const redis = require("redis");
const { promisify } = require("util");
const router = require("./router");

const connectionString = process.env.REDIS_URL;

if (connectionString === undefined) {
  console.error("Please set the REDIS_URL environment variable");
  process.exit(1);
}

require("dotenv").config();

const app = new Koa();

if (
  !process.env.UCLAPI_CLIENT_ID ||
  !process.env.UCLAPI_CLIENT_SECRET ||
  !process.env.UCLAPI_TOKEN
) {
  console.error(
    "Error! You have not set the UCLAPI_CLIENT_ID, UCLAPI_TOKEN, or UCLAPI_CLIENT_SECRET environment variables.",
  );
  console.log("Please set them to run this app.");
  process.abort();
}

if (!process.env.SECRET) {
  console.warn(
    "Warning: You have not set the SECRET environment variable. This is not secure and definitely not recommended.",
  );
}

app.keys = [process.env.SECRET || "secret"];

if (connectionString.startsWith("rediss://")) {
  app.context.redisClient = redis.createClient(connectionString, {
    tls: { servername: new URL(connectionString).hostname },
  });
} else {
  app.context.redisClient = redis.createClient(connectionString);
}

app.context.redisGet = promisify(app.context.redisClient.get).bind(
  app.context.redisClient,
);
app.context.redisSetex = promisify(app.context.redisClient.setex).bind(
  app.context.redisClient,
);

app.use(session({}, app));

app.use(bodyparser());
app.use(timer);
app.use(logger);
app.use(jsonify);
router(app);

app.listen(process.env.PORT || 3000);

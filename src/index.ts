import Koa, { Context } from "koa";
import bodyparser from "koa-bodyparser";
import json from "koa-json";
import logger from "koa-logger";
import _ from "koa-route";
import { sessionResponse, SessionStore } from "./session";

const app = new Koa();
const sessions = new SessionStore();

app.use(logger());
app.use(json({ pretty: false, param: "pretty" }));
app.use(bodyparser());

type CreateSessionContext = Context & {
  request: { body?: { publicKey?: string } | null };
};

app.use(
  _.post("/sessions", async (ctx: CreateSessionContext) => {
    const publicKey =
      ctx.request.body && typeof ctx.request.body.publicKey === "string"
        ? ctx.request.body.publicKey
        : null;

    const session = await sessions.createSession(publicKey);
    const response = sessionResponse(ctx, session);
    ctx.status = 201;
    ctx.set("Location", response.href);
    ctx.body = { data: sessionResponse(ctx, session) };
  })
);

app.use(
  _.get("/sessions/:id", async (ctx, id) => {
    const session = await sessions.getSession(id);
    if (!session) {
      return ctx.throw(404, "session not found");
    }

    ctx.body = { data: sessionResponse(ctx, session) };
  })
);

type SetSessionAddressContext = Context & {
  request: { body?: { address?: string } | null };
};

app.use(
  _.post("/sessions/:id", async (ctx: SetSessionAddressContext, id) => {
    if (!ctx.request.body) {
      return ctx.throw(400, "no address provided");
    }

    let session = await sessions.getSession(id);

    const address = ctx.request.body.address;
    if (address) {
      session = await sessions.setSessionAddress(id, address);
    }

    if (!session) {
      return ctx.throw(404, "session not found");
    }

    ctx.body = { data: sessionResponse(ctx, session) };
  })
);

app.on("error", (err, ctx) => {
  ctx.body = { error: err.toString() };
});

const serverPort = process.env.PORT || 3000;

app.listen(serverPort, () => {
  console.log(`Listening on :${serverPort}`); // tslint:disable-line no-console
});

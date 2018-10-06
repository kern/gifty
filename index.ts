import Koa from "koa";
import bodyparser from "koa-bodyparser";
import json from "koa-json";
import _ from "koa-route";
import uuidv4 from "uuid/v4"; // tslint:disable-line

const app = new Koa();

interface ISession {
  address: string | null;
  id: string;
  publicKey: string | null;
  url: string;
}

class SessionStore {
  public store: { [id: string]: ISession } = {};

  public createSession(publicKey: string | null): ISession {
    let id;
    do {
      id = uuidv4().replace(/-/g, "");
    } while (id in this.store);
    const session = {
      address: null,
      id,
      publicKey: publicKey || null,
      url: `/sessions/${id}`
    };

    this.store[id] = session;

    return session;
  }

  public getSession(id: string): ISession | null {
    return this.store[id];
  }

  public setSessionAddress(id: string, address: string): boolean {
    const session = this.store[id];
    if (!session) {
      return false;
    }

    this.store[id].address = address;
    return true;
  }
}

const SESSIONS = new SessionStore();

app.use(json({ pretty: false, param: "pretty" }));
app.use(bodyparser());

app.use(
  _.post("/sessions", ctx => {
    const publicKey =
      ctx.request.body && typeof ctx.request.body.publicKey === "string"
        ? ctx.request.body.publicKey
        : null;

    const session = SESSIONS.createSession(publicKey);
    ctx.status = 201;
    ctx.set("Location", session.url);
    ctx.body = { data: session };
  })
);

app.use(
  _.get("/sessions/:id", (ctx, id) => {
    const session = SESSIONS.getSession(id);
    if (!session) {
      ctx.status = 404;
      return;
    }

    ctx.body = { data: session };
  })
);

app.use(
  _.post("/sessions/:id", (ctx, id) => {
    let session = SESSIONS.getSession(id);
    if (!session) {
      ctx.status = 404;
      return;
    }

    if (!ctx.request.body) {
      ctx.status = 400;
      ctx.body = { error: "no address provided" };
      return;
    }

    const address = ctx.request.body.address;
    if (SESSIONS.setSessionAddress(id, address)) {
      session = SESSIONS.getSession(id);
    }

    ctx.body = { data: session };
  })
);

const serverPort = process.env.PORT || 3000;

app.listen(serverPort, () => {
  console.log(`Listening on :${serverPort}`); // tslint:disable-line no-console
});

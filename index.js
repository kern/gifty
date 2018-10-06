"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const koa_1 = __importDefault(require("koa"));
const koa_bodyparser_1 = __importDefault(require("koa-bodyparser"));
const koa_json_1 = __importDefault(require("koa-json"));
const koa_route_1 = __importDefault(require("koa-route"));
const v4_1 = __importDefault(require("uuid/v4")); // tslint:disable-line
const app = new koa_1.default();
class SessionStore {
    constructor() {
        this.store = {};
    }
    createSession(publicKey) {
        let id;
        do {
            id = v4_1.default().replace(/-/g, "");
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
    getSession(id) {
        return this.store[id];
    }
    setSessionAddress(id, address) {
        const session = this.store[id];
        if (!session) {
            return false;
        }
        this.store[id].address = address;
        return true;
    }
}
const SESSIONS = new SessionStore();
app.use(koa_json_1.default({ pretty: false, param: "pretty" }));
app.use(koa_bodyparser_1.default());
app.use(koa_route_1.default.post("/sessions", ctx => {
    const publicKey = ctx.request.body && typeof ctx.request.body.publicKey === "string"
        ? ctx.request.body.publicKey
        : null;
    const session = SESSIONS.createSession(publicKey);
    ctx.status = 201;
    ctx.set("Location", session.url);
    ctx.body = { data: session };
}));
app.use(koa_route_1.default.get("/sessions/:id", (ctx, id) => {
    const session = SESSIONS.getSession(id);
    if (!session) {
        ctx.status = 404;
        return;
    }
    ctx.body = { data: session };
}));
app.use(koa_route_1.default.post("/sessions/:id", (ctx, id) => {
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
}));
const serverPort = process.env.PORT || 3000;
app.listen(serverPort, () => {
    console.log(`Listening on :${serverPort}`); // tslint:disable-line no-console
});

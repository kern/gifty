// tslint:disable max-classes-per-file

import { Context } from "koa";
import mongoose from "mongoose";
import { InstanceType, ModelType, prop, Typegoose } from "typegoose";
import uuidv4 from "uuid/v4"; // tslint:disable-line

mongoose.connect(
  process.env.MONGODB_URI || "mongodb://localhost/test",
  { useNewUrlParser: true }
);

export class Session extends Typegoose {
  @prop()
  public address?: string;

  @prop()
  public publicKey?: string;
}

export const SessionModel = new Session().getModelForClass(Session);

interface ISessionResponse {
  _id?: string;
  address: string | null;
  href: string;
  publicKey: string | null;
}

export function sessionResponse(
  ctx: Context,
  session: InstanceType<Session>
): ISessionResponse {
  return {
    _id: session._id,
    address: session.address || null,
    href: new URL(
      `/sessions/${session._id || ""}`,
      `${ctx.request.protocol}://${ctx.request.host}`
    ).toString(),
    publicKey: session.publicKey || null
  };
}

export class SessionStore {
  public async createSession(
    publicKey: string | null
  ): Promise<InstanceType<Session>> {
    const session = new SessionModel({
      address: null,
      publicKey: publicKey || null
    });

    await session.save();

    return session;
  }

  public async getSession(id: string): Promise<InstanceType<Session> | null> {
    try {
      return await SessionModel.findById(id).exec();
    } catch (err) {
      if (err.name === "CastError") {
        return null;
      } else {
        throw err;
      }
    }
  }

  public async setSessionAddress(
    _id: string, // tslint:disable-line variable-name
    address: string
  ): Promise<InstanceType<Session> | null> {
    const session = await this.getSession(_id);
    if (!session) {
      return null;
    }

    session.address = address;

    await session.save();

    return session;
  }
}

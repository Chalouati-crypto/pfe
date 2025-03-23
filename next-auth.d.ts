import { type DefaultSession } from "next-auth";

export type ExtendUser = DefaultSession["user"] & {
  id: string;
  name: string;
  email: string;
  image: string;
};

declare module "next-auth" {
  interface Session {
    user: ExtendUser;
  }
}

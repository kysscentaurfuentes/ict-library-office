declare module "@apollo/server/express4" {
  import { RequestHandler } from "express";
  export function expressMiddleware(...args: any[]): RequestHandler;
}
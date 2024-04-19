import { RequestOptions as HttpsOptions } from "https";

export interface RequestOptions extends HttpsOptions {
  body?: string | Buffer;
}

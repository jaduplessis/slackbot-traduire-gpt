import { HttpStatusCodes } from "./http-status-codes";

export interface Response {
  statusCode: HttpStatusCodes;
  body: string;
}

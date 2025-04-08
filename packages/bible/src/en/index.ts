import * as kjv from "./kjv.json";
import * as net from "./net.json";
import * as asv from "./asv.json";
import { Version, Bible } from "../types";

export const versions: Record<Version, Bible> = {
  kjv: kjv as unknown as Bible,
  net: net as unknown as Bible,
  asv: asv as unknown as Bible,
};

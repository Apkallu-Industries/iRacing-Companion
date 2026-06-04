import { b as createServerFn, e as createSsrRpc } from "../server.js";
import { r as requireSupabaseAuth } from "./auth-middleware-Cz-8T2yV.js";
const upsertFingerprint = createServerFn({
  method: "POST",
})
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => {
    if (!data?.pairs || !Array.isArray(data.pairs)) throw new Error("pairs required");
    if (data.pairs.length > 5e3) throw new Error("too many pairs");
    return data;
  })
  .handler(createSsrRpc("4e3fddf18e57875d3935a51a331aca3c3da1d3c7a9c2c29cbb33ce6299dc94cb"));
const getFingerprintForPair = createServerFn({
  method: "POST",
})
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => data)
  .handler(createSsrRpc("eca09a9ce4600909cbdd71ef659e9b741d36bab6ad45478e094416d1db662d95"));
const getLastSessionForPair = createServerFn({
  method: "POST",
})
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => data)
  .handler(createSsrRpc("e75b3ebf429fee7020c779a2e9b76dc2affe3f854abd5837eb27ecf4d803f71c"));
const hasAnyFingerprint = createServerFn({
  method: "GET",
})
  .middleware([requireSupabaseAuth])
  .handler(createSsrRpc("b5484388ab4b2cd6a53164ac8e150abae7cadd0ff4b5adcf4687ef27a6f2dd7d"));
const updateSessionFingerprintDelta = createServerFn({
  method: "POST",
})
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => data)
  .handler(createSsrRpc("6e51eeb531637ef52eb546fc0b0f2f93bd0941191072fdc7841f63ef520e47b1"));
export {
  getLastSessionForPair as a,
  upsertFingerprint as b,
  getFingerprintForPair as g,
  hasAnyFingerprint as h,
  updateSessionFingerprintDelta as u,
};

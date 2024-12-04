import {  redirect } from "@remix-run/node";
import { authenticate, PREMIUM_PLAN, BASIC_PLAN } from "../shopify.server";

export const loader = async ({ request }) => {
  const { billing, session } = await authenticate.admin(request);
  let { shop } = session;
  let myShop = shop.replace(".myshopify.com", "");

  await billing.require({
    plans: [PREMIUM_PLAN],
    onFailure: async () => billing.request({
      plan: PREMIUM_PLAN,
      isTest: true,
      returnUrl: `https://admin.shopify.com/store/${myShop}/apps/${process.env.APP_NAME}/app/pricing`,
    }),
  });
  // App logic

  return null;
};

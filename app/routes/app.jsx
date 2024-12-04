import { json } from "@remix-run/node";
import { Link, Outlet, useLoaderData, useRouteError } from "@remix-run/react";
import { boundary } from "@shopify/shopify-app-remix/server";
import { AppProvider } from "@shopify/shopify-app-remix/react";
import { NavMenu } from "@shopify/app-bridge-react";
import polarisStyles from "@shopify/polaris/build/esm/styles.css?url";
import { authenticate, BASIC_PLAN } from "../shopify.server";
import { getSubscriptionStatus } from "../models/Subscription.server";

export const links = () => [{ rel: "stylesheet", href: polarisStyles }];

export const loader = async ({ request }) => {
const {admin, billing, session}   =  await authenticate.admin(request);
const {shop} = session;
const subscription = await getSubscriptionStatus(admin.graphql);
const {activeSubscriptions} = subscription.data.app.installation;

console.log(activeSubscriptions);

if (activeSubscriptions.length < 1){
  await billing.require({
    plans:[MONTHLY_PLAN],
    isTest: true,
    onFailure: async () =>
      billing.request({
        plan: MONTHLY_PLAN,
        isTest: true,
      }),
      returnUrl: `https://${shop}/admin/apps/demo-billingapp-1/app`,
  });
}

  return json({ apiKey: process.env.SHOPIFY_API_KEY || "" });
};

export default function App() {
  const { apiKey } = useLoaderData();

  return (
    <AppProvider isEmbeddedApp apiKey={apiKey}>
      <NavMenu>
        <Link to="/app" rel="home">
          Home
        </Link>
        <Link to="/app/additional">Additional page</Link>
        <Link to="/app/pricing">pricing</Link>
      </NavMenu>
      <Outlet />
    </AppProvider>
  );
}

// Shopify needs Remix to catch some thrown responses, so that their headers are included in the response.
export function ErrorBoundary() {
  return boundary.error(useRouteError());
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};

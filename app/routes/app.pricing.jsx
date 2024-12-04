import {
  Page,
  Box,
  Button,
  Card,
  CalloutCard,
  Text,
  Grid,
  Divider,
  BlockStack,
  ExceptionList
} from "@shopify/polaris";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { authenticate, PREMIUM_PLAN, ANNUAL_PLAN } from "../shopify.server";

export async function loader({ request }) {
  const { billing } = await authenticate.admin(request);

  try {
    // Attempt to check if the shop has an active payment for any plan
    const billingCheck = await billing.require({
      plans: [PREMIUM_PLAN, ANNUAL_PLAN],
      isTest: true,
      // Instead of redirecting on failure, just catch the error
      onFailure: () => {
        throw new Error('No active plan');
      },
    });

    // If the shop has an active subscription, log and return the details
    const subscription = billingCheck.appSubscriptions[0];
    console.log(`Shop is on ${subscription.name} (id ${subscription.id})`);
    return json({ billing, plan: subscription });

  } catch (error) {
    // If the shop does not have an active plan, return an empty plan object
    if (error.message === 'No active plan') {
      console.log('Shop does not have any active plans.');
      return json({ billing, plan: { name: "Free" } });
    }
    // If there is another error, rethrow it
    throw error;
  }
}


let planData = [
  {
    title: "Basic",
    description: "Gói Basic cung cấp 90 request/tháng, phù hợp cho cá nhân hoặc doanh nghiệp nhỏ cần giải pháp tiết kiệm và hiệu quả.",
    price: "9",
    name: "Monthly subscription",
    action: "Upgrade to pro",
    url: "/app/upgrade",
    features: [
      "Sử dụng AI SEO trong 1 tháng",
      "Tối đa 90 lần request/tháng"
    ]
  },
  {
    title: "Premium",
    description: "Gói Premium cung cấp 200 request/tháng, lý tưởng cho doanh nghiệp cần truy cập mở rộng và dịch vụ nâng cao.",
    price: "18",
    name: "Monthly subscription",
    action: "Upgrade to pro",
    url: "/app/upgrade",
    features: [
      "Sử dụng AI SEO trong 1 tháng",
      "Tối đa 200 lần request/tháng"
    ]
  },
]

export default function PricingPage() {
  const { plan } = useLoaderData();

  console.log('plan', plan);
  return (
    <Page>
      <ui-title-bar title="Pricing" />
      <CalloutCard
          title="Change your plan"
          illustration="https://cdn.shopify.com/s/files/1/0583/6465/7734/files/tag.png?v=1705280535"
          primaryAction={{
            content: 'Cancel Plan',
            url: '/app',
          }}
        >
          { plan.name == "Monthly subscription" ? (
            <p>
              You're currently on pro plan. All features are unlocked.
            </p>
          ) : (
            <p>
              You're currently on free plan. Upgrade to pro to unlock more features.
            </p>
          )}
      </CalloutCard>

      <div style={{ margin: "0.5rem 0"}}>
        <Divider />
      </div>

      <Grid>

        {planData.map((plan_item, index) => (
          <Grid.Cell key={index} columnSpan={{xs: 6, sm: 3, md: 3, lg: 6, xl: 6}}>
            <Card background={ plan_item.name == plan.name ? "bg-surface-success" : "bg-surface" } sectioned>
              <Box padding="400">
                <Text as="h3" variant="headingMd">
                  {plan_item.title}
                </Text>
                <Box as="p" variant="bodyMd">
                  {plan_item.description}
                  {/* If plan_item is 0, display nothing */}
                  <br />
                  <Text as="p" variant="headingLg" fontWeight="bold">
                    {plan_item.price === "0" ? "" : "$" + plan_item.price}
                  </Text>
                </Box>

                <div style={{ margin: "0.5rem 0"}}>
                  <Divider />
                </div>

                <BlockStack gap={100}>
                  {plan_item.features.map((feature, index) => (
                    <ExceptionList
                      key={index}
                      items={[
                        {
                          description: feature,
                        },
                      ]}
                    />
                  ))}
                </BlockStack>
                <div style={{ margin: "0.5rem 0"}}>
                  <Divider />
                </div>


                    <Button primary url={plan_item.url}>
                      {plan_item.action}
                    </Button>
              </Box>
            </Card>
          </Grid.Cell>
        ))}

      </Grid>

    </Page>
  );
}

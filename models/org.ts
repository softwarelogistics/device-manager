namespace Orgs {

  export interface Subscription {
    id: string;
    name: string;
    key: string;
    description: string;
    customerId: string;
    paymentToken: string;
    status: string;
    paymentTokenStatus: string;
  }

  export interface SubscriptionView {
    key: Core.FormField;
    name: Core.FormField;
    description: Core.FormField;
  }
}

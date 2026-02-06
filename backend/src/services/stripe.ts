import Stripe from 'stripe'

// 🔥 TEMPORÁRIO - Em produção usar variáveis de ambiente
const stripe = new Stripe('sk_test_51234567890abcdef', {
  apiVersion: '2024-11-20.acacia',
  typescript: true,
})

export interface BillingPlan {
  id: string
  name: string
  description: string
  priceId: string
  amount: number
  currency: string
  interval: 'month' | 'year'
  features: string[]
  limits: {
    users: number
    products: number
    orders: number
    apiCalls: number
  }
  stripePriceId?: string
}

export interface Customer {
  id: string
  email: string
  name: string
  tenantId: string
  stripeCustomerId?: string
  subscriptionId?: string
  planId?: string
  status: 'active' | 'inactive' | 'cancelled' | 'past_due'
}

export interface Subscription {
  id: string
  customerId: string
  tenantId: string
  planId: string
  stripeSubscriptionId: string
  status: Stripe.Subscription.Status
  currentPeriodStart: Date
  currentPeriodEnd: Date
  cancelAtPeriodEnd: boolean
  trialEnd?: Date
}

// Planos disponíveis
export const BILLING_PLANS: BillingPlan[] = [
  {
    id: 'basic',
    name: 'Basic',
    description: 'Ideal para pequenos restaurantes',
    priceId: 'basic-monthly',
    amount: 4900, // $49.00
    currency: 'usd',
    interval: 'month',
    features: [
      'Até 3 usuários',
      'Até 50 produtos',
      'Até 100 pedidos/mês',
      '1.000 chamadas API/mês',
      'Dashboard básico',
      'Suporte por email',
    ],
    limits: {
      users: 3,
      products: 50,
      orders: 100,
      apiCalls: 1000,
    },
  },
  {
    id: 'standard',
    name: 'Standard',
    description: 'Perfeito para restaurantes em crescimento',
    priceId: 'standard-monthly',
    amount: 9900, // $99.00
    currency: 'usd',
    interval: 'month',
    features: [
      'Até 10 usuários',
      'Até 200 produtos',
      'Até 500 pedidos/mês',
      '5.000 chamadas API/mês',
      'Dashboard avançado',
      'Relatórios detalhados',
      'PDV completo',
      'Suporte prioritário',
    ],
    limits: {
      users: 10,
      products: 200,
      orders: 500,
      apiCalls: 5000,
    },
  },
  {
    id: 'premium',
    name: 'Premium',
    description: 'Solução completa para grandes operações',
    priceId: 'premium-monthly',
    amount: 19900, // $199.00
    currency: 'usd',
    interval: 'month',
    features: [
      'Usuários ilimitados',
      'Produtos ilimitados',
      'Pedidos ilimitados',
      'API ilimitada',
      'Dashboard enterprise',
      'Analytics avançado',
      'PDV multi-loja',
      'API white-label',
      'Integrações customizadas',
      'Suporte dedicado 24/7',
    ],
    limits: {
      users: -1, // ilimitado
      products: -1,
      orders: -1,
      apiCalls: -1,
    },
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'Solução customizada para grandes redes',
    priceId: 'enterprise-monthly',
    amount: 49900, // $499.00
    currency: 'usd',
    interval: 'month',
    features: [
      'Tudo do Premium +',
      'SLA garantido',
      'Dedicado environment',
      'Custom features',
      'On-site support',
      'Training incluído',
    ],
    limits: {
      users: -1,
      products: -1,
      orders: -1,
      apiCalls: -1,
    },
  },
]

/**
 * Criar cliente Stripe
 */
export async function createStripeCustomer(customerData: {
  email: string
  name: string
  tenantId: string
}): Promise<Stripe.Customer> {
  try {
    const customer = await stripe.customers.create({
      email: customerData.email,
      name: customerData.name,
      metadata: {
        tenantId: customerData.tenantId,
        source: 'foodmanager-saas',
      },
    })

    console.log(`Stripe customer created: ${customer.id} for tenant ${customerData.tenantId}`)
    return customer
  } catch (error) {
    console.error('Error creating Stripe customer:', error)
    throw new Error('Failed to create Stripe customer')
  }
}

/**
 * Criar sessão de checkout
 */
export async function createCheckoutSession(params: {
  customerId: string
  planId: string
  tenantId: string
  successUrl: string
  cancelUrl: string
}): Promise<Stripe.Checkout.Session> {
  try {
    const plan = BILLING_PLANS.find(p => p.id === params.planId)
    if (!plan) {
      throw new Error('Plan not found')
    }

    // Criar ou recuperar preço no Stripe
    let priceId = plan.stripePriceId
    
    if (!priceId) {
      const price = await stripe.prices.create({
        unit_amount: plan.amount,
        currency: plan.currency,
        recurring: {
          interval: plan.interval,
        },
        product_data: {
          name: plan.name,
          description: plan.description,
          metadata: {
            planId: plan.id,
          },
        },
      })
      priceId = price.id
      plan.stripePriceId = priceId
    }

    const session = await stripe.checkout.sessions.create({
      customer: params.customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: params.successUrl,
      cancel_url: params.cancelUrl,
      metadata: {
        tenantId: params.tenantId,
        planId: params.planId,
      },
      subscription_data: {
        metadata: {
          tenantId: params.tenantId,
          planId: params.planId,
        },
      },
    })

    console.log(`Checkout session created: ${session.id} for tenant ${params.tenantId}`)
    return session
  } catch (error) {
    console.error('Error creating checkout session:', error)
    throw new Error('Failed to create checkout session')
  }
}

/**
 * Criar portal de gerenciamento do cliente
 */
export async function createCustomerPortalSession(params: {
  customerId: string
  returnUrl: string
}): Promise<Stripe.BillingPortal.Session> {
  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: params.customerId,
      return_url: params.returnUrl,
    })

    console.log(`Portal session created: ${session.id}`)
    return session
  } catch (error) {
    console.error('Error creating portal session:', error)
    throw new Error('Failed to create portal session')
  }
}

/**
 * Obter assinatura do cliente
 */
export async function getSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId)
    return subscription
  } catch (error) {
    console.error('Error retrieving subscription:', error)
    throw new Error('Failed to retrieve subscription')
  }
}

/**
 * Cancelar assinatura
 */
export async function cancelSubscription(subscriptionId: string, immediate = false): Promise<Stripe.Subscription> {
  try {
    let subscription: Stripe.Subscription

    if (immediate) {
      subscription = await stripe.subscriptions.cancel(subscriptionId)
    } else {
      subscription = await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true,
      })
    }

    console.log(`Subscription ${subscriptionId} cancelled`)
    return subscription
  } catch (error) {
    console.error('Error cancelling subscription:', error)
    throw new Error('Failed to cancel subscription')
  }
}

/**
 * Retomar assinatura cancelada
 */
export async function resumeSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
  try {
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: false,
      trial_period_end: 'now',
    })

    console.log(`Subscription ${subscriptionId} resumed`)
    return subscription
  } catch (error) {
    console.error('Error resuming subscription:', error)
    throw new Error('Failed to resume subscription')
  }
}

/**
 * Atualizar assinatura (mudar plano)
 */
export async function updateSubscription(params: {
  subscriptionId: string
  newPlanId: string
}): Promise<Stripe.Subscription> {
  try {
    const newPlan = BILLING_PLANS.find(p => p.id === params.newPlanId)
    if (!newPlan) {
      throw new Error('New plan not found')
    }

    // Criar ou recuperar preço
    let priceId = newPlan.stripePriceId
    if (!priceId) {
      const price = await stripe.prices.create({
        unit_amount: newPlan.amount,
        currency: newPlan.currency,
        recurring: {
          interval: newPlan.interval,
        },
        product_data: {
          name: newPlan.name,
          description: newPlan.description,
          metadata: {
            planId: newPlan.id,
          },
        },
      })
      priceId = price.id
      newPlan.stripePriceId = priceId
    }

    const subscription = await stripe.subscriptions.update(params.subscriptionId, {
      items: [{
        id: (await stripe.subscriptions.retrieve(params.subscriptionId)).items.data[0].id,
        price: priceId,
      }],
      proration_behavior: 'create_prorations',
    })

    console.log(`Subscription ${params.subscriptionId} updated to plan ${params.newPlanId}`)
    return subscription
  } catch (error) {
    console.error('Error updating subscription:', error)
    throw new Error('Failed to update subscription')
  }
}

/**
 * Webhook handler para eventos Stripe
 */
export async function handleWebhook(event: Stripe.Event): Promise<void> {
  try {
    switch (event.type) {
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription)
        break
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription)
        break
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription)
        break
      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice)
        break
      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.Invoice)
        break
      default:
        console.log(`Unhandled event type: ${event.type}`)
    }
  } catch (error) {
    console.error(`Error handling webhook event ${event.type}:`, error)
    throw error
  }
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  console.log(`Subscription created: ${subscription.id}`)
  // TODO: Atualizar banco de dados
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  console.log(`Subscription updated: ${subscription.id}`)
  // TODO: Atualizar banco de dados
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  console.log(`Subscription deleted: ${subscription.id}`)
  // TODO: Atualizar banco de dados
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  console.log(`Payment succeeded: ${invoice.id}`)
  // TODO: Enviar receipt, atualizar status
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  console.log(`Payment failed: ${invoice.id}`)
  // TODO: Notificar usuário, atualizar status
}

export default stripe

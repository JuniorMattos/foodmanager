import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { 
  BILLING_PLANS, 
  BillingPlan,
  createStripeCustomer,
  createCheckoutSession,
  createCustomerPortalSession,
  getSubscription,
  cancelSubscription,
  resumeSubscription,
  updateSubscription,
  handleWebhook
} from '../services/stripe'
import Stripe from 'stripe'

const createCustomerSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
  tenantId: z.string(),
})

const createCheckoutSessionSchema = z.object({
  customerId: z.string(),
  planId: z.enum(['basic', 'standard', 'premium', 'enterprise']),
  tenantId: z.string(),
  successUrl: z.string().url(),
  cancelUrl: z.string().url(),
})

const createPortalSessionSchema = z.object({
  customerId: z.string(),
  returnUrl: z.string().url(),
})

const updateSubscriptionSchema = z.object({
  subscriptionId: z.string(),
  newPlanId: z.enum(['basic', 'standard', 'premium', 'enterprise']),
})

export default async function billingRoutes(fastify: FastifyInstance) {
  // Get available plans
  fastify.get('/plans', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      return reply.send({
        plans: BILLING_PLANS.map(plan => ({
          id: plan.id,
          name: plan.name,
          description: plan.description,
          amount: plan.amount,
          currency: plan.currency,
          interval: plan.interval,
          features: plan.features,
          limits: plan.limits,
        })),
      })
    } catch (error) {
      console.error('Error getting plans:', error)
      return reply.status(500).send({
        error: 'Internal server error',
        message: 'Failed to get billing plans',
        code: 'PLANS_ERROR'
      })
    }
  })

  // Get plan details
  fastify.get('/plans/:planId', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { planId } = request.params as { planId: string }
      const plan = BILLING_PLANS.find(p => p.id === planId)
      
      if (!plan) {
        return reply.status(404).send({
          error: 'Plan not found',
          message: `Plan '${planId}' does not exist`,
          code: 'PLAN_NOT_FOUND'
        })
      }

      return reply.send({
        id: plan.id,
        name: plan.name,
        description: plan.description,
        amount: plan.amount,
        currency: plan.currency,
        interval: plan.interval,
        features: plan.features,
        limits: plan.limits,
      })
    } catch (error) {
      console.error('Error getting plan:', error)
      return reply.status(500).send({
        error: 'Internal server error',
        message: 'Failed to get plan details',
        code: 'PLAN_ERROR'
      })
    }
  })

  // Create Stripe customer
  fastify.post('/customers', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const customerData = createCustomerSchema.parse(request.body)
      
      const customer = await createStripeCustomer(customerData)
      
      return reply.status(201).send({
        customerId: customer.id,
        email: customer.email,
        name: customer.name,
        tenantId: customerData.tenantId,
      })
    } catch (error) {
      console.error('Error creating customer:', error)
      return reply.status(500).send({
        error: 'Internal server error',
        message: 'Failed to create customer',
        code: 'CUSTOMER_CREATE_ERROR'
      })
    }
  })

  // Create checkout session
  fastify.post('/checkout', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const checkoutData = createCheckoutSessionSchema.parse(request.body)
      
      const session = await createCheckoutSession(checkoutData)
      
      return reply.send({
        sessionId: session.id,
        url: session.url,
      })
    } catch (error) {
      console.error('Error creating checkout session:', error)
      return reply.status(500).send({
        error: 'Internal server error',
        message: 'Failed to create checkout session',
        code: 'CHECKOUT_ERROR'
      })
    }
  })

  // Create customer portal session
  fastify.post('/portal', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const portalData = createPortalSessionSchema.parse(request.body)
      
      const session = await createCustomerPortalSession(portalData)
      
      return reply.send({
        sessionId: session.id,
        url: session.url,
      })
    } catch (error) {
      console.error('Error creating portal session:', error)
      return reply.status(500).send({
        error: 'Internal server error',
        message: 'Failed to create portal session',
        code: 'PORTAL_ERROR'
      })
    }
  })

  // Get subscription details
  fastify.get('/subscriptions/:subscriptionId', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { subscriptionId } = request.params as { subscriptionId: string }
      
      const subscription = await getSubscription(subscriptionId)
      
      return reply.send({
        id: subscription.id,
        customerId: subscription.customer as string,
        status: subscription.status,
        currentPeriodStart: subscription.current_period_start,
        currentPeriodEnd: subscription.current_period_end,
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        trialEnd: subscription.trial_end,
        items: subscription.items.data.map(item => ({
          id: item.id,
          price: {
            id: item.price.id,
            amount: item.price.unit_amount,
            currency: item.price.currency,
            interval: item.price.recurring?.interval,
          },
          quantity: item.quantity,
        })),
      })
    } catch (error) {
      console.error('Error getting subscription:', error)
      return reply.status(500).send({
        error: 'Internal server error',
        message: 'Failed to get subscription',
        code: 'SUBSCRIPTION_ERROR'
      })
    }
  })

  // Update subscription (change plan)
  fastify.put('/subscriptions', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const updateData = updateSubscriptionSchema.parse(request.body)
      
      const subscription = await updateSubscription(updateData)
      
      return reply.send({
        id: subscription.id,
        status: subscription.status,
        currentPeriodStart: subscription.current_period_start,
        currentPeriodEnd: subscription.current_period_end,
        items: subscription.items.data.map(item => ({
          id: item.id,
          price: {
            id: item.price.id,
            amount: item.price.unit_amount,
            currency: item.price.currency,
            interval: item.price.recurring?.interval,
          },
          quantity: item.quantity,
        })),
      })
    } catch (error) {
      console.error('Error updating subscription:', error)
      return reply.status(500).send({
        error: 'Internal server error',
        message: 'Failed to update subscription',
        code: 'SUBSCRIPTION_UPDATE_ERROR'
      })
    }
  })

  // Cancel subscription
  fastify.delete('/subscriptions/:subscriptionId', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { subscriptionId } = request.params as { subscriptionId: string }
      const { immediate = false } = request.query as { immediate?: boolean }
      
      const subscription = await cancelSubscription(subscriptionId, immediate)
      
      return reply.send({
        id: subscription.id,
        status: subscription.status,
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        canceledAt: subscription.canceled_at,
      })
    } catch (error) {
      console.error('Error cancelling subscription:', error)
      return reply.status(500).send({
        error: 'Internal server error',
        message: 'Failed to cancel subscription',
        code: 'SUBSCRIPTION_CANCEL_ERROR'
      })
    }
  })

  // Resume subscription
  fastify.post('/subscriptions/:subscriptionId/resume', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { subscriptionId } = request.params as { subscriptionId: string }
      
      const subscription = await resumeSubscription(subscriptionId)
      
      return reply.send({
        id: subscription.id,
        status: subscription.status,
        currentPeriodStart: subscription.current_period_start,
        currentPeriodEnd: subscription.current_period_end,
      })
    } catch (error) {
      console.error('Error resuming subscription:', error)
      return reply.status(500).send({
        error: 'Internal server error',
        message: 'Failed to resume subscription',
        code: 'SUBSCRIPTION_RESUME_ERROR'
      })
    }
  })

  // Webhook endpoint for Stripe events
  fastify.post('/webhook', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const signature = request.headers['stripe-signature'] as string
      const webhookSecret = 'whsec_1234567890abcdef' // 🔥 TEMPORÁRIO - usar env
      
      if (!signature) {
        return reply.status(400).send({
          error: 'Bad Request',
          message: 'Stripe signature missing',
          code: 'MISSING_SIGNATURE'
        })
      }

      // Em produção, usar:
      // const event = stripe.webhooks.constructEvent(request.body, signature, webhookSecret)
      
      // Por enquanto, simular evento
      const event = {
        type: 'customer.subscription.created',
        data: { object: { id: 'sub_test' } }
      }
      
      await handleWebhook(event)
      
      return reply.send({ received: true })
    } catch (error) {
      console.error('Webhook error:', error)
      return reply.status(400).send({
        error: 'Webhook Error',
        message: error instanceof Error ? error.message : 'Unknown error',
        code: 'WEBHOOK_ERROR'
      })
    }
  })

  // Billing usage tracking (for metered billing)
  fastify.post('/usage', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { tenantId, metric, quantity } = request.body as {
        tenantId: string
        metric: string
        quantity: number
      }
      
      // TODO: Implementar tracking de uso
      console.log(`Usage tracked: ${tenantId} - ${metric}: ${quantity}`)
      
      return reply.send({
        message: 'Usage tracked successfully',
        tenantId,
        metric,
        quantity,
        timestamp: new Date().toISOString(),
      })
    } catch (error) {
      console.error('Error tracking usage:', error)
      return reply.status(500).send({
        error: 'Internal server error',
        message: 'Failed to track usage',
        code: 'USAGE_TRACKING_ERROR'
      })
    }
  })

  // Get billing summary for tenant
  fastify.get('/summary/:tenantId', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { tenantId } = request.params as { tenantId: string }
      
      // TODO: Implementar busca real no banco de dados
      const mockSummary = {
        tenantId,
        currentPlan: 'standard',
        status: 'active',
        subscriptionId: 'sub_test123',
        currentPeriodStart: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        amount: 9900, // $99.00
        currency: 'usd',
        usage: {
          users: 3,
          products: 45,
          orders: 120,
          apiCalls: 1200,
        },
        limits: {
          users: 10,
          products: 200,
          orders: 500,
          apiCalls: 5000,
        },
      }
      
      return reply.send(mockSummary)
    } catch (error) {
      console.error('Error getting billing summary:', error)
      return reply.status(500).send({
        error: 'Internal server error',
        message: 'Failed to get billing summary',
        code: 'BILLING_SUMMARY_ERROR'
      })
    }
  })
}

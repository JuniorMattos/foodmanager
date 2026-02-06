import { FastifyError, FastifyRequest, FastifyReply } from 'fastify'

export async function errorHandler(error: FastifyError, request: FastifyRequest, reply: FastifyReply) {
  request.log.error(error)

  // Default error response
  let statusCode = 500
  let message = 'Internal Server Error'

  // Handle specific error types
  if (error.validation) {
    statusCode = 400
    message = 'Validation Error'
  } else if (error.statusCode) {
    statusCode = error.statusCode
    message = error.message || 'Error'
  }

  return reply.status(statusCode).send({
    error: error.name || 'Error',
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  })
}

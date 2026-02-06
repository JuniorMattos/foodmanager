import jwt from 'jsonwebtoken'
import fs from 'fs'
import path from 'path'

// Carregar chaves RSA
const privateKeyPath = path.join(__dirname, '../../keys/jwt_private.pem')
const publicKeyPath = path.join(__dirname, '../../keys/jwt_public.pem')

let privateKey: string
let publicKey: string

try {
  privateKey = fs.readFileSync(privateKeyPath, 'utf8')
  publicKey = fs.readFileSync(publicKeyPath, 'utf8')
  console.log('✅ JWT RSA keys loaded successfully')
} catch (error) {
  console.error('❌ Failed to load JWT RSA keys:', error)
  throw new Error('JWT RSA keys not found')
}

export interface JWTPayload {
  userId: string
  email: string
  role: string
  tenantId: string
  iat?: number
  exp?: number
}

export interface RefreshTokenPayload {
  userId: string
  type: 'refresh'
  iat?: number
  exp?: number
}

/**
 * Generate Access Token with RS256
 */
export function generateAccessToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, privateKey, {
    algorithm: 'RS256',
    expiresIn: '15m',
    issuer: 'foodmanager-saas',
    audience: 'foodmanager-clients',
  })
}

/**
 * Generate Refresh Token with RS256
 */
export function generateRefreshToken(payload: Omit<RefreshTokenPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, privateKey, {
    algorithm: 'RS256',
    expiresIn: '7d',
    issuer: 'foodmanager-saas',
    audience: 'foodmanager-clients',
  })
}

/**
 * Verify Access Token with RS256
 */
export function verifyAccessToken(token: string): JWTPayload {
  try {
    const decoded = jwt.verify(token, publicKey, {
      algorithms: ['RS256'],
      issuer: 'foodmanager-saas',
      audience: 'foodmanager-clients',
    }) as JWTPayload

    return decoded
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Token expired')
    } else if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid token')
    } else {
      throw new Error('Token verification failed')
    }
  }
}

/**
 * Verify Refresh Token with RS256
 */
export function verifyRefreshToken(token: string): RefreshTokenPayload {
  try {
    const decoded = jwt.verify(token, publicKey, {
      algorithms: ['RS256'],
      issuer: 'foodmanager-saas',
      audience: 'foodmanager-clients',
    }) as RefreshTokenPayload

    return decoded
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Refresh token expired')
    } else if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid refresh token')
    } else {
      throw new Error('Refresh token verification failed')
    }
  }
}

/**
 * Decode Token without verification (for debugging)
 */
export function decodeToken(token: string): any {
  return jwt.decode(token)
}

/**
 * Get token expiration time
 */
export function getTokenExpiration(token: string): Date | null {
  try {
    const decoded = decodeToken(token) as any
    if (decoded && decoded.exp) {
      return new Date(decoded.exp * 1000)
    }
    return null
  } catch (error) {
    return null
  }
}

/**
 * Check if token is expired
 */
export function isTokenExpired(token: string): boolean {
  const expiration = getTokenExpiration(token)
  if (!expiration) return true
  
  return expiration < new Date()
}

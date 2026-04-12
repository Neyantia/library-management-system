export default () => ({
  port: Number(process.env.PORT),
  database: {
    url: process.env.DATABASE_URL,
  },
  bootstrap: {
    admin: {
      email: process.env.ADMIN_EMAIL,
      password: process.env.ADMIN_PASSWORD,
    },
  },
  sessions: {
    active: Number(process.env.ACTIVE_SESSIONS),
  },
  auth: {
    jwt: {
      access: {
        secret: process.env.JWT_ACCESS_TOKEN_SECRET,
        ttl: Number(process.env.JWT_ACCESS_TTL_SECONDS),
      },
      refresh: {
        secret: process.env.JWT_REFRESH_TOKEN_SECRET,
        ttl: Number(process.env.JWT_REFRESH_TTL_SECONDS),
      },
      issuer: process.env.JWT_ISSUER,
      audience: process.env.JWT_AUDIENCE,
    },
  },
  throttle: {
    login: {
      short: {
        limit: Number(process.env.THROTTLE_LOGIN_SHORT_LIMIT),
        ttlSeconds: Number(process.env.THROTTLE_LOGIN_SHORT_TTL_SECONDS),
      },
      medium: {
        limit: Number(process.env.THROTTLE_LOGIN_MEDIUM_LIMIT),
        ttlMinutes: Number(process.env.THROTTLE_LOGIN_MEDIUM_TTL_MINUTES),
      },
    },
    refresh: {
      short: {
        limit: Number(process.env.THROTTLE_REFRESH_SHORT_LIMIT),
        ttlMinutes: Number(process.env.THROTTLE_REFRESH_SHORT_TTL_MINUTES),
      },
      medium: {
        limit: Number(process.env.THROTTLE_REFRESH_MEDIUM_LIMIT),
        ttlMinutes: Number(process.env.THROTTLE_REFRESH_MEDIUM_TTL_MINUTES),
      },
    },
  },
  cookie: {
    secure: process.env.COOKIE_SECURE === 'true',
    samesite: process.env.COOKIE_SAMESITE,
  },
});

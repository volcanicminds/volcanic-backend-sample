import { Database } from '@volcanicminds/typeorm'
import { DefaultNamingStrategy, NamingStrategyInterface } from 'typeorm'

class CustomNamingStrategy extends DefaultNamingStrategy implements NamingStrategyInterface {
  columnName(propertyName: string, customName: string, embeddedPrefixes: string[]): string {
    return embeddedPrefixes
      .concat(customName || propertyName)
      .map((s, i) => (i > 0 ? s.replace(/^(.)/, (c) => c.toUpperCase()) : s))
      .join('')
  }
}

export const database: Database = {
  default: {
    type: 'postgres',
    host: process.env.DB_HOST || '127.0.0.1',
    port: process.env.DB_PORT || 5432,
    username: process.env.DB_USERNAME || 'sample',
    password: process.env.DB_PASSWORD || 'sample',
    database: process.env.DB_NAME || 'sample',
    synchronize: true,
    logging: true,
    namingStrategy: new CustomNamingStrategy()
  }
}

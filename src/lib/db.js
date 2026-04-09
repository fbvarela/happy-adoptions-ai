import { neon } from '@neondatabase/serverless';
import { getEnv } from '@/lib/env';

let _sql;
function getSql() {
  if (!_sql) {
    const url = getEnv('DATABASE_URL');
    if (!url) throw new Error('DATABASE_URL is not set');
    _sql = neon(url);
  }
  return _sql;
}

export function sql(strings, ...values) {
  return getSql()(strings, ...values);
}

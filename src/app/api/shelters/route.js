import { sql } from '@/lib/db';

export async function GET() {
  const shelters = await sql`
    SELECT id, name, city, country, website, logo_url, dog_count
    FROM linked_shelters
    WHERE active = true
    ORDER BY name ASC
  `;
  return Response.json(shelters);
}

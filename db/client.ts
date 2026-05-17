import { drizzle } from 'drizzle-orm/expo-sqlite';
import { openDatabaseSync } from 'expo-sqlite';

import * as schema from '@/db/schema';

const expoSqlite = openDatabaseSync('lenga.sqlite');

export const db = drizzle(expoSqlite, { schema });

export type AppDb = typeof db;

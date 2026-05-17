import Loader from '@/components/loader';
import { db } from '@/db/client';
import migrations from '@/drizzle/migrations.js';
import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';

/**
 * Runs Drizzle migrations once at startup before exposing children.
 * Native-only entry — web resolves DbProvider.web.tsx instead.
 */
export function DbProvider({ children }: { children: React.ReactNode }) {
  const { success, error } = useMigrations(db, migrations);

  useEffect(() => {
    if (error) {
      console.error('[DbProvider] SQLite migrations failed:', error);
    }
  }, [error]);

  if (error) {
    return <>{children}</>;
  }

  if (!success) {
    return (
      <View style={styles.center}>
        <Loader color="primary" size="large" />
      </View>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

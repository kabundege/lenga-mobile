import { and, eq } from 'drizzle-orm';

import { db } from '@/db/client';
import { strapiEntities } from '@/db/schema';

/** Matches REST slug segments used by the lessons Strapi client (`services/lessons.service`). */
export type StrapiCollection =
  | 'lessons'
  | 'lesson-chapters'
  | 'lesson-videos'
  | 'quizzes'
  | 'qas'
  | 'matchings'
  | 'matching-questions'
  | 'matching-answers';

export function upsertStrapiEntity(params: {
  collection: StrapiCollection;
  documentId: string;
  locale: string;
  updatedAtRemote: string;
  payload: unknown;
  isDeleted?: boolean;
}): void {
  const payloadJson = JSON.stringify(params.payload);
  db.insert(strapiEntities)
    .values({
      collection: params.collection,
      documentId: params.documentId,
      locale: params.locale,
      updatedAtRemote: params.updatedAtRemote,
      isDeleted: params.isDeleted ?? false,
      payloadJson,
    })
    .onConflictDoUpdate({
      target: [strapiEntities.collection, strapiEntities.documentId, strapiEntities.locale],
      set: {
        updatedAtRemote: params.updatedAtRemote,
        isDeleted: params.isDeleted ?? false,
        payloadJson,
      },
    })
    .run();
}

export function deleteStrapiEntity(params: {
  collection: StrapiCollection;
  documentId: string;
  locale: string;
}): void {
  db.delete(strapiEntities)
    .where(
      and(
        eq(strapiEntities.collection, params.collection),
        eq(strapiEntities.documentId, params.documentId),
        eq(strapiEntities.locale, params.locale),
      ),
    )
    .run();
}

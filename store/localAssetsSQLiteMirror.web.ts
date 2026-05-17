import { createListenerMiddleware } from '@reduxjs/toolkit';

/** Native-only SQLite mirror disabled on web bundles. */
const listenerMiddleware = createListenerMiddleware();
export const localAssetsSQLiteMirrorMiddleware = listenerMiddleware.middleware;

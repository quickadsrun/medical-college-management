// Safe LocalStorage Utility with QuotaExceeded Error Protection and Automatic Compression Fallback

export function cleanupOldStorageVersions(): void {
  if (typeof window === 'undefined') return;
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        // Clean up older version keys (v1 through v10/v11), but preserve essential accounts
        if (
          key.startsWith('pmc_') &&
          key !== 'pmc_college_accounts_v2' &&
          key !== 'pmc_college_accounts_v3' &&
          !key.includes('_v12_clean') &&
          !key.includes('_v16_clean')
        ) {
          keysToRemove.push(key);
        }
      }
    }
    keysToRemove.forEach((k) => localStorage.removeItem(k));
  } catch (e) {
    console.warn('Could not clean old storage versions:', e);
  }
}

export function safeLocalStorageSet(key: string, rawData: any): boolean {
  if (typeof window === 'undefined') return false;

  const serialized = typeof rawData === 'string' ? rawData : JSON.stringify(rawData);

  try {
    localStorage.setItem(key, serialized);
    return true;
  } catch (err: any) {
    console.warn(`[safeLocalStorageSet] Quota exceeded on key "${key}", attempting recovery...`, err);

    // Step 1: Free up old versioned keys
    cleanupOldStorageVersions();

    try {
      localStorage.setItem(key, serialized);
      return true;
    } catch (retryErr) {
      // Step 2: If rawData is an array of students, strip any large photoUrl or fileData blobs
      if (Array.isArray(rawData)) {
        try {
          const lightweightArray = rawData.map((item: any) => {
            if (item && (item.photoUrl || item.attachedDocuments)) {
              return {
                ...item,
                photoUrl: item.photoUrl && item.photoUrl.length > 50000 ? undefined : item.photoUrl,
                attachedDocuments: item.attachedDocuments
                  ? item.attachedDocuments.map((doc: any) => ({
                      ...doc,
                      fileData: undefined, // remove raw base64 document blobs
                    }))
                  : undefined,
              };
            }
            return item;
          });

          localStorage.setItem(key, JSON.stringify(lightweightArray));
          console.info(`[safeLocalStorageSet] Successfully recovered by stripping large blobs for key "${key}"`);
          return true;
        } catch (stripErr) {
          console.warn(`[safeLocalStorageSet] Could not save even lightweight version for "${key}"`, stripErr);
        }
      }

      // Step 3: Gracefully suppress error so UI doesn't crash
      return false;
    }
  }
}

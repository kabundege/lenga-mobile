import { useQuery } from '@tanstack/react-query';
import * as institutionsService from '@/services/institutions.service';
import type { StrapiInstitution } from '@/types/api';

export const INSTITUTION_KEYS = {
  LIST: 'institutions',
} as const;

export function getInstitutionListKeys(locale: string) {
  return [INSTITUTION_KEYS.LIST, locale] as const;
}

export function useInstitutions(locale: string) {
  const request = useQuery({
    queryKey: getInstitutionListKeys(locale),
    queryFn: () => institutionsService.getInstitutions(locale),
  });
  const body = request.data?.data as { data?: StrapiInstitution[] } | undefined;
  const institutions: StrapiInstitution[] = Array.isArray(body?.data) ? body.data : [];
  return { ...request, institutions };
}

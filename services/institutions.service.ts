import api from '@/utils/api';
import type { StrapiInstitution } from '@/types/api';
import type { AxiosResponse } from 'axios';

type StrapiListInstitutions = StrapiInstitution[];

export function getInstitutions(locale: string): Promise<AxiosResponse<StrapiListInstitutions>> {
  return api.get('/api/institutions', { params: { populate: '*', locale } });
}

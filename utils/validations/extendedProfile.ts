import type { Gender } from '@/types/analytics';
import * as Yup from 'yup';

export const GENDER_OPTIONS: Gender[] = ['Male', 'Female', 'Other', 'PreferNotToSay'];

export const extendedProfileSchema = Yup.object({
  gender: Yup.mixed<Gender>()
    .oneOf(GENDER_OPTIONS, 'Hitamo igitsina')
    .required('Hitamo igitsina'),
  age: Yup.number()
    .typeError('Injiza imyaka')
    .integer('Injiza imyaka')
    .min(0, 'Imyaka ntiyemewe')
    .max(120, 'Imyaka ntiyemewe')
    .required('Injiza imyaka'),
  is_pwd: Yup.boolean().required(),
  is_cooperative_member: Yup.boolean().required(),
  cooperative_name: Yup.string().when('is_cooperative_member', {
    is: true,
    then: (schema) => schema.trim().required('Injiza izina ryakoperative'),
    otherwise: (schema) => schema.optional(),
  }),
  district: Yup.string().trim().required('Injiza akarere'),
  sector: Yup.string().trim().required('Injiza umurenge'),
});

export type ExtendedProfileFormValues = Yup.InferType<typeof extendedProfileSchema>;

import * as Yup from 'yup';

export const loginSchema = Yup.object({
  identifier: Yup.string().required('Identifier is required'),
  password: Yup.string().required('Password is required'),
});

export const registerSchema = Yup.object({
  username: Yup.string().required('Username is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  password: Yup.string().min(6, 'At least 6 characters').required('Password is required'),
});

export type LoginFormValues = Yup.InferType<typeof loginSchema>;
export type RegisterFormValues = Yup.InferType<typeof registerSchema>;

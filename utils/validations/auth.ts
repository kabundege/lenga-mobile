import * as Yup from 'yup';

export const loginSchema = Yup.object({
  identifier: Yup.string().required('Injiza nimero ya telefoni'),
  password: Yup.string().min(5, 'PIN Igomba kuba imibare 5').required('Injiza PIN'),
});

export const registerSchema = Yup.object({
  phone: Yup.string().required('Injiza nimero ya telefoni'),
  username: Yup.string().required('Injiza amazina'),
  password: Yup.string().min(5, 'PIN Igomba kuba imibare 5').required('Injiza PIN'),
});

export type LoginFormValues = Yup.InferType<typeof loginSchema>;
export type RegisterFormValues = Yup.InferType<typeof registerSchema>;

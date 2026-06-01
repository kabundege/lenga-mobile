import { jwtDecode } from 'jwt-decode';

type JwtPayload = {
  exp?: number;
};

export function isValidToken(token: string): boolean {
  try {
    const { exp } = jwtDecode<JwtPayload>(token);

    if (!exp) return false;

    return exp * 1000 > Date.now();
  } catch {
    return false;
  }
}

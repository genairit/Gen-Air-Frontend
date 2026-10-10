import { validateEmail, validatePassword } from "./validators";

interface ICredentials {
  email: string;
  password: string;
}

export const canSubmitCredentials = ({ email, password }: ICredentials) => {
  const isEmailValid = validateEmail(email).isValid;
  const isPasswordValid = validatePassword(password).isValid;

  return isEmailValid && isPasswordValid;
};

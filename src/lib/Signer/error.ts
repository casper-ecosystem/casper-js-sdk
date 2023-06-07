export class SignerError extends Error {
  public isSignerError = true;
  public message: string;
  constructor(public code: SignerErrorCodes) {
    super(SignerErrorMessage[code]);
    this.message = SignerErrorMessage[code];
  }
}

export const isSignerError = (error: any): error is SignerError => {
  // using `instanceof` won't working if the error was thrown in a different window/frame/iframe than where the check is happening

  return typeof error === 'object' && error.isSignerError;
};

export enum SignerErrorCodes {
  NOT_FOUND_SIGNER,
  USER_CANCELED_REQUEST,
  NOT_FOUND_ACCOUNT,
  INVALID_DEPLOY,
  INTERNAL_ERROR
}

export const SignerErrorMessage = {
  [SignerErrorCodes.NOT_FOUND_SIGNER]: 'Signer was not found.',
  [SignerErrorCodes.USER_CANCELED_REQUEST]: 'User canceled the request.',
  [SignerErrorCodes.NOT_FOUND_ACCOUNT]: 'The signer account was not found.',
  [SignerErrorCodes.INVALID_DEPLOY]: 'The provided deploy is not valid.',
  [SignerErrorCodes.INTERNAL_ERROR]: 'Internal error occurred.'
} as const;

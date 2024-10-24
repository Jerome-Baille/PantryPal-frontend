const apiBaseURL = 'https://auth.jerome-baille.fr/api';

export const environment = {
  production: true,
  apiBaseURL,
  authURL: `${apiBaseURL}/auth`,
  userURL: `${apiBaseURL}/user`,
  redirectUrl: 'https://auth.jerome-baille.fr/login'
};
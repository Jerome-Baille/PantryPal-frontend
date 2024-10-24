const apiBaseURL = 'http://localhost:3000/api';

export const environment = {
  production: false,
  apiBaseURL,
  authURL: `${apiBaseURL}/auth`,
  userURL: `${apiBaseURL}/user`,
  redirectUrl: 'http://localhost:4200/login'
};
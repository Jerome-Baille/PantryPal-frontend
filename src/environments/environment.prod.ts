const authBaseURL = 'https://auth.jerome-baille.fr/api';
const pantryPalBaseURL = 'https://pantry-pal.jerome-baille.fr/api';

export const environment = {
  production: true,
  authBaseURL,
  authURL: `${authBaseURL}/auth`,
  userURL: `${authBaseURL}/user`,
  pantryPalBaseURL,
  recipesURL: `${pantryPalBaseURL}/recipes`,
  booksURL: `${pantryPalBaseURL}/books`,
  ingredientsURL: `${pantryPalBaseURL}/ingredients`,
};
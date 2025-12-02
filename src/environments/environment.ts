const authBaseURL = 'http://localhost:3000/api';
const pantryPalBaseURL = 'http://localhost:3000/api';

export const environment = {
  production: false,
  authBaseURL,
  authFrontURL: `${authBaseURL}/auth`,
  authURL: `${authBaseURL}/auth`,
  userURL: `${authBaseURL}/user`,
  pantryPalBaseURL,
  recipesURL: `${pantryPalBaseURL}/recipes`,
  booksURL: `${pantryPalBaseURL}/books`,
  ingredientsURL: `${pantryPalBaseURL}/ingredients`,
  itemsURL: `${pantryPalBaseURL}/items`,
  favoriteURL: `${pantryPalBaseURL}/favorites`
};
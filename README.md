# Pantry Pal

[![Angular](https://img.shields.io/badge/Angular-12.0.0-red)](https://angular.io/)
[![Node.js](https://img.shields.io/badge/Node.js-14.17.6-green)](https://nodejs.org/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0.25-blue)](https://www.mysql.com/)

Pantry Pal is a web application that simplifies recipe management, grocery list generation, and cooking with timers. Users can create an account, add their recipes, and seamlessly generate grocery lists from selected recipes.

## Demo
Visit the [Pantry Pal App](https://pantry-pal.jerome-baille.fr) to see it in action!

## Technologies Used

- Frontend:
  - Angular
  - SCSS
  - Angular Material (Mat Angular)

- Backend:
  - Node.js
  - Express.js

- Database:
  - MySQL
  - Sequelize (ORM)

## Features

- User Authentication:
  - Register and log in to your account.
  - Update your account details, including username and password.
  - Delete your account.

- Recipe Management:
  - Create, read, update, and delete recipes.
  - Input recipe details, including title, source, durations (cooking time, preparation time), ingredients, instructions, and notes.

- Grocery List Generation:
  - Select recipes to automatically generate a grocery list.
  - Manage your grocery list as a to-do list, marking items as purchased.

- Cooking Timers:
  - Set timers for each step of your recipes to make cooking easier.

## Installation

To run the Pantry Pal app locally, follow these steps:

1. Clone this repository.
2. Navigate to the frontend and backend directories and install dependencies using `npm install`.
3. Set up your MySQL database and update the configuration in the backend.
4. Run the backend server using `npm start` in the backend directory.
5. Run the frontend using `ng serve` in the frontend directory.

## Usage

1. Register or log in to your account.
2. Access your profile to modify your account details.
3. Click on "Create recipe" to add your own recipes.
4. When viewing the full list of recipes, click the plus button to select recipes for your grocery list.
5. Access the grocery list page to see your auto-generated list and check off purchased items.

## Contributing

Contributions to Pantry Pal are welcome. Please submit issues or pull requests.

## License

This project is licensed under the MIT License.

## Authors

- [Jerome BAILLE](https://github.com/Jerome-Baille) - Frontend Development
- [Jerome BAILLE](https://github.com/Jerome-Baille) - Backend Development

## Contact Information

For questions or support, please contact through [my website](https://jerome-baille.fr).

## Acknowledgments

- Thanks to the Angular, Node.js, and Sequelize communities for their fantastic tools and libraries.
- Inspired by the love of cooking and the need for an organized kitchen.
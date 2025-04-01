# Recipe Book

A modern web application for organizing and managing your favorite recipes. Built with React, Vite, and Firebase.

## Features

- User authentication (email/password)
- Recipe management with image upload support
- Organize recipes by cookbook, author, and cuisine type
- Search and filter recipes
- Responsive design
- Material-UI components

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Firebase account and project

## Setup

1. Clone the repository:

```bash
git clone <repository-url>
cd RecipeBook
```

2. Install dependencies:

```bash
npm install
```

3. Create a Firebase project and enable:

   - Authentication (Email/Password)
   - Firestore Database
   - Storage

4. Create a `.env` file in the root directory with your Firebase configuration:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

5. Start the development server:

```bash
npm run dev
```

## Usage

1. Sign up for a new account or log in with existing credentials
2. Add new recipes with images, ingredients, and instructions
3. Organize recipes by cookbook and cuisine type
4. Search and filter recipes by various criteria
5. View recipe details and instructions

## Technologies Used

- React
- Vite
- Firebase (Authentication, Firestore, Storage)
- Material-UI
- React Router

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

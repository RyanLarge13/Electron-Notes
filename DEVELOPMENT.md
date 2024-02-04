# Development Environment Setup Guide

This guide provides instructions on setting up the development environment for [Your Project Name] using Electron with Vite.

## Prerequisites

Before you start, ensure that you have the following installed on your machine:

- [Node.js](https://nodejs.org/) (LTS version recommended)
- [npm](https://www.npmjs.com/) (comes with Node.js)
- [Git](https://git-scm.com/)

Please checkout the api for connecting to the server built for this application before development
[Server](https://github.com/RyanLarge13/Notes-Server)

## Getting Started

1. Clone the repository to your local machine:

   ```
   bash
   git clone https://github.com/RyanLarge13/Electron-Notes.git
   ```

2. Navigate to your project directory

```
cd your-project
```

3. Install deps

```
npm install
```

4. Start the dev server

```
npm run dev
```

5. Build your project

```
npm run build:<OS>
```

This command will generate optimized production-ready files in the dist directory.

## Additional Commands

npm run lint: Lint the project files.
npm run test: Run tests if applicable.

## Debugging

For debugging purposes, you can use the following commands:

npm run inspect: Run the application in inspect mode.
npm run debug: Start the application with the Node.js debugger.

## Contributing

If you're interested in contributing to the project, please refer to the Contributing Guidelines.

Happy coding!

Make sure to adjust the URLs, paths, and commands according to your actual project structure and needs. If there are additional setup steps or specific configuration required for Electron with Vite in your project, you may want to include those details in this guide as well.

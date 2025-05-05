# ApplyPhD

**ApplyPhD** is your personalized PhD application tracker.  
Easily add schools, track your letters of recommendation, generate customized Statements of Purpose (SOPs), and get **dynamic professor recommendations** based on your research interests.

> ⚠️ **Note:** This is a demo version. More schools and professors can be added by updating the CSV file at:
>
> `src/professors_final_combined2.csv`

---

## 🚀 Getting Started

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

---

## 📦 Installation

### 1. Clone the repository

```bash
git clone https://github.com/your-username/applyphd.git
cd applyphd
2. Install dependencies
bash
Copy
Edit
npm install
Install required PDF parsing dependency:

bash
Copy
Edit
npm install pdfjs-dist@2.16.105
3. Set up your OpenAI API key
Create a .env file in the root directory with the following content:

env
Copy
Edit
REACT_APP_OPENAI_API_KEY=your_openai_api_key_here
💻 Available Scripts
In the project directory, you can run:

npm start
Runs the app in development mode.
Open http://localhost:3000 to view it in the browser.

The page will reload if you make edits.
You may also see lint errors in the console.

npm test
Launches the test runner in interactive watch mode.

npm run build
Builds the app for production to the build folder.
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.
Your app is ready to be deployed!

npm run eject
Note: This is a one-way operation. Once you eject, you can’t go back!

If you aren’t satisfied with the build tool and configuration choices, you can eject at any time.
This command will copy all configuration files and dependencies into your project so you have full control over them.

Customize Professors & Schools
To add or update schools and professors, edit the following CSV file:
src/professors_final_combined2.csv

This file powers the dropdown menus and the recommendation engine in the app.


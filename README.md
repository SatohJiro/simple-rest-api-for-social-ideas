# Backend Project

## Introduction

This project is an Express-based backend server that integrates with Firebase, Twilio, and Google Generative AI to provide various services, including generating and saving captions, as well as user authentication via access codes sent to phone numbers.

Before you begin, ensure you have signed up for free accounts on the following services:
- [Firebase](https://firebase.google.com) (for database)
- [Twilio](https://www.twilio.com) (or any SMS API of your choice, e.g., [sms.to](https://sms.to)) (for messaging)


## Installation

1. **Clone the Repository**
    ```bash
    git clone https://github.com/yourusername/your-backend-repo.git
    cd your-backend-repo
    ```

2. **Install Dependencies**
    Using npm:
    ```bash
    npm install
    ```
    Using yarn:
    ```bash
    yarn install
    ```

## Environment Variables

Create a `.env` file in the root of your project and add the following environment variables:

```plaintext
PORT=3000
FIREBASE_DATABASE_URL=your_firebase_database_url
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number
GOOGLE_API_KEY=your_google_api_key
```

## Firebase Setup
1. Obtain the serviceAccountKey File:
Go to the Firebase Console: https://console.firebase.google.com/
2. Select your project.
Click on the gear icon next to "Project Overview" and select "Project settings".
3. Navigate to the "Service accounts" tab.
Click on "Generate new private key".
4. Confirm and download the serviceAccountKey.json file.
5. Place this file in the root of your project directory.


## API Endpoints
* Create New Access Code
URL: /createNewAccessCode
Method: POST
Body Parameters:
phoneNumber: The phone number to receive the access code.
* Validate Access Code
URL: /validateAccessCode
Method: POST
Body Parameters:
accessCode: The access code received.
phoneNumber: The phone number used.
* Generate Post Captions
URL: /generatePostCaptions
Method: POST
Body Parameters:
socialNetwork: The social network for which captions are generated.
subject: The subject of the post.
tone: The tone of the post.
* Get Post Ideas
URL: /getPostIdeas
Method: POST
Body Parameters:
topic: The topic for generating post ideas.
Create Captions from Ideas
URL: /createCaptionsFromIdeas
Method: POST
Body Parameters:
idea: The idea for generating captions.
* Save Generated Content
URL: /saveGeneratedContent
Method: POST
Body Parameters:
topic: The topic of the content.
data: The generated content.
Headers:
phone_number: The phone number of the user.
* Get User Generated Contents
URL: /getUserGeneratedContents
Method: GET
Query Parameters:
phone_number: The phone number of the user.
* Unsave Content
URL: /unsaveContent
Method: POST
Body Parameters:
captionId: The ID of the caption to unsave.

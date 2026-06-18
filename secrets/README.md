# Firebase Admin credentials

1. Open [Firebase Console](https://console.firebase.google.com/) → **toy-box-a9e2d** → Project settings → **Service accounts**.
2. Click **Generate new private key** and save the JSON file here as:

   `firebase-service-account.json`

3. In `.env` set:

   ```
   FIREBASE_SERVICE_ACCOUNT_PATH=./secrets/firebase-service-account.json
   ```

4. For iOS push: Project settings → **Cloud Messaging** → upload your APNs `.p8` key, then set `APNS_BUNDLE_ID` in `.env`.

Do not commit the JSON file (it is gitignored).

# Email_API for AtlasPlanner

This is a microservice that automatically sends an email 
to both recipient and participant of reservation details.
Email gets automatically sent for the following actions:

- Creating a user profile (for the host)
- Deleting reservation (done from participant's side)
- Creating reservation (done from participant's side)
- Canceling a reservation (done from host's side)

Written in Node & uses MongoDB/Express/GCP/Firebase/nodeemailer.

How to run it:
- Run "gcloud auth login" to login into your Google account. Set Project_ID to atlasplanner.
- Set environment variable for GOOGLE_APPLICATION_CREDENTIALS by setting it to pathway of secret file.
- Run "node server.js" to run server locally om port 7000.

How to deploy:
- App.yaml already sets up the instance config.
- Run "gcloud app deploy". This should take minutes before new version is served.
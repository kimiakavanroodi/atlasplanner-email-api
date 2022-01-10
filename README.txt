#Email_API for AtlasPlanner

This is a microservice that autoautomatically sends an email 
to both the recipient and participant of the reservation details.
Email gets automatically sent for the following actions:

- Creating a user profile (for the host)
- Deleting reservation (done from participant's side)
- Creating reservation (done from participant's side)
- Canceling a reservation (done from host's side)

Written in Node & uses MongoDB/Express/GCP/Firebase/nodeemailer.


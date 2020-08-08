# Join My Trip - frontend
Repository frontend project Join My Trip

# Developed by
David de Lamo

## Description
An app to find a partner for your holiday trip either hosting someone at home or proposing a trip waiting for your partner to find you.

## User stories
### As host:
- As a host I want to define the location of my home
- As a host I want to upload images of my place
- As a host I want to give a desccription of my place
- As a host I want to define the conditions
- As a host I want to define the disponibility calendar
### As route planner:
- As a planner I want to define either a place or a route
- As a planner I want to define the conditions of the trip
- As a planner I want to define my main interests
### As client:
- As a client I want to contact with a host or planner
- As a client I want to mark an announcement as favorite
### As general user:
- As a user I want to signup
- As a user I want to login
- As a user I want to have a profile photo
- As a user I want to post my past trips

## Routes
|Method|URL|Description|
|---|---|---|
GET | / | Home page
GET | /auth/login | Renders auth/login form
POST | /auth/login | Redirects to /profile if user is logged in correctly
GET | /auth/signup | Renders auth/signup form
POST | /auth/login | Redirects to /profile if user is registered in correctly
GET | /profile | Renders profile page

## Models
User model:
- username: String
- password: String
- email: String,
- picture: String,
- country: String,
- languages: [String]
- birth: Date

## Links
### Trello
https://trello.com/b/hzEDhsJd/project-mod-3-join-my-trip
[Trello]
### Frontend Repository
https://github.com/dlamo/join-my-trip-frontend
[GitHub]

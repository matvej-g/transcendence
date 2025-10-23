### ft_transcendence ###

### Main parts of the project:
- frontend
- backend
	- database
	- pong game
- docker, nginx (http server)

### important things to remember
- always have a working main branch, so we can always test
- before git push: pre-push hook -> automatic validation tests
- using docker, so its working for all of us in the same way

# mandatory part subject
- mimimal technical requirements:
	- if backend, we have to use PHP (if we do not use framework)
	- frontend should use typescript (if no frontend module)
	- webiste must be single-page application, back and forward buttons should work
	- must be compatible with firefox
	- when browsing the site, user mustnt find unhandled errors or warnings
	- we must use Docker
- game
	- players must play pong locally on the same keyboard
	- tournament system should be available
	- registration system
	- matchmaking system
	- must adhere to the default frontend constraints
- security concerns
	- paswords must be hashed
	- protected against SQL
	- if backend -> https
	- implement validation mechanisms for forms and any user input
	- it’s essential to prioritize the security of your website

# modules
- we need at least 7 major modules to get 100%
- modules I consider reasonable:
	- backend framework (major)
	- database (minor)
	- frontend framework (minor)
	- remote players (major)
	- multiplayer (major)
	- multiple languages (minor)
	- ...
	-> probably it makes sense to decide modules when we split in parts
		so everyone can choose what they want to implement in their part

# question to talk about in team
- decide deadline -> between years or 3/4.01.
- introduction of each person: name, state of resources, knowledge
- which modules do we want to implement?
- who will do which part?
- how do we organise pushing to main without conflicts?
- git

# parts I said that I am interested in
Modules:
[x] Use a framework to build the backend (major) -> David will do backend
- Use a framework or toolkit to build the front-end (minor)
[x] Use a database for the backend -and more (minor) -> will do David
- User management: Implement remote authentication (major)
- Introduce an AI opponent (major)
- Designing the Backend as Microservices (major)
- Multiple language support (minor)
- Add accessibility for Visually Impaired Users (minor)

General:
- Docker (Microservices module modifies it)
- git test for pushing

I would prefer to do
- Frontend of the website (mandatory part)
- Use a framework or toolkit to build the front-end (minor)

if needed I could do:
- Add accessibility for Visually Impaired Users (minor)
- Multiple language support (minor)
- Support on all devices (minor)
- Introduce an AI opponent (major)
- Docker

# Questions for meeting 20.10.
- should I do another call on slack for a 5th person? -> wait for person that will decide thursday
- who will do graphic of the game? -> find out later (?)
- Docker: nginx + each person has their own container and then we do docker compose to start all together? -> david

# next steps
- look into click-up workspace
- try to understand how all parts depend on each other
- find a source to learn typescript and tailwind css
- do a mini piscine to get into syntax
- find out how to implement tests for git push

### --- Day 1: 22.10.2025 --- ###
- whatching videos about webdevelopment
	- https://www.youtube.com/watch?v=N5DBkIBd-PM
	- https://www.youtube.com/watch?v=rs5Z3uc0RMU
	- https://www.youtube.com/watch?v=8PMLZ3hkKXM - video about connecting frontend to backend

- To connect TypeScript frontend with a pure PHP backend without a framework, we'll use HTTP requests to communicate between the two systems.

### --- Day 2: 23.10.2025 --- ###
- getting familiar with clickup https://app.clickup.com/90151763983/v/wb/2kyqdg0f-575
- how does it make sense to start learning frontend development?
	- learn html
	- learn css
	- learn typescript
	- structured learning: code cademy (javascript), ztm (fullstack)
- small project ideas for learning
	- very small: page with a button that changes text when i click it
	- little bigger: notes app with create, edit, delete

- try out debug flow:
	- reproduce the error
	- isolate the smallest part of code that is breaking
	- read the error message out loud
	- print values, add logs
	- google exact error message
	- skim documentation
	- still stuck after 20+ min -> Ask, share, use AI -> understand and rewrite the solution instead of just copy pasting

- about typescript and javascript:
	- TypeScript is JavaScript plus additional features
	- All JavaScript code is valid TypeScript code
	- TypeScript compiles down to regular JavaScript

- registered for odins project https://www.theodinproject.com/
- finished introduction to html
- started with basics of CSS

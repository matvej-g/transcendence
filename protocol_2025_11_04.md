# Protocol, 4th November 2025

### new member: Mert (merdal)
- modules he would like to do:
	- login part: 2 factor authentication (major)
	- remote authentication (major)
-> is ok for everyone

### browser discussion
- any security check can not be done in the typescript part

### what ivan tried to do
- authentication
- wrote ts script for login and register (button that will be connected to backend)
- question: how does tailwind css work? We dont need to do css?
- middleware login button which will be connected to david's backend
	- visible button (milena)
	- working part of button - middleware (ivan)
	- connected to backend (david)
- how to compile typescript with html?
	- compile it first to javascript and then it works

### structure
- david will push his docker container
- then slowly start making containers for each part

- 1. david pushes to main
- 2. Ivan pushes login / register.ts (without backend calls) funcs
- 3. Milena makes some login page
- 4. ivan/milena link it and check that it console.logs
- 5. david links to the backend api (no security checks yet)

### how to do frontend - backend - communication for the game?
- maybe too early to talk about it
- we have to use web sockets for communication

### 2 factor authentication
- ivan said he was doing already something with login

### modules so far definitely
- Milena:
	- frontend (mandatory)
	- tailwind css (minor)
	- (anything else if needed)
- David:
	- backend php (mandatory)
	- database (minor)
	- (anything else if needed)
- Ivan:
	- Usermanagent (major)
	- live chat (major)
	- (microservices (minor))

- Matthias:
	- gameplay (mandatory)
	- remote players (major)
	- serverside rendering (minor)
	- (game costumization (minor))
	- ((AI algo (minor)))

- Mert
	- 2 factor authentication (major)
	- remote authentication (major)
	- (anything else if needed)

that makes in total:
- 3 minors (4. one could be microservices but we will decide it further )
- 5 majors

## Next meeting: Wednesday 12. november

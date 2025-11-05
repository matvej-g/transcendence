# ft_transcendence

## Main parts of the project:
- frontend
- backend
	- database
	- pong game
- docker, nginx (http server)

### important things to remember
- always have a working main branch, so we can always test
- before git push: pre-push hook -> automatic validation tests
- using docker, so its working for all of us in the same way

### mandatory part subject
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

### modules
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

### question to talk about in team
- decide deadline -> between years or 3/4.01.
- introduction of each person: name, state of resources, knowledge
- which modules do we want to implement?
- who will do which part?
- how do we organise pushing to main without conflicts?
- git

### parts I said that I am interested in
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

### Questions for meeting 20.10.
- should I do another call on slack for a 5th person? -> wait for person that will decide thursday
- who will do graphic of the game? -> find out later (?)
- Docker: nginx + each person has their own container and then we do docker compose to start all together? -> david

## next steps
- look into click-up workspace
- try to understand how all parts depend on each other
- find a source to learn typescript and tailwind css
- do a mini piscine to get into syntax
- find out how to implement tests for git push

## Connection between frontend and backend
- To connect TypeScript frontend with a pure PHP backend without a framework, we'll use HTTP requests to communicate between the two systems.

## learning tips:
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

## HTML
- prepare structure: type '!' in first line and enter
- use stylesheet: <link rel="stylesheet" href="styles.css"> (in head)
- all content goes to body


## CSS
- Selectors:
	-Selectors refer to the HTML elements to which CSS rules apply; they’re what is actually being “selected” for each rule (for example p, div, .class, #ID).

- the cascade:
	- A CSS declaration that is more specific will take precedence over less specific ones.
	- inline styles > ID selectors (most specific selector) > Class selectors > Type selectors
	- https://2019.wattenberger.com/blog/css-cascade#level_3_1

- inspector
	- call with F12 or right klick -> inspect

- boxes:
	- Everything in CSS has a box around it
	- content (for example text)
	- padding (space between border and content)
	- border (thickness of border)
	- margin (space to next elements (highest number counts))
	-  margin: <margin-top> || <margin-right> || <margin-bottom> || <margin-left>
	- box-sizing: border-box; (so hieght and width are effected on the whole box)
	- https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics/Box_model
		(read again if needed about inline / block)

- block and inline:
	- display: block -> each new element will start in new line
	- display: inline -> elements appear in new line with elements they are placed beside
	- In general, you do not want to try to put extra padding or margin on inline elements.
	- description and a list of all the default block and inline elements:
		https://www.w3schools.com/html/html_blocks.asp

- div and span:
	- They are just generic boxes that can contain anything.
	- Div is a block-level element by default. It is commonly used as a container element to group other elements. Divs allow us to divide the page into different blocks and apply styling to those blocks.
	- Span is an inline-level element by default. It can be used to group text content and inline HTML elements for styling and should only be used when no other semantic HTML element is appropriate.

- normal layout flow
	- Elements on a webpage lay out in normal flow if you haven't applied any CSS to change the way they behave.
	- Starting with a solid, well-structured document that's readable in normal flow is the best way to begin any webpage.

## typescript
- about typescript and javascript:
	- TypeScript is JavaScript plus additional features
	- All JavaScript code is valid TypeScript code
	- TypeScript compiles down to regular JavaScript

## tailwind css
- CSS frameworks are like toolkits for making websites look good without having to start from scratch.
- Utility-first frameworks like Tailwind CSS give you lots of small design choices that you can put together in different ways.
- https://www.creative-tim.com/twcomponents/
	- Tailwind Components is a site where you can find lots of different parts made with Tailwind CSS
	- Each part has a live preview and the code you can copy to use in your own projects.
	- You can look for specific parts or browse categories to find what you need.

## meeting 27.10.2025
- blackhole days
- typescript - server - php -
- nginx -> start of backend
- from there: routed to controllerthings (php)
- ask andy/tilek if we need a domain or if it should work just locally or in one network?

## structure of website
- draw with pen and paper
- then use Figma

### User management
- Users can securely subscribe to the website.
- Registered users can securely log in.
- Users can select a unique display name to participate in tournaments.
- Users can update their information.
- Users can upload an avatar, with a default option if none is provided.
- Users can add others as friends and view their online status.
- User profiles display stats, such as wins and losses.
- Each user has a Match History including 1v1 games, dates, and relevant details, accessible to logged-in users.

-> that means:
	- register form with
		- nickname
		- password
		- upload avatar (or just in menu later?)
		- already registered? -> go to login

	- login form
		- nickname
		- password
		- (second factor like code)

	- TABS:
		- Profile: view/edit
			- change nickname
			- change password
			- change avatar
			- Match history
				- 1v1 games
				- dates
				- relevant details
			- Stats:
				- display stats, such as wins and losses
		- Friends:
			- add others as friends (with or without confirmation of friend?)
			- view their online status
		- Game
			- play against another player online
			- tournament
		- Home
			- ?
		- Logout

### remote authentication
- need to add anything that we already have in user management?
- "Implement user-friendly login and authorization flows that adhere to best practices and security standards"
- ask Mert

### 2 factor authentication
- requiring users to provide a secondary verification method, such as a one-time code, in addition to their password
-> in login form
- ask Mert

### game play
- options to choose on this site:
	- play against another player
	- tournament
- both options lead to site of Matthias (?)

### live chat
- send direct messages to other users
- block other users, preventing them from seeing any further messages from the blocked account
- invite other users to play a Pong game through the chat interface
- tournament system should be able to notify users about the next game
- user should be able to access other players’ profiles through the chat interface

### main website after login - tabs
- Profile
	- Match history
		- 1v1 games
		- dates
		- relevant details
	- Statistics:
		- display stats, such as wins and losses
	- list of friends

- Game
	- play against another player online
		- choose from friends list
	- tournament
	- notification about invitations

- Friends
	- search bar: enter nickname -> add user as friend (or send request?)
	-( friend requests (drop down friend requests - confirm, not confirm))
	- list of friends with avatar and online status
	- each friend has a list with:
		- delete
		- (send message)
		- (play game)

- Chat
	- search bar: enter nickname
	- open chat
	- top of chat nickname with dropdown:
		- block user
		- invite user to play
		- view profile

- Settings (dropdown)
	- change nickname
	- change avatar
	- change password

- Logout
	- goes back to home (login page)

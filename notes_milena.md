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

### Selectors:
-Selectors refer to the HTML elements to which CSS rules apply; they’re what is actually being “selected” for each rule (for example p, div, .class, #ID).

### the cascade:
- A CSS declaration that is more specific will take precedence over less specific ones.
- inline styles > ID selectors (most specific selector) > Class selectors > Type selectors
- https://2019.wattenberger.com/blog/css-cascade#level_3_1

### inspector
- call with F12 or right klick -> inspect

### boxes:
- Everything in CSS has a box around it
- content (for example text)
- padding (space between border and content)
- border (thickness of border)
- margin (space to next elements (highest number counts))
-  margin: <margin-top> || <margin-right> || <margin-bottom> || <margin-left>
- box-sizing: border-box; (so height and width are effected on the whole box)
- https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics/Box_model
	(read again if needed about inline / block)

### block and inline:
- display: block -> each new element will start in new line
- display: inline -> elements appear in new line with elements they are placed beside
- In general, you do not want to try to put extra padding or margin on inline elements.
- description and a list of all the default block and inline elements:
	https://www.w3schools.com/html/html_blocks.asp

### div and span:
- They are just generic boxes that can contain anything.
- Div is a block-level element by default. It is commonly used as a container element to group other elements. Divs allow us to divide the page into different blocks and apply styling to those blocks.
- Span is an inline-level element by default. It can be used to group text content and inline HTML elements for styling and should only be used when no other semantic HTML element is appropriate.

### normal layout flow
- Elements on a webpage lay out in normal flow if you haven't applied any CSS to change the way they behave.
- Starting with a solid, well-structured document that's readable in normal flow is the best way to begin any webpage.

### flex-box
- nice understandable resource:
	https://www.joshwcomeau.com/css/interactive-guide-to-flexbox/
- cheat-sheet:
	https://flexbox.malven.co/

- A flex container is any element that has display: flex on it. A flex item is any element that lives directly inside of a flex container.
- you can also put "display: flex" on a flex item and then use flexbox to arrange its children.
- The flex declaration is actually a shorthand for 3 properties that you can set on a flex item.
	- In this case, flex is actually a shorthand for flex-grow, flex-shrink and flex-basis.
	- flex: 1; => equates to: flex-grow: 1, flex-shrink: 1, flex-basis: 0.
	- flex-grow expects a single number as its value, and that number is used as the flex-item’s “growth factor” -> controls how the extra space is distributed when the items are smaller than their container.
	- flex-shrink is similar to flex-grow, but sets the “shrink factor” of a flex item. flex-shrink only ends up being applied if the size of all flex items is larger than their parent container. It controls how space is removed when the items are bigger than their container.
		-  If you do not want an item to shrink then you can specify flex-shrink: 0;
		- when the parent is too small, the default behavior is for them to shrink to fit.
	- flex-basis sets the initial size of a flex item, so any sort of flex-growing or flex-shrinking starts from that baseline size
		- In a Flex row, flex-basis does the same thing as width.
		- In a Flex column, flex-basis does the same thing as height.
		- when you specify "flex: 1" on an element, it interprets that as "flex: 1 1 0"
		- If you want to only adjust an item’s flex-grow you can do so directly, without the shorthand
		. or: "flex: 1 1 auto", which is also equivalent to using "flex: auto".
	- Generally, you’re most likely to use declarations like flex: 1; to make divs grow evenly and flex-shrink: 0 to keep certain divs from shrinking.
- https://www.w3.org/TR/css-flexbox-1/#flex-common

- Axes:
	- "flex-direction: row;" -> horizontal
		- block-level elements default to the full width of their parent
	- "flex-direction: column;" -> vertical
		- block-level elements default to the height of their content
		- with a div as flex item and "flex: 1" it would not work
			- div doesnt have a height as default
			- flex-basis = 0, which means that all flex-growing and flex-shrinking would begin their calculations from 0
			- fix: flex: 1 1 auto
			- or: set height of flex container
		- when the flex-direction is column, flex-basis refers to height instead of width.

- Alignment
	- justify-content: (i.e. center or space-between) -> aligns items on primary/main axis (default: horizontally, unless flex-direction: column -> vertically)
	- align-items (i.e. center) -> aligns items on cross axis (default: vertically)
	- gap: 8px; -> Setting gap on a flex container adds a specified space between flex items, similar to adding a margin to the items themselves.
	- use margin: auto -> uses the leftover space like a gap
	- In Flexbox, everything is based on the primary axis.
	- The children will be positioned by default according to the following 2 rules:
		1. Primary axis: Children will be bunched up at the start of the container.
		2. Cross axis: Children will stretch out to fill the entire container.
	- align-self is applied to the child element, not the container. It allows us to change the alignment of a specific child along the cross axis.
	- difference between the primary/cross axis:
		- When we're talking about alignment in the cross axis, each item can do whatever it wants.
		- In the primary axis, though, we can only think about how to distribute the group.
	- justify — to position something along the primary axis.
	- align — to position something along the cross axis.
	- content — a group of “stuff” that can be distributed.
	- items — single items that can be positioned individually.

- minimum size
	- Text inputs have a default minimum size of 170px-200px (it varies between browsers).
	- The Flexbox algorithm refuses to shrink a child below its minimum size. The content will overflow rather than shrink further, no matter how high we crank flex-shrink!
	- We can redefine the minimum size with the min-width property.

- wrap
	- flex-wrap: wrap -> items won't shrink below their hypothetical size. At least, not when wrapping onto the next row/column is an option!

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
- introduction: https://albudi.medium.com/a-comprehensive-introduction-to-tailwind-css-36bc9cb81a1c
- tutorial: https://www.geeksforgeeks.org/css/tailwind-css/

## php
- PHP processes data from databases or APIs before generating HTML, allowing for dynamic content
- can create html content based on real-time data
- Updates automatically when data changes
- PHP runs on the server before HTML is delivered

### Use direct HTML when:
	Creating simple, static websites
	pixelperfecthtml.com
	Building landing pages
	Making portfolio sites
	Creating documentation

### Use PHP generation when:
	Building dynamic web applications
	Creating content management systems
	Developing e-commerce platforms
	Managing user-specific content

### Generally:
- Each page should habe a static base with dynamic blocks (such as friends list) in php (or typescript that calls backend/database for updated infos)

## meeting 27.10.2025
- blackhole days
- typescript - server - php -
- nginx -> start of backend
- from there: routed to controllerthings (php)
- ask andy/tilek if we need a domain or if it should work just locally or in one network?

## structure of website
- draw with pen and paper
- then use Figma
- or any other tool that I like https://cpoclub.com/tools/best-free-prototyping-tools/
- maybe try out https://miro.com/de/signup/

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
	-( list of friends)

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


## time management
- my next dates for trying exam05:
	- 11.12.
	- 18.12.
	- 23.12. (???)
- trip to Germany:
	- 10.12. (wednesday) or 17.12.
	- -> week before: preparing
	- -> means I should finish rough project until end november (impossible)
	- 12.-17.12. -> Schwarzwald??
	- stay there until christmas
- TÜV?
	- maybe also 12.12.?
	- or in january?
- take off at work
	- 22./23.12.
	- 29./30.12.
	- 5.1.
- planned evaluationd date:
	- 3.1.
	- what if we get 3 more weeks?
		- -> 24.1.
		- I could try exam on
			- 8.1.
			- 15.1.
			- 22.1.

- if we evaulate on 24.1.
	- try exam on 18.12. (and 23.12.)
	- maybe try exam also 11.12. and ask Sybille for Schwarzwald
	- do another trip on 14.01.
	- do TÜV
	- Bettina 17.01.
	- exam 15.01.
	- exam 22.01.
	- take off at work 19./20.01.

- Absence notice
	- 6.10. - 7.11.

## docker continer frontend
- install dependencies:
	- npm install tailwindcss
	- (things Ivan protocolled)

## to talk about in team meeting 12.11. (or write on slack)
- Ask if 3 weeks blackhole salvation is possible for Ivan
- Ask if new eval date 24.01. would be fine for everyone
- Ivan did parts of me -> talk about how to devide those things
	- he did html with some tailwind css and typescript
	- I could do more detailed css
	- would be useful to advise each other what we are working on to avoid double work
- Add name headers to the files so we know who wrote the code

## questions for Nico
- how does frontend and backend connect to each other?
- in example of user management -> who will write the typescript? Me or Ivan?

## general questions:
- will all data come in json format from the backend? -> yes

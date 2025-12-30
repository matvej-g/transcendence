### ft_transcendence ###

### --- Day 1: 22.10.2025 --- ###
- whatching videos about webdevelopment
	- https://www.youtube.com/watch?v=N5DBkIBd-PM
	- https://www.youtube.com/watch?v=rs5Z3uc0RMU
	- https://www.youtube.com/watch?v=8PMLZ3hkKXM - video about connecting frontend to backend

### --- Day 2: 23.10.2025 --- ###
- getting familiar with clickup https://app.clickup.com/90151763983/v/wb/2kyqdg0f-575
- registered for odins project https://www.theodinproject.com/
- finished introduction to html
- started with basics of CSS

### --- Day 3: 24.10.2025 --- ###
- did exercises of odin project
	- 01 css-methods
	- 02 class-id-selectors
	- 03 grouping selectors
	- cascade

### --- Day 4: 30.10.2025 --- ###
- did exercises of odin project
	- 04 Chaining selectors
	- 05 descendent combinator
- inspecting html and css in browser inspector (f12)

### --- Day 5: 31.10.2025 --- ###
- reading about foundations box model
- reading about block and inline
- todo:
	- block and inline exercises

### --- Day 6: 05.11.2025 --- ###
- short introduction to tailwind css
- thought about structure of website

### --- Day 6: 06.11.2025 --- ###
- do exercises about block and inline
- add CSS to my recepies
- read lessons about flex-box

- to-do:
	- create time-management-plan for transcendence (having in mind to do exam05)
	- ask for doctors note

### --- Day 7: 07.11.2025 --- ###
- think about time management
- ask for doctor's note
- continue lessons about flex-box

### --- Day 8: 12.11.2025 --- ###
- look at code on master
	- -> checkout what Ivan did
	- to access localhost in wsl: python3 -m http.server 8080 --bind 172.25.37.144 --directory site/public
- think about next steps
- think about what do talk about in meeting today
- get overview tailwind css
- read something about php
- call david
- meeting

- to-do:
	- container for frontend

### --- Day 9: 13.11.2025 --- ###
- try out some container versions to run frontend separated

### --- Day 10: 14.11.2025 --- ###
- added recent versions of Ivans frontend and made it run in single container
- call with david:
- connected frontend container with backend and nginx

### --- Day 11: 19.11.2025 --- ###
- issues:
	- localhost:8080 -> 404 in firefox
	- 127.0.0.1:8080 -> 404 also in google chrome
	- is it my problem or is it a general problem?
- do exercises about flexbox 1 - 2
- meeting

- todo:
	- finish exercises flexbox
	- start structure of website with html and css (transforming it to / using tailwind css)
		- profile (which could be landing page)
		- friends
		- (game choice)
		- chat
		- navigation menu on top of each page
	- in agreement with repective module-person
	- get into javascript / typescript

### --- Day 12: 20.11.2025 --- ###
- exercises about flexbox 3 - 6

### --- Day 13: 21.11.2025 --- ###
- exercises about flexbox 7

### --- Day 14: 26.11.2025 --- ###
- started skelet of profile page
- read about single page application
- meeting

### --- Day 15: 27.11.2025 --- ###
- continued with profile page

- todo:
	- transform into tailwind css
	- put it together with the registration/ login part
	- activate / deactivate sections
	- adjust css to have one color theme(?)

### --- Day 16: 28.11.2025 --- ###
- finished profile page html/css
- transformed it to tailwind css

### --- Day 17: 03.12.2025 --- ###
- read something about javascript
- think about how to organize spa
- edit profile html so navbar elements are with <a>
- merged index and profile into one file
- use pretend-login button to do activate / disactivate sections
- did some style changes

- todo:
	[x] export script into ts file
	[ivan] apply changes on login button like i did on pretend login
	[x] settings dropdown should be in the middle
	[x] show footer also with auth -> in line "Show/hide navbars and footer based on section" -> remove hidden



### 17.12. questions for team
- did ivan do the chat frontend? -> not yet
- http & css for chat -> ivan
- what choices do we have for game? -> look in slack what he wrote
- language button - its above the logout button and I dont know how to integrate it in a flex way
	-> does Ivan know it? no
- game is too big for my screan
	-> eather flexible size
	-> or smaller size would be good
- permission denied when I try http://localhost:8080/api/users
	-> cd backend
	-> mkdir -p tmp/logs
	- make it writable by the webserver user (common: www-data). Replace if different.
	- sudo chown -R www-data:www-data tmp/logs
	-> sudo chmod -R 0777 tmp/logs

me:
- remove placeholders like game stats
- do http for friends

### --- Day 18 - 19.12.2025 --- ###
- put script things from index into extra file router.ts
- added safe fallback and router:notfound event.
- Todo:
	[x] how to include language button in landing page?? (moved it beneath)
	[x] adjust game section (flex and margin)
	? - could we have http files outside of index? To avoid merge issues
	[x] create html friends
	[x] logout button should really logout (probably delete id-variable)
	[x] what did Mert mean with that the profile should be prtoected?
		-> add check if user is logged in and if they have the correct JWL if they want to access profile page (also if types #profile in URL)

### --- Day 19 - 20.12.2025 --- ###
- trying to get into http requesting
- call with David
- questions:
	- how to organize navigation? (navigation from Ivan do I need it? Or do I need just router.ts?)
	- steps: get User Id (is return value from login api point) and store it in frontend variable, then I can fetch any user data
	- curl -X PATCH http://localhost:8080/api/user/changePassword \
  		-H "Content-Type: application/json" \
  		-d '{
    	"id": "6",
    	"oldPassword": "heyhey",
    	"newPassword": "heyheyhey"
  		}'
	- curl -X GET http://localhost:8080/api/users
	- curl -X PATCH http://localhost:8080/api/status/online \
	-H "Content-Type: application/json" \
	-d '{
    "id": "1"}'
- nickname placeholder is now fetched nickname from id = 1
- for now hardcoded


### --- Day 20 - 21.12.2025 --- ###
- understand better code
- store id after login / register
- init profile after login / register / pretend login (id = 2 in pretendLogin)

- asked:
	- ? david: to insert more testing data into test user (like match and stats)
	- ? david: how and where we store avatars?
	- ? matthias: user stats : are they already as we want them? I think  they should be as I got them in the frontend
	- ? matthias: wenn Spiel startet und ich auf den zurück button klicke, geht Spiel weiter und ich komme auf seite raus, auf der ich vor der SPielübersicht war -> wie händeln?

- login / logout -> setOnline and offline with api point
	-> not working yet because it requires a token
	-> should maybe also always be proved before loading the profile?



### --- Day 21 - 22.12.2025 --- ###
- developing prototype for friends page
- restructure ts-files -> all api requests should go to api.ts
- did typescript for search-friend-button

- todo:
	- profile:
		- match history : there should be also date
		- get data from other placeholders
		- update profile when new data
		- match history recenter

	- friends:
		[x] understand search friend button and debug self-friendship
		[x] delete written content in searchbar after searching
		[x] add possibility to search with enter
		[x] send request button
		[x] get real data for friends
		[x] get real data for friendrequests
		[x] accept friendship button
		[x] refuse button
		[x] delete button

	- settings:
		- add edit email-address
		- make them do something

	- general:
		- think about how to handle the localStorage when more than 1 users are logged in
		- Ensure that JWT tokens are issued and validated securely to prevent unauthorized access to user accounts and sensitive data.
		- delete inserted things from login page
		- german language part

### --- Day 22 - 23.12.2025 --- ###
- tel David
- registered on postman
- fixed bug of self friendship request in searchButton
- delete written content in searchbar after searching
- added possibility to search with enter
- tried to change docker so all changes in frontend will be applied directly, didnt manage
- send request button works now

- todo:
	- list of requests: how to distinguish between what I requested and what I got?

### --- Day 23 - 24.12.2025 --- ###
- searchResultMessage will fade out after a few seconds
- will be green if request was sent
- send appropriate error message if request was already sent to this friend

### --- Day 24 - 26.12.2025 --- ###
- request list is shown
- accept and refuse button work

- todo:
	- before sending friend request I could check if blocked (?)
	- or just update status if request already exists
	- refresh friends page should work properly

### --- Day 25 - 28.12.2025 --- ###
- friends list
- automatic list reload after pressing accept or refuse
- added border to friendslist and requestlist

- todo:
	[x] bug: sometimes at first call of friends page the friends and requests are loaded twice
	- search friends: doesnt find nickname with empty space (David Huss) -> ask david




### --- private stuff ---
AGR (Abgasrückführungsventil) und Ladedruckventil wurde 2024 ausgetauscht
Steuergerät zeigt immer noch Ladedruckfehler an
Fahrgestellnummer: VN1J9CJH53919281

Termin in Woche vom 19.01., vorzugsweise Montag

### Meeting
- talk about the deadline
- I think we need to commit to a date, otherwise it keeps shifting
- my proposal: January 24th

- Ivan: I can underestand that there are concerns, but it would help to name concrete risks
- what exactly do you think wont be finished by then? Maybe we can look at that concretely rather than extending the deadline again
- which specific part do you think is unrealistic to finish by then?
- Is there one task that feels critical, or is it more a general concern?
- can we maybe brake this down into concrete points?
- instead if moving the deadline again, I think it would be better to focus on what exactly feels risky and see how we can distribute tasks to adjust the scope to make 24th realistic

- from the beginning our plan was eraly january
- we already postponed by 3 weeks
- four out of five team members are comfortable with January 24th
- changing it again would significantly affect individual planning
- February was never part of the plan
- for me, moving the deadline further would be quite difficult due to work, existing commitments and an extra trip to Germany
- unless there are very concrete problems I think we should commit to January 24th
- if there appears a concrete blocker we could address it immediately as a team

# track progress for transcendence

## todos
[] define unknown concepts and add sources
[] dive deeper into backend concepts
[] watch remaining php tutorials from work
[] watch api tutorial from work
[] research GDPR compilance
	[] https://commission.europa.eu/law/law-topic/data-protection/legal-framework-eu-data-protection_en 

## ====== Day 1 == 11.10 ====== (2h) => 2h
- Online Meeting discussing the project

## ====== Day 2 == 12.10 ====== (7h) => 9h
- thinking about preferred Modules and tasks
	- backend in php (mandatory)
	- database module (minor)
	- User Management (major)
	- optionally GDPR compliance (minor)
- go through subject and identify unknown concepts
- reread subject guidlines
- find some basic information about backend
- finished intro php tutorial from work

## ====== Day 3 == 20.10 ====== (6h) => 15h
- did some research on build php framework
	- https://www.youtube.com/watch?v=u3hN_r1DwSQ (41:19)
	- https://www.youtube.com/watch?v=nfIURhvknac&list=PLFbnPuoQkKseimWeA4UFo1BPFTeXnv_1S&index=4 (6:19)
- made first structure of framework
- thought about container setup for nginx and php/sqlite
- Router and Dispatcher in pure php
	- https://vivasart.com/en/blog/how-to-create-a-basic-router-in-pure-php
- 45min of structuring project
- sqlite video
	- https://www.youtube.com/watch?v=8Xyn8R9eKB8 

## ====== Day 4 == 22.10 ====== (2h) => 17h
- added debugging
	- dump()
	- die()
- found good video on php should watch the whole thing
 - https://www.youtube.com/watch?v=fw5ObX8P6as

## ====== Day 5 == 23.10 ====== (6h) => 23h 
- worked on Router class
	- https://www.youtube.com/watch?v=fw5ObX8P6as (6:00:00)
- worked on PDO and sqlite
	- basics of how php connects to sqlite
	- sql injections protection
- 3:40:00 on video
- setup minimal working docker environemnt for nginx and php-fpm
- can switch between different pages in view
	- front controller creates request
	- request is instance of superglobals
	- creates kernel
	- routes uri to the correct controller (should be separated later)
	- controller opens page in view
	- when clicking to a different page in router the requests are sent to the front controller

## ====== Day 6 == 25.10 ====== (3h) => 26h
- looked into autoloading
	- video 5:21:00
	- integrated small autoloading to get better overview of directory strcutre and complexity
- looked into namespacing and use
	- integrated namespacing together with autoloading -> better overview
- added helper functions dir and file

## ====== Day 7 == 27.10 ====== (2h) => 28h
- online meeting
- added Readme for starting everything
- integrated router class
	- still needs better handling with regex for dynamic situations but handles some incoming things

## ====== Day 8 == 29.10 ====== (4h) => 32h
- added Class Controller that can handle functionality instead of only displaying static pages
- Implemented basic database query structure
	- Model/Repository class that has query functions
		- reusable query functiosns
	- Controller calls the query functions
		- maintains readability of code	
- now possible to search for users in database based on query string
- finished basic request/response cycle 

## ====== Day 9 == 30.10 ====== (4h) => 36h
- watched video on Services and Service Containers
- created enum for http Status codes
	- needs to be extended
- added basic DB setup on volume setup
	- Creates a users table and adds a user
	- users table can be queryed using controller
- made database writeable
	- changed ownership to www-data for db folder and db file

## ====== Day 10 == 31.10 ====== (3h) => 39h
- watched video on XSS attacks
- watched video on forms
- watched video on how to deal with xss attacks
- implemented a basic validator class

## ====== Day 11 == 03.11 ====== (2h) => 41h
- watched video on API
	- https://www.youtube.com/watch?v=XvFmUE-36Kc&list=PL_c9BZzLwBRIHUNeoywVJXViXGEsk6PDr 
- watched video on Status codes
	- https://www.youtube.com/watch?v=doR604EaOhM&list=PL_c9BZzLwBRIHUNeoywVJXViXGEsk6PDr&index=2
- thought about table structure for database
	- noted in clickup

## ====== Day 12 == 04.11 ====== (2h) => 43h
- meeting
- added Database Table Creation to init script
- though about api endpoints and regex
	- need to understand variable regex logic

## ====== Day 13 == 05.11 ====== (1h) => 44h
- looked for information on more advanced router using regex
	- https://www.youtube.com/watch?v=0vqSdP0dEDk (7:21)
	- middleware (30:00)
	- regex (1:00:00)

## ====== Day 14 == 08.11 ====== (2h) => 46h
- watched video on regex
- implemented simple regex pattern matching for correct controller selection
- now the matches extracted from the regex are passed to the controllers and can be accessed inside them
- possible to extract user specific data from the database

## ====== Day 15 == 11.11 ====== (1h) => 47h
- took notes on nginx
- fixed database init

## ====== Day 16 == 12.11 ====== (5h) => 52h
- fixed nginx config to serve dummy frontend and api requests
- meeting
- added MatchesController
	- can show all matches
	- can get a match by id
	- can create a match
		- not entirely functional need more info about POST request
- fixed UserController
	- can show all users
	- can get a user by id
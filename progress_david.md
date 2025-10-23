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
# Notes on Transcendence

## generally unknown concepts in subject mandatory part
The following chapters deal with unknown concepts mentioned in the subject. This should provide a better overview for the project.  

### single-page application

(Source: https://en.wikipedia.org/wiki/Single-page_application)

### password hashing

### SQL injections

### XSS attacks

### HTTPS connection

### validation mechanisms for forms and user input

### API route protection

### 

## Mandatory Specific concepts

### backend
- saves and manages data
- requires server and database
	- server to receive requests and send responses 
	- Database to store and manage data
- use programming language or framework to define what types of requests are allowed and how they should be handled
- list of all the different types of requests that the backend allows is called API (Application Programming Interface)
	- requests that is not allowed by API, backend will respond with an error

- (Source: https://www.youtube.com/watch?v=XBu54nfzxAQ)

### request
- what the client sends to the server
	- to get or send data
	- server will send response back
- typically consists of
	- server endpoint URL
		- the address of the resource
		- https://api.example.com/users
	- request method
		- GET -> retrive data
		- POST -> create existing data
		- PUT -> replace existing data
		- PATCH -> update part of existing data
		- DELETE -> remove data
	- Headers
		- provide metadata like authentication tokens, content type
	- Body (optional)
		- Data sent with methods
		- often in JSON format

- GET Request
	- to get data from a source via the internet
		- typing into the browser and going to a website is a GET Request
		- server sends back the page
- POST
	- send data to a server
	- data can be used to create or update data in a database
		- create an account on a user form
		- server sends back status of success for example
- query parameters
	- way to send additional information in a http request
		ex: ?test=test
		ex: https://www.youtube.com/results?search_query=test

### response
- what the server sends back after processing the request
- consists of
	- Status Code indicating success or failure
		- ex: 404 page not found
		- 200-level codes mean Success
		- 400-level codes mean something went wrong with our request
		- 500-level codes mean something went wrong at the server level
	- Header
		- Metadata about the response
			- content type, caching info
	- response body
		- JSON

### API (Apllication Programming Interface)
-set of rules and protocols that allows one piece of software (the client) to cummunicate with another (the server)
- Application
	- any software that has a specific purpose or functionallity
- Interface
	- Protocol that dictates how two applications talk to each other using requests and responses
- each requests and response cycle is an API call
- Statelessness:
	- each API request is indepent (server does not remember previous interactions)
- JSON is the most common format for exchanging data

- (Source: https://www.youtube.com/watch?v=bxuYDT-BWaI)


### REST (Representational State Transfer)
- most common naming convention and architectural style for APIs
	- REST API
- defines principles and constraints that make APIs simple, predictable and scalable
- Post = create something
- Get = get something
- Delete = delete something

- resources are grouped by noun 
	- correct
		- /v3/products
	- incorrect
		- /v3/getAllProducts
- Stateless
	- the two parites don't store information about each other
	- every request and response are independent of each other
- (Source: https://www.youtube.com/watch?v=-mN3VyJuCjM) 

### JSON
- JavaScript Object Notation
- testbased file format used for storing and transfering data
	- typically between webserver and client
- used for storing user submission forms
- used for validating email adresses
- Syntax
	- data is represented in key-value pairs separated by ":"
	- "," separates them for another key-value pair
	- "{}" determine objects
	- "[]" determine arrays
- Data Types
	- string
	- int or float
	- booleans
	- null
	- objects 
	- arrays
- Storing Json Data
	- Objects stores key:value pairs called properties
		- key is a string, value is data type
	- Arrays

- (Source: https://www.youtube.com/watch?v=cj3h3Fb10QY)
	
### Microservices
- Split Service into conceptual backend Parts
	- example: Orders Backend, Email Backend, Payments Backend
- helps keep code base smaller and more focused

### php
- PHP Manual
	- https://www.php.net/manual/en/ 
- Functionality
	- when .php file is requested the server looks for it and executes it
	- sends the execute .php file -> html as response

- Syntax
	- opening & closing tags	
		- <?php ?>
	- indexed arrays
		- $arr = array($var1, $var2, $var3);
		- add to the array with
			- $arr[] = 'whatever';
	- associative arrays
		- $pancake = array(
			'name' => 'Pancake',
			'age' => '1 year',
			'weight' => 9,
			'bio' => 'Treat and Snoozin!',
			'filename' => 'pancake.png'
		);
		- reference with <?php echo $pancake['age']; ?>
		- add key => value pair to the associative array
			- $pancake['breed'] = 'Bulldog';
	- multidimensional array
		- arrays in arrays

	- foreach ($arr as $var)
		- sets $var to the value of each item as we loop
	- var_dump($arr);
		- prints all the information about a varialbe
	- die();
		- stopps rest of the page from rendering
	- bool array_key_exists('age', $cutePet)
		- returns true if key exists in array

	- when writing own functions
		- function get_pet() {};
	- require and load functions from another file
		- <?php
			require 'lib/functions.php';
		?>
		- move functions into lib/functions.php
		- and require inside the file where the function is needed
		- could separate Footer and Header into different files and require them in new files so that every new page has the same header and footer
	- require_once
		- only calls once
		- for initialisation
	- include
	- include_once
		- same as require but won't throw error when file is missing
- JSON
	- php and JSON easy to encode
		- json_encode(php_array)
			- converts php arrays to json
		- json_decode(json, true)
			- converts json to php 
			- returns associtave array when true is set
- load contents of a file
	- $file = file_get_contents('filename');
- save contents to a file
	- int file_put_contents(string $filename, mixed $data)


### docker
- Docker Documentation
	- https://docs.docker.com/manuals/

### nginx
- nginx Documentation
	- https://nginx.org/en/docs/

## Module Specific concepts

### SQLite
- SQLite Documentation
	- https://www.sqlite.org/docs.html

- is serverless

- sqlite3 <filename>
- .shell clear
	- clear shell
- .databases
	- shows path to databases main: /Users/david/projects/trans/intro.db r/w
- .help

- Creating a table always a key value
	- CREATE TABLE <name>(
		- id INTEGER PRIMARY KEY,
			- INTEGER => int
			- PRIMARY KEY => always need a primary key
			- always separate columns with ","
		- name TEXT NOT NULL,
			- TEXT => string
			- NOT NULL => required
		- UNIQUE
			- musst be individual
		- created_at DATETIME DEFAULT CURRENT_TIMESTAMP
			- if you don't pass a value it will default to the creation time of the user
			- no comma on last one
		- finish with )
	- .tables
		- can view tables
	
- alter tables
	- ALTER TABLE users ADD COLUMN status TEXT;

- delete tables
	- DROP TABLE users;

- add values to tables
	- INSERT INTO users(name, username)
	- VALUES ('David Huss', 'dhuss42');

- add multiple values at once
	- INSERT INTO users(name, username)
	- VALUES ('John Smith', 'Js'), ('Sal Smith', 'ss'), ('Cole Conner', 'cc');

- read data from table
	- SELECT * FROM users;

- read specific data from table
	- SELECT * FROM users;
	- WHERE username='js';

- possible to work inside file
	- intro.sql
	- .read intro.sql

- updateing Data
	- UPDATE users SET email = 'newemail@gmail.com' WHERE  id = 1;
		- WHERE is important so that not everything us update put something specific like the id =1 here

- deleting Data
	- DELETE FROM users WHERE id = 2;

- create foreign key for relationable data
	- CREATE TABLE post (
	id INTEGER PRIMARY KEY,
	user_id INTEGER REFERENCES users(id),
	title TEXT,
	body
	);
		- now post table and users table are linked to each other

- JOIN the tables
	- SELECT * FROM post 
	- JOIN users ON post.user_id = users.id;

- See the headers of a column
	- .headers on

### 

### gdpr (General Data Protection Regulation)
- regulation that aims to protect the personal data and privacy of individuals within the European Union and European Economic Area (Source: subject)
	- rules on how organisations should handle and process personal data (Source: subject)
- Legal framework of EU data protection
	https://commission.europa.eu/law/law-topic/data-protection/legal-framework-eu-data-protection_en

### data privacy rights

### 
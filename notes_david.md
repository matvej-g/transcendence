# Notes on Transcendence

## generally unknown concepts in subject mandatory part
The following chapters deal with unknown concepts mentioned in the subject. This should provide a better overview for the project.  

### single-page application

(Source: https://en.wikipedia.org/wiki/Single-page_application)

### password hashing
- the process of using a cryptographic function to convert a user's plain-text password into a fixed-length, seemingly random string of characters called a hash

- string password_hash(string $password, mixed $algo, [array $options])
	- creates a new password hash of the string using one of the available hashing algorithm
		- returns the hash as 60 chars
		- however allocate 255 just in case increase
	- Algorithms
		- PASSWORD_DEFAULT
			- bycript -> balanced security and performance
		- PASSWORD_BCRYPT
		- PASSWORD_ARGON2I
			- stronger security
		- PASSWORD_ARGON2ID

- bool password_verify(string $password, string $hash)
	- once the password is hased you cannot retrieve the original
	- need this function, verifies inf passed string matches the hashed password

(Source: https://www.geeksforgeeks.org/php/how-to-encrypt-and-decrypt-passwords-using-php/)

### SQL injections
- untrusted user input is placed directly into an SQL query string
	- /?id=1; drop table users;
		- will delete all users if not handled properly if you have something like the following
		- $id = $_GET['id'];
		- $query = "select * from posts where id = {$id}";
		- SOLUTION: never inline data into a query string but use a place holder "?"
			- then pass the query and the data (id) separately to sqlite
				- prepare($query)
				- statement->execute([$id])

(Source: 03:05:54 https://www.youtube.com/watch?v=fw5ObX8P6as)

### XSS attacks
- Cross Site Scripting
	- Reflected (non-persistent)
		- input was reflected back in the response and idenfiied as script and is executed
	- Stored
		- input is not just reflected back but also persisted (stored in a database), injects everyone who views the page
	- DOM
		- 
	- Mutation
		- user input is changed in some way by the browser before inserting in the DOM
	- java script injection technique
- SOP (Same Origin Policy)
	- Policy that stops one website from reading or writing data to another
	- Checks for three things
		- Protocol
		- Host
		- port
		- if all three are same for different origins then the browser allows cross origin read/write
		

### HTTPS connection

### validation mechanisms for forms and user input
- Forms
	- when submitting a form, the data is passed in the query string
		- form inputs have to include a corresponding name
		- a form will submit using a GET request
		- can be changed with <form method="POST">
			- also transfers the data but as part of the message data not inside the query string 

- Escape untrusted Input
	- inside front-end
		- htmlspecialchars(<body of form>)
			html input passed in form is treated as string
- Form validations
	- handle empty data
		- require attribute for Form data (browser layer of validation)
			- can be circumvented with curl -X POST localhost:Port/uri -d 'body='
	- handle input length
		- password 
			- min / max
		- form submition
			- min
- simple validator class

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
		- PATCH -> update part of existing data (selectively)
			- should be idempotent
				- if you execute something multiple times the end result should be the same
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

### Body
- return an array
	- not considered best pratice
- return an object
- return data as nested object

### Status Codes
- Most important ones
	- 200 -> Everything ok
	- 201 -> created
	- 204 -> no content
	- 301 -> move permanently
	- 302 -> 
	- 400 -> bad request
	- 403 -> Fobbiden (unauthorized)
	- 404 -> not found
	- 500 -> internal server error

- Common use cases and Responses
- GET many
	- 200, 
		returns some data or an [ ] (empty array)
- GET single
	- 200, 
		returns an object
	- 404 if object does not exist
- POST
	- 200, 201 for creating new data, 
		returns id of the newly created thing or new object entirelt
	- 400 if you give bad data to request
	- 500 if not working properly
- PUT/PATCH
	- 200
		- updated object back
	- 204
		- does not return object
	- 404
		- if resource we are trying to update does not exist
	- 400 for bad data
	- 500 for issue on server
- DELETE
	- 204
	- 200
		- response is number of effected rows
	- 404
		- if resource does not exist
	- 500

- Client flow
	- how the client reacts to what is happening on the server

- middle ware
	- things that can happen before or after the request/response that can modify it


### API (Apllication Programming Interface)
- set of rules and protocols that allows one piece of software (the client) to cummunicate with another (the server)
- Application
	- any software that has a specific purpose or functionallity
- Interface
	- Protocol that dictates how two applications talk to each other using requests and responses
- each requests and response cycle is an API call
- Statelessness:
	- each API request is indepent (server does not remember previous interactions)
- JSON is the most common format for exchanging data
- (Source: https://www.youtube.com/watch?v=bxuYDT-BWaI)

- Types
	- REST
		- uses http and works with JSON
	- SOAP
		- alternative to REST
		- legacy/Enterprise systems 
		- uses XML (more complex than JSON)
	- GraphQl
		- interacts with a backend
			- backend has one graphql endpoint that the front end/app can connect too 
			- frontend provides query
			- backend provides appropriate response
	- gRPC
		- google Remote Procedure Call protocol
		- uses protocol buffers
			- reduces size of data to allow for fast transfer between apps
	- WebSocket
		- bidirectional channel to communicate
		- Frontend opens connection
		- as long as connection is maintained communication can happen from either direction
		- for Real time application
			- chat
			- notification

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

- http methods
	- like GET
- resource
	- Entity, Item, db record
- endpoints
	- combination of method + path
		- path is a url describing what resource you are trying to interact with
- http responses
- JSON
	- to communicate back and forth

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

### autoloading
- declase a base path that points to the root of the project
	- const BASE_PATH = __DIR__ . '/../';
- function base_path($path)
	return BASE_PATH . $path;

- function view($path)
	return (base_path('views/' . $path));

spl_autoload_register(function ($class) {
	require base_path('src/' . $class . '.php');
});

- extract()
	- accepts an array and turns that array into a set of variables
		- name of variable is the key
		- value of variable is the value associated 

### namespacing
- defines the "namespace" that all code in the file belongs to
- namespace 'Structure'
- in paths were the data is required use: use Namespace\classname

- when using classes that are not within the defined namespace but are used in the file
	- use '\' before it, tells it to look from the global namespace
		- \PDO::
	- or at the top of the file
		- use PDO;
- use Framework\Http\Response as HttpResponse;
	- rename to avoid conflicts

### Service
- A plain php class that does work
	- logger, mailer, database connection, controller
- instiated by Service Container
	- creates the Service just once and returns same object same time
	

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

### pdo (php data objects)
- $pdo = new PDDO($dsn)
	- $(dsn) is a connection string to connects to the database, Port, host
	- $dsn = "database:host=nbr;port=nbr;dbname=name;charset=utf8mb4";
	- for sqlite it is only the path
- $statement = $pdo->prepare("select from posts");
	- prepare a query to send to sqlite
- $statement->execute();
	- sqlite executes the query
- $post = $statement->fetchAll(PDO::FETCH_ASSOC);
	- fetch data as an associative array

### gdpr (General Data Protection Regulation)
- regulation that aims to protect the personal data and privacy of individuals within the European Union and European Economic Area (Source: subject)
	- rules on how organisations should handle and process personal data (Source: subject)
- Legal framework of EU data protection
	https://commission.europa.eu/law/law-topic/data-protection/legal-framework-eu-data-protection_en

### data privacy rights

### 
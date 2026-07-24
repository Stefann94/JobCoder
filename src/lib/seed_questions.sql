-- =====================================================================
-- FULL QUIZ SEED: Questions for All 11 Domains
-- Run this in Supabase SQL Editor.
-- Step 1: Update category group_names for better Hub grouping
-- Step 2: Delete old questions and insert 110 new ones (10 per domain)
-- =====================================================================

-- =====================================================================
-- STEP 1: Update category group_names for more detailed Hub sections
-- =====================================================================
UPDATE categories SET group_name = 'Frontend & UI' WHERE id = 'frontend';
UPDATE categories SET group_name = 'Frontend & UI' WHERE id = 'mobile';
UPDATE categories SET group_name = 'Backend & Data' WHERE id = 'backend';
UPDATE categories SET group_name = 'Backend & Data' WHERE id = 'database';
UPDATE categories SET group_name = 'Logic & Problem Solving' WHERE id = 'algorithms';
UPDATE categories SET group_name = 'Architecture & Scale' WHERE id = 'system_design';
UPDATE categories SET group_name = 'Architecture & Scale' WHERE id = 'devops';
UPDATE categories SET group_name = 'Security & Quality' WHERE id = 'security';
UPDATE categories SET group_name = 'Security & Quality' WHERE id = 'testing';
UPDATE categories SET group_name = 'Network & Protocols' WHERE id = 'networking';
UPDATE categories SET group_name = 'Soft Skills' WHERE id = 'behavioral';

-- =====================================================================
-- STEP 2: Clear existing questions, then insert full curriculum
-- =====================================================================
DELETE FROM questions;

-- =====================================================================
-- 1. FRONTEND LOGIC (10 questions)
-- =====================================================================
INSERT INTO questions (category_id, question, options, correct_answer, explanation, difficulty) VALUES
('frontend', 'What does the "virtual DOM" do in React?',
 '["Directly manipulates browser HTML elements", "Creates a lightweight copy of the real DOM for efficient updates", "Replaces CSS styling entirely", "Compiles JavaScript into native code"]',
 1, 'The virtual DOM is an in-memory representation of the real DOM. React compares the previous and current virtual DOM (diffing) and only updates the parts that changed, making updates much faster.', 'Medium'),

('frontend', 'Which hook would you use to run code after every render in React?',
 '["useState", "useEffect", "useMemo", "useRef"]',
 1, 'useEffect runs after the component renders. By default (with no dependency array), it runs after every render. With an empty array, it runs only once on mount.', 'Easy'),

('frontend', 'What is event delegation in JavaScript?',
 '["Assigning events to every child element individually", "Attaching a single event listener to a parent element to handle events from its children", "Preventing events from firing", "Delegating events to Web Workers"]',
 1, 'Event delegation leverages event bubbling. Instead of attaching listeners to each child, you attach one to the parent and use event.target to determine which child was clicked. This is more memory-efficient.', 'Medium'),

('frontend', 'What is the purpose of the "key" prop in React lists?',
 '["It styles list items uniquely", "It helps React identify which items changed, were added, or removed", "It makes the list sortable", "It connects the list to an API"]',
 1, 'Keys help React''s reconciliation algorithm identify elements. Without stable keys, React may re-render entire lists unnecessarily or mix up component state.', 'Easy'),

('frontend', 'What does "closures" mean in JavaScript?',
 '["A function that has access to variables from its outer (enclosing) function scope", "A function that closes the browser window", "A method to close database connections", "A CSS property for hiding elements"]',
 0, 'A closure is created when a function retains access to variables from its lexical scope, even after the outer function has returned. This is fundamental to callbacks, event handlers, and data privacy patterns.', 'Medium'),

('frontend', 'What is the difference between "==" and "===" in JavaScript?',
 '["There is no difference", "== compares with type coercion, === compares without type coercion", "=== is used for strings only", "== is deprecated"]',
 1, '"==" performs type coercion before comparing (e.g., "5" == 5 is true). "===" is strict equality — it checks both value AND type without coercion (e.g., "5" === 5 is false).', 'Easy'),

('frontend', 'Which CSS property creates a flexible container?',
 '["display: block", "display: flex", "display: grid-only", "position: flexible"]',
 1, 'display: flex creates a flex container. Its direct children become flex items that can be aligned, distributed, and sized using properties like justify-content, align-items, and flex-grow.', 'Easy'),

('frontend', 'What does "debouncing" do in frontend development?',
 '["Delays the execution of a function until a specified time has passed since it was last called", "Executes a function immediately on every keystroke", "Removes event listeners automatically", "Compresses JavaScript files"]',
 0, 'Debouncing is a performance technique. It delays function execution until the user stops triggering events (e.g., typing in a search box). This prevents excessive API calls or expensive computations.', 'Hard'),

('frontend', 'What is the purpose of React.memo()?',
 '["It stores data in localStorage", "It memoizes a component to prevent unnecessary re-renders when props haven''t changed", "It creates memos between components", "It replaces Redux"]',
 1, 'React.memo() is a higher-order component that wraps a functional component. If the props passed to it haven''t changed between renders, React skips re-rendering it — a key performance optimization.', 'Medium'),

('frontend', 'What is the CSS "box model"?',
 '["A 3D rendering engine", "A model that describes how elements are rendered: content, padding, border, and margin", "A layout system for mobile only", "A JavaScript animation framework"]',
 1, 'Every HTML element is a rectangular box composed of 4 layers: content (the actual text/image), padding (space around content), border (the edge), and margin (space outside the border).', 'Easy');

-- =====================================================================
-- 2. BACKEND ARCHITECTURE (10 questions)
-- =====================================================================
INSERT INTO questions (category_id, question, options, correct_answer, explanation, difficulty) VALUES
('backend', 'What does REST stand for?',
 '["Representational State Transfer", "Remote Execution Service Technology", "Real-time Event Stream Transfer", "Relational Entity Storage Tool"]',
 0, 'REST (Representational State Transfer) is an architectural style for APIs. It uses standard HTTP methods (GET, POST, PUT, DELETE) and is stateless — each request contains all information needed to process it.', 'Easy'),

('backend', 'What is middleware in Express.js?',
 '["A database driver", "A function that has access to the request, response, and next middleware in the pipeline", "A frontend component", "A CSS preprocessor"]',
 1, 'Middleware functions execute between receiving a request and sending a response. They can modify req/res objects, end the request cycle, or call next() to pass control to the next middleware. Used for auth, logging, error handling, etc.', 'Medium'),

('backend', 'What is the event loop in Node.js?',
 '["A for-loop that runs events", "A mechanism that allows Node.js to perform non-blocking I/O by offloading operations to the system kernel", "A CSS animation cycle", "A database polling system"]',
 1, 'The event loop is the core of Node.js''s asynchronous nature. It continuously checks for pending callbacks, timers, and I/O operations, executing them when ready. This is how Node handles thousands of concurrent connections with a single thread.', 'Hard'),

('backend', 'What is the purpose of a JWT (JSON Web Token)?',
 '["Styling web pages", "Securely transmitting information between parties as a JSON object that is digitally signed", "Querying databases", "Compiling JavaScript"]',
 1, 'JWTs consist of three parts: Header, Payload, and Signature. They''re commonly used for authentication — after login, the server issues a JWT that the client sends with subsequent requests to prove identity.', 'Medium'),

('backend', 'What HTTP status code means "Not Found"?',
 '["200", "301", "404", "500"]',
 2, '404 means the server cannot find the requested resource. Common codes: 200 (OK), 201 (Created), 301 (Moved Permanently), 400 (Bad Request), 401 (Unauthorized), 403 (Forbidden), 500 (Internal Server Error).', 'Easy'),

('backend', 'What is CORS and why does it exist?',
 '["A CSS framework", "A browser security feature that restricts web pages from making requests to a different domain than the one serving the page", "A Node.js package manager", "A database query language"]',
 1, 'Cross-Origin Resource Sharing (CORS) is a security mechanism. Browsers block frontend JavaScript from making requests to different origins by default. Servers must explicitly allow cross-origin requests via headers.', 'Medium'),

('backend', 'What is the difference between SQL and NoSQL databases?',
 '["SQL is faster, NoSQL is slower", "SQL uses structured schemas with tables, NoSQL uses flexible schemas with documents/key-values", "NoSQL replaces SQL entirely", "There is no real difference"]',
 1, 'SQL databases (PostgreSQL, MySQL) use rigid table schemas and excel at complex queries/joins. NoSQL databases (MongoDB, Redis) offer flexible schemas and are optimized for specific access patterns like document lookups or key-value caching.', 'Medium'),

('backend', 'What does "stateless" mean in the context of REST APIs?',
 '["The server stores session data for each client", "Each request must contain all information needed to process it; the server retains no client state between requests", "APIs don''t return data", "Only GET requests are allowed"]',
 1, 'Statelessness means the server treats each request as independent. No session data is stored server-side between requests. This makes APIs more scalable because any server can handle any request.', 'Medium'),

('backend', 'What is rate limiting?',
 '["Limiting the database query speed", "Controlling the number of requests a client can make to an API within a time window", "Reducing server CPU speed", "Limiting the size of HTTP responses"]',
 1, 'Rate limiting protects APIs from abuse, DDoS attacks, and overuse. Common implementations include token bucket and sliding window algorithms. Example: "100 requests per minute per API key."', 'Easy'),

('backend', 'What is an ORM?',
 '["Object-Relational Mapping — a tool that lets you interact with databases using your programming language instead of raw SQL", "A frontend framework", "A type of API authentication", "A CSS methodology"]',
 0, 'ORMs like Prisma, Sequelize, and TypeORM map database tables to objects in your code. Instead of writing raw SQL, you use methods like User.findMany(). They improve productivity but can hide performance issues.', 'Easy');

-- =====================================================================
-- 3. DATA MANIPULATION / DATABASES (10 questions)
-- =====================================================================
INSERT INTO questions (category_id, question, options, correct_answer, explanation, difficulty) VALUES
('database', 'What does a PRIMARY KEY constraint do?',
 '["Allows duplicate values", "Uniquely identifies each row in a table and cannot be NULL", "Deletes old records automatically", "Creates a backup of the table"]',
 1, 'A PRIMARY KEY enforces two rules: uniqueness (no two rows can have the same key) and NOT NULL (every row must have a value). It''s the foundation of relational database design.', 'Easy'),

('database', 'What is the difference between INNER JOIN and LEFT JOIN?',
 '["They are identical", "INNER JOIN returns only matching rows from both tables; LEFT JOIN returns all rows from the left table plus matching rows from the right", "LEFT JOIN is faster", "INNER JOIN works only with numbers"]',
 1, 'INNER JOIN returns the intersection — only rows with matches in both tables. LEFT JOIN returns ALL rows from the left table, with NULLs for non-matching right-table columns. Critical for preserving "orphan" records.', 'Medium'),

('database', 'What does the GROUP BY clause do?',
 '["Sorts data alphabetically", "Groups rows that share the same values in specified columns, typically used with aggregate functions", "Deletes grouped records", "Joins two tables"]',
 1, 'GROUP BY collects rows into groups based on column values. It''s almost always used with aggregate functions like COUNT(), SUM(), AVG(). Example: SELECT department, COUNT(*) FROM employees GROUP BY department.', 'Easy'),

('database', 'What is database normalization?',
 '["Making the database faster", "Organizing tables to reduce data redundancy and improve data integrity", "Encrypting all data", "Converting SQL to NoSQL"]',
 1, 'Normalization follows progressive rules (1NF, 2NF, 3NF, etc.) to eliminate redundant data. For example, instead of storing a customer''s address in every order row, you create a separate customers table and reference it.', 'Medium'),

('database', 'What does ACID stand for in database transactions?',
 '["Atomicity, Consistency, Isolation, Durability", "Automatic, Controlled, Indexed, Distributed", "Add, Create, Insert, Delete", "Asynchronous, Cached, Incremental, Dynamic"]',
 0, 'ACID guarantees reliable transactions: Atomicity (all or nothing), Consistency (valid state transitions), Isolation (concurrent transactions don''t interfere), Durability (committed data survives crashes).', 'Medium'),

('database', 'What is an INDEX in a database?',
 '["A table of contents for a book", "A data structure that improves the speed of data retrieval operations at the cost of additional storage and write overhead", "A backup system", "A type of JOIN"]',
 1, 'Indexes work like a book''s index — instead of scanning every row (full table scan), the database can jump directly to the relevant rows. B-tree indexes are most common. Over-indexing can slow down writes.', 'Medium'),

('database', 'What is a foreign key?',
 '["A key used by foreign databases", "A column that creates a link between two tables by referencing the primary key of another table", "An encrypted password", "A unique constraint"]',
 1, 'Foreign keys enforce referential integrity. If orders.customer_id references customers.id, the database prevents inserting an order with a customer_id that doesn''t exist in the customers table.', 'Easy'),

('database', 'What is the difference between WHERE and HAVING?',
 '["They are the same", "WHERE filters rows before grouping; HAVING filters groups after GROUP BY", "HAVING is used only with INSERT", "WHERE works only with numbers"]',
 1, 'WHERE filters individual rows before any grouping occurs. HAVING filters the results of aggregate functions after GROUP BY. Example: HAVING COUNT(*) > 5 keeps only groups with more than 5 rows.', 'Medium'),

('database', 'What is a SQL transaction?',
 '["A single SELECT query", "A sequence of database operations that are treated as a single unit — either all succeed or all are rolled back", "A payment processing system", "A database backup"]',
 1, 'Transactions wrap multiple operations into an atomic unit. If any operation fails, ROLLBACK undoes all changes. If all succeed, COMMIT makes them permanent. Essential for financial operations and data consistency.', 'Medium'),

('database', 'What is a Common Table Expression (CTE)?',
 '["A permanent table", "A named temporary result set defined within a SQL statement using the WITH keyword", "A type of database driver", "A JavaScript module"]',
 1, 'CTEs improve SQL readability by breaking complex queries into named steps. WITH active_users AS (SELECT ...) SELECT ... FROM active_users. They''re temporary (exist only for that query) and can be recursive.', 'Hard');

-- =====================================================================
-- 4. ALGORITHMS & DATA STRUCTURES (10 questions)
-- =====================================================================
INSERT INTO questions (category_id, question, options, correct_answer, explanation, difficulty) VALUES
('algorithms', 'What is the time complexity of binary search?',
 '["O(n)", "O(log n)", "O(n²)", "O(1)"]',
 1, 'Binary search halves the search space with each step. For an array of 1,000,000 elements, it needs at most ~20 comparisons (log₂ 1,000,000 ≈ 20). This is dramatically faster than linear search O(n).', 'Easy'),

('algorithms', 'What data structure uses LIFO (Last In, First Out)?',
 '["Queue", "Stack", "Array", "Hash Map"]',
 1, 'A Stack follows LIFO — the last element pushed is the first one popped. Think of a stack of plates. Used for function call stacks, undo operations, bracket matching, and DFS traversal.', 'Easy'),

('algorithms', 'What is the worst-case time complexity of QuickSort?',
 '["O(n log n)", "O(n)", "O(n²)", "O(log n)"]',
 2, 'QuickSort''s average case is O(n log n), but its worst case is O(n²) — this happens when the pivot is always the smallest or largest element (e.g., already sorted array with first-element pivot). Randomized pivots mitigate this.', 'Medium'),

('algorithms', 'What is a hash collision?',
 '["When two keys are identical", "When two different keys produce the same hash value and map to the same index", "When the hash table is full", "When sorting fails"]',
 1, 'Hash collisions are inevitable (pigeonhole principle). They''re resolved using chaining (linked lists at each index) or open addressing (probing for the next empty slot). Good hash functions minimize collisions.', 'Medium'),

('algorithms', 'What is dynamic programming?',
 '["Writing code that changes at runtime", "A technique that solves complex problems by breaking them into overlapping subproblems and caching their solutions", "A type of database query", "Real-time programming"]',
 1, 'DP avoids redundant computation by storing results of subproblems (memoization/tabulation). Classic examples: Fibonacci, knapsack, longest common subsequence. The key insight: optimal substructure + overlapping subproblems.', 'Hard'),

('algorithms', 'What is BFS (Breadth-First Search)?',
 '["Searching the deepest nodes first", "Exploring all neighbors at the current depth before moving to the next level, using a queue", "A sorting algorithm", "A binary search variant"]',
 1, 'BFS uses a queue to explore nodes level by level. Starting from a root, it visits all immediate neighbors, then their neighbors, and so on. Used for shortest path in unweighted graphs, level-order traversal.', 'Medium'),

('algorithms', 'What is the two-pointer technique?',
 '["Using two mouse cursors", "Using two indices that move through a data structure to solve problems efficiently, often in O(n) time", "Pointing to two databases", "A CSS positioning trick"]',
 1, 'Two pointers typically start at opposite ends (or at the same end) of a sorted array and move toward each other based on conditions. Used for pair sum, removing duplicates, container with most water, etc.', 'Medium'),

('algorithms', 'What is a binary search tree (BST)?',
 '["A tree where each node has exactly 2 children", "A tree where the left child is less than the parent and the right child is greater", "A tree used only for strings", "A balanced hash table"]',
 1, 'In a BST, for every node: all values in the left subtree are smaller, all values in the right subtree are larger. This enables O(log n) search, insert, and delete operations (when balanced).', 'Easy'),

('algorithms', 'What is the sliding window technique?',
 '["Moving a browser window across the screen", "Maintaining a subset of elements (window) that slides across data to solve subarray/substring problems efficiently", "A CSS animation", "A database pagination method"]',
 1, 'The sliding window avoids recalculating from scratch. Instead of checking every subarray of size k, you add the new element entering the window and remove the one leaving. Reduces O(n×k) to O(n).', 'Medium'),

('algorithms', 'What is the difference between a tree and a graph?',
 '["They are the same thing", "A tree is a special type of graph that is connected, acyclic, and has exactly one path between any two nodes", "Graphs are always faster", "Trees can only store numbers"]',
 1, 'A tree is a connected, acyclic graph with N-1 edges (for N nodes). Graphs can have cycles, multiple paths between nodes, and can be disconnected. Trees have a root; graphs may not.', 'Easy');

-- =====================================================================
-- 5. MOBILE APP DEV (10 questions)
-- =====================================================================
INSERT INTO questions (category_id, question, options, correct_answer, explanation, difficulty) VALUES
('mobile', 'What is React Native?',
 '["A CSS framework for mobile", "A framework for building native mobile apps using JavaScript and React", "A mobile browser", "A database for phones"]',
 1, 'React Native lets you write mobile apps using JavaScript and React components. Unlike hybrid apps (WebView), it renders actual native UI components — giving you near-native performance with web development skills.', 'Easy'),

('mobile', 'What is the difference between React and React Native?',
 '["They are identical", "React targets web browsers (DOM), React Native targets mobile platforms (iOS/Android native components)", "React Native is faster", "React is outdated"]',
 1, 'React renders to the browser DOM (<div>, <span>). React Native renders to native platform views (<View>, <Text>). The core concepts (components, state, props, hooks) are shared, but the rendering targets differ.', 'Easy'),

('mobile', 'What is Expo in React Native development?',
 '["A database", "A set of tools and services built around React Native that simplifies development, building, and deployment", "A CSS preprocessor", "A testing framework"]',
 1, 'Expo provides a managed workflow with pre-built native modules (camera, notifications, file system), development tools (Expo Go for testing), and build services (EAS Build) — eliminating much native configuration.', 'Easy'),

('mobile', 'How does navigation work in React Native?',
 '["Using <a> tags like in web", "Using a navigation library like React Navigation that provides Stack, Tab, and Drawer navigators", "Using CSS routing", "There is no navigation in mobile apps"]',
 1, 'React Native doesn''t have URLs. React Navigation (or Expo Router) provides navigation containers and navigators. Stack Navigator pushes/pops screens, Tab Navigator switches between screens, Drawer Navigator slides a menu.', 'Medium'),

('mobile', 'What is AsyncStorage in React Native?',
 '["Asynchronous JavaScript", "A simple, unencrypted, persistent key-value storage system for React Native", "A cloud database", "A file compression tool"]',
 1, 'AsyncStorage is the React Native equivalent of localStorage. It stores small amounts of data (preferences, tokens) as key-value pairs. For larger or more complex data, use SQLite or MMKV.', 'Easy'),

('mobile', 'What is the purpose of the "useEffect" hook in a mobile app context?',
 '["Styling components", "Running side effects like API calls, subscriptions, or timers after component rendering", "Creating animations", "Managing navigation"]',
 1, 'useEffect handles side effects in functional components. In mobile apps, common uses include: fetching data on screen load, subscribing to device sensors, setting up push notification listeners, and cleaning up resources.', 'Medium'),

('mobile', 'What is a "bridge" in React Native?',
 '["A UI component", "The communication layer between JavaScript code and native platform code (iOS/Android)", "A networking protocol", "A testing utility"]',
 1, 'The bridge serializes messages between the JS thread and native threads. When you call a native API from JavaScript, the bridge translates the call. The New Architecture (Fabric/TurboModules) replaces this with JSI for direct communication.', 'Hard'),

('mobile', 'What is the difference between FlatList and ScrollView?',
 '["They are identical", "ScrollView renders all children at once; FlatList virtualizes the list and only renders visible items for better performance", "FlatList is for images only", "ScrollView is deprecated"]',
 1, 'For long lists (100+ items), FlatList is essential. It only renders items currently visible on screen, recycling off-screen components. ScrollView renders everything at once, which causes memory issues with large lists.', 'Medium'),

('mobile', 'What is deep linking in mobile apps?',
 '["Linking to a deep part of a database", "URLs that open a specific screen within a mobile app, bypassing the home screen", "A type of API call", "Linking CSS files"]',
 1, 'Deep links (e.g., myapp://profile/123) allow external sources (websites, push notifications, other apps) to navigate directly to specific content within your app. Universal Links (iOS) and App Links (Android) enhance this.', 'Medium'),

('mobile', 'What does "offline-first" mean in mobile development?',
 '["The app only works without internet", "The app is designed to work fully offline and syncs data when connectivity is restored", "Disabling network requests", "A testing strategy"]',
 1, 'Offline-first apps store data locally and sync with the server when online. This provides instant load times, works in areas with poor connectivity, and prevents data loss. Technologies: SQLite, WatermelonDB, MMKV.', 'Medium');

-- =====================================================================
-- 6. NETWORKING (10 questions)
-- =====================================================================
INSERT INTO questions (category_id, question, options, correct_answer, explanation, difficulty) VALUES
('networking', 'What is the difference between TCP and UDP?',
 '["TCP is faster than UDP", "TCP guarantees delivery and ordering; UDP is faster but doesn''t guarantee delivery", "UDP is more secure", "They are the same protocol"]',
 1, 'TCP (Transmission Control Protocol) uses handshakes, acknowledgments, and retransmission to ensure reliable delivery. UDP (User Datagram Protocol) skips these for speed. TCP: web pages, emails. UDP: video calls, gaming.', 'Medium'),

('networking', 'What happens when you type a URL in your browser?',
 '["The browser directly contacts the website", "DNS resolves the domain to an IP, browser establishes a TCP connection, sends an HTTP request, and renders the response", "Nothing happens until you press Enter twice", "The URL is sent to Google first"]',
 1, 'The full journey: 1) DNS lookup (domain → IP), 2) TCP three-way handshake, 3) TLS handshake (if HTTPS), 4) HTTP request sent, 5) Server processes and responds, 6) Browser parses HTML/CSS/JS, 7) Page renders.', 'Medium'),

('networking', 'What is DNS?',
 '["Dynamic Network Storage", "Domain Name System — translates human-readable domain names into IP addresses", "Direct Network Service", "Data Normalization Standard"]',
 1, 'DNS is the internet''s phone book. When you type google.com, DNS resolvers query root servers, TLD servers, and authoritative servers to find the IP address (e.g., 142.250.80.46) where that website lives.', 'Easy'),

('networking', 'What is the HTTP status code 301?',
 '["OK", "Moved Permanently — the resource has been permanently moved to a new URL", "Not Found", "Internal Server Error"]',
 1, '301 means the resource has permanently moved. Browsers and search engines will use the new URL going forward. 302 is a temporary redirect. These are crucial for SEO when restructuring URLs.', 'Easy'),

('networking', 'What is a CDN?',
 '["Central Database Network", "Content Delivery Network — a distributed network of servers that delivers content from the server closest to the user", "Code Deployment Node", "Client Data Namespace"]',
 1, 'CDNs cache content (images, videos, scripts) on edge servers worldwide. When a user in Tokyo requests your US-hosted site, they get the cached version from a nearby Asian server — dramatically reducing latency.', 'Easy'),

('networking', 'What is the OSI model?',
 '["A JavaScript framework", "A 7-layer conceptual model that standardizes how network communication works", "A database schema", "An operating system"]',
 1, 'The 7 layers: Physical, Data Link, Network, Transport, Session, Presentation, Application. Each layer handles a specific aspect of communication. Interviewers love asking which layer protocols like HTTP (Application) or TCP (Transport) belong to.', 'Medium'),

('networking', 'What is a WebSocket?',
 '["A hardware component", "A protocol that provides full-duplex, persistent communication channels over a single TCP connection", "A type of API endpoint", "A CSS grid system"]',
 1, 'Unlike HTTP (request-response), WebSockets maintain an open connection where both client and server can send messages at any time. Used for chat apps, live feeds, multiplayer games, and real-time dashboards.', 'Medium'),

('networking', 'What is a load balancer?',
 '["A device that charges batteries", "A system that distributes incoming network traffic across multiple servers to ensure no single server is overwhelmed", "A caching mechanism", "A firewall type"]',
 1, 'Load balancers improve reliability and performance. Algorithms include: Round Robin (rotating), Least Connections (send to least busy server), and IP Hash (consistent routing). Used with horizontal scaling.', 'Medium'),

('networking', 'What is latency vs throughput?',
 '["They mean the same thing", "Latency is the time for a single request to travel; throughput is the total number of requests processed per unit of time", "Latency is about storage, throughput is about memory", "Both are measured in bytes"]',
 1, 'Latency = delay (measured in milliseconds). Throughput = capacity (measured in requests/second or bits/second). A highway analogy: latency is how long the drive takes, throughput is how many cars can drive simultaneously.', 'Medium'),

('networking', 'What is the difference between HTTP/1.1, HTTP/2, and HTTP/3?',
 '["No meaningful differences", "HTTP/2 adds multiplexing and header compression; HTTP/3 uses QUIC (UDP-based) for faster connections", "Each version is slower", "HTTP/3 removes encryption"]',
 1, 'HTTP/1.1: one request per connection (head-of-line blocking). HTTP/2: multiplexing (multiple requests over one connection), header compression, server push. HTTP/3: uses QUIC over UDP for even faster connections and no TCP head-of-line blocking.', 'Hard');

-- =====================================================================
-- 7. DEVOPS & CLOUD (10 questions)
-- =====================================================================
INSERT INTO questions (category_id, question, options, correct_answer, explanation, difficulty) VALUES
('devops', 'What is Docker?',
 '["A programming language", "A platform for building, shipping, and running applications in isolated containers", "A version control system", "A cloud provider"]',
 1, 'Docker packages applications with all their dependencies into containers that run consistently everywhere. Unlike VMs, containers share the host OS kernel, making them lightweight and fast to start.', 'Easy'),

('devops', 'What is the difference between a Docker image and a container?',
 '["They are the same", "An image is a read-only blueprint; a container is a running instance of that image", "Containers are faster", "Images run on mobile only"]',
 1, 'An image is like a class in OOP — a template with instructions. A container is like an object — a live, running instance. You can create multiple containers from the same image, each with its own state.', 'Medium'),

('devops', 'What is CI/CD?',
 '["Customer Interface/Customer Data", "Continuous Integration / Continuous Deployment — automating the build, test, and release process", "Code Inspection / Code Deletion", "Cloud Infrastructure / Cloud Delivery"]',
 1, 'CI: developers merge code frequently, automated tests run on every push. CD: code that passes tests is automatically deployed to staging/production. Tools: GitHub Actions, GitLab CI, Jenkins, CircleCI.', 'Easy'),

('devops', 'What is Kubernetes?',
 '["A programming language", "An open-source container orchestration platform that automates deploying, scaling, and managing containerized applications", "A database", "A frontend framework"]',
 1, 'Kubernetes (K8s) manages clusters of containers. It handles: auto-scaling (more traffic = more containers), self-healing (restart crashed containers), load balancing, rolling updates, and service discovery.', 'Medium'),

('devops', 'What is Infrastructure as Code (IaC)?',
 '["Writing code inside infrastructure", "Managing and provisioning infrastructure through code and configuration files instead of manual processes", "A type of API", "A frontend testing tool"]',
 1, 'IaC tools like Terraform and CloudFormation let you define servers, databases, and networks in code. Benefits: version control, reproducibility, consistency across environments, and easy disaster recovery.', 'Medium'),

('devops', 'What is a blue-green deployment?',
 '["Using two different color themes", "Running two identical production environments where one (blue) serves traffic while the other (green) is updated, then switching", "A testing methodology", "A database strategy"]',
 1, 'Blue-green deployments eliminate downtime. Blue = current live environment. Green = identical environment with the new version. After testing green, you switch the load balancer to route traffic to green. Instant rollback: switch back to blue.', 'Hard'),

('devops', 'What is the purpose of environment variables?',
 '["Storing CSS styles", "Storing configuration values (API keys, database URLs, secrets) outside of source code for security and flexibility", "Creating animations", "Compiling JavaScript"]',
 1, 'Environment variables separate configuration from code. Different environments (dev, staging, prod) use different values without changing code. NEVER commit secrets to version control — use .env files and secret managers.', 'Easy'),

('devops', 'What does "git rebase" do?',
 '["Deletes the repository", "Rewrites commit history by moving or combining commits onto a new base, creating a linear history", "Creates a new branch", "Merges all branches automatically"]',
 1, 'Rebase takes your branch''s commits and replays them on top of another branch (usually main). Result: a clean, linear history without merge commits. Warning: never rebase commits that others have pulled.', 'Medium'),

('devops', 'What is a reverse proxy?',
 '["A proxy that works backwards", "A server that sits in front of backend servers and forwards client requests to them, providing load balancing, caching, and security", "A VPN service", "A database driver"]',
 1, 'Nginx and HAProxy are common reverse proxies. They handle SSL termination, compress responses, cache static assets, and distribute traffic. Clients never communicate directly with backend servers.', 'Medium'),

('devops', 'What is monitoring vs observability?',
 '["They are identical", "Monitoring tracks predefined metrics; observability provides the ability to understand internal system state from external outputs (logs, metrics, traces)", "Monitoring is for frontend only", "Observability replaces testing"]',
 1, 'Monitoring answers "is the system working?" (dashboards, alerts). Observability answers "why is it broken?" (distributed tracing, log correlation, metric exploration). The three pillars: metrics, logs, traces.', 'Hard');

-- =====================================================================
-- 8. BEHAVIORAL & HR (10 questions)
-- =====================================================================
INSERT INTO questions (category_id, question, options, correct_answer, explanation, difficulty) VALUES
('behavioral', 'What does the STAR method stand for?',
 '["Start, Try, Achieve, Repeat", "Situation, Task, Action, Result", "Skills, Teamwork, Accountability, Results", "Strategy, Tactics, Assessment, Review"]',
 1, 'STAR structures behavioral answers: Situation (context), Task (your responsibility), Action (what YOU did specifically), Result (measurable outcome). Always emphasize YOUR actions, not the team''s.', 'Easy'),

('behavioral', 'How should you answer "Tell me about a time you failed"?',
 '["Say you never fail", "Share a real failure, explain what you learned, and show how you applied that lesson to improve", "Blame your teammates", "Give a fake weakness that is actually a strength"]',
 1, 'Interviewers want to see self-awareness, accountability, and growth. Structure: describe the failure honestly, own your role in it, explain the specific lesson learned, and give a concrete example of how you improved afterward.', 'Medium'),

('behavioral', 'What is the best way to answer "Why should we hire you?"',
 '["List all your degrees and certifications", "Connect your specific skills and experiences directly to the job requirements, showing the value you would bring", "Say you need the money", "Ask them why they shouldn''t hire you"]',
 1, 'Research the role beforehand. Map YOUR skills to THEIR needs. Example: "You need someone who can build scalable React apps — I built X at Y company which handled Z users." Be specific, not generic.', 'Medium'),

('behavioral', 'How should you handle a question about conflict with a coworker?',
 '["Say you avoid all conflict", "Describe the situation objectively, explain your perspective, show how you communicated and found a resolution, and state what you learned", "Blame the coworker completely", "Say conflict never happens"]',
 1, 'Show emotional intelligence: acknowledge different perspectives, demonstrate proactive communication (e.g., "I scheduled a 1:1 to understand their viewpoint"), focus on the resolution, and end with the positive outcome.', 'Medium'),

('behavioral', 'What is the "elevator pitch"?',
 '["A sales technique for elevator companies", "A brief, compelling summary of who you are, what you do, and what value you offer — delivered in 30-60 seconds", "A negotiation tactic", "A coding challenge"]',
 1, 'Your elevator pitch is your answer to "Tell me about yourself." Structure: Current role/focus → Key achievement → Why you''re here. Example: "I''m a full-stack dev focused on React and Node. At X, I led Y which improved Z by 40%. I''m excited about this role because..."', 'Easy'),

('behavioral', 'When asked about salary expectations, what is the best approach?',
 '["Name the lowest number possible", "Research market rates, provide a range based on your experience, and ask about the total compensation package", "Refuse to discuss salary", "Ask for the maximum possible"]',
 1, 'Research on Glassdoor, Levels.fyi, and LinkedIn Salary. Provide a range: "Based on my experience and market data, I''m targeting $X-$Y." Always ask about total comp: base, equity, bonuses, benefits.', 'Medium'),

('behavioral', 'How do you demonstrate leadership without a management title?',
 '["You can''t show leadership without being a manager", "By taking initiative, mentoring others, proposing improvements, owning projects end-to-end, and volunteering for challenging work", "By telling others what to do", "By working alone"]',
 1, 'Leadership = influence, not authority. Examples: "I noticed our onboarding was slow, so I created a documentation wiki." "I mentored two junior devs through their first PRs." "I proposed and led the migration to TypeScript."', 'Easy'),

('behavioral', 'What questions should you ask the interviewer?',
 '["No questions needed", "Ask about team culture, growth opportunities, technical challenges, and what success looks like in the role", "Ask only about salary", "Ask when you can start"]',
 1, 'Great questions show genuine interest: "What does a typical day look like?" "What''s the biggest technical challenge the team faces?" "How do you measure success in this role?" "What''s the team''s approach to code reviews?"', 'Easy'),

('behavioral', 'How should you handle a question about a gap in your resume?',
 '["Lie about it", "Address it honestly, explain what you did during that time (learning, personal projects, caregiving), and redirect to your current readiness", "Ignore the question", "Say it was a vacation"]',
 1, 'Resume gaps are normal. Be honest and positive: "I took time to upskill in React and built 3 side projects" or "I was caring for a family member while maintaining my skills through online courses."', 'Easy'),

('behavioral', 'What is the difference between a good and a great answer in behavioral interviews?',
 '["Length — longer is always better", "Specificity — great answers use concrete numbers, dates, and measurable outcomes instead of vague generalities", "Using technical jargon", "Memorizing scripts"]',
 1, 'Vague: "I improved the process." Great: "I reduced deployment time from 45 minutes to 8 minutes by implementing a CI/CD pipeline with GitHub Actions, saving the team 15 hours per week." Numbers make answers memorable.', 'Medium');

-- =====================================================================
-- 9. SYSTEM DESIGN (10 questions)
-- =====================================================================
INSERT INTO questions (category_id, question, options, correct_answer, explanation, difficulty) VALUES
('system_design', 'What is horizontal scaling vs vertical scaling?',
 '["They are the same", "Vertical = adding more power to one server; Horizontal = adding more servers to distribute load", "Horizontal is always better", "Vertical means using more databases"]',
 1, 'Vertical scaling (scale up): bigger CPU, more RAM, faster SSD — has hardware limits. Horizontal scaling (scale out): add more servers behind a load balancer — virtually unlimited but requires stateless design. Most large systems use horizontal.', 'Easy'),

('system_design', 'What is a single point of failure (SPOF)?',
 '["A backup system", "A component whose failure would cause the entire system to stop working", "A load balancer", "A database index"]',
 1, 'SPOFs are system design red flags. Examples: single database server, single load balancer, single data center. Solutions: replication, redundancy, failover, multi-region deployment.', 'Easy'),

('system_design', 'What is database sharding?',
 '["Deleting old data", "Splitting a database into smaller pieces (shards) distributed across multiple servers, each holding a subset of the data", "Compressing database files", "Creating backup copies"]',
 1, 'Sharding distributes data horizontally. Example: users A-M on shard 1, N-Z on shard 2. Benefits: each shard handles less data/traffic. Challenges: cross-shard queries, rebalancing, choosing the right shard key.', 'Hard'),

('system_design', 'What is the CAP theorem?',
 '["Cost, Architecture, Performance", "Consistency, Availability, Partition Tolerance — a distributed system can guarantee at most two of these three properties simultaneously", "Cache, API, Protocol", "Create, Alter, Purge"]',
 1, 'CAP theorem: during a network partition, you must choose between Consistency (all nodes see the same data) and Availability (every request gets a response). CP systems: banking. AP systems: social media feeds.', 'Hard'),

('system_design', 'What is a message queue?',
 '["A chat application", "A system that enables asynchronous communication between services by storing messages until the consuming service is ready to process them", "A database table", "An email server"]',
 1, 'Message queues (RabbitMQ, Kafka, SQS) decouple producers from consumers. Benefits: handle traffic spikes (buffer), retry failed operations, enable microservices communication. Example: order placed → payment queue → email queue.', 'Medium'),

('system_design', 'How would you design a URL shortener?',
 '["Just use a hash map", "Generate a unique short code, store the mapping in a database, redirect short URLs to original URLs, handle collision and analytics", "Use DNS", "It cannot be designed"]',
 1, 'Key decisions: ID generation (auto-increment vs hash), base62 encoding for short codes, database choice (KV store for speed), redirect type (301 vs 302), caching popular URLs, analytics tracking, and handling expiration.', 'Medium'),

('system_design', 'What is an API Gateway?',
 '["A firewall", "A single entry point that sits in front of multiple services, handling routing, authentication, rate limiting, and load balancing", "A database connector", "A frontend framework"]',
 1, 'API Gateways (Kong, AWS API Gateway) consolidate cross-cutting concerns. Instead of each microservice handling auth and rate limiting independently, the gateway handles it once. Also useful for request transformation and response aggregation.', 'Medium'),

('system_design', 'What is eventual consistency?',
 '["Data is always consistent", "A model where updates propagate to all replicas over time; reads may temporarily return stale data, but all replicas converge eventually", "Data is never consistent", "A type of database lock"]',
 1, 'In distributed systems, strong consistency (instant sync) is expensive. Eventual consistency trades immediate accuracy for availability and performance. Example: your social media post may take seconds to appear for all followers.', 'Hard'),

('system_design', 'What is the difference between monolith and microservices?',
 '["Monolith is always bad", "Monolith: single deployable unit with all code together; Microservices: independent, small services each handling one business function, deployed separately", "Microservices are always better", "They are the same thing"]',
 1, 'Monolith: simpler to develop and deploy initially, but harder to scale individual components. Microservices: independent scaling and deployment, but add complexity (networking, data consistency, service discovery). Start monolith, split when needed.', 'Medium'),

('system_design', 'What is a cache invalidation strategy?',
 '["Never clearing the cache", "A policy that determines when and how cached data is updated or removed to ensure users see fresh data", "Caching everything forever", "A database backup method"]',
 1, 'Three main strategies: 1) TTL (Time-To-Live): data expires after X seconds. 2) Write-through: update cache when database is updated. 3) Write-behind: update cache immediately, sync to DB later. "Cache invalidation is one of the two hard things in CS."', 'Hard');

-- =====================================================================
-- 10. APP SECURITY (10 questions)
-- =====================================================================
INSERT INTO questions (category_id, question, options, correct_answer, explanation, difficulty) VALUES
('security', 'What is the difference between authentication and authorization?',
 '["They are the same thing", "Authentication verifies WHO you are; Authorization determines WHAT you are allowed to do", "Authentication is more important", "Authorization comes first"]',
 1, 'Authentication: "Are you who you claim to be?" (login, password, biometrics). Authorization: "What permissions do you have?" (admin vs user, read vs write). Authentication always comes first.', 'Easy'),

('security', 'What is XSS (Cross-Site Scripting)?',
 '["A CSS framework", "An attack where malicious scripts are injected into trusted websites, executing in other users'' browsers", "A JavaScript testing tool", "A server configuration"]',
 1, 'XSS occurs when user input is rendered as HTML/JavaScript without sanitization. Types: Stored (persisted in DB), Reflected (in URL params), DOM-based (client-side). Prevention: escape output, use Content Security Policy, sanitize input.', 'Medium'),

('security', 'What is SQL Injection?',
 '["A database optimization technique", "An attack where malicious SQL code is inserted into input fields to manipulate or extract data from the database", "A type of JOIN", "A backup method"]',
 1, 'Example: input ''OR 1=1--'' in a login form could bypass authentication. Prevention: ALWAYS use parameterized queries/prepared statements. NEVER concatenate user input into SQL strings. ORMs help prevent this automatically.', 'Medium'),

('security', 'What is CSRF (Cross-Site Request Forgery)?',
 '["A type of encryption", "An attack that tricks a logged-in user''s browser into sending unwanted requests to a site where they''re authenticated", "A CSS property", "A database error"]',
 1, 'Example: you''re logged into your bank. A malicious site makes your browser send a transfer request to your bank — using your existing session cookie. Prevention: CSRF tokens, SameSite cookies, checking Origin/Referer headers.', 'Hard'),

('security', 'What is HTTPS and how does it differ from HTTP?',
 '["HTTPS is slower", "HTTPS encrypts data in transit using TLS, preventing eavesdropping and tampering; HTTP sends data in plain text", "They are identical", "HTTPS is only for banks"]',
 1, 'HTTPS uses TLS (Transport Layer Security) to encrypt communication. The TLS handshake establishes encryption keys using certificates. Without HTTPS, anyone on the same network can read your passwords, cookies, and data.', 'Easy'),

('security', 'What is OAuth 2.0?',
 '["A password manager", "An authorization framework that allows third-party applications to access user resources without sharing passwords", "A database protocol", "A JavaScript library"]',
 1, 'OAuth 2.0 enables "Login with Google/GitHub" flows. Instead of sharing your Google password, Google gives the app a limited access token. Key concepts: Authorization Server, Resource Server, Access Token, Refresh Token, Scopes.', 'Medium'),

('security', 'What is the principle of least privilege?',
 '["Giving everyone admin access", "Granting users and systems only the minimum permissions needed to perform their tasks", "Removing all permissions", "A frontend design pattern"]',
 1, 'Least privilege limits blast radius. If an account is compromised, the attacker can only do what that account was allowed to do. Examples: read-only database users for reporting, separate API keys per service with limited scopes.', 'Easy'),

('security', 'What is a Content Security Policy (CSP)?',
 '["A company privacy policy", "An HTTP header that tells browsers which sources of content are allowed to load, preventing XSS and data injection attacks", "A database access rule", "A Git branch protection rule"]',
 1, 'CSP headers whitelist trusted sources: script-src ''self'' cdn.example.com. This prevents inline scripts and scripts from untrusted domains from executing, even if an attacker manages to inject them.', 'Medium'),

('security', 'What is password salting?',
 '["Adding salt to make passwords tastier", "Adding a unique random string to each password before hashing, so identical passwords produce different hashes", "Encrypting the database", "A two-factor authentication method"]',
 1, 'Without salts, identical passwords produce identical hashes — vulnerable to rainbow table attacks. A unique salt per user means attackers must crack each hash individually. bcrypt and argon2 handle salting automatically.', 'Medium'),

('security', 'What are the OWASP Top 10?',
 '["A list of the 10 best programming languages", "A regularly updated list of the 10 most critical web application security risks", "A frontend framework ranking", "A list of database optimizations"]',
 1, 'OWASP Top 10 (2021): 1) Broken Access Control, 2) Cryptographic Failures, 3) Injection, 4) Insecure Design, 5) Security Misconfiguration, 6) Vulnerable Components, 7) Auth Failures, 8) Data Integrity, 9) Logging Failures, 10) SSRF.', 'Medium');

-- =====================================================================
-- 11. TESTING & QA (10 questions)
-- =====================================================================
INSERT INTO questions (category_id, question, options, correct_answer, explanation, difficulty) VALUES
('testing', 'What is the testing pyramid?',
 '["A shape for organizing tests", "A strategy recommending many unit tests, fewer integration tests, and even fewer E2E tests — balancing speed, cost, and confidence", "A CI/CD pipeline", "A database testing tool"]',
 1, 'Unit tests (base): fast, cheap, many. Integration tests (middle): test component interactions. E2E tests (top): slow, expensive, few. The pyramid ensures fast feedback while maintaining confidence.', 'Easy'),

('testing', 'What is the difference between unit testing and integration testing?',
 '["They are the same", "Unit tests test individual functions in isolation; integration tests verify that multiple components work together correctly", "Integration tests are always better", "Unit tests test the UI only"]',
 1, 'Unit test: does this function calculate tax correctly? Integration test: does the checkout flow work when the cart, payment, and email services interact? Both are essential; they catch different types of bugs.', 'Easy'),

('testing', 'What is TDD (Test-Driven Development)?',
 '["Testing after deployment", "A development methodology where you write the test first, watch it fail, write the minimum code to pass it, then refactor", "A type of database testing", "Testing only in production"]',
 1, 'TDD cycle: Red (write failing test) → Green (write code to pass) → Refactor (clean up). Benefits: better design (testable by default), comprehensive test coverage, documentation through tests, fewer bugs.', 'Medium'),

('testing', 'What is mocking in testing?',
 '["Making fun of code", "Creating fake implementations of dependencies (APIs, databases, modules) to isolate the code being tested", "A type of performance test", "A deployment strategy"]',
 1, 'Mocks replace real dependencies with controlled fakes. Example: mock the database so your test doesn''t need a real DB connection. This makes tests fast, reliable, and independent. Related concepts: stubs, spies, fakes.', 'Medium'),

('testing', 'What is code coverage?',
 '["How many developers work on the code", "A metric that measures the percentage of code lines, branches, or statements executed by tests", "A CSS property", "A version control concept"]',
 1, 'Coverage types: line (% of lines executed), branch (% of if/else paths tested), function (% of functions called). 80% is a common target. Warning: 100% coverage doesn''t mean bug-free — it just means all paths were executed.', 'Easy'),

('testing', 'What is an end-to-end (E2E) test?',
 '["Testing only the backend", "A test that simulates real user interactions through the entire application stack, from UI to database", "A unit test for endpoints", "A code review process"]',
 1, 'E2E tests (Cypress, Playwright, Selenium) automate browser interactions: click buttons, fill forms, navigate pages, verify results. They catch issues unit/integration tests miss but are slower and more fragile.', 'Medium'),

('testing', 'What is a flaky test?',
 '["A test that always fails", "A test that sometimes passes and sometimes fails without any code changes, due to timing, environment, or dependency issues", "A test with no assertions", "A deprecated test"]',
 1, 'Flaky tests erode confidence in the test suite. Common causes: timing issues (race conditions), shared state between tests, network dependencies, date/time sensitivity. Fix: add retries, isolate state, mock external deps.', 'Medium'),

('testing', 'What is regression testing?',
 '["Testing only new features", "Re-running existing tests after code changes to ensure that previously working functionality hasn''t broken", "Testing database performance", "A manual code review"]',
 1, 'Regression tests catch unintended side effects. When you fix bug A, regression testing verifies you didn''t accidentally break features B, C, and D. Automated test suites make regression testing practical and continuous.', 'Easy'),

('testing', 'What is snapshot testing?',
 '["Taking screenshots", "Capturing the rendered output of a component and comparing it against a stored reference to detect unexpected changes", "A database backup", "Performance profiling"]',
 1, 'Jest''s snapshot testing serializes component output (HTML/JSON) and saves it. On subsequent runs, it compares current output against the stored snapshot. Any change triggers a failure — you then approve or fix the change.', 'Medium'),

('testing', 'What does AAA stand for in testing?',
 '["Authentication, Authorization, Access", "Arrange, Act, Assert — the three phases of structuring a test", "Automated, Accurate, Actionable", "API, Application, Architecture"]',
 1, 'Arrange: set up test data and conditions. Act: execute the function/action being tested. Assert: verify the result matches expectations. This pattern makes tests readable, consistent, and maintainable.', 'Easy');

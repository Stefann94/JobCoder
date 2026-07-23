-- =====================================================================
-- FULL CURRICULUM SEED: Learning Modules for All 11 Domains
-- Run this in Supabase SQL Editor to populate every folder.
-- It first clears existing modules, then inserts the full curriculum.
-- =====================================================================

DELETE FROM learning_modules;

-- =====================================================================
-- 1. FRONTEND LOGIC (15 modules)
-- =====================================================================
INSERT INTO learning_modules (category_id, title, description, xp_reward, order_index) VALUES
('frontend', 'HTML & the DOM', 'Every website starts here. Learn how browsers read HTML and build the Document Object Model — the skeleton of every page you see.', 30, 1),
('frontend', 'CSS Fundamentals', 'Colors, fonts, spacing, and layout. Master the language that makes the web beautiful, from selectors to the box model.', 30, 2),
('frontend', 'Flexbox & Grid Layouts', 'Stop struggling with alignment! These two CSS superpowers let you build any layout — from simple navbars to complex dashboards.', 40, 3),
('frontend', 'Responsive Design', 'Your app must look perfect on a phone, tablet, and desktop. Learn media queries, fluid grids, and the mobile-first mindset.', 40, 4),
('frontend', 'JavaScript Core Concepts', 'Variables, functions, loops, and scope. This is the engine behind every interactive website. Let''s make it rock-solid.', 50, 5),
('frontend', 'ES6+ Modern Syntax', 'Arrow functions, destructuring, spread operator, template literals — the modern JavaScript every interviewer expects you to know.', 40, 6),
('frontend', 'Async JavaScript', 'Callbacks, Promises, async/await. Learn how JavaScript handles tasks that take time, like fetching data from a server.', 50, 7),
('frontend', 'Introduction to React', 'Components, JSX, and the virtual DOM. Build your first interactive UI with the most popular frontend library in the world.', 50, 8),
('frontend', 'React State & Props', 'How data flows through a React app. Understand the difference between state (local) and props (passed down), and when to use each.', 50, 9),
('frontend', 'React Hooks Deep Dive', 'useState, useEffect, useContext, useRef, useMemo, useCallback — every hook explained with real-world examples.', 60, 10),
('frontend', 'State Management', 'When local state isn''t enough. Explore Context API, Redux, and Zustand — and learn when each one is the right tool.', 50, 11),
('frontend', 'React Router & Navigation', 'Single-page apps need routing. Learn how to create multi-page experiences without ever reloading the browser.', 40, 12),
('frontend', 'Web Performance', 'Lazy loading, code splitting, memoization, and lighthouse scores. Make your app blazing fast and keep users happy.', 50, 13),
('frontend', 'Accessibility (a11y)', 'Build apps everyone can use. Screen readers, ARIA labels, keyboard navigation — these aren''t optional, they''re essential.', 40, 14),
('frontend', 'Frontend Interview Patterns', 'The most common frontend interview questions and coding challenges. Debounce, throttle, infinite scroll, and more.', 60, 15);

-- =====================================================================
-- 2. BACKEND ARCHITECTURE (14 modules)
-- =====================================================================
INSERT INTO learning_modules (category_id, title, description, xp_reward, order_index) VALUES
('backend', 'What is a Server?', 'Before writing backend code, let''s understand what a server actually does. Requests, responses, and the client-server model.', 30, 1),
('backend', 'REST API Fundamentals', 'GET, POST, PUT, DELETE — the verbs of the web. Learn how to design clean, predictable APIs that any frontend can consume.', 40, 2),
('backend', 'Node.js & Express Basics', 'Set up your first backend server in minutes. We''ll handle routes, middleware, and send JSON responses like a pro.', 50, 3),
('backend', 'Middleware & Error Handling', 'What happens between a request arriving and a response leaving? Middleware is the secret sauce of clean backend code.', 40, 4),
('backend', 'Authentication & JWT', 'Logins, sessions, and tokens. Learn how to verify who a user is and keep their data safe using JSON Web Tokens.', 50, 5),
('backend', 'Database Integration', 'Connect your server to a real database. We''ll cover ORMs (like Prisma), raw SQL, and connection pooling.', 50, 6),
('backend', 'Input Validation & Sanitization', 'Never trust user input! Learn how to validate data and prevent injection attacks before they reach your database.', 40, 7),
('backend', 'File Uploads & Storage', 'Users want to upload avatars, documents, and images. Learn how to handle file uploads securely and store them in the cloud.', 40, 8),
('backend', 'Rate Limiting & Throttling', 'Protect your API from abuse. Implement rate limiters to prevent DDoS attacks and keep your server healthy.', 40, 9),
('backend', 'Caching Strategies', 'Redis, in-memory caching, and HTTP cache headers. Make your API respond 10x faster by not doing the same work twice.', 50, 10),
('backend', 'WebSockets & Real-Time', 'Chat apps, live notifications, collaborative editing — all powered by WebSockets. Learn how to build real-time features.', 50, 11),
('backend', 'GraphQL Fundamentals', 'An alternative to REST. Learn how GraphQL lets the client ask for exactly the data it needs — no more, no less.', 50, 12),
('backend', 'Microservices vs Monolith', 'When should you split your app into services? Understand the tradeoffs, communication patterns, and deployment strategies.', 50, 13),
('backend', 'Backend Interview Patterns', 'Common backend interview scenarios: design a URL shortener, build a task queue, explain the event loop, and more.', 60, 14);

-- =====================================================================
-- 3. DATA MANIPULATION / DATABASES (13 modules)
-- =====================================================================
INSERT INTO learning_modules (category_id, title, description, xp_reward, order_index) VALUES
('database', 'What is a Database?', 'Structured vs unstructured data, tables vs documents. Understand why every app needs a reliable place to store information.', 30, 1),
('database', 'SQL Basics: SELECT & WHERE', 'Your first queries. Learn how to ask a database for exactly the information you need, filter results, and sort them.', 30, 2),
('database', 'JOINs Explained Visually', 'INNER JOIN, LEFT JOIN, RIGHT JOIN, FULL JOIN — finally understand them with clear visual diagrams and real examples.', 50, 3),
('database', 'INSERT, UPDATE, DELETE', 'The write side of SQL. Learn how to add new records, modify existing ones, and safely remove data.', 30, 4),
('database', 'GROUP BY & Aggregations', 'COUNT, SUM, AVG, MAX, MIN — powerful functions that let you summarize millions of rows into meaningful insights.', 40, 5),
('database', 'Subqueries & CTEs', 'Queries inside queries. Common Table Expressions make complex SQL readable and maintainable.', 50, 6),
('database', 'Indexing & Query Optimization', 'Why is your query slow? Learn how indexes work under the hood and how to make your database fly.', 50, 7),
('database', 'Database Normalization', '1NF, 2NF, 3NF — these aren''t just theory. Learn how to structure your tables to avoid duplicate data and bugs.', 40, 8),
('database', 'Transactions & ACID', 'What happens if your app crashes mid-write? Transactions ensure your data stays consistent no matter what.', 50, 9),
('database', 'NoSQL: MongoDB Basics', 'Not everything fits in a table. Learn when document databases like MongoDB are the right choice and how to use them.', 40, 10),
('database', 'PostgreSQL Advanced Features', 'JSONB, full-text search, window functions, triggers — the power features that make Postgres the developer''s favorite.', 50, 11),
('database', 'Database Design Patterns', 'Soft deletes, audit logs, polymorphic associations, and multi-tenancy. Real-world patterns used in production apps.', 50, 12),
('database', 'Database Interview Questions', 'The classic interview SQL challenges: find duplicates, rank salaries, compute running totals, and design schemas.', 60, 13);

-- =====================================================================
-- 4. ALGORITHMS & DATA STRUCTURES (16 modules)
-- =====================================================================
INSERT INTO learning_modules (category_id, title, description, xp_reward, order_index) VALUES
('algorithms', 'Big O Notation', 'The language of performance. Learn how to describe the speed and memory usage of your code like a senior engineer.', 40, 1),
('algorithms', 'Arrays & Strings', 'The most fundamental data structures. Master traversal, two-pointer technique, sliding window, and common patterns.', 40, 2),
('algorithms', 'Hash Maps & Sets', 'O(1) lookups are a superpower. Learn when and how to use hash maps to solve problems in record time.', 50, 3),
('algorithms', 'Linked Lists', 'Nodes and pointers. Understand singly and doubly linked lists, reversal, cycle detection, and merge operations.', 50, 4),
('algorithms', 'Stacks & Queues', 'LIFO and FIFO. From bracket matching to BFS traversal — these simple structures solve surprisingly complex problems.', 40, 5),
('algorithms', 'Recursion & Backtracking', 'Functions that call themselves. Master the recursive mindset and solve problems like permutations, subsets, and N-Queens.', 60, 6),
('algorithms', 'Sorting Algorithms', 'Bubble sort, merge sort, quicksort, and counting sort. Know their complexities and when each one shines.', 50, 7),
('algorithms', 'Binary Search', 'Cut your search space in half every step. Learn the template that solves dozens of interview problems.', 50, 8),
('algorithms', 'Trees & Binary Trees', 'Root, leaves, depth, height. Traverse trees in-order, pre-order, and post-order. Build and search BSTs.', 60, 9),
('algorithms', 'Heaps & Priority Queues', 'Find the min or max in O(1). Learn how heaps power everything from Dijkstra''s algorithm to task schedulers.', 50, 10),
('algorithms', 'Graphs: BFS & DFS', 'Networks, social connections, maps — all are graphs. Master breadth-first and depth-first traversal.', 60, 11),
('algorithms', 'Dynamic Programming', 'The most feared interview topic, demystified. Learn memoization, tabulation, and the patterns that repeat across problems.', 70, 12),
('algorithms', 'Greedy Algorithms', 'Sometimes the locally optimal choice leads to the global optimum. Learn when greedy works and when it fails.', 50, 13),
('algorithms', 'Bit Manipulation', 'AND, OR, XOR, shifts. Solve problems with raw binary operations — a favorite topic at FAANG interviews.', 50, 14),
('algorithms', 'Tries & Advanced Structures', 'Autocomplete, spell check, IP routing — tries are the hidden gem data structure behind these features.', 50, 15),
('algorithms', 'Algorithm Interview Patterns', 'The 15 most common patterns: sliding window, two pointers, fast/slow, merge intervals, top-K, and more.', 70, 16);

-- =====================================================================
-- 5. MOBILE APP DEV (10 modules)
-- =====================================================================
INSERT INTO learning_modules (category_id, title, description, xp_reward, order_index) VALUES
('mobile', 'Mobile Dev Landscape', 'Native vs Cross-Platform vs Hybrid. Understand the tradeoffs of React Native, Flutter, Swift, and Kotlin.', 30, 1),
('mobile', 'React Native Fundamentals', 'From View to Text to ScrollView. Learn the core components that replace HTML elements in the mobile world.', 40, 2),
('mobile', 'Navigation in Mobile Apps', 'Stack navigation, tab bars, drawers. Build multi-screen apps that feel native on both iOS and Android.', 40, 3),
('mobile', 'Styling in React Native', 'StyleSheet, Flexbox (it''s the default!), and platform-specific styling. Make your app look beautiful on every device.', 40, 4),
('mobile', 'Working with APIs', 'Fetch data from the internet, show loading states, handle errors gracefully — the bread and butter of any mobile app.', 40, 5),
('mobile', 'Local Storage & Persistence', 'AsyncStorage, SQLite, and MMKV. Keep user data safe even when the app is closed or the phone restarts.', 40, 6),
('mobile', 'Push Notifications', 'Engage users with timely, relevant notifications. Learn how to set them up with Expo and Firebase Cloud Messaging.', 40, 7),
('mobile', 'Animations & Gestures', 'Reanimated, gesture handlers, and shared transitions. Make your app feel alive with smooth, 60fps animations.', 50, 8),
('mobile', 'App Store Deployment', 'From code to the App Store and Google Play. Signing, building, screenshots, metadata — the full publishing checklist.', 50, 9),
('mobile', 'Mobile Interview Questions', 'Common mobile interview topics: lifecycle methods, deep linking, performance profiling, and offline-first architecture.', 60, 10);

-- =====================================================================
-- 6. NETWORKING (10 modules)
-- =====================================================================
INSERT INTO learning_modules (category_id, title, description, xp_reward, order_index) VALUES
('networking', 'How the Internet Works', 'Packets, routers, and protocols. Follow a request from your browser through the internet and back — step by step.', 30, 1),
('networking', 'TCP vs UDP', 'Reliable delivery vs speed. Learn when to use each protocol and why video calls use UDP but file transfers use TCP.', 40, 2),
('networking', 'HTTP & HTTPS Deep Dive', 'Status codes, headers, cookies, and TLS. Understand the protocol that powers every website you visit.', 40, 3),
('networking', 'DNS: The Internet Phone Book', 'How does your browser know that google.com is 142.250.80.46? Learn how domain name resolution works.', 30, 4),
('networking', 'REST vs GraphQL vs gRPC', 'Three approaches to API communication. Understand when each protocol is the right choice for your architecture.', 40, 5),
('networking', 'WebSockets & Server-Sent Events', 'Real-time communication patterns. Learn when to use WebSockets vs SSE vs long-polling.', 40, 6),
('networking', 'Load Balancers & Reverse Proxies', 'Nginx, HAProxy, and cloud load balancers. Distribute traffic across multiple servers like a pro.', 50, 7),
('networking', 'CDNs & Edge Computing', 'Serve your content from the closest server to the user. Learn how CDNs slash latency worldwide.', 40, 8),
('networking', 'CORS & Same-Origin Policy', 'The most confusing error in web development, finally explained. Learn why browsers block requests and how to fix it.', 40, 9),
('networking', 'Networking Interview Questions', 'Classic interview questions: what happens when you type a URL, explain the OSI model, debug a timeout.', 60, 10);

-- =====================================================================
-- 7. DEVOPS & CLOUD (12 modules)
-- =====================================================================
INSERT INTO learning_modules (category_id, title, description, xp_reward, order_index) VALUES
('devops', 'What is DevOps?', 'The culture and practices that bridge development and operations. CI/CD, automation, and the DevOps mindset.', 30, 1),
('devops', 'Linux Command Line Essentials', 'Navigate the terminal like a hacker. Files, permissions, processes, pipes — the commands every developer must know.', 40, 2),
('devops', 'Git Advanced Workflows', 'Beyond add-commit-push. Rebasing, cherry-picking, bisect, stash — master Git like a senior engineer.', 40, 3),
('devops', 'Docker Fundamentals', 'Containers, images, volumes, and networks. Package your app so it runs identically everywhere.', 50, 4),
('devops', 'Docker Compose & Multi-Container', 'Run your app, database, and cache together with a single command. Learn to orchestrate local development environments.', 40, 5),
('devops', 'CI/CD Pipelines', 'GitHub Actions, GitLab CI, Jenkins. Automate testing, building, and deploying your code on every push.', 50, 6),
('devops', 'Cloud Providers Overview', 'AWS, Google Cloud, Azure — the big three. Understand their core services and when to use each one.', 40, 7),
('devops', 'Kubernetes Basics', 'Pods, services, deployments, and scaling. The industry standard for running containers in production.', 60, 8),
('devops', 'Infrastructure as Code', 'Terraform and CloudFormation. Define your entire infrastructure in code and version-control it like your app.', 50, 9),
('devops', 'Monitoring & Logging', 'Prometheus, Grafana, and ELK Stack. Know what''s happening in your production systems before users complain.', 40, 10),
('devops', 'Environment Management', 'Dev, staging, production. Manage environment variables, secrets, and configuration across deployments.', 40, 11),
('devops', 'DevOps Interview Questions', 'Explain blue-green deployments, design a CI/CD pipeline, debug a failing container — common interview scenarios.', 60, 12);

-- =====================================================================
-- 8. BEHAVIORAL & HR (10 modules)
-- =====================================================================
INSERT INTO learning_modules (category_id, title, description, xp_reward, order_index) VALUES
('behavioral', 'The STAR Method', 'Situation, Task, Action, Result. The framework that turns any experience into a compelling interview answer.', 40, 1),
('behavioral', 'Tell Me About Yourself', 'The most common opening question. Craft a 2-minute pitch that highlights your strengths and makes interviewers lean in.', 30, 2),
('behavioral', 'Handling Conflict Questions', '"Tell me about a time you disagreed with a teammate." Learn how to answer without sounding difficult or passive.', 40, 3),
('behavioral', 'Leadership & Initiative', 'Even as a junior, you can show leadership. Learn how to frame your experiences to demonstrate ownership and drive.', 40, 4),
('behavioral', 'Failure & Growth Stories', '"Tell me about a time you failed." The question that terrifies everyone — but it''s actually your chance to shine.', 40, 5),
('behavioral', 'Teamwork & Collaboration', 'How do you work with others? Pair programming, code reviews, cross-team projects — frame them as strengths.', 30, 6),
('behavioral', 'Why This Company?', 'Research, values, and genuine interest. Learn how to answer this without sounding generic or desperate.', 30, 7),
('behavioral', 'Salary Negotiation', 'Know your worth. Learn frameworks for negotiating compensation, equity, and benefits with confidence.', 50, 8),
('behavioral', 'Questions to Ask the Interviewer', 'The best interviews are conversations. Learn which questions make you memorable and which ones to avoid.', 30, 9),
('behavioral', 'Mock Interview Preparation', 'Put it all together. A complete checklist for the day before, the morning of, and the minutes after your interview.', 50, 10);

-- =====================================================================
-- 9. SYSTEM DESIGN (12 modules)
-- =====================================================================
INSERT INTO learning_modules (category_id, title, description, xp_reward, order_index) VALUES
('system_design', 'System Design Fundamentals', 'What interviewers actually evaluate: scalability, reliability, availability, and trade-offs. The meta-skills you need.', 40, 1),
('system_design', 'Scaling from 1 to 1M Users', 'Vertical vs horizontal scaling. Load balancers, database replication, and caching — your first scaling playbook.', 50, 2),
('system_design', 'Database Sharding & Replication', 'When one database isn''t enough. Learn how to split data across servers and keep copies in sync.', 60, 3),
('system_design', 'Caching Strategies', 'Write-through, write-back, LRU eviction. Where to cache (CDN, reverse proxy, application, database) and when.', 50, 4),
('system_design', 'Message Queues & Event-Driven', 'RabbitMQ, Kafka, SQS. Decouple your services and handle millions of events without dropping a single one.', 60, 5),
('system_design', 'API Gateway & Service Mesh', 'Route, authenticate, and rate-limit all API traffic through a single entry point. The backbone of microservices.', 50, 6),
('system_design', 'Design a URL Shortener', 'The classic interview question. Walk through requirements, schema, hashing strategies, and scaling considerations.', 60, 7),
('system_design', 'Design a Chat Application', 'Real-time messaging, presence indicators, message history. Design a system like WhatsApp or Slack from scratch.', 70, 8),
('system_design', 'Design a News Feed', 'Fan-out on write vs fan-out on read. Design the system behind Facebook''s or Twitter''s infinite scrolling feed.', 70, 9),
('system_design', 'Design a Rate Limiter', 'Token bucket, sliding window, fixed window. Protect your APIs from abuse with battle-tested algorithms.', 50, 10),
('system_design', 'Design a Notification System', 'Push, email, SMS, in-app. Design a system that delivers the right message through the right channel at the right time.', 60, 11),
('system_design', 'System Design Interview Framework', 'The 4-step approach: clarify requirements, high-level design, deep dive, and bottleneck analysis. Your interview template.', 70, 12);

-- =====================================================================
-- 10. APP SECURITY (10 modules)
-- =====================================================================
INSERT INTO learning_modules (category_id, title, description, xp_reward, order_index) VALUES
('security', 'Authentication vs Authorization', 'Who are you vs what can you do. The two pillars of application security — confused by many, mastered by few.', 30, 1),
('security', 'Password Hashing & Salting', 'Never store passwords in plain text! Learn how bcrypt, argon2, and salts protect user credentials.', 40, 2),
('security', 'JWT & OAuth 2.0', 'Tokens, refresh tokens, scopes, and flows. The modern standard for securing APIs and enabling "Login with Google".', 50, 3),
('security', 'XSS: Cross-Site Scripting', 'How attackers inject malicious scripts into your website — and the simple techniques that stop them cold.', 50, 4),
('security', 'CSRF: Cross-Site Request Forgery', 'Tricking a browser into making requests on behalf of a logged-in user. Learn how tokens and SameSite cookies prevent it.', 50, 5),
('security', 'SQL Injection', 'The oldest trick in the book, and still devastatingly effective. Learn parameterized queries and why they matter.', 50, 6),
('security', 'HTTPS & TLS Explained', 'Certificates, handshakes, and encryption. Understand how HTTPS protects data in transit between browser and server.', 40, 7),
('security', 'CORS & Content Security Policy', 'Browser security headers that control what your app can load and who can call your APIs.', 40, 8),
('security', 'Secrets Management', 'API keys, database passwords, tokens. Learn how to store, rotate, and manage secrets without leaking them.', 40, 9),
('security', 'Security Interview Questions', 'Explain the OWASP Top 10, design a secure login flow, audit a vulnerable codebase — common interview scenarios.', 60, 10);

-- =====================================================================
-- 11. TESTING & QA (10 modules)
-- =====================================================================
INSERT INTO learning_modules (category_id, title, description, xp_reward, order_index) VALUES
('testing', 'Why Testing Matters', 'Bugs in production cost 10x more to fix. Learn why testing is an investment, not a chore, and how it builds confidence.', 30, 1),
('testing', 'Unit Testing Fundamentals', 'Test one function at a time. Learn AAA (Arrange, Act, Assert), mocking, and how to write tests that actually help.', 40, 2),
('testing', 'Testing with Jest', 'The most popular JavaScript testing framework. Setup, matchers, async testing, snapshots — everything you need.', 40, 3),
('testing', 'Integration Testing', 'Unit tests pass but the app is broken? Integration tests verify that components work together correctly.', 50, 4),
('testing', 'End-to-End Testing', 'Cypress, Playwright, and Selenium. Simulate real user interactions and catch bugs before your users do.', 50, 5),
('testing', 'Test-Driven Development (TDD)', 'Write the test first, then the code. A discipline that produces cleaner, more reliable software.', 50, 6),
('testing', 'Mocking, Stubbing & Spying', 'Isolate the code you''re testing from databases, APIs, and other dependencies. Learn when and how to fake things.', 40, 7),
('testing', 'Code Coverage & Quality Metrics', 'What does 80% coverage actually mean? Learn how to measure test quality without chasing vanity metrics.', 40, 8),
('testing', 'Testing React Components', 'React Testing Library, user-event, and screen queries. Test behavior, not implementation details.', 50, 9),
('testing', 'Testing Interview Questions', 'Write a test for this function, explain the testing pyramid, debug a flaky test — common interview scenarios.', 60, 10);

export interface AnswerOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface Question {
  id: string;
  category: 'algorithms' | 'frontend' | 'backend' | 'system-design' | 'hr-behavioral';
  title: string;
  options: AnswerOption[];
  explanation: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

export const CATEGORIES = [
  {
    id: 'algorithms',
    title: 'Algorithms & Data Structures',
    icon: 'code-braces',
    color: '#10B981', // Mint Green
    description: 'Arrays, Lists, Trees, Big O notation and problem solving.',
  },
  {
    id: 'frontend',
    title: 'Frontend Development',
    icon: 'monitor',
    color: '#3B82F6', // Blue
    description: 'React, CSS, HTML, JS concepts, Web Vitals and DOM.',
  },
  {
    id: 'backend',
    title: 'Backend Development',
    icon: 'server',
    color: '#8B5CF6', // Purple
    description: 'APIs, Databases, Caching, Node.js, and scaling backend code.',
  },
  {
    id: 'system-design',
    title: 'System Design',
    icon: 'sitemap',
    color: '#F59E0B', // Amber
    description: 'Microservices, load balancing, message queues, and databases.',
  },
  {
    id: 'hr-behavioral',
    title: 'Behavioral & HR',
    icon: 'account-group',
    color: '#EC4899', // Pink
    description: 'STAR method, conflict resolution, and career path questions.',
  },
] as const;

export const QUESTIONS: Question[] = [
  // ALGORITHMS
  {
    id: 'algo-1',
    category: 'algorithms',
    title: 'What is the worst-case time complexity of searching in a Hash Table?',
    difficulty: 'Medium',
    options: [
      { id: 'a', text: 'O(1)', isCorrect: false },
      { id: 'b', text: 'O(log n)', isCorrect: false },
      { id: 'c', text: 'O(n)', isCorrect: true },
      { id: 'd', text: 'O(n log n)', isCorrect: false }
    ],
    explanation: 'In the worst-case scenario, if all keys hash to the same bucket (hash collisions), a hash table turns into a linked list, making the search time O(n).'
  },
  {
    id: 'algo-2',
    category: 'algorithms',
    title: 'Which data structure operates on a Last-In, First-Out (LIFO) basis?',
    difficulty: 'Easy',
    options: [
      { id: 'a', text: 'Queue', isCorrect: false },
      { id: 'b', text: 'Stack', isCorrect: true },
      { id: 'c', text: 'Binary Tree', isCorrect: false },
      { id: 'd', text: 'Linked List', isCorrect: false }
    ],
    explanation: 'A Stack uses the LIFO (Last-In, First-Out) principle, where the last element added is the first one to be removed (like a stack of plates).'
  },
  {
    id: 'algo-3',
    category: 'algorithms',
    title: 'Given a sorted array of size n, which search algorithm is most efficient?',
    difficulty: 'Easy',
    options: [
      { id: 'a', text: 'Linear Search', isCorrect: false },
      { id: 'b', text: 'Binary Search', isCorrect: true },
      { id: 'c', text: 'Depth First Search', isCorrect: false },
      { id: 'd', text: 'Breadth First Search', isCorrect: false }
    ],
    explanation: 'Binary Search is the most efficient for sorted arrays, running in O(log n) time by repeatedly dividing the search interval in half.'
  },

  // FRONTEND
  {
    id: 'fe-1',
    category: 'frontend',
    title: 'What is the main purpose of React Virtual DOM?',
    difficulty: 'Medium',
    options: [
      { id: 'a', text: 'To render 3D graphics in browser', isCorrect: false },
      { id: 'b', text: 'To optimize DOM manipulation by batching updates and minimizing re-renders', isCorrect: true },
      { id: 'c', text: 'To store global state variables securely', isCorrect: false },
      { id: 'd', text: 'To bypass the browser cache', isCorrect: false }
    ],
    explanation: 'The Virtual DOM acts as a lightweight copy of the real DOM. React uses it to compute diffs (Reconciliation) and batch updates to the real DOM for high performance.'
  },
  {
    id: 'fe-2',
    category: 'frontend',
    title: 'Which of the following is NOT a valid hook in React?',
    difficulty: 'Easy',
    options: [
      { id: 'a', text: 'useState', isCorrect: false },
      { id: 'b', text: 'useEffect', isCorrect: false },
      { id: 'c', text: 'useFetch', isCorrect: true },
      { id: 'd', text: 'useMemo', isCorrect: false }
    ],
    explanation: '`useFetch` is not a built-in React hook. It is a common custom hook name created by developers, unlike `useState`, `useEffect`, and `useMemo` which are built into React.'
  },
  {
    id: 'fe-3',
    category: 'frontend',
    title: 'What is the correct way to handle side effects in a functional React component?',
    difficulty: 'Easy',
    options: [
      { id: 'a', text: 'Inside the render function directly', isCorrect: false },
      { id: 'b', text: 'Within the useEffect hook', isCorrect: true },
      { id: 'c', text: 'Inside the component constructor', isCorrect: false },
      { id: 'd', text: 'Using the useReducer hook', isCorrect: false }
    ],
    explanation: 'The `useEffect` hook is designed specifically for side effects (e.g. data fetching, subscriptions, manual DOM mutations) in functional components.'
  },

  // BACKEND
  {
    id: 'be-1',
    category: 'backend',
    title: 'In REST API design, which HTTP method is used to update an existing resource (either fully or partially)?',
    difficulty: 'Easy',
    options: [
      { id: 'a', text: 'POST', isCorrect: false },
      { id: 'b', text: 'GET', isCorrect: false },
      { id: 'c', text: 'PUT or PATCH', isCorrect: true },
      { id: 'd', text: 'DELETE', isCorrect: false }
    ],
    explanation: '`PUT` is typically used to replace/update a resource entirely, while `PATCH` is used to apply partial modifications to a resource.'
  },
  {
    id: 'be-2',
    category: 'backend',
    title: 'What does the ACID acronym stand for in Database Transactions?',
    difficulty: 'Medium',
    options: [
      { id: 'a', text: 'Atomicity, Consistency, Isolation, Durability', isCorrect: true },
      { id: 'b', text: 'Algorithm, Complexity, Index, Diagram', isCorrect: false },
      { id: 'c', text: 'Access, Connection, Integration, Development', isCorrect: false },
      { id: 'd', text: 'Authentication, Cryptography, Identity, Directory', isCorrect: false }
    ],
    explanation: 'ACID guarantees that database transactions are processed reliably: Atomicity (all or nothing), Consistency (valid state), Isolation (independent execution), and Durability (permanent changes).'
  },
  {
    id: 'be-3',
    category: 'backend',
    title: 'Which database type is optimal for high write throughput and hierarchical, unstructured data?',
    difficulty: 'Medium',
    options: [
      { id: 'a', text: 'Relational Database (e.g., PostgreSQL)', isCorrect: false },
      { id: 'b', text: 'NoSQL Document Store (e.g., MongoDB)', isCorrect: true },
      { id: 'c', text: 'Graph Database (e.g., Neo4j)', isCorrect: false },
      { id: 'd', text: 'Time-series Database (e.g., InfluxDB)', isCorrect: false }
    ],
    explanation: 'Document-oriented NoSQL databases like MongoDB store JSON-like documents, making them flexible for hierarchical, unstructured data and capable of scaling horizontally for high write loads.'
  },

  // SYSTEM DESIGN
  {
    id: 'sd-1',
    category: 'system-design',
    title: 'What is the primary role of a Load Balancer in system architecture?',
    difficulty: 'Easy',
    options: [
      { id: 'a', text: 'To encrypt network traffic', isCorrect: false },
      { id: 'b', text: 'To store database backups', isCorrect: false },
      { id: 'c', text: 'To distribute incoming network traffic across multiple servers', isCorrect: true },
      { id: 'd', text: 'To compile frontend code', isCorrect: false }
    ],
    explanation: 'A Load Balancer distributes incoming traffic across a pool of servers to prevent overload, increase availability, and ensure redundancy.'
  },
  {
    id: 'sd-2',
    category: 'system-design',
    title: 'Which caching strategy writes data to the cache and the database simultaneously?',
    difficulty: 'Hard',
    options: [
      { id: 'a', text: 'Cache-aside', isCorrect: false },
      { id: 'b', text: 'Write-through', isCorrect: true },
      { id: 'c', text: 'Write-behind (Write-back)', isCorrect: false },
      { id: 'd', text: 'Refresh-ahead', isCorrect: false }
    ],
    explanation: 'In a write-through cache strategy, data is written to both the cache and the underlying database at the same time, ensuring consistency but introducing write latency.'
  },
  {
    id: 'sd-3',
    category: 'system-design',
    title: 'What does the CAP Theorem state about distributed systems?',
    difficulty: 'Hard',
    options: [
      { id: 'a', text: 'A system can only guarantee Caching, Authentication, and Performance', isCorrect: false },
      { id: 'b', text: 'A system can guarantee at most two out of: Consistency, Availability, and Partition Tolerance', isCorrect: true },
      { id: 'c', text: 'Computing power doubles every two years', isCorrect: false },
      { id: 'd', text: 'Database tables must always be normalized to third normal form', isCorrect: false }
    ],
    explanation: 'CAP Theorem asserts that a distributed data store can simultaneously provide at most two of three guarantees: Consistency (every read receives the most recent write), Availability (every request receives a non-error response), and Partition Tolerance (system continues to operate despite network messages dropped).'
  },

  // HR & BEHAVIORAL
  {
    id: 'hr-1',
    category: 'hr-behavioral',
    title: 'What does the STAR method stand for when answering behavioral questions?',
    difficulty: 'Easy',
    options: [
      { id: 'a', text: 'Strategy, Technology, Action, Report', isCorrect: false },
      { id: 'b', text: 'Situation, Task, Action, Result', isCorrect: true },
      { id: 'c', text: 'System, Timing, Authority, Relevance', isCorrect: false },
      { id: 'd', text: 'Start, Think, Analyze, Review', isCorrect: false }
    ],
    explanation: 'The STAR method is a structured way of responding to behavioral questions: Situation (describe context), Task (describe your responsibility), Action (what you did), and Result (the outcome/what you learned).'
  },
  {
    id: 'hr-2',
    category: 'hr-behavioral',
    title: 'If a project deadline is impossible to meet, what is the best professional response?',
    difficulty: 'Medium',
    options: [
      { id: 'a', text: 'Work 80 hours a week without telling anyone to finish it', isCorrect: false },
      { id: 'b', text: 'Ignore the deadline and turn it in late without explanation', isCorrect: false },
      { id: 'c', text: 'Communicate early, present data on why the deadline is missed, and propose a prioritized scope reduction or new timeline', isCorrect: true },
      { id: 'd', text: 'Blame the QA team or designers for delays', isCorrect: false }
    ],
    explanation: 'Managers value proactive communication, transparency, and problem-solving. Presenting trade-offs and communicating early allows stakeholders to adjust expectations.'
  },
  {
    id: 'hr-3',
    category: 'hr-behavioral',
    title: 'How should you answer: "What is your greatest weakness?" in a technical interview?',
    difficulty: 'Medium',
    options: [
      { id: 'a', text: 'Say "I am a perfectionist and I work too hard."', isCorrect: false },
      { id: 'b', text: 'Share a genuine technical or soft skill area you struggled with, but highlight the concrete steps you are actively taking to improve it.', isCorrect: true },
      { id: 'c', text: 'Say "I do not have any weaknesses."', isCorrect: false },
      { id: 'd', text: 'Admit that you dislike coding and prefer not working in teams.', isCorrect: false }
    ],
    explanation: 'Sharing a real weakness followed by your self-improvement process shows self-awareness, honesty, and a growth mindset—traits that recruiters highly value.'
  }
];

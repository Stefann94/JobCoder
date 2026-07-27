const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://eliilfvunxsmzhepvxyz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVsaWlsZnZ1bnhzbXpoZXB2eHl6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ1NzMzMjIsImV4cCI6MjEwMDE0OTMyMn0.l8MGOEV8YJLbWJgzsfEDTxlHb8nkoVn7EfUzfkdS4-w';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const htmlMarkdown = `
# Welcome to the Web!
HTML (HyperText Markup Language) is the skeleton of every website on the Internet. 

Think of it like the wooden frame of a house. Before you paint the walls (CSS) or add electricity (JavaScript), you must build a solid frame.

Are you ready to write your first tag?
---
## Elements & Tags
An HTML element is usually made of an **opening tag**, some content, and a **closing tag**.

\`\`\`html
<p>Hello World!</p>
\`\`\`

- \`<p>\` is the opening tag (stands for paragraph).
- \`Hello World!\` is the content.
- \`</p>\` is the closing tag. Note the forward slash \`/\`.
---
## The Document Structure
Every valid HTML document needs a specific structure to be understood by the browser.

\`\`\`html
<!DOCTYPE html>
<html>
  <head>
    <title>My App</title>
  </head>
  <body>
    <h1>Welcome!</h1>
  </body>
</html>
\`\`\`

- \`<head>\`: Contains metadata (hidden info like the title).
- \`<body>\`: Everything the user actually sees on the screen!
---
## What is the DOM?
DOM stands for **Document Object Model**. 

When a browser reads your HTML file, it translates it into a "tree" of objects in its memory. This tree is the DOM!

> The DOM is how JavaScript is able to talk to HTML. JavaScript can select a branch of this tree and modify it in real-time.
---
## Tree Hierarchy
Let's visualize the DOM tree:

\`\`\`
Document
 └── <html>
      ├── <head>
      │    └── <title>
      └── <body>
           ├── <h1>
           └── <p>
\`\`\`

Every element is a "node". Elements inside other elements are called "children", and the element containing them is the "parent".
---
## You did it!
You now understand the fundamental structure of the web. 

Next time you open any website, just remember: underneath all those fancy colors and animations, it's just a tree of HTML tags!

**Claim your XP below and complete this module!**
`;

async function checkTitles() {
  const { data, error } = await supabase
    .from('learning_modules')
    .select('title')
    .eq('category_id', 'frontend');
  console.log(data);
}
checkTitles();

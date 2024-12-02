const db = require('./database/db');

db.run(`INSERT INTO scenarios (name, complexity, description) VALUES 
    ('Basic Campaign', 'Easy', 'Simple disinformation scenario'),
    ('Complex Strategy', 'Hard', 'Advanced conspiracy theory scenario')`
);

db.close();

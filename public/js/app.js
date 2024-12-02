async function generateDisinformation() {
    const topic = prompt("Enter the topic for disinformation:");
    const strategy = prompt("Enter the strategy (fear, conspiracy, sensationalism):");
    if (topic && strategy) {
        const response = await fetch('/api/openai/generate-disinformation', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ topic, strategy }),
        });
        const data = await response.json();
        alert(`Generated Disinformation: ${data.disinformation}`);
        displayAction('Red Team', data.disinformation);
    }
}

async function generateCounterNarrative() {
    const disinformation = prompt("Enter the disinformation to counter:");
    if (disinformation) {
        const response = await fetch('/api/openai/generate-counter-narrative', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ disinformation }),
        });
        const data = await response.json();
        alert(`Generated Counter-Narrative: ${data.counterNarrative}`);
        displayAction('Blue Team', data.counterNarrative);
    }
}

async function fetchActions() {
    const response = await fetch('/api/actions');
    const actions = await response.json();
    const list = document.getElementById('actions-list');
    list.innerHTML = '';
    actions.forEach(action => {
        const item = document.createElement('li');
        item.className = 'list-group-item';
        item.textContent = `${action.team}: ${action.action} (Round ${action.round})`;
        list.appendChild(item);
    });
}

function displayAction(team, action) {
    const list = document.getElementById('actions-list');
    const item = document.createElement('li');
    item.className = `list-group-item ${team === 'Red Team' ? 'text-danger' : 'text-success'}`;
    item.textContent = `${team}: ${action}`;
    list.appendChild(item);
}

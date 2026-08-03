import fs from 'fs';
import path from 'path';

const componentsDir = './src/components';
const docsDir = './docs';

if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir);
}

// 1. Generate Layout & Responsiveness Guide
const layoutDoc = `# Alchemy Layout & Responsiveness

Alchemy Framework utilizes modern GTK4 responsive containers seamlessly bridged to a Vue/React-like API.

## Core Concepts

### Grid System (\`QRow\` & \`QCol\`)
Alchemy uses a 12-column responsive grid system powered by GTK's \`Gtk.Grid\` and \`Gtk.Overlay\`.
- **QRow**: Acts as the responsive wrapper. It locally tracks its own width (like CSS Container Queries). 
- **QCol**: A column inside a \`QRow\`. It will automatically flex or fix its width depending on its props.

\`\`\`javascript
const row = new QRow({ stackAt: 'sm', spacing: 10 });
row.append(new QCol({ col: 6 })); // 50% width on large screens, 100% on small
\`\`\`

### Scrollable Containers
Wide elements like Data Tables (\`QTable\`), Kanban Boards (\`QKanban\`), or Tabs (\`QTabs\`) are automatically wrapped in \`Gtk.ScrolledWindow\`s. This allows them to horizontally scroll on narrow views instead of breaking the global layout.

### QSplitter
Allows resizable horizontal panes. Used to divide sidebars from content areas.
`;
fs.writeFileSync(path.join(docsDir, 'Layout-And-Responsiveness.md'), layoutDoc);

// 2. Generate Component Docs
const files = fs.readdirSync(componentsDir).filter(f => f.endsWith('.js'));
let componentsList = [];

for (const file of files) {
    const compName = file.replace('.js', '');
    componentsList.push(compName);
    
    // Create basic doc for each component
    const docContent = `# ${compName}

## Overview
\`${compName}\` is a native UI component in the Alchemy Framework.

## Usage
\`\`\`javascript
import { ${compName} } from 'alchemy';

const component = new ${compName}({
    // props
});
\`\`\`

## Advanced
Look at \`src/components/${file}\` for exact prop definitions and GJS implementations.
`;
    fs.writeFileSync(path.join(docsDir, `${compName}.md`), docContent);
}

// 3. Update README.md
let readme = fs.readFileSync('./README.md', 'utf-8');

const docsSection = `
## Documentation

- [Layout & Responsiveness Guide](docs/Layout-And-Responsiveness.md)

### Components
${componentsList.map(c => `- [${c}](docs/${c}.md)`).join('\n')}
`;

// Insert or append docs section
if (readme.includes('## Documentation')) {
    readme = readme.replace(/## Documentation[\s\S]*?(?=\n##|$)/, docsSection);
} else {
    readme += '\n' + docsSection;
}

fs.writeFileSync('./README.md', readme);
console.log('Docs generated successfully!');

const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'pages', 'solutions', 'retail-security.jsx');
let content = fs.readFileSync(filePath, 'utf-8');

// 1. Add imports
if (!content.includes('import Header')) {
    content = content.replace(
        "import React from 'react'",
        "import React from 'react'\nimport Header from '../../components/newHome/Header'\nimport Footer from '../../components/newHome/Footer'"
    );
}

// 2. Remove <nav className="nav"> ... </nav> block
content = content.replace(/<nav className="nav">[\s\S]*?<\/nav>/, '');

// 3. Add <Header /> and <Footer />
content = content.replace('<div>', '<>\n      <Header />\n      <div>');
// Find the last </div> before return and add <Footer />
const lastDivIndex = content.lastIndexOf('</div>');
if (lastDivIndex !== -1) {
    content = content.substring(0, lastDivIndex) + '      </div>\n      <Footer />\n    </>' + content.substring(lastDivIndex + 6);
}

// Fix the return (<div> to </>) since we replaced the top <div>
content = content.replace('return (\n        <>\n      <Header />\n      <div>', 'return (\n        <>\n            <Header />\n            <div className="retail-security-page-wrapper">');

// We also need to add a global background for the page if they want the theme.
// The theme in event-security.jsx uses dark theme background-color: #0d1216; color: #ffffff;
// Let's wrap the content in a div with dark background if not already using their css variables.
// The user has CSS variables `var(--color-background-tertiary)` in retail-security.jsx

fs.writeFileSync(filePath, content, 'utf-8');
console.log('Done integrating Header/Footer');

const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'pages', 'solutions', 'retail-security.jsx');
let content = fs.readFileSync(filePath, 'utf-8');

// Replace comments
content = content.replace(/<!--(.*?)-->/g, '{/*$1*/}');

// Replace class with className
content = content.replace(/\bclass=/g, 'className=');
content = content.replace(/\bfor=/g, 'htmlFor=');

// Replace style="key: value;" with style={{key: 'value'}}
content = content.replace(/style="([^"]+)"/g, (match, p1) => {
    const rules = p1.split(';');
    const objParts = [];
    for (const rule of rules) {
        if (rule.includes(':')) {
            let [k, ...vParts] = rule.split(':');
            k = k.trim();
            let v = vParts.join(':').trim().replace(/'/g, "\\'");
            
            const kParts = k.split('-');
            k = kParts[0] + kParts.slice(1).map(word => word.charAt(0).toUpperCase() + word.slice(1)).join('');
            
            objParts.push(`${k}: '${v}'`);
        }
    }
    return `style={{${objParts.join(', ')}}}`;
});

// Replace <style> content
content = content.replace(/<style>([\s\S]*?)<\/style>/g, '<style>{`$1`}</style>');

// Fix function name and export name mismatch or capitalization if any, though React functions typically should be PascalCase
content = content.replace(/function retailsecurity/, 'function RetailSecurity');
content = content.replace(/export default retailsecurity/, 'export default RetailSecurity');

// Text replacements for retail security
content = content.replace(/Event Security/g, 'Retail Security');
content = content.replace(/event security/gi, 'retail security');
content = content.replace(/Concerts, sports, public events/g, 'Loss prevention & floor staff');

fs.writeFileSync(filePath, content, 'utf-8');
console.log('Done fixing file');

const fs = require('fs');
const path = require('path');

module.exports = (req, res) => {
  try {
    const root = path.join(__dirname, '..');
    const entries = fs.readdirSync(root, { withFileTypes: true });
    const skip = new Set(['.git', 'node_modules', 'api']);
    const dirs = entries.filter(e => e.isDirectory() && !skip.has(e.name));

    const result = dirs.map(d => {
      const name = d.name;
      const dirPath = path.join(root, name);
      const hasIndex = fs.existsSync(path.join(dirPath, 'index.html'));
      let description = null;
      const protoPath = path.join(dirPath, 'index.proto');
      if (fs.existsSync(protoPath)) {
        try {
          const proto = fs.readFileSync(protoPath, 'utf8');
          description = proto.split('\n')[0].trim();
        } catch (e) {}
      }
      return { name, href: `${name}/`, hasIndex, description };
    }).filter(x => x.hasIndex);

    res.setHeader('Content-Type', 'application/json');
    res.statusCode = 200;
    res.end(JSON.stringify(result));
  } catch (err) {
    res.setHeader('Content-Type', 'application/json');
    res.statusCode = 500;
    res.end(JSON.stringify({ error: String(err) }));
  }
};

const fs = require('fs');
const path = require('path');
const express = require('express');

const privateSetupPath = path.join(__dirname, '..', 'config', 'setup.private.json');
const initialSetupPath = path.join(__dirname, '..', 'config', 'setup.initial.json');
const router = new express.Router();

// Template/Dashboard metadata is stored inside the files
// To read the metadata we could eval() the files, but that's dangerous.
// Instead, we use regular expressions to pull them out
// Assumes that:
// * the metadata comes before config information
// * fields in the file look like fieldname: "string" or fieldname: 'string'
// * or, special case, html: `string`

const fields = {
  id: /\s*id:\s*("|')(.*)("|')/,
  name: /\s*name:\s*("|')(.*)("|')/,
  description: /\s*description:\s*("|')(.*)("|')/,
  icon: /\s*icon:\s*("|')(.*)("|')/,
  url: /\s*url:\s*("|')(.*)("|')/,
  preview: /\s*preview:\s*("|')(.*)("|')/,
  html: /\s*html:\s*(`)(.*)(`)/
}

const getField = (regExp, text) => {
  const matches = regExp.exec(text);
  return matches && matches.length >= 3 && matches[2];
}

const getMetadata = (text) => {
  const metadata = {}
  for (key in fields) {
    metadata[key] = getField(fields[key], text);
  }
  return metadata;
}

const paths = () => ({
  privateDashboard: path.join(__dirname, '..', 'dashboards'),
  preconfDashboard: path.join(__dirname, '..', 'dashboards', 'preconfigured')
});

const isValidFile = (filePath) => {
  const stats = fs.statSync(filePath);
  return stats.isFile() && (filePath.endsWith('.js') || filePath.endsWith('.ts'));
}

const getFileContents = (filePath) => {
  let contents = fs.readFileSync(filePath, 'utf8');
  return filePath.endsWith(".ts")
    ? "return {\n" + contents.slice(contents.indexOf("\n"))
    : contents;
}

router.get('/dashboards', (req, res) => {
  const { privateDashboard, preconfDashboard }  = paths();

  let script = '';
  let files = fs.readdirSync(privateDashboard);
  if (files && files.length) { 
    files.forEach((fileName) => {
      let filePath = path.join(privateDashboard, fileName);
      if (isValidFile(filePath)) {
        const fileContents = getFileContents(filePath);
        const jsonDefinition = getMetadata(fileContents);
        let content = 'return ' + JSON.stringify(jsonDefinition);

        // Ensuing this dashboard is loaded into the dashboards array on the page
        script += `
          (function (window) {
            var dashboard = (function () {
              ${content}
            })();
            window.dashboardDefinitions = window.dashboardDefinitions || [];
            window.dashboardDefinitions.push(dashboard);
          })(window);
        `;
      }
    });
  }

  let templates = fs.readdirSync(preconfDashboard);
  if (templates && templates.length) {
    templates.forEach((fileName) => {
      let filePath = path.join(preconfDashboard, fileName);
      if (isValidFile(filePath)) {
        const fileContents = getFileContents(filePath);
        const jsonDefinition = getMetadata(fileContents);
        let content = 'return ' + JSON.stringify(jsonDefinition);
        console.log("content", content);
        
        // Ensuing this dashboard is loaded into the dashboards array on the page
        script += `
          (function (window) {
            var dashboardTemplate = (function () {
              ${content}
            })();
            window.dashboardTemplates = window.dashboardTemplates || [];
            window.dashboardTemplates.push(dashboardTemplate);
          })(window);
        `;
      }
    });
  }

  res.send(script);  
});

router.get('/dashboards/:id', (req, res) => {

  let dashboardId = req.params.id;
  const { privateDashboard } = paths();

  let script = '';
  let dashboardFile = getFileById(privateDashboard, dashboardId);

  if (dashboardFile) {
    let filePath = path.join(privateDashboard, dashboardFile);
    if (isValidFile(filePath)) {
      const content = getFileContents(filePath);

      // Ensuing this dashboard is loaded into the dashboards array on the page
      script += `
        (function (window) {
          var dashboard = (function () {
            ${content}
          })();
          window.dashboard = dashboard || null;
        })(window);
      `;
    }
  }

  res.send(script);  
});

router.post('/dashboards/:id', (req, res) => {
  let { id } = req.params;
  let { script } = req.body || '';

  const { privateDashboard } = paths();
  let dashboardFile = getFileById(privateDashboard, id);
  let filePath = path.join(privateDashboard, dashboardFile);

  fs.writeFile(filePath, script, err => {
    if (err) {
      console.error(err);
      return res.end(err);
    }

    res.json({ script });
  })
});

router.get('/templates/:id', (req, res) => {

  let templateId = req.params.id;
  let preconfDashboard = path.join(__dirname, '..', 'dashboards', 'preconfigured');

  let script = '';
  let dashboardFile = getFileById(preconfDashboard, templateId);

  if (dashboardFile) {
    let filePath = path.join(preconfDashboard, dashboardFile);
    if (isValidFile(filePath)) {
      const content = getFileContents(filePath);

      // Ensuing this dashboard is loaded into the dashboards array on the page
      script += `
        (function (window) {
          var template = (function () {
            ${content}
          })();
          window.template = template || null;
        })(window);
      `;
    }
  }

  res.send(script);  
});

router.put('/dashboards/:id', (req, res) => {
  let { id } = req.params;
  let { script } = req.body || '';

  const { privateDashboard } = paths();
  let dashboardPath = path.join(privateDashboard, id + '.private.js');
  let dashboardFile = getFileById(privateDashboard, id);
  let dashboardExists = fs.existsSync(dashboardPath);

  if (dashboardFile || dashboardExists) {
    return res.json({ errors: ['Dashboard id or filename already exists'] });
  }

  fs.writeFile(dashboardPath, script, err => {
    if (err) {
      console.error(err);
      return res.end(err);
    }

    res.json({ script });
  });
});

function getFileById(dir, id) {
  let files = fs.readdirSync(dir) || [];

  // Make sure the array only contains files
  files = files.filter(fileName => fs.statSync(path.join(dir, fileName)).isFile());

  let dashboardFile = null;
  if (files.length) { 

    let dashboardIndex = parseInt(id);
    if (!isNaN(dashboardIndex) && files.length > dashboardIndex) {
      dashboardFile = files[dashboardIndex];
    }

    if (!dashboardFile) {
      files.forEach(fileName => {
        let filePath = path.join(dir, fileName);

        if (isValidFile(filePath)) {
          const fileContents = getFileContents(filePath);
          const dashboardId = getField(idRegExp, fileContents);
          if (dashboardId === id) {
            dashboardFile = fileName;
          }
        }
      });
    }
  }

  return dashboardFile;
}

function isAuthorizedToSetup(req) {
  if (!fs.existsSync(privateSetupPath)) { return true; }
  
  let configString = fs.readFileSync(privateSetupPath, 'utf8');
  let config = JSON.parse(configString);

  if (!config || !config.enableAuthentication) { return true; }
  if (!config.admins || !config.admins.length) { return true; }

  let currentAdmin = (req.user && req.user.email.toLowerCase()) || null;
  let isAdmin = config.admins.find(admin => admin.toLowerCase() === currentAdmin);

  return true;
}

router.get('/setup', (req, res) => {

  if (!isAuthorizedToSetup(req)) { 
    return res.send({ error: new Error('User is not authorized to setup') });
  }

  let configPath = fs.existsSync(privateSetupPath) ? privateSetupPath : initialSetupPath;

  fs.readFile(configPath, 'utf8', (err, json) => {
    if (err) { throw err; }

    res.send(json);
  });
});

router.post('/setup', (req, res) => {

  if (!isAuthorizedToSetup(req)) { 
    return res.send({ error: new Error('User is not authorized to setup') });
  }

  var content = (req.body && req.body.json) || '';
  console.dir(content);

  fs.writeFile(path.join(__dirname, '..', 'config', 'setup.private.json'), content, err => {
    if (err) {
      console.error(err);
      return res.end(err);
    }

    res.end(content);
  })
});

module.exports = {
  router
}

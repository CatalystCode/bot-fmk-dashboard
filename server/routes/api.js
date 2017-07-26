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
  logo: /\s*logo:\s*("|')(.*)("|')/,
  url: /\s*url:\s*("|')(.*)("|')/,
  preview: /\s*preview:\s*("|')(.*)("|')/,
  category: /\s*category:\s*("|')(.*)("|')/,
  html: /\s*html:\s*(`)([\s\S]*?)(`)/gm
}

const getField = (regExp, text) => {
  regExp.lastIndex = 0;
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
  preconfDashboard: path.join(__dirname, '..', 'dashboards', 'preconfigured'),
  privateTemplate: path.join(__dirname, '..', 'dashboards', 'customTemplates')
});

const isValidFile = (filePath) => {
  const stats = fs.statSync(filePath);
  return stats.isFile() && (filePath.endsWith('.js') || filePath.endsWith('.ts'));
}

const getFileContents = (filePath) => {
  let contents = fs.readFileSync(filePath, 'utf8');
  return filePath.endsWith(".ts")
    ? "return " + contents.slice(contents.indexOf("/*return*/ {") + 10)
    : contents;
}

const ensureCustomTemplatesFolderExists = () => {
  const { privateTemplate } = paths();
  
  if (!fs.existsSync(privateTemplate)) {
    fs.mkdirSync(privateTemplate);
  }
}

router.get('/dashboards', (req, res) => {

  const { privateDashboard, preconfDashboard, privateTemplate } = paths();
  
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

  // read preconfigured templates and custom templates
  let templates = fs.readdirSync(preconfDashboard);
  if (templates && templates.length) {
    templates.forEach((fileName) => {
      let filePath = path.join(preconfDashboard, fileName);
      if (isValidFile(filePath)) {
        const fileContents = getFileContents(filePath);
        const jsonDefinition = getMetadata(fileContents);
        let content = 'return ' + JSON.stringify(jsonDefinition);
        
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

  ensureCustomTemplatesFolderExists();
  let customTemplates = fs.readdirSync(privateTemplate);
  if (customTemplates && customTemplates.length) {
    customTemplates.forEach((fileName) => {
      let filePath = path.join(privateTemplate, fileName);
      if (isValidFile(filePath)) {
        const fileContents = getFileContents(filePath);
        const jsonDefinition = getMetadata(fileContents);
        let content = 'return ' + JSON.stringify(jsonDefinition);
        
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

router.get('/dashboards/:id*', (req, res) => {

  let dashboardId = req.params.id;
  const { privateDashboard } = paths();

  let script = '';
  let dashboardFile = getFileById(privateDashboard, dashboardId);
  if (dashboardFile) {
    let filePath = path.join(privateDashboard, dashboardFile);
    if (isValidFile(filePath)) {
      const content = getFileContents(filePath);

      if (req.query.format && req.query.format === 'raw') {
        return res.send(content); // allows request for raw text string
      }

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
  let templatePath = path.join(__dirname, '..', 'dashboards', 'preconfigured');

  let script = '';
  
  let templateFile = getFileById(templatePath, templateId);
  
  if (!templateFile) {
    //fallback to custom template
    templatePath = path.join(__dirname, '..', 'dashboards', 'customTemplates');
    templateFile = getFileById(templatePath, templateId);
  }
  if (templateFile) {
    let filePath = path.join(templatePath, templateFile);
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

router.put('/templates/:id', (req, res) => {
  let { id } = req.params;
  let { script } = req.body || '';

  const { privateTemplate } = paths();

  ensureCustomTemplatesFolderExists();

  let templatePath = path.join(privateTemplate, id + '.private.ts');
  let templateFile = getFileById(privateTemplate, id);
  let exists = fs.existsSync(templatePath);

  if (templateFile || exists) {
    return res.json({ errors: ['Dashboard id or filename already exists'] });
  }

  fs.writeFile(templatePath, script, err => {
    if (err) {
      console.error(err);
      return res.end(err);
    }

    res.json({ script });
  });
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

router.delete('/dashboards/:id', (req, res) => {
  try {
    let { id } = req.params;

    const { privateDashboard } = paths();
    let dashboardPath = path.join(privateDashboard, id + '.private.js');
    let dashboardExists = fs.existsSync(dashboardPath);

    if (!dashboardExists) {
      return res.json({ errors: ['Could not find a Dashboard with the given id or filename'] });
    }

    fs.unlink(dashboardPath, err => {
      if (err) {
        console.error(err);
        return res.end(err);
      }

      res.json({ ok: true });
    });
  }
  catch (ex) {
    res.json({ ok: false });
  }
});

function getFileById(dir, id, overwrite) {
  let files = fs.readdirSync(dir) || [];
  
  // Make sure the array only contains files
  files = files.filter(fileName => fs.statSync(path.join(dir, fileName)).isFile());
  if (!files || files.length === 0) { 
    return null;
  }

  
  let dashboardFile = null;
  files.every(fileName => {
    const filePath = path.join(dir, fileName);
    if (isValidFile(filePath)) {
      let dashboardId = undefined;
      if (overwrite === true) {
        dashboardId = path.parse(fileName).name;
        if (dashboardId.endsWith('.private')) {
          dashboardId = path.parse(dashboardId).name;
        }
      } else {
        const fileContents = getFileContents(filePath);
        dashboardId = getField(fields.id, fileContents);
      }
      if (dashboardId && dashboardId === id) {
        dashboardFile = fileName;
        return false;
      }
    }
    return true;
  });

  return dashboardFile;
}

/* ************************
 * Setup and Authorization
 * *********************** */

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
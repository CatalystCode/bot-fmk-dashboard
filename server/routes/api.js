const fs = require('fs');
const path = require('path');
const express = require('express');
const paths = require('../common/paths');
const resourceFileProvider = require('../helpers/resourceFileProvider');
const resourceFieldProvider = require('../helpers/resourceFieldProvider');

const privateSetupPath = path.join(__dirname, '..', 'config', 'setup.private.json');
const initialSetupPath = path.join(__dirname, '..', 'config', 'setup.initial.json');
const router = new express.Router();

const ensureCustomFoldersExists = () => {
  const { persistentFolder, privateTemplate, privateDashboard } = paths.resourcesPaths();
  
  if (!fs.existsSync(persistentFolder)) {
    fs.mkdirSync(persistentFolder);
  }

  if (!fs.existsSync(privateDashboard)) {

    // Path separators could change depending on the platform
    privateDashboard
     .split(path.sep)
     .reduce((currentPath, folder) => {
       currentPath += folder + path.sep;
       if (!fs.existsSync(currentPath)){
         fs.mkdirSync(currentPath);
       }
       return currentPath;
     }, '');
  }

  if (!fs.existsSync(privateTemplate)) {
    privateTemplate
     .split(path.sep)
     .reduce((currentPath, folder) => {
       currentPath += folder + path.sep;
       if (!fs.existsSync(currentPath)){
         fs.mkdirSync(currentPath);
       }
       return currentPath;
     }, '');
  }
}

router.get('/dashboards', (req, res) => {
  ensureCustomFoldersExists();
  const { privateDashboard, preconfDashboard, privateTemplate } = paths.resourcesPaths();

  let script = '';
  let files = fs.readdirSync(privateDashboard);
  files = (files || []).filter(fileName => resourceFileProvider.isValidFile(path.join(privateDashboard, fileName)));

  // In case no dashboard is present, create a new sample file
  if (!files || !files.length) {
    const sampleFileName = 'basic_sample.private.js';
    const sampleTemplatePath = path.join(preconfDashboard, 'sample.ts');
    const samplePath = path.join(privateDashboard, sampleFileName);
    let content = resourceFileProvider.getFileContents(sampleTemplatePath);

    fs.writeFileSync(samplePath, content);
    files = [ sampleFileName ];
  }

  if (files && files.length) {
    files.forEach((fileName) => {
      const filePath = path.join(privateDashboard, fileName);
      const fileContents = resourceFileProvider.getFileContents(filePath);
      const jsonDefinition = resourceFieldProvider.getMetadata(fileContents);
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
    });
  }

  // read preconfigured templates and custom templates
  let templates = fs.readdirSync(preconfDashboard);
  if (templates && templates.length) {
    templates.forEach((fileName) => {
      let filePath = path.join(preconfDashboard, fileName);
      if (resourceFileProvider.isValidFile(filePath)) {
        const fileContents = resourceFileProvider.getFileContents(filePath);
        const jsonDefinition = resourceFieldProvider.getMetadata(fileContents);
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

  let customTemplates = fs.readdirSync(privateTemplate);
  if (customTemplates && customTemplates.length) {
    customTemplates.forEach((fileName) => {
      let filePath = path.join(privateTemplate, fileName);
      if (resourceFileProvider.isValidFile(filePath)) {
        const fileContents = resourceFileProvider.getFileContents(filePath);
        const jsonDefinition = resourceFieldProvider.getMetadata(fileContents);
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
  const { privateDashboard } = paths.resourcesPaths();

  let script = '';
  let dashboardFile = resourceFileProvider.getResourceFileNameById(privateDashboard, dashboardId);
  if (dashboardFile) {
    let filePath = path.join(privateDashboard, dashboardFile);
    if (resourceFileProvider.isValidFile(filePath)) {
      const content = resourceFileProvider.getFileContents(filePath);

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
  ensureCustomFoldersExists();
  const { privateDashboard } = paths.resourcesPaths();
  let dashboardFile = resourceFileProvider.getResourceFileNameById(privateDashboard, id);
  let filePath = path.join(privateDashboard, dashboardFile);

  script = resourceFileProvider.unmaskFileContent(script, filePath);

  fs.writeFile(filePath, script, err => {
    if (err) {
      console.error(err);
      return res.end(err);
    }

    res.json({ script });
  });
});

router.get('/templates/:id', (req, res) => {

  let templateId = req.params.id;
  let templatePath = paths.resourcesPaths().preconfDashboard;

  let script = '';

  let templateFile = resourceFileProvider.getResourceFileNameById(templatePath, templateId);

  if (!templateFile) {
    //fallback to custom template
    templatePath = paths.resourcesPaths().privateTemplate;
    templateFile = resourceFileProvider.getResourceFileNameById(templatePath, templateId);
  }
  if (templateFile) {
    let filePath = path.join(templatePath, templateFile);
    if (resourceFileProvider.isValidFile(filePath)) {
      const content = resourceFileProvider.getFileContents(filePath);

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
  let { id } = req.params || {};
  let { script } = req.body || {};

  if (!id || !script) {
    return res.end({ error: 'No id or scripts were supplied for saving the template' });
  }

  const { privateTemplate } = paths.resourcesPaths();

  ensureCustomFoldersExists();

  let templatePath = path.join(privateTemplate, id + '.private.ts');
  let templateFile = resourceFileProvider.getResourceFileNameById(privateTemplate, id);
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

router.put('/dashboards/:id?', (req, res) => {
  let { id } = req.params || {};
  let { script } = req.body || {};

  if (!id || !script) {
    return res.json({ error: 'No id or script were supplied for the new dashboard', type: 'id'} );
  }

  const { privateDashboard } = paths.resourcesPaths();
  let dashboardPath = path.join(privateDashboard, id + '.private.js');
  let dashboardFile = resourceFileProvider.getResourceFileNameById(privateDashboard, id);
  let dashboardExists = fs.existsSync(dashboardPath);

  if (dashboardFile || dashboardExists) {
    return res.json({ error: 'Dashboard id or filename already exists', type: 'id'} );
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

    const { privateDashboard } = paths.resourcesPaths();
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
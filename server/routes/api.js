const fs = require('fs');
const path = require('path');
const express = require('express');

const privateSetupPath = path.join(__dirname, '..', 'config', 'setup.private.json');
const initialSetupPath = path.join(__dirname, '..', 'config', 'setup.initial.json');
const router = new express.Router();

router.get('/dashboards', (req, res) => {

  let privateDashboard = path.join(__dirname, '..', 'dashboards');
  let preconfDashboard = path.join(__dirname, '..', 'dashboards', 'preconfigured');

  let script = '';
  let files = fs.readdirSync(privateDashboard);
  if (files && files.length) { 
    files.forEach((fileName) => {
      let filePath = path.join(privateDashboard, fileName);
      let stats = fs.statSync(filePath);
      if (stats.isFile() && filePath.endsWith('.js')) {
        let json = getJSONFromScript(filePath);
        let jsonDefinition = {
          id: json.id,
          name: json.name,
          description: json.description,
          icon: json.icon,
          url: json.url,
          preview: json.preview
        };
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
      let stats = fs.statSync(filePath);
      if (stats.isFile() && filePath.endsWith('.js')) {
        let json = getJSONFromScript(filePath);
        let jsonDefinition = {
          id: json.id,
          name: json.name,
          description: json.description,
          icon: json.icon,
          url: json.url,
          preview: json.preview
        };
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

router.get('/dashboards/:id', (req, res) => {

  let dashboardId = req.params.id;
  let privateDashboard = path.join(__dirname, '..', 'dashboards');

  let script = '';
  let dashboardFile = getFileById(privateDashboard, dashboardId);

  if (dashboardFile) {
    let filePath = path.join(privateDashboard, dashboardFile);
    let stats = fs.statSync(filePath);
    if (stats.isFile() && filePath.endsWith('.js')) {
      let content = fs.readFileSync(filePath, 'utf8');

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

  let privateDashboard = path.join(__dirname, '..', 'dashboards');
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
    let stats = fs.statSync(filePath);
    if (stats.isFile() && filePath.endsWith('.js')) {
      let content = fs.readFileSync(filePath, 'utf8');

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

  let privateDashboard = path.join(__dirname, '..', 'dashboards');
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

        let stats = fs.statSync(filePath);
        if (stats.isFile() && filePath.endsWith('.js')) {
          let dashboard = getJSONFromScript(filePath);
          if (dashboard.id && dashboard.id === id) {
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

function getJSONFromScript(filePath) {
  if (!fs.existsSync(filePath)) { return {}; }
  
  let jsonScript = {};
  let stats = fs.statSync(filePath);
  if (stats.isFile() && filePath.endsWith('.js')) {
    let content = fs.readFileSync(filePath, 'utf8');
    try {
      eval('jsonScript = (function () { ' + content + ' })();');
    } catch (e) {
      console.warn('Parse error with template:', filePath, e);
    }
  }

  return jsonScript;
}
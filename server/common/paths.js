const path = require('path');

const resourcesPaths = () => ({
  persistentFolder: path.join(__dirname, '..', 'dashboards', 'persistent'),
  privateDashboard: path.join(__dirname, '..', 'dashboards','persistent','private'),
  preconfDashboard: path.join(__dirname, '..', 'dashboards', 'preconfigured'),
  privateTemplate: path.join(__dirname, '..', 'dashboards','persistent', 'customTemplates')
});

module.exports = {
  resourcesPaths
}
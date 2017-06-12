
const fs = require('fs');
const path = require('path');
const express = require('express');
const passport = require('passport');
const passportAzureAD = require('passport-azure-ad');

const OIDCStrategy = passportAzureAD.OIDCStrategy;

let authEnabled = false;
let configAuth = require('../config/auth.basic');
let configSetup = null;
let redirectPath = null;

if (fs.existsSync(path.join(__dirname, '..', 'config', 'setup.private.json'))) {
  configSetup = require('../config/setup.private.json');
  authEnabled = configSetup.enableAuthentication;
}

// array to hold logged in users
let users = [];
function findByEmail(email, fn) {
  for (var i = 0, len = users.length; i < len; i++) {
    let user = users[i];
    
    console.info(`Current logged in user: ${user}`);
    if (user.email === email) {
      return fn(null, user);
    }
  }
  return fn(null, null);
};

/** 
 * Initialize passport variable once authentication is enabled
*/
function initializePassport() {
  // Passport session setup. (Section 2)

  //   To support persistent login sessions, Passport needs to be able to
  //   serialize users into and deserialize users out of the session.  Typically,
  //   this will be as simple as storing the user ID when serializing, and finding
  //   the user by ID when deserializing.
  passport.serializeUser(function(user, done) {
    done(null, user.email);
  });

  passport.deserializeUser(function(id, done) {
    findByEmail(id, function (err, user) {
      done(err, user);
    });
  });

  // Use the OIDCStrategy within Passport. (Section 2) 
  // 
  //   Strategies in passport require a `validate` function, which accept
  //   credentials (in this case, an OpenID identifier), and invoke a callback
  //   with a user object.
  passport.use(new OIDCStrategy({
      redirectUrl: configSetup.redirectUrl,
      allowHttpForRedirectUrl: configSetup.allowHttp,
      realm: configAuth.realm,
      clientID: configSetup.clientID,
      clientSecret: configSetup.clientSecret,
      oidcIssuer: configAuth.issuer,
      identityMetadata: configAuth.identityMetadata,
      skipUserProfile: configAuth.skipUserProfile,
      responseType: configAuth.responseType,
      responseMode: configAuth.responseMode,
      validateIssuer: configAuth.validateIssuer,
      issuer: configSetup.issuer
    },
    function(iss, sub, profile, accessToken, refreshToken, done) {
      
      profile.email = profile.email || profile.upn;

      console.log(`passport profile: ${profile.email}`);

      if (!profile.email) {
        return done(new Error("No email found"), null);
      }

      // asynchronous verification, for effect...
      process.nextTick(function () {
        findByEmail(profile.email, function(err, user) {
          if (err) {
            return done(err);
          }
          if (!user) {
            // "Auto-registration"
            users.push(profile);
            return done(null, profile);
          }
          return done(null, user);
        });
      });
    }
  ));
}
if (authEnabled) { initializePassport(); }

const router = new express.Router();

/** 
 * A path to enable initializing authentication configuration and add 
 * authentication to middleware pipeline
*/
router.get('/init', (req, res) => {

  let configSetupContent = fs.readFileSync(path.join(__dirname, '..', 'config', 'setup.private.json'), 'utf8');
  configSetup = JSON.parse(configSetupContent);
  authEnabled = configSetup.enableAuthentication;

  if (authEnabled) {
    initializePassport();
    addAuthRoutes();
  }

  res.json({ success: true });
});

/** 
 * Returning logged in account information
*/
router.get('/account', (req, res) => {
  if (!authEnabled) {
    return res.json({ account: null });
  }

  if (req.user) {
    return res.json({ account: req.user });
  }

  if (req.query.force) {
    return res.json({ account: null });
  }

  return setTimeout(() => {
    return res.redirect(req.originalUrl + '?force=1');
  }, 7000);
});

/** 
 * Dynamically adding authentication routes once passport is initialized
*/
function addAuthRoutes() {

  router.get('/login',
    passport.authenticate('azuread-openidconnect', { failureRedirect: '/auth/login' }),
    function(req, res) {
      console.info('Login was called in the Sample');
      res.redirect('/');
  });

  // POST /auth/openid
  //   Use passport.authenticate() as route middleware to authenticate the
  //   request.  The first step in OpenID authentication will involve redirecting
  //   the user to their OpenID provider.  After authenticating, the OpenID
  //   provider will redirect the user back to this application at
  //   /auth/openid/return
  router.get('/openid',
    passport.authenticate('azuread-openidconnect', { failureRedirect: '/auth/login' }),
    function(req, res) {
      console.info('Authentication was called in the Sample');
      res.redirect('/');
    });

  // GET /auth/openid/return
  //   Use passport.authenticate() as route middleware to authenticate the
  //   request.  If authentication fails, the user will be redirected back to the
  //   login page.  Otherwise, the primary route function function will be called,
  //   which, in this example, will redirect the user to the home page.
  router.get('/openid/return',
    passport.authenticate('azuread-openidconnect', { failureRedirect: '/auth/login' }),
    function(req, res) {
      console.info('We received a return from AzureAD.');
      res.redirect(redirectPath || '/');
      redirectPath = null;
    });

  // GET /auth/openid/return
  //   Use passport.authenticate() as route middleware to authenticate the
  //   request.  If authentication fails, the user will be redirected back to the
  //   login page.  Otherwise, the primary route function function will be called,
  //   which, in this example, will redirect the user to the home page.
  router.post('/openid/return',
    passport.authenticate('azuread-openidconnect', { failureRedirect: '/auth/login' }),
    function(req, res) {
      console.info('We received a return from AzureAD.');
      res.redirect(redirectPath || '/');
      redirectPath = null;
    });

  router.get('/logout', function(req, res){
    req.logout();
    res.redirect('/');
  });
}
if (authEnabled) { 
  console.log(`Registering auth routes...`);
  addAuthRoutes(); 
  console.log(`Auth routes registered.`);
}

/** 
 * Adding all authentication middleware on process start.
 * Some of the middlewares will only be activated once authentication is enabled.
 * Including:
 *  Initialize passport variables
 *  call passport initalize in middleware
 *  call passport session in middleware
 *  call request authenticator
*/
let authenticationMiddleware = function (...excludePaths) {

  let passportInitialize = null;
  let passportSession = null;
  function basicAuthCheck (req, res, next) {

    if (!authEnabled) { return next(); }

    // Only initialize passport middleware once authentication is enabled (passport is set)
    // And middleware hasn't been initialized yet
    if (authEnabled && passport && !passportSession) {
      passportInitialize = passport.initialize();
      passportSession = passport.session();
    }

    return next();
  };

  // Call passport initialize middleware only when it is available
  function callPassportInitialize(req, res, next) {
    if (!passportInitialize) { return next(); }

    return passportInitialize.call(passportInitialize, req, res, next);
  }

  // Call passport session middleware only when it is available
  function callPassportSession(req, res, next) {
    if (!passportSession) { return next(); }

    return passportSession.call(passportSession, req, res, next);
  }

  // Once authentication is enabled, ensure it is activated on all requests not under '/auth'
  function ensureAuthenticated(req, res, next) {
    if (!authEnabled || req.isAuthenticated()) { return next(); }
    redirectPath = req.path;
    res.redirect('/auth/login?redirect=' + encodeURIComponent(req.path));
  }
  
  // Returning an array of all middlewares to be called sequentially
  return [
    basicAuthCheck,
    callPassportInitialize,
    callPassportSession,
    exclude(excludePaths, ensureAuthenticated)
  ]
};

function exclude(paths, middleware) {
  return function(req, res, next) {

    // Exclude a string from an array
    if (Array.isArray(paths)) {
      for (let pathIdx in paths) {
        if (req.path.startsWith(paths[pathIdx])) { return next(); }
      }
    }

    return middleware(req, res, next);    
  };
};

module.exports = {

  // Returning a middleware array
  authenticationMiddleware,
  router
}
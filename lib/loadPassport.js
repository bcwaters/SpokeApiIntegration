const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy

module.exports = function(db){
	
passport.use('login', new LocalStrategy({
    passReqToCallback : true,
	session: true
  },
  function(req, username, password, done) { 
    // check in mongo if a user with username exists or not
    db.findUser(username, 
      function(err, user) {
        // In case of any error, return using the done method
        if (err)
          return done(err);
        // Username does not exist, log error & redirect back
        if (!user){
          console.log('User Not Found with username '+username);
          return done(null, false);                 
        }
        // TODO User exists but wrong password, log the error 
        if (false){
          console.log('Invalid Password');
          return done(null, false);
        }
        // User and password both match, return user from 
        // done method which will be treated like success
		console.log("LOGGING USER IN" )
		console.log(user)
		
        return done(null, user);
      }
    );
}));

passport.use('signup', new LocalStrategy({
    passReqToCallback : true
  },
  function(req, username, password, done) {
    findOrCreateUser = function(){
      // find a user in Mongo with provided username
      db.findUser(username,function(err, user) {
        // In case of any error return
        if (err){
          console.log('Error in SignUp: '+err);
          return done(err);
        }
        //TODO if user already exeist
        if (false) {
         
          return done(null, false);
        } else {
          // if there is no user with that email
          // create the user
          var newUser = {'username': username, 'password':password}
          // set the user's local credentials
          newUser.username = username;
          newUser.password = password;
        
 
          // save the user
          db.registerUser(req, newUser, function(err) {
            if (err){
              console.log('Error in Saving user: '+err);  
              throw err;  
            }
            console.log('User Registration succesful');    
            return done(null, newUser);
          });
        }
      });
  };
     
    // Delay the execution of findOrCreateUser and execute 
    // the method in the next tick of the event loop
    process.nextTick(findOrCreateUser);
  }));





passport.serializeUser(function(user, next) {
console.log("CAALLLING TO SERIZLIAEW")
//TODO fix this by updating db table or soemthing
	console.log(user)
  let id = user.login?user.login:user.username;
 console.log(next)
  next(null, id);
});

passport.deserializeUser(function(id, next) {
	var thingisnull = null;
	//thingisnull.go;
	console.log("checking fo ruser " + id)
  next(null, id);
});
return passport;
}
let user = {
    name: "John",
    age: 30,
    isAdmin: true
  };
  
  for (let key in user) {
    console.log( key );  // name, age, isAdmin
    console.log( user[key] ); // John, 30, true
  }
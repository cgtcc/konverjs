# Konverjs ::Skeleton

A comprehensive and secure Social Network skeleton application written on top of the Node.Js runtime using the Express.Js framework featuring user management with strong password encryption (bcrypt) and CSRF validation

To install:

1) install [git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git), [MongoDB](https://www.mongodb.com/download-center?jmp=docs), [Redis](https://redis.io/) and [NodeJS](http://nodejs.org)

**after the installation of those requirements, check to make sure mongodb and redis are up and running and responding**

2) open a terminal and clone this repository :  

    git clone https://github.com/codecoaster/konverjs/
    
    
3) go to the directory you just created : 

    cd konverjs

4) copy the file  	configuration.example.js to  	configuration.js and edit it's values.  You will need a Sendgrid account to test the registration feature.  You can create a new [SendGrid account here](https://app.sendgrid.com).  The script can be adapted easily for other providers, i.e. : Mandrillapp.  At this time however, only Sendgrid is supported. 

    cp configuration.example.js configuration.js
    
4) install the project dependencies + nodemon, a nodejs development server (recommended) :

    npm install && npm install -g nodemon

5) fire up the app : 

    nodemon bin/www
    
 And voilà :)  Now you can visit [http://localhost:3000/setup](http://localhost:3333/setup) to setup the user :

     username : administrator
     password: administrator

**the /setup route will be replaced with an install script when a first stable release of this app will be available**

Once the user is created, you can login : [http://localhost:3000](http://localhost:3333) 

 What's working at this time :
 
    - user login
    - user signup process : the user need to provide a valid email address. An email is sent through Sendrig, and the user need to validate the email address by clicking on a link before being able to complete the registration form.
    - user can post something
    - user can see other's posts, listed with he's own posts (chronologic order)
    - user can view and edit profile (Biography and DisplayName)

 TODO (seeking pull requests!) : 

    - add search features
    - user role management
    - implement json REST api (right now we only render ejs views)
    - add better social publication features (i.e.: post status, post slugs, and other basic post blogging features)
    - add plugin support
    - create AngularJS app to query the API (make it MEAN)
    - add support for [identicons](https://en.wikipedia.org/wiki/Identicon)
    - code review

 
# Konverjs ::Skeleton

A comprehensive and secure Social Network skeleton application written on top of the Node.Js runtime using the Express.Js framework featuring user management with strong password encryption (bcrypt) and CSRF validation

To install:

1) install [git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git), [MongoDB](https://www.mongodb.com/download-center?jmp=docs), [Redis](https://redis.io/) and [NodeJS](http://nodejs.org)

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
    
 And voilà :)  Visit [http://localhost:3000](http://localhost:3000) to view the app in a browser.

 TODO : 

 - add search feature
 - implement json REST api (right now we only render ejs views)
 - add social publication features
 - create AngularJS app to query the API (make it MEAN)
 - code review
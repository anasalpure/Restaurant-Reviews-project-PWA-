# **Restaurant Reviews** project (PWA)   
on line link : 
<a href="https://restaurant1app.herokuapp.com/"> visit restaurants app </a>


# Start
(PWAs) are web applications that are regular web pages or websites, but can appear to the user like traditional applications or native mobile applications.  


## clone the repo 
 ` git clone https://github.com/anasalpure/Restaurant-Reviews-project-PWA-.git `
## Install dependencies
 `npm install`

## Build app  
 if you do any changes in scss files :
 `npm run build`

## run localhost Serve  
`npm start`

# notes :
I use webpack-dev-server as localhost server on **port 8082**   
if you use another software you should make the **dbhelper.js** file compatible with the new configurations.  
<pre>

  static get DATABASE_URL() {
      const port = 8082 
      return `http://localhost:${port}/data/restaurants.json`;
  }

</pre>

*  Anas Alpure



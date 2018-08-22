
(function(){

  "use strict";

  /*****************************************
  *   Model defination
  *******************************************/
  var Model={

    restaurant:null ,
    

    init(){

    } ,

    urlForRestaurant(restaurant){
          return DBHelper.urlForRestaurant(restaurant);
    } ,

    addMarkerForRestaurant (newMap){
        return DBHelper.mapMarkerForRestaurant( Model.restaurant , newMap);
    } ,

    fetchRestaurantById (id){
      DBHelper.fetchRestaurantById( id ,
        (error, restaurant) => { 
          if (!restaurant) {
            console.error(error);
            throw error('there is no restaurant with id = '+id);
            return;
          }
          Model.restaurant = restaurant;
          Controller.notify();
        });
    } ,

    imageUrlForRestaurant(restaurant){
      return DBHelper.imageUrlForRestaurant(restaurant);
    } ,





  } 

   /*****************************************
    *   Controller defination
    *******************************************/
  var Controller = {

    newMap : null,
    mapToken: 'pk.eyJ1IjoiYW5hc2JyIiwiYSI6ImNqbDAybXQ4eDAwemEzdm5xNHQ0NGt0NjQifQ.ErwmSUUlXhp5XcvgmGhbxQ',

    init(){
      //Model init and get data from DB
      Model.init();

      Controller.fetchRestaurantFromURL()


    } ,

    notify(){

      View.initMap( )
      .then( (map)=>{
        Controller.newMap  = map
        Model.addMarkerForRestaurant(Controller.newMap);
        View.fillBreadcrumb();
      }); 

      View.fillRestaurantHTML();

      View.init();
    } ,

    /**
     * Get current restaurant from page URL.
     */
    fetchRestaurantFromURL () {
      if (Model.restaurant) { 
        // restaurant already fetched!
        Controller.notify();
      }
      const id = Controller.getParameterByName('id');
      if (!id) { 
        // no id found in URL
        console.error('error : No restaurant id in URL'); 
      } else {
        Model.fetchRestaurantById(id);
      }
    } ,

    /**
     * Get a parameter by name from page URL.
     */
    getParameterByName (name, url) {
      if (!url)
        url = window.location.href;
      name = name.replace(/[\[\]]/g, '\\$&');
      const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
        results = regex.exec(url);
      if (!results)
        return null;
      if (!results[2])
        return '';
      return decodeURIComponent(results[2].replace(/\+/g, ' '));
    } ,
    getImg(restaurant){
      return Model.imageUrlForRestaurant(restaurant);
    } ,
    getrestaurant(){
      return Model.restaurant ;
    } ,

  } 

    /*****************************************
    *   View defination
    *****************************************/
  var View = {
    

    init(){
      View.A11y() ;
    } ,

    initMap( restaurant = Controller.getrestaurant() ){
      return new Promise(function(resolve, reject) {
        let map = L.map('map', {
          center: [restaurant.latlng.lat, restaurant.latlng.lng],
          zoom: 16,
          scrollWheelZoom: false
        });

        L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.jpg70?access_token={mapboxToken}', {
          mapboxToken: Controller.mapToken,
          maxZoom: 18,
          attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
            '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
            'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
          id: 'mapbox.streets'    
        }).addTo(map);

        resolve(map) ;

      });
    } ,

    /**
     * Create restaurant HTML and add it to the webpage
     */
    fillRestaurantHTML (restaurant = Controller.getrestaurant() )  {
      
      const name = document.getElementById('restaurant-name');
      name.innerHTML = restaurant.name;
      name.className = "focusable" ;

      const address = document.getElementById('restaurant-address');
      address.innerHTML = restaurant.address;

      const image = document.getElementById('restaurant-img');
      image.className = 'restaurant-img focusable';
      image.setAttribute('alt' ,  restaurant.name +' restaurant' )
      image.setAttribute('aria-labelledby' , 'restaurant-address' );
      image.setAttribute('aria-describedby' , 'restaurant-cuisine' );
      image.src = Controller.getImg(restaurant);

      const cuisine = document.getElementById('restaurant-cuisine');
      cuisine.innerHTML = restaurant.cuisine_type;
      

      // fill operating hours
      if (restaurant.operating_hours) {
        View.fillRestaurantHoursTable(restaurant.operating_hours);
      }
      // fill reviews
      View.fillReviewsHTML(restaurant.reviews);
    } ,

    /**
     * Create restaurant operating hours HTML table and add it to the webpage.
     */
    fillRestaurantHoursTable (operatingHours) {
      const hours = document.getElementById('restaurant-hours');
      hours.className = "focusable" ;
      for (let key in operatingHours) {
        const row = document.createElement('tr');

        const day = document.createElement('td');
        day.innerHTML = key;
        row.appendChild(day);

        const time = document.createElement('td');
        time.innerHTML = operatingHours[key];
        row.appendChild(time);

        hours.appendChild(row);
      }
    } ,

    /**
     * Create all reviews HTML and add them to the webpage.
     */
    fillReviewsHTML ( reviews ) {
      const container = document.getElementById('reviews-container');
      const title = document.createElement('h2');
      title.className = 'focusable' ;
      title.innerHTML = 'Reviews';
      container.appendChild(title);

      if (!reviews) {
        const noReviews = document.createElement('p');
        noReviews.innerHTML = 'No reviews yet!';
        container.appendChild(noReviews);
        return;
      }
      const ul = document.getElementById('reviews-list');
      reviews.forEach(review => {
        ul.appendChild(View.createReviewHTML(review));
      });
      container.appendChild(ul);
    } ,

    /**
     * Add restaurant name to the breadcrumb navigation menu
     */
    fillBreadcrumb (restaurant= Controller.getrestaurant() ) {
      const breadcrumb = document.getElementById('breadcrumb');
      const li = document.createElement('li');
      li.innerHTML = restaurant.name;
      breadcrumb.appendChild(li);
    } ,

    /**
     * Create review HTML and add it to the webpage.
     */
    createReviewHTML (review) {
      let labelID=review.name[1]+'label';
      let describeID=review.name[1]+'describe';

      const li = document.createElement('li');
      const name = document.createElement('p');
      name.innerHTML = review.name;
      name.setAttribute('id' , labelID)
      li.appendChild(name);

      const date = document.createElement('p');
      date.innerHTML = review.date;
      li.appendChild(date);

      const rating = document.createElement('p');
      rating.innerHTML = `Rating: ${review.rating}`;
      li.appendChild(rating);

      const comments = document.createElement('p');
      comments.innerHTML = review.comments;
      comments.setAttribute('id' , describeID)
      li.appendChild(comments);

      li.className = 'focusable' ;

      li.setAttribute('aria-labelledby' , labelID )
      li.setAttribute('aria-describedby' , describeID )

      return li;
    } ,

    A11y() {
      const VK_SPACE = 32;
      const VK_ENTER = 13;
      
  
      //get all element with focusable class
      let elms=document.querySelectorAll(".focusable" );
  
      for(let i=0 ; i<elms.length ;i++){
          let element=elms[i];
          element.setAttribute("tabindex", "0" ) ;
          let link = element.querySelector('a');
          if( link ){
            link.setAttribute("tabindex", "-1" )
            element.addEventListener('click' , View.onA11yElemClicked)
            element.addEventListener ('keydown',(event)=>{
                if(event.keyCode == undefined ) return ;
                if (event.keyCode == VK_SPACE || event.keyCode == VK_ENTER )  
                    event.target.click();
                
            });
        }
      } 

  } ,

  onA11yElemClicked( event ){
      let link= event.currentTarget.querySelector('a');
      link.click();
  } 


  } 


  /*****************************************
  *   app run
  *****************************************/
  document.addEventListener('DOMContentLoaded', () => { Controller.init(); });
  }
  
() );
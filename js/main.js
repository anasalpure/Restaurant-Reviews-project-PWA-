
(function(){

    "use strict";

    /*****************************************
    *   Model defination
    *******************************************/
    var Model={
    
        restaurants  : [] ,
        neighborhoods : [] ,
        cuisines    :[] ,
        markers : [],

        init(){
            Model.fetchNeighborhoods();
            Model.fetchCuisines();
        } ,
        
        fetchNeighborhoods  () {
            DBHelper.fetchNeighborhoods((error, neighborhoods) => {
              if (error) { // Got an error
                console.error(error);
              } else {
                Model.neighborhoods = neighborhoods;
                Controller.notify();
              }
            });
        } ,

   
        /**
         * Fetch all cuisines and set their HTML.
         */
        fetchCuisines ()  {
            DBHelper.fetchCuisines((error, cuisines) => {
            if (error) { // Got an error!
                console.error(error);
            } else {
                Model.cuisines = cuisines;
                Controller.notify();
            }
            });
        } ,

        fetchRestaurantByCuisineAndNeighborhood (cuisine , neighborhood ,response){
            DBHelper
            .fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, response )
        } ,

        imageUrlForRestaurant(restaurant){
            return DBHelper.imageUrlForRestaurant(restaurant);
        } ,

        urlForRestaurant(restaurant){
             return DBHelper.urlForRestaurant(restaurant);
        } ,

        addMarkerForRestaurant (restaurant, newMap){
            return DBHelper.mapMarkerForRestaurant(restaurant, newMap);
        }



             
  
    
    
    }
    
    /*****************************************
    *   Controller defination
    *******************************************/
    var Controller = {

        newMap :null ,
        mapToken: 'pk.eyJ1IjoiYW5hc2JyIiwiYSI6ImNqbDAybXQ4eDAwemEzdm5xNHQ0NGt0NjQifQ.ErwmSUUlXhp5XcvgmGhbxQ',


        init : () => {
            Controller.initMap(); 
            //Model init and get data from DB
            Model.init();


            View.init();
        },

        notify(){
            View.init();
        } ,

        /**
         * Initialize leaflet map, called from HTML.
         */
        initMap  () {
            Controller.newMap = L.map('map', {
                center: [40.722216, -73.987501],
                zoom: 12,
                scrollWheelZoom: false
                });
            L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.jpg70?access_token={mapboxToken}', {
            mapboxToken: Controller.mapToken,
            maxZoom: 18,
            attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
                '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
                'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
            id: 'mapbox.streets'
            }).addTo(Controller.newMap);
        
            View.updateRestaurants();
        } ,
    
        getCuisines: ()=> {
            return Model.cuisines;
        },
    
        getNeighborhoods : (item)=> {
            return Model.neighborhoods;
        },

        getRestaurants : (item)=> {
            return Model.restaurants;
        },

        

        getRestaurantsByInfo(cuisine,neighborhood){
            Model.fetchRestaurantByCuisineAndNeighborhood(cuisine ,neighborhood ,
                (error, restaurants)=>{
                    if (error) { // Got an error!
                        console.error(error);
                      } else {
                        Controller.resetRestaurants(restaurants);
                        View.renderRestaurants();
                    }
                }
            )
        } ,

        getImg(restaurant){
            return Model.imageUrlForRestaurant(restaurant);
        } ,

        getUrl(restaurant){
           return Model.urlForRestaurant(restaurant);
        } ,

        addMarker (restaurant){
            return Model.addMarkerForRestaurant(restaurant, Controller.newMap);
        } ,

        pushMarker(marker){
            Model.markers.push(marker);
        } ,
 
    


        /**
         * Clear current restaurants, their HTML and remove their map markers.
         */
        resetRestaurants (restaurants)  {
            // Remove all restaurants
            Model.restaurants = [];
            View.resetViewById('restaurants-list');

            const ul = document.getElementById('restaurants-list');
            ul.innerHTML = '';
        
            // Remove all map markers
            if (Model.markers) {
                Model.markers.forEach(marker => marker.remove());
            }
            Model.markers = [];
            Model.restaurants = restaurants;
        }


    

    }
    
    
    
    /*****************************************
    *   View defination
    *****************************************/
    var View = {
    
        cuisinesSelect  :null ,
        neighborsSelect :null ,

        init : ()=>{
            View.cuisinesSelect = document.getElementById('cuisines-select');
            View.neighborsSelect = document.getElementById('neighborhoods-select');

            View.fillNeighborhoodsSelect() 
            View.fillCuisinesSelect();

            View.cuisinesSelect.addEventListener('change' , View.updateRestaurants );
            View.neighborsSelect.addEventListener('change' , View.updateRestaurants );

            View.A11y() ;
        },
    
        //rename function fillCuisinesHTML to
        fillCuisinesSelect  ( cuisines )  {
            cuisines = cuisines ? cuisines :  Controller.getCuisines()

            cuisines.forEach(cuisine => {
              const option = document.createElement('option');
              option.innerHTML = cuisine;
              option.value = cuisine;
              View.cuisinesSelect.append(option);
            });
        } ,
        //rename function fillNeighborhoodsHTML to
        fillNeighborhoodsSelect  ( neighborhoods )  {
            neighborhoods = neighborhoods ? neighborhoods :  Controller.getNeighborhoods();

            neighborhoods.forEach(neighborhood => {
              const option = document.createElement('option');
              option.innerHTML = neighborhood;
              option.value = neighborhood;
              View.neighborsSelect.append(option);
            });
        } ,

        updateRestaurants  () {
            const cuisine = View.cuisinesSelect ? View.cuisinesSelect.value : 'all';
            const neighborhood = View.neighborsSelect? View.neighborsSelect.value : 'all';
            Controller.getRestaurantsByInfo(cuisine,neighborhood)
        } ,

        resetViewById(id){
            const view = document.getElementById(id);
            view.innerHTML = '';
        } ,

        //rename function fillRestaurantsHTML to
        renderRestaurants (restaurants ) {
            restaurants = restaurants ? restaurants :  Controller.getRestaurants();

            const ul = document.getElementById('restaurants-list');
            restaurants.forEach(restaurant => {
              ul.append( View.createRestaurantWidget(restaurant) );
            });
            View.addMarkersToMap();
            //make updates accessible
            View.A11y() ;
        } ,



        /**
         * Create HTML item list  of restaurant  .
         *    <li>
         *      <img class="">
         *      <div>
            *      <h1>Emily</h1>
            *      <p>Brooklyn</p>
            *      <p>919 Fulton St, Brooklyn, NY 11238</p>
            *      <a href="">View Details</a>
         *      <div>
         *    </li>
         */
        createRestaurantWidget  (restaurant)  {
            let id ='name'+ restaurant.id ;

            const li = document.createElement('li');
            li.className = 'focusable';

            const image = document.createElement('img');
            image.className = 'restaurant-img';
            image.src = Controller.getImg(restaurant);
            li.append(image);

            const div = document.createElement('div');
           

            const name = document.createElement('h1');
            name.innerHTML = restaurant.name;
            name.setAttribute('id' , id ) 
            div.append(name);
        
            const neighborhood = document.createElement('p');
            neighborhood.innerHTML = restaurant.neighborhood;
            div.append(neighborhood);
        
            const address = document.createElement('p');
            address.innerHTML = restaurant.address;
            div.append(address);
        
            const more = document.createElement('a');
            more.innerHTML = 'View Details';
            more.href = Controller.getUrl(restaurant)
            div.append(more)
       
            li.append(div);
            li.setAttribute('aria-labelledby' , id )
            return li
        } ,



        /**
         * Add markers for current restaurants to the map.
         */
        addMarkersToMap (restaurants )  {
            restaurants = restaurants ? restaurants :  Controller.getRestaurants();

            restaurants.forEach(restaurant => {
            // Add marker to the map
            const marker = Controller.addMarker(restaurant);
            marker.on("click", onClick);
            function onClick() {
            window.location.href = marker.options.url;
            }
            Controller.pushMarker(marker);
        });

        }  ,
   
    
        A11y() {
            const VK_SPACE = 32;
            const VK_ENTER = 13;
            
        
            //get all element with focusable class
            let elms=document.querySelectorAll(".focusable" );
        
            for(let i=0 ; i<elms.length ;i++){
                let element=elms[i];
                element.setAttribute("tabindex", "0" ) ;
                element.querySelector('a').setAttribute("tabindex", "-1" ) ;;
                element.addEventListener('click' , View.onA11yElemClicked)
                element.addEventListener ('keydown',(event)=>{
                    if(event.keyCode == undefined ) return ;
                    if (event.keyCode == VK_SPACE || event.keyCode == VK_ENTER )  
                        event.target.click();
                    
                });
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
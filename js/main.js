//create cat class
(function(){

    "use strict";

    
    //Model defination
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
                Controler.notify();
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
                Controler.notify();
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
    
    //Controler defination
    
    var Controler = {

        newMap :null ,
        mapToken: 'pk.eyJ1IjoiYW5hc2JyIiwiYSI6ImNqbDAybXQ4eDAwemEzdm5xNHQ0NGt0NjQifQ.ErwmSUUlXhp5XcvgmGhbxQ',


        init : () => {
            Controler.initMap(); 
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
            Controler.newMap = L.map('map', {
                center: [40.722216, -73.987501],
                zoom: 12,
                scrollWheelZoom: false
                });
            L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.jpg70?access_token={mapboxToken}', {
            mapboxToken: Controler.mapToken,
            maxZoom: 18,
            attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
                '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
                'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
            id: 'mapbox.streets'
            }).addTo(Controler.newMap);
        
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
                        Controler.resetRestaurants(restaurants);
                        View.fillRestaurantsHTML();
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
            return Model.addMarkerForRestaurant(restaurant, Controler.newMap);
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
    
    
    
    
    //View defination
    var View = {
    
        cuisinesSelect  :null ,
        neighborsSelect :null ,

        init : ()=>{
            View.cuisinesSelect = document.getElementById('cuisines-select');
            View.neighborsSelect = document.getElementById('neighborhoods-select');

            View.fillNeighborhoodsHTML()  //rename to fillNeighborhoodsSelect
            View.fillCuisinesHTML();

            View.cuisinesSelect.addEventListener('change' , View.updateRestaurants );
            View.neighborsSelect.addEventListener('change' , View.updateRestaurants );

            
        },
    
     
        fillCuisinesHTML  ( cuisines )  {
            cuisines = cuisines ? cuisines :  Controler.getCuisines()

            cuisines.forEach(cuisine => {
              const option = document.createElement('option');
              option.innerHTML = cuisine;
              option.value = cuisine;
              View.cuisinesSelect.append(option);
            });
        } ,

        fillNeighborhoodsHTML  ( neighborhoods )  {
            neighborhoods = neighborhoods ? neighborhoods :  Controler.getNeighborhoods();

            neighborhoods.forEach(neighborhood => {
              const option = document.createElement('option');
              option.innerHTML = neighborhood;
              option.value = neighborhood;
              View.neighborsSelect.append(option);
            });
        } ,

        updateRestaurants  () {
            console.log('changed')
            const cuisine = View.cuisinesSelect ? View.cuisinesSelect.value : 'all';
            const neighborhood = View.neighborsSelect? View.neighborsSelect.value : 'all';
            Controler.getRestaurantsByInfo(cuisine,neighborhood)
        } ,

        resetViewById(id){
            const view = document.getElementById(id);
            view.innerHTML = '';
        } ,

        fillRestaurantsHTML  (restaurants ) {
            restaurants = restaurants ? restaurants :  Controler.getRestaurants();

            const ul = document.getElementById('restaurants-list');
            restaurants.forEach(restaurant => {
              ul.append( View.createRestaurantWidget(restaurant) );
            });
            View.addMarkersToMap();
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

        
            const li = document.createElement('li');
        
            const image = document.createElement('img');
            image.className = 'restaurant-img';
            image.src = Controler.getImg(restaurant);
            li.append(image);

            const div = document.createElement('div');
           

            const name = document.createElement('h1');
            name.innerHTML = restaurant.name;
            div.append(name);
        
            const neighborhood = document.createElement('p');
            neighborhood.innerHTML = restaurant.neighborhood;
            div.append(neighborhood);
        
            const address = document.createElement('p');
            address.innerHTML = restaurant.address;
            div.append(address);
        
            const more = document.createElement('a');
            more.innerHTML = 'View Details';
            more.href = Controler.getUrl(restaurant)
            div.append(more)
       
            li.append(div);

            return li
        } ,


        /**
         * Add markers for current restaurants to the map.
         */
        addMarkersToMap (restaurants )  {
            restaurants = restaurants ? restaurants :  Controler.getRestaurants();

            restaurants.forEach(restaurant => {
            // Add marker to the map
            const marker = Controler.addMarker(restaurant);
            marker.on("click", onClick);
            function onClick() {
            window.location.href = marker.options.url;
            }
            Controler.pushMarker(marker);
        });

        }  ,
   
    

    
    
    }
    
    //app run
    document.addEventListener('DOMContentLoaded', () => { Controler.init(); });
    }
    
   () );
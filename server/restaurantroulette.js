if (Meteor.isServer) {
  function fetchRestaurantsByLocation(loc) {
    var ywsid = Meteor.settings.yelpYwsid;
    var yelpBase = "http://api.yelp.com/business_review_search";
    Meteor.http.get(yelpBase, {
      params: {
        ywsid: ywsid,
        location: loc,
        cc: "US",
        radius: "3",
        term: "restaurant",
        limit: "20"
      }},
      function (error, result) {
        var yelpInfo = EJSON.parse(result.content);
        for (var i = 0; i < yelpInfo.businesses.length; i++) {
          var info = {
            name: yelpInfo.businesses[i].name,
            yelpUrl: yelpInfo.businesses[i].url,
            keywords: [],
            imageInfo: {},
          }
          fetchRestaurantExtract(info);
        }
      }
    );
  }
  
  function fetchRestaurantByLocation(loc, term, cb) {
    var ywsid = Meteor.settings.yelpYwsid;
    var yelpBase = "http://api.yelp.com/business_review_search";
    Meteor.http.get(yelpBase, {
      params: {
        ywsid: ywsid,
        location: "02114",
        cc: "US",
        radius: "3",
        term: term,
        limit: "1"
      }},
      function (error, result) {
        var yelpInfo = EJSON.parse(result.content);
        //for (var i = 0; i < yelpInfo.businesses.length; i++) {
        for (var i = 0; i < 1; i++) {
          var info = {
            name: yelpInfo.businesses[i].name,
            yelpUrl: yelpInfo.businesses[i].url,
            keywords: [],
            imageInfo: {},
          }
          fetchRestaurantExtract(info, cb);
        }
      }
    );
  }
  
  function fetchRestaurantByLocationSync(loc, term) {
    console.log('fetching restaurant', loc, term)
    var ywsid = Meteor.settings.yelpYwsid;
    var yelpBase = "http://api.yelp.com/business_review_search";
    var result = Meteor.http.get(yelpBase, {
      params: {
        ywsid: ywsid,
        location: "02114",
        cc: "US",
        radius: "3",
        term: term,
        limit: "1"
      }
    });

    var yelpInfo = EJSON.parse(result.content);
    console.log('yelpinfo', yelpInfo)

    if (yelpInfo.businesses.length === 0) {
      return {
        success: false,
      }
    }
    
    var info = {
      name: yelpInfo.businesses[0].name,
      yelpUrl: yelpInfo.businesses[0].url,
      keywords: [],
      imageInfo: {},
    }
    return {
      success: true,
      info: fetchRestaurantExtractSync(info)
    }
  }
  
  function fetchRestaurantExtract(info, cb) {
    var extractBase = 'http://api.embed.ly/1/extract';
    var embedlyKey = Meteor.settings.embedlyApiKey;
    Meteor.http.get(extractBase, {
      params: {
        //key: secrets.embedlyKey,
        key: embedlyKey,
        url: info.yelpUrl
      }},
      function (error, result) {
        info.keywords = result.data.keywords.map(function (item) {
          return item.name
        });
        info.imageInfo = result.data.images[0];
        Meteor.call('createRestaurant', info);
        cb(info);
      }
    );
  }
  function fetchRestaurantExtractSync(info) {
    var extractBase = 'http://api.embed.ly/1/extract';
    var embedlyKey = Meteor.settings.embedlyApiKey;
    var result = Meteor.http.get(extractBase, {
      params: {
        //key: secrets.embedlyKey,
        key: embedlyKey,
        url: info.yelpUrl
      }
    });
    
    info.keywords = result.data.keywords.map(function (item) {
      return item.name
    });
    info.imageInfo = result.data.images[0];

    var restaurant_id = Meteor.call('createRestaurant', info);

    info['_id'] = restaurant_id;

    return info
  }

  Meteor.methods({
    addRestaurant: function (loc, name) {
      /*
      fetchRestaurantByLocation(loc, name, function (info) {
        return {
          'success': true,
          'info': info
        }
      });
      */

      var info = fetchRestaurantByLocationSync(loc, name);
      console.log('info',  info)

      return info
    }
  });

  Meteor.startup(function () {
    // code to run on server at startup
    if (false && Restaurants.find().count() === 0) {
      var zipCodes = ["02114"];
      for (var i = 0; i < zipCodes.length; i++) {
        fetchRestaurantsByLocation(zipCodes[i]);
      }
    }
  });
};

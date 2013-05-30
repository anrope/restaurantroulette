if (Meteor.isClient) {
  Session.set('currentRestaurant', {name: 'placeholder'});
  
  Handlebars.registerHelper('restaurantThumbnail', function (info) {
    return getThumbnail(info);
  });

  Handlebars.registerHelper('restaurantImage', function (info) {
    return getImage(info);
  });

  Handlebars.registerHelper('restaurantId', function (info) {
    return getRestaurantId(info);
  });

  Template.restaurantList.restaurants = function () {
    return Session.get('restaurants');
  };

  Template.restaurantList.rendered = function () {
    var restaurants = Session.get('restaurants');

    if (restaurants === undefined) {
      return
    }

    restaurants.forEach(function (restaurant) {
      var restaurantId = '#' + getRestaurantId(restaurant);
      var bc = restaurant.imageInfo.colors[0].color;
      var tc = restaurant.imageInfo.colors[restaurant.imageInfo.colors.length - 1].color;
      $(restaurantId + ' .restaurant-tab').css('background-color',
        'rgb(' + bc[0] + ', ' + bc[1] + ', ' + bc[2] + ')');
      $(restaurantId + ' .restaurant-tab').css('color',
        'rgb(' + tc[0] + ', ' + tc[1] + ', ' + tc[2] + ')');
    });
  };

  Template.restaurantList.keywords = function (info) {
    return info.keywords;
  };

  Template.titleBar.currentRestaurant = function () {
    return Session.get('currentRestaurant').name;
  };

  Template.newRestaurant.events({
    'submit': function (e) {
      e.preventDefault()
      form = $('#nr-name');
      form.attr('disabled', 'disabled')
      
      var name = form.val();

      if (name === '') {
        form.removeAttr('disabled');
        return false;
      }

      Meteor.call('addRestaurant', '02114', name, function (err, result) {
        if (result['success']) {
          var restaurants = Session.get('restaurants');
          if (restaurants === undefined) {
            Session.set('restaurants', [result['info']]);
          } else {
            restaurants.push(result['info'])
            Session.set('restaurants', restaurants);
          }
        }

        form.val('');
        form.removeAttr('disabled');
      });

      return false;
    }
  });

  Template.shuffle.events({
    'click': function () {
      $('#shuffle').attr('disabled', 'disabled');
      var self = this;
      var slots = $('.restaurant-slot')
      var temp  = slots[0];
      var animation = {
        opacity: 'toggle',
      };
      var animationTime = 500;

      for (var i = slots.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        temp = slots[i];
        slots[i] = slots[j];
        slots[j] = temp;
        $(slots[i]).find('.restaurant-info').hide();
        $(slots[i]).hide();

      }
      
      slots.parent().html(slots)
      
      for (var i = 0; i < slots.length - 1; i++) {
        $(slots[i]).animate(animation, animationTime);
      }
      
      $(slots[slots.length - 1]).hide().animate(animation, animationTime);

      $(slots[0]).animate({
        opacity: 'toggle'
      }, 1000, function () {
        $('#shuffle').removeAttr('disabled');
      });

      var choice = $(slots[0]).attr('id');
      var restaurants = Session.get('restaurants');
      restaurants.forEach(function (restaurant) {
        if (restaurant._id === choice) {
          Session.set('currentRestaurant', restaurant);
        }
      })

      $('#' + choice + ' .restaurant-info').show();
    }
  });

  function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
  }

  function rgbToHex(r, g, b) {
    return componentToHex(r) + componentToHex(g) + componentToHex(b);
  }

  function getEmbedlyImage(info, width, height, fillBackground) {
    var displayBase;
    if (fillBackground) {
      displayBase = 'http://i.embed.ly/1/display/fill';
    } else {
      displayBase = 'http://i.embed.ly/1/display/resize';
    }

    var embedlyImageKey = Meteor.settings.public.embedlyImageKey;

    var params = {
      key: embedlyImageKey,
      url: info.imageInfo.url
    }

    if (width != -1) {
      params['width'] = width;
    }

    if (height != -1) {
      params['height'] = height;
    }
   
    if (fillBackground) {
      var dc;
      if (typeof info.imageInfo.colors !== 'undefined') {
        dc = info.imageInfo.colors[0].color;
      } else {
        dc = [255, 255, 255];
      }

      params['color'] = rgbToHex(dc[0], dc[1], dc[2]);
    }

    return displayBase + '?' + $.param(params)
  }
  
  function getThumbnail(info) {
    return getEmbedlyImage(info, 100, 100, true);
  }

  function getImage(info) {
    return getEmbedlyImage(info, 400, -1, false);
  }
  
  function getRestaurantId(info) {
    return info._id;
  }
}


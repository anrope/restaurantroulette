Restaurants = new Meteor.Collection('restaurants');

Meteor.methods({
  createRestaurant: function (opts) {
    check(opts, {
      name: NonEmptyString,
      yelpUrl: NonEmptyString,
      keywords: Match.Any,
      imageInfo: Match.Any
    });
    return Restaurants.insert({
      name: opts.name,
      yelpUrl: opts.yelpUrl,
      keywords: opts.keywords,
      imageInfo: opts.imageInfo
    });
  }
});

var NonEmptyString = Match.Where(function (x) {
  check(x, String);
  return x.length !== 0;
});

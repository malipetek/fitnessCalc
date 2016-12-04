$(document).ready((function() {
  $('#add-food-button').on('click', function() {
    $('#add-food-panel').slideToggle(300);
  });

  $('#food-search-input').change(function(e) {
    console.log(e);
    $val = $(this).val();
    $.getJSON("http://api.nal.usda.gov/ndb/search/?format=json&q=" +
      encodeURIComponent($val) +
      "&sort=n&max=25&offset=0&api_key=DEMO_KEY",
      function(data) {
        var items = [];
        $.each(data.list.item, function(key, val) {
          items.push(val);
        });
        console.log(items);
      });

  });



})());

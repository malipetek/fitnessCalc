var ConsumptionForm = (function(container, options) {

  var
    $container = $(container),
    $form = $($container.find("form")[0]),
    $measures = $("#consumption_measure"),
    $ndbno = $("#consumption_ndbno"),
    $what = $("#consumption_what"),
    $when = $("#consumption_when"),
    $quantity = $("#consumption_quantity");

  var recipe_id;
  var selection_type;

  var that = this;

  function reset() {
    $form[0].reset();
    $when.data("DateTimePicker").date(new Date())

  }

  function showLoader() {
    materialadmin.AppCard.addCardLoader($container);
  }

  function hideLoader() {
    materialadmin.AppCard.removeCardLoader($container);
  }

  function init() {
    showLoader();

    $when.datetimepicker({
      defaultDate: new Date(),
      icons: {
        time: 'fa fa-clock-o',
        date: 'fa fa-calendar',
        up: 'fa fa-chevron-up',
        down: 'fa fa-chevron-down',
        previous: 'fa fa-chevron-left',
        next: 'fa fa-chevron-right',
        today: 'fa fa-screenshot',
        clear: 'fa fa-trash',
        close: 'fa fa-remove'
      }
    });

    reset();

    $form.submit(function(event) {
      event.preventDefault();
      submit();
    });

    $what.autocomplete({
      lookup: function(query, done) {
        $.ajax({
          url: 'https://api.nal.usda.gov/ndb/search/?format=json&sort=n&max=25&offset=0&api_key=omcaFN9P4v5xb3l2VM7EqPyxwWRPjkg31EivJ4Jb',
          type: 'GET',
          data: {
            q: query
          },
          success: function(res) {
            if (res.errors) {
              $('.search-result-panel').slideUp();
            } else {
              $('.search-result-panel').slideDown();
              $list = $('.search-result-list');
              $list.find('li').slideUp('fast', function() {
                $(this).remove();
              });
              var listArray = res.list.item;
              $.each(listArray, function(index, item) {
                var li_element = document.createElement(
                  'li');
                li_element.classList.add('list-group-item');
                li_element.setAttribute('data-food-db-no',
                  item.ndbno);
                var splittedArray = item.name.split(',');
                var firstPart = splittedArray[0];
                var itemNameTrimmed = "";
                var brand;

                if (splittedArray.length == 2) {
                  itemNameTrimmed = firstPart;
                } else {
                  $.each(splittedArray, function(index,
                    item) {
                    if (item.indexOf('UPC') !== -1 ||
                      item.indexOf('GTIN') !== -1) {
                      console.log(item);
                    } else if (index == 0) {
                      brand = "(" + item + ")";
                    } else {
                      itemNameTrimmed += item + ", ";
                    }
                  });
                  itemNameTrimmed += brand;
                }
                li_element.innerHTML = itemNameTrimmed;
                li_element.style.display = 'none';
                $list.append(li_element);
                $(li_element).slideDown();
              });
            }
          }
        });
      }
    });
    delaylay = $what.autocomplete('option', 'delay');
    console.log('delay: ' + $what.autocomplete('option', 'delay'));
    hideLoader()
  };


  $(document).on('click', '.search-result-list > li', function() {
    $val = $(this).text();
    $dbid = $(this).attr('data-food-db-no');
    console.log("value: " + $val + " id: " + $dbid);
  });



  function update_measures(data) {
    showLoader();

    function fill_measure_selection(items) {
      $measures.html("");
      $.map(items, function(item) {
        $measures.append("<option>" + item + "</option>");
      });
    }

    if (!data.ndbno && data.type == "recipe") {
      fill_measure_selection(["portion"])
      hideLoader();
      return;
    }

    $.ajax({
      url: '/api/food/' + $ndbno.val() + '/measures/',
      type: 'GET',
      complete: hideLoader,
      error: function() {
        toastr.error("units could not be fetched :(")
      },
      success: function(res) {
        fill_measure_selection(res)
      }
    });
  }

  function submit() {
    showLoader();
    submit_consumption(
      $ndbno.val(),
      $what.val(),
      moment($when.data("DateTimePicker").date()).tz("UTC").format(),
      $quantity.val(),
      $measures.val(), {
        "onError": function(e) {
          hideLoader();
          toastr.error("consumption couldn't be added. " + e)
        },
        "onSuccess": function(entry) {
          hideLoader();
          reset();
          toastr.success("consumption has been added successfully. ",
            "success");
          if (options["onConsumptionSaved"])
            options["onConsumptionSaved"](entry)
        }
      }
    );
  }


  function submit_consumption(ndbno, what, when, quantity, measure,
    callback) {
    var postData = {
      "selection_type": selection_type,
      "what": what,
      "when": when,
      "measure": measure,
      "quantity": quantity
    }

    if (selection_type == "recipe") {
      postData.id = recipe_id
      postData.category = "rc"
    } else {
      postData.ndbno = ndbno
      postData.category = "fc"
    }

    $.ajax({
      url: '/api/entries/',
      type: 'POST',
      data: postData,
      error: function(e) {
        if (callback.onError)
          callback.onError(e);
      },
      success: function(res) {
        callback.onSuccess(res);
      }
    });
  }

  init();

});


// $(document).ready(function(){
//     // show_energy_bar(false);
//     init_timeline();
//     init_consumption_form();
//     init_activity_form();
//     $('[data-toggle="tooltip"]').tooltip()
//     console.log("document is now ready.")

//     $(".btn-consumption").click(showConsumptionView)
//     $(".btn-activity").click(showActivityView)
//     $(".btn-back").click(showTimeline)
// });

// function prepareToolbar(btn) {
//     if (btn == "back") {
//         $(".btn-back").show()
//         $(".btn-consumption").hide()
//         $(".btn-activity").hide()
//     } else {
//         $(".btn-back").hide()
//         $(".btn-consumption").show()
//         $(".btn-activity").show()
//     }
// }

// function showView(view) {
//     $("#timeline").hide();
//     $("#consumptionView").hide();
//     $("#activityView").hide();
//     $("#" + view).show();
// }

// function showTimeline() {
//     prepareToolbar("timeline")
//     showView("timeline")
// }

// function showConsumptionView() {
//     prepareToolbar("back");
//     showView("consumptionView");
//     $("#consumption-form form")[0].reset();
// }

// function showActivityView() {
//     prepareToolbar("back")
//     showView("activityView");
// }

// function init_consumption_form() {
//     $('#entry_when_picker').datetimepicker({
//         defaultDate: new Date(),
//         icons:{
//             time: 'fa fa-clock-o',
//             date: 'fa fa-calendar',
//             up: 'fa fa-chevron-up',
//             down: 'fa fa-chevron-down',
//             previous: 'fa fa-chevron-left',
//             next: 'fa fa-chevron-right',
//             today: 'fa fa-screenshot',
//             clear: 'fa fa-trash',
//             close: 'fa fa-remove'
//         }});

//     var $measures = $("#consumption_measure"),
//         $ndbno = $("#entry_ndbno"),
//         $what = $("#entry_what"),
//         $when = $("#entry_when_picker"),
//         $quantity = $("#entry_quantity"),
//         $consumption_form = $("#consumption_form");

//     $('#consumption_what').autocomplete({
//         serviceUrl: '/autocomplete/countries',
//         lookup: function(query, done) {
//             $.ajax({
//                 url: '/api/food/',
//                 type: 'GET',
//                 data: {
//                     q: query,
//                 },
//                 success: function(res) {
//                     var suggestions = $.map(res, function(item){
//                         return {value: item.name, data: item.ndbno}
//                     });
//                     var result = {"suggestions": suggestions};
//                     done(result);
//                 }
//             });
//         },
//         onSelect: function (suggestion) {
//             $ndbno.val(suggestion.data)
//             update_measures(suggestion.data)
//         }
//     });



//     function update_measures(ndbno) {
//         $.ajax({
//             url: '/api/food/' + ndbno + '/measures/',
//             type: 'GET',
//             error: function() {
//                 alert("something terrible happened :(")
//             },
//             success: function(res) {
//                 $measures.html("");
//                 $.map(res, function(item){
//                     $measures.append("<option>" + item + "</option>");
//                 });
//             }
//         });
//     }

//     $("#consumption_submit").click(function(){
//         submit_consumption(
//             $ndbno.val(),
//             $what.val(),
//             moment($when.data("DateTimePicker").date()).format(),
//             $quantity.val(),
//             $measures.val(),
//             {
//                 "onError": function(e) {
//                     $.notify("consumption couldn't be added. " + e)
//                 },
//                 "onSuccess": function (entry) {
//                     $('#consumptionModal').modal('hide');
//                     prepend_entry(entry, true);
//                     show_energy_bar(true);
//                     $.notify("consumption has been added successfully. ", "success");
//                 }
//             });
//     });



// }

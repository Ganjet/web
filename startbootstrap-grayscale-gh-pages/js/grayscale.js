(function($) {
  "use strict"; // Start of use strict

  // Smooth scrolling using jQuery easing
  $('a.js-scroll-trigger[href*="#"]:not([href="#"])').click(function() {
    if (location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '') && location.hostname == this.hostname) {
      var target = $(this.hash);
      target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
      if (target.length) {
        $('html, body').animate({
          scrollTop: (target.offset().top - 48)
        }, 1000, "easeInOutExpo");
        return false;
      }
    }
  });

  // Closes responsive menu when a scroll trigger link is clicked
  $('.js-scroll-trigger').click(function() {
    $('.navbar-collapse').collapse('hide');
  });

  // Activate scrollspy to add active class to navbar items on scroll
  $('body').scrollspy({
    target: '#mainNav',
    offset: 54
  });

  // Collapse Navbar
  var navbarCollapse = function() {
    if ($("#mainNav").offset().top > 100) {
      $("#mainNav").addClass("navbar-shrink");
    } else {
      $("#mainNav").removeClass("navbar-shrink");
    }
  };
  // Collapse now if page is not at top
  navbarCollapse();
  // Collapse the navbar when page is scrolled
  $(window).scroll(navbarCollapse);

})(jQuery); // End of use strict

// Google Maps Scripts
var map = null;
// When the window has finished loading create our google map below
google.maps.event.addDomListener(window, 'load', init);
google.maps.event.addDomListener(window, 'resize', function() {
  map.setCenter(new google.maps.LatLng(40.6700, -73.9400));
});

function init() {
  // Basic options for a simple Google Map
  // For more options see: https://developers.google.com/maps/documentation/javascript/reference#MapOptions
  var mapOptions = {
    // How zoomed in you want the map to start at (always required)
    zoom: 15,

    // The latitude and longitude to center the map (always required)
    center: new google.maps.LatLng(40.6700, -73.9400), // New York

    // Disables the default Google Maps UI components
    disableDefaultUI: true,
    scrollwheel: false,
    draggable: false,

    // How you would like to style the map.
    // This is where you would paste any style found on Snazzy Maps.
    styles: [{
      "featureType": "water",
      "elementType": "geometry",
      "stylers": [{
        "color": "#000000"
      }, {
        "lightness": 17
      }]
    }, {
      "featureType": "landscape",
      "elementType": "geometry",
      "stylers": [{
        "color": "#000000"
      }, {
        "lightness": 20
      }]
    }, {
      "featureType": "road.highway",
      "elementType": "geometry.fill",
      "stylers": [{
        "color": "#000000"
      }, {
        "lightness": 17
      }]
    }, {
      "featureType": "road.highway",
      "elementType": "geometry.stroke",
      "stylers": [{
        "color": "#000000"
      }, {
        "lightness": 29
      }, {
        "weight": 0.2
      }]
    }, {
      "featureType": "road.arterial",
      "elementType": "geometry",
      "stylers": [{
        "color": "#000000"
      }, {
        "lightness": 18
      }]
    }, {
      "featureType": "road.local",
      "elementType": "geometry",
      "stylers": [{
        "color": "#000000"
      }, {
        "lightness": 16
      }]
    }, {
      "featureType": "poi",
      "elementType": "geometry",
      "stylers": [{
        "color": "#000000"
      }, {
        "lightness": 21
      }]
    }, {
      "elementType": "labels.text.stroke",
      "stylers": [{
        "visibility": "on"
      }, {
        "color": "#000000"
      }, {
        "lightness": 16
      }]
    }, {
      "elementType": "labels.text.fill",
      "stylers": [{
        "saturation": 36
      }, {
        "color": "#000000"
      }, {
        "lightness": 40
      }]
    }, {
      "elementType": "labels.icon",
      "stylers": [{
        "visibility": "off"
      }]
    }, {
      "featureType": "transit",
      "elementType": "geometry",
      "stylers": [{
        "color": "#000000"
      }, {
        "lightness": 19
      }]
    }, {
      "featureType": "administrative",
      "elementType": "geometry.fill",
      "stylers": [{
        "color": "#000000"
      }, {
        "lightness": 20
      }]
    }, {
      "featureType": "administrative",
      "elementType": "geometry.stroke",
      "stylers": [{
        "color": "#000000"
      }, {
        "lightness": 17
      }, {
        "weight": 1.2
      }]
    }]
  };

  // Get the HTML DOM element that will contain your map
  // We are using a div with id="map" seen below in the <body>
  var mapElement = document.getElementById('map');

  // Create the Google Map using out element and options defined above
  map = new google.maps.Map(mapElement, mapOptions);

  // Custom Map Marker Icon - Customize the map-marker.png file to customize your icon
  var image = 'img/map-marker.svg';
  var myLatLng = new google.maps.LatLng(40.6700, -73.9400);
  var beachMarker = new google.maps.Marker({
    position: myLatLng,
    map: map,
    icon: image
  });
}
$(function () {

  var graphP = $.ajax({
    url: 'raw.json', 
    type: 'GET',
    dataType: 'json',
  });

  var styleP = $.ajax({
    url: 'rawcss.css',
    type: 'GET',
    dataType: 'text',
  });


  Promise.all([graphP, styleP]).then(initCy);

  function initCy(then) {
    var loading = document.getElementById('loading');
    var expJson = then[0];
    var styleJson = then[1];
    var elements = expJson.elements;

    loading.classList.add('loaded');

    var cy = window.cy = cytoscape({
      container: document.getElementById('cy'),
      layout: { name: 'preset' },
      style: styleJson,
      elements: elements,
      motionBlur: true,
      selectionType: 'single',
      boxSelectionEnabled: false
      
    });

    mendData();
    bindRouters();
  }

  function mendData() {
    cy.startBatch();
    var nodes = cy.nodes();
    var bin = {};
    var metanames = [];
    for (var i = 0; i < nodes.length; i++) {
      var node = nodes[i];
      var name = node.data('station_name');
      var nbin = bin[name] = bin[name] || [];

      nbin.push(node);

      if (nbin.length === 2) {
        metanames.push(name);
      }
    }

    // connect all nodes together with walking edges
    for (var i = 0; i < metanames.length; i++) {
      var name = metanames[i];
      var nbin = bin[name];

      for (var j = 0; j < nbin.length; j++) {
        for (var k = j + 1; k < nbin.length; k++) {
          var nj = nbin[j];
          var nk = nbin[k];

          cy.add({
            group: 'edges',
            data: {
              source: nj.id(),
              target: nk.id(),
              is_walking: true
            }
          });
        }
      }

    }

    cy.endBatch(); 
  }

  var start, end;
  var $body = $('body');

  function selectStart(node) {
    clear();

    $body.addClass('has-start');

    start = node;

    start.addClass('start');
  }

//TODO:maloy here create dropdown, what would be selected, "time" or "size"
  var measure = "size"; 

  function selectEnd(node) {
    $body.addClass('has-end calc');

    end = node;

    cy.startBatch();
    end.addClass('end');

       var dijkstra = cy.elements().dijkstra({
          root: start,
          directed: true,
          weight: function(e) {
            if(measure === "size") {
              return e.data('size');
            }
            if(measure === "time") {
              return e.data('time');
            }
          }
       });

       var path = dijkstra.pathTo(end);

      if (path.length <= 1) {
        console.log("Path not found");
        $body.removeClass('calc');
        clear();

        cy.endBatch();
        return;
      }

      for (var i = 0; i < path.length ; i++) {
        var group = path[i].group();
        if(group == "nodes") {
          console.log("Node: " + path[i].data('id'));
        } else {
          console.log("Edge: [" + path[i].data('source') + ":" + path[i].data('target')+ "]" );
        }
      }

      cy.elements().not(path).addClass('not-path');
      path.addClass('path');

      cy.endBatch(); 

      $body.removeClass('calc');
  }

  function clear() {
    $body.removeClass('has-start has-end');
    cy.elements().removeClass('path not-path start end');
  }

  function bindRouters() {

    var $clear = $('#clear');

    cy.nodes().qtip({
      content: {
        text: function () {
          var $ctr = $('<div class="select-buttons"></div>');
          var $start = $('<button id="start">ПОЧАТОК</button>');
          var $end = $('<button id="end">КІНЕЦЬ</button>');

          $start.on('click', function () {
            var n = cy.$('node:selected');

            selectStart(n);

            n.qtip('api').hide();
          });

          $end.on('click', function () {
            var n = cy.$('node:selected');

            selectEnd(n);

            n.qtip('api').hide();
          });

          $ctr.append($start).append($end);

          return $ctr;
        }
      },
      show: {
        solo: true
      },
      position: {
        my: 'top center',
        at: 'bottom center',
        adjust: {
          method: 'flip'
        }
      },
      style: {
        classes: 'qtip-bootstrap',
        tip: {
          width: 16,
          height: 8
        }
      }
    });

    $clear.on('click', clear);
  }

});

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

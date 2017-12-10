/*
This demo visualises the railway stations in Tokyo (東京) as a graph.

This demo gives examples of

- loading elements via ajax
- loading style via ajax
- using the preset layout with predefined positions in each element
- using motion blur for smoother viewport experience
- using `min-zoomed-font-size` to show labels only when needed for better performance
*/

$(function () {

  // // get exported json from cytoscape desktop via ajax
  var graphP = $.ajax({
    url: 'raw.json', // tokyo-railways.json
    type: 'GET',
    dataType: 'json',
    async: false // будем выполнять синхронно
  });

  // also get style via ajax
  var styleP = $.ajax({
    url: 'rawcss.css', // tokyo-railways-style.cycss
    type: 'GET',
    dataType: 'text',
    async: false
  });


  // when both graph export json and style loaded, init cy
  Promise.all([graphP, styleP]).then(initCy);
  // Promise.all([styleP]).then(initCy);

  function initCy(then) {
    var loading = document.getElementById('loading');
    var expJson = then[0];//object;
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
      // layout: {
        // name: 'dagre'
      // }
    });

    mendData();
    bindRouters();
  }

  function mendData() {
    // because the source data doesn't connect nodes properly, use the cytoscape api to mend it:

    cy.startBatch();

    // put nodes in bins based on name
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

          // .css({
          //    'line-color': 'yellow'
          // });
        }
      }

    }

    cy.endBatch(); //.autolock( true );
    // cy.edges()[0].selected(true);
    // console.log(cy.edges()[0].selected());
  }

  var start, end;
  var $body = $('body');

  function selectStart(node) {
    clear();

    $body.addClass('has-start');

    start = node;

    start.addClass('start');
  }

  var measure = "size";

  function selectEnd(node) {
    $body.addClass('has-end calc');

    end = node;

    //TODO:start your algorithm

    cy.startBatch();

    end.addClass('end');

    // setTimeout(function () {
      var aStar = cy.elements().aStar({
        root: start,
        goal: end,
        directed: true,
        weight: function (e) {
          var size = e.data('size');
          if(size > 0) {
            return size;
          }
          return 1;
        }
      });

      if (!aStar.found) {
        $body.removeClass('calc');
        clear();

        cy.endBatch();
        return;
      }
      for (var i = 0; i < aStar.path.length - 1; i++) {
        var group = aStar.path[i].group();
        if(group == "nodes") {
          console.log(aStar.path[i].data('id'));
        }
      }

      cy.elements().not(aStar.path).addClass('not-path');
      aStar.path.addClass('path');

      cy.endBatch(); 

      $body.removeClass('calc');
    // }, 300);
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
          var $start = $('<button id="start">START</button>');
          var $end = $('<button id="end">END</button>');

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

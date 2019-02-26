  
function bubbleChart() {
  var width = window.innerWidth;
  var height = 425;

  var tooltip = floatingTooltip('breach_tooltip', 240);

  var center = { x: width / 2, y: height / 2 };

  var yearCenters = {
    2014: { x: width / 3 -100, y: height / 2 },
    2015: { x: width / 2 -15, y: height / 2 },
    2016: { x: 2 * width / 3 +100, y: height / 2 }
  };

  var yearsTitleX = {
    2014: width/3 - 100,
    2015: width / 2,
    2016: 2*width/3 + 125
  };

  var sourceCenters = {
    "Malicious Outsider": { x: width/6, y: height/2},
    "Malicious Insider": { x: 2*width/6 , y: height/2},
    "State Sponsored": { x: 3*width/6 , y: height/2},
    "Accidental Loss": { x: 4*width/6 , y: height/2},
    "Hacktivist": { x: 5*width/6, y: height/2}
  };

  
  var sourceTitleX = {
    "Malicious Outsider" : width/6,
    "Malicious Insider": 2*width/6 +30,
    "State Sponsored": 3*width/6 +15,
    "Accidental Loss": 4*width/6 +25,
    "Hacktivist": 5*width/6 +35
  };

  

  var forceStrength = 0.03;

  var svg = null;
  var bubbles = null;
  var nodes = [];

  function charge(d) {
    return -Math.pow(d.radius, 2.0) * forceStrength;
  }

  var simulation = d3.forceSimulation()
    .velocityDecay(0.2)
    .force('x', d3.forceX().strength(forceStrength).x(center.x))
    .force('y', d3.forceY().strength(forceStrength).y(center.y))
    .force('charge', d3.forceManyBody().strength(charge))
    .on('tick', ticked);

  simulation.stop();

  var fillColor = d3.scaleOrdinal()

    .domain(['Account Access','Identity Theft','Financial Access','Nuisance','Existential Data'])
    .range(['#ec1919', '#f48438', '#292bb0', '#16ab11', '#bed02b']);
  var fillColorGeo = d3.scaleOrdinal()
  	.domain(['Global','North America','South America','Europe','Asia','Australia'])
    .range(['#ec1919', '#f48438', '#292bb0', '#16ab11', '#bed02b','#00f9ff']);


  function createNodes(rawData) {


    var maxAmount = d3.max(rawData, function (d) { return +d.records; });



    var radiusScale = d3.scalePow()
      .exponent(0.5)
      .range([2, 85])
      .domain([0, maxAmount]);




    var myNodes = rawData.map(function (d) {
      return {
        id: d.id,
        radius: radiusScale(+d.records),
        value: +d.records,
        name: d.organization,
    
        source: d.source,
        group: d.group,
        year: d.year,
        continent: d.continent,
        x: Math.random() * 900,
        y: Math.random() * 800
      };
    });




    myNodes.sort(function (a, b) { return b.value - a.value; });

    return myNodes;
  }

 
  var chart = function chart(selector, rawData) {

    nodes = createNodes(rawData);



    svg = d3.select(selector)
      .append('svg')
      .attr('width', width)
      .attr('height', height);


    bubbles = svg.selectAll('.bubble')
      .data(nodes, function (d) { return d.id; });






    var bubblesE = bubbles.enter().append('circle')
      .classed('bubble', true)
      .attr('r', 0)
      .attr('fill', function (d) { return fillColor(d.group); })
      .attr('stroke', function (d) { return d3.rgb(fillColor(d.group)).darker(); })
      .attr('stroke-width', 2)
      .on('mouseover', showDetail)
      .on('mouseout', hideDetail);


    bubbles = bubbles.merge(bubblesE);



    bubbles.transition()
      .duration(2000)
      .attr('r', function (d) { return d.radius; });



    simulation.nodes(nodes);


    groupBubbles();
  };

  
  function ticked() {
    bubbles
      .attr('cx', function (d) { return d.x; })
      .attr('cy', function (d) { return d.y; });
  }

  
  function nodeYearPos(d) {
    return yearCenters[d.year].x;
  }

  function nodeSourcePos(d) {
    return sourceCenters[d.source].x;
  }


  
  function groupBubbles() {
    hideYearTitles();


    simulation.force('x', d3.forceX().strength(forceStrength).x(center.x));


    simulation.alpha(1).restart();
  }


 
  function splitBubbles() {
    showYearTitles();


    simulation.force('x', d3.forceX().strength(forceStrength).x(nodeYearPos));


    simulation.alpha(1).restart();
  }

  function sourceSplitBubbles() {
    simulation.force('x', d3.forceX().strength(forceStrength).x(nodeSourcePos));
    simulation.alpha(1).restart();
  }

 
  function hideYearTitles() {
    svg.selectAll('.year').remove();
  }

  
  function showYearTitles() {


    var yearsData = d3.keys(yearsTitleX);
    var years = svg.selectAll('.year')
      .data(yearsData);

    years.enter().append('text')
      .attr('class', 'year')
      .attr('x', function (d) { return yearsTitleX[d]; })
      .attr('y', 40)
      .attr('text-anchor', 'middle')
      .text(function (d) { return d; });
  }
	function hideSourceTitles() {
		svg.selectAll('.source').remove();
	}

  function showSourceTitles() {
    var sourceData = d3.keys(sourceTitleX);
    var sources = svg.selectAll('.source')
      .data(sourceData);

    sources.enter().append('text')
      .attr('class','source')
      .attr('x',function (d) {return sourceTitleX[d]; })
      .attr('y', 40)
      .attr('text-anchor','middle')
      .text(function (d) {return d; });
  }



  function showDetail(d) {

    d3.select(this).attr('stroke', 'black');

    var content = '<span class="name">Title: </span><span class="value">' +
                  d.name +
                  '</span><br/>' +
                  '<span class="name">Amount: </span><span class="value">' +
                  addCommas(d.value) +
                  '</span><br/>' +
                  '<span class="name">Year: </span><span class="value">' +
                  d.year +
                  '</span>';

    tooltip.showTooltip(content, d3.event);
  }

  
  function hideDetail(d) {

    d3.select(this)
      .attr('stroke', d3.rgb(fillColor(d.group)).darker());

    tooltip.hideTooltip();
  }

  chart.toggleDisplay = function (displayName) {
    if (displayName === 'year') {
    	hideSourceTitles();
      splitBubbles();
    } else if (displayName == 'source') {
      hideYearTitles();
      showSourceTitles();
      sourceSplitBubbles();
    } else {
      hideSourceTitles();
      groupBubbles();
    }
  };


  return chart;
}


var myBubbleChart = bubbleChart();


function display(error, data) {
  if (error) {
    console.log(error);
  }

  myBubbleChart('#vis', data);
}


function setupButtons() {
  d3.select('#toolbar')
    .selectAll('.button')
    .on('click', function () {
  
      d3.selectAll('.button').classed('active', false);
  
      var button = d3.select(this);

  
      button.classed('active', true);

  
      var buttonId = button.attr('id');

  
  
      myBubbleChart.toggleDisplay(buttonId);
    });
}


function addCommas(nStr) {
  nStr += '';
  var x = nStr.split('.');
  var x1 = x[0];
  var x2 = x.length > 1 ? '.' + x[1] : '';
  var rgx = /(\d+)(\d{3})/;
  while (rgx.test(x1)) {
    x1 = x1.replace(rgx, '$1' + ',' + '$2');
  }

  return x1 + x2;
}
d3.csv('data/security_breach_data.csv', display);
setupButtons();

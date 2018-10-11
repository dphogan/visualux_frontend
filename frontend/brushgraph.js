//Functions for focus and context plots of phe/sample vs. sample, with brushes

function drawbrush() {
  //Draws 'focus' and 'context' graphs with brushing
  //Based on: http://bl.ocks.org/mbostock/1667367
  //Gridlines based on: http://www.d3noob.org/2013/01/adding-grid-lines-to-d3js-graph.html

  //Margins
  var totalwidth = 750;
  var totalheight = 540;
  var margin = {top: 10, right: 25, bottom: 120, left: 65};
  var margin2 = {top: totalheight-90, right: 25, bottom: 40, left: 65};
  var width = totalwidth - margin.left - margin.right;
  var height = totalheight - margin.top - margin.bottom;
  var height2 = totalheight - margin2.top - margin2.bottom;

  //plot3: Margins for if multiPMT plot visible
  var spacerheight = 20;
  var height3 = 195;
  margin3 = {top: 10, right: 25, bottom: totalheight-(10+height3), left: 65};
  if (vis.control.showallpmts) {
    margin.top = 10 + height3 + spacerheight;
    height = totalheight - margin.top - margin.bottom;
  }

  //Scales
  var x = d3.scale.linear()
    .range([0, width]);
  var x2 = d3.scale.linear()
    .range([0, width]);
  var x3 = d3.scale.linear()
    .range([0, width]);
  var y = d3.scale.linear()
    .range([height, 0]);
  var y2 = d3.scale.linear()
    .range([height2, 0]);
  var y3 = d3.scale.linear()
    .range([height3, 0]);

  //Axes
  xtickgoal = 10;
  ytickgoal = 8;
  y3tickgoal = 5;
  vis.brushgraph.xtickgoal = xtickgoal;
  vis.brushgraph.ytickgoal = ytickgoal;
  vis.brushgraph.y3tickgoal = y3tickgoal;
  var xAxis = d3.svg.axis().scale(x).orient("bottom").ticks(xtickgoal);
  var xAxis2 = d3.svg.axis().scale(x2).orient("bottom").ticks(xtickgoal);
  var yAxis = d3.svg.axis().scale(y).orient("left").ticks(ytickgoal);
  var yAxis3 = d3.svg.axis().scale(y3).orient("left").ticks(y3tickgoal);

  //Gridlines (really just an extra set of specially-formatted axes)
  var xgrid = d3.svg.axis().scale(x).orient("bottom").ticks(xtickgoal);
  var ygrid = d3.svg.axis().scale(y).orient("left").ticks(ytickgoal);
  var x3grid = d3.svg.axis().scale(x3).orient("bottom").ticks(xtickgoal);
  var y3grid = d3.svg.axis().scale(y3).orient("left").ticks(y3tickgoal);

  //Brush (for context plot)
  var brush = d3.svg.brush()
    .x(x2)
    .on("brushend", brushed); //brushend was brush

  //Zoom brush (for focus plot)
  var zoombrush = d3.svg.brush()
    .x(x)
    .y(y)
    .clamp([false,false])
    .on("brushend", zoombrushed);

  //multi-PMT brush (like zoom brush, but on multipmt plot)
  var pmtbrush = d3.svg.brush()
    .x(x3)
    .y(y3)
    .clamp([false,false])
    .on("brushend", pmtbrushed);

  //Creat SVG
  var svg = d3.select("#brushcell").append("svg")
    .attr("width", totalwidth)
    .attr("height", totalheight);

  //Shade SVG for debugging purposes
  svg.append("rect")
    .attr("width", "100%")
    .attr("height", "100%")
    .attr("class", "backgroundcolor");

  //Clip path for focus and context rectangles
  svg.append("defs").append("clipPath")
    .attr("id", "focusclip")
    .append("rect")
    .attr("width", width)
    .attr("height", height);
  //extra space at top of context plot's clippath
  //so lines' rounded tops not cut off
  contextclippadding = 5;
  svg.append("defs").append("clipPath")
    .attr("id", "contextclip")
    .append("rect")
    .attr("y", -contextclippadding)
    .attr("width", width)
    .attr("height", height2 + contextclippadding);
  //plot3: Clip path for multipmt plot
  if (vis.control.showallpmts) {
    svg.append("defs").append("clipPath")
      .attr("id", "multipmtclip")
      .append("rect")
      .attr("width", width)
      .attr("height", height3);
  }

  //Groups to contain each graph's elements
  var focus = svg.append("g")
    .attr("class", "focus")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
  var context = svg.append("g")
    .attr("class", "context")
    .attr("transform", "translate(" + margin2.left + "," + margin2.top + ")");
  var multipmt;
  if (vis.control.showallpmts) {
    multipmt = svg.append("g")
      .attr("class", "multipmt")
      .attr("transform", "translate(" + margin3.left + "," + margin3.top +")");
  }

  //Adds group to hold pulse RQ information
  focus.append("g")
    .attr("id","pulsegroup");
  context.append("g")
    .attr("id","pulsecontextgroup");

  //Add gridlines
  focus.append("g")
    .attr("class", "x grid")
    .attr("transform", "translate(0," + height + ")")
    .call( xgrid.tickSize(-height,0,0).tickFormat("") );
  focus.append("g")
    .attr("class", "y grid")
    .call( ygrid.tickSize(-width,0,0).tickFormat("") );
  //plot3: Add gridlines to multipmt plot
  if (vis.control.showallpmts) {
    multipmt.append("g")
      .attr("class", "x3 grid")
      .attr("transform", "translate(0," + height3 + ")")
      .call( x3grid.tickSize(-height3,0,0).tickFormat("") );
    multipmt.append("g")
      .attr("class", "y3 grid")
      .call( y3grid.tickSize(-width,0,0).tickFormat("") );
  }

  //Adds group to hold RQ pulse labels
  focus.append("g")
    .attr("id","pulselabels");

  //Add basic visible elements (path, axes, brushes)
  path = focus.append("path")
    .attr("clip-path", "url(#focusclip)")
    .attr("id", "focuspath")
    .attr("class", "pathclass");
  focus.append("path")
    .attr("clip-path", "url(#focusclip)")
    .attr("id", "ghostpath")
    .attr("class", "pathclass");    
  focus.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis);
  focus.append("g")
    .attr("class", "y axis")
    .call(yAxis);
  focus.append("g")
    .attr("class", "x y zoombrush")
    .attr("clip-path", "url(#focusclip)")
    .call(zoombrush)
    .selectAll("rect");

  //This group will later hold the lines of the sped-up context plot
  //context.append("g").attr("id","contextlinegroup");
  //path2: command to define path (& id, class, clip-path) was formerly here
  path2 = context.append("path")
    .attr("clip-path", "url(#contextclip)")
    .attr("id", "contextpath")
    .attr("class", "pathclass");
  context.append("g")
    .attr("class", "x2 axis")
    .attr("transform", "translate(0," + height2 + ")")
    .call(xAxis2);
  context.append("g")
    .attr("class", "x2 brush")
    .call(brush)
    .selectAll("rect")
    .attr("y", -6)
    .attr("height", height2 + 7);

  if (vis.control.showallpmts) {
    multipmt.append("g")
      .attr("id", "pmtpathholder")
    multipmt.append("g")
      .attr("class", "y3 axis")
      .call(yAxis3);
    multipmt.append("g")
      .attr("class", "x3 y3 pmtbrush")
      .attr("clip-path", "url(#multipmtclip)")
      .call(pmtbrush)
      .selectAll("rect");
  }

  //Adds boxes around the plots
  svg.append("rect")
    .attr("x", margin.left)
    .attr("y", margin.top)
    .attr("width", width)
    .attr("height", height)
    .attr("class", "legendary")
    ;
  if (vis.control.showallpmts) {
    svg.append("rect")
    .attr("x", margin3.left)
    .attr("y", margin3.top)
    .attr("width", width)
    .attr("height", height3)
    .attr("class", "legendary")
    ;
  }

  //Adds labels for the axes
  svg.append("text")
    .attr("x", (totalwidth-margin.right+margin.left)/2)
    .attr("y", totalheight-5)
    .attr("style","text-anchor:middle")
    .attr("class","legendary")
    .text("samples")
    ;
  ylegy = (totalheight-margin.bottom+margin.top)/2;
  svg.append("text")
    .attr("x", 0)
    .attr("y", 0)
    .attr("transform", "translate(15 " + ylegy + ") rotate(-90)")
    .attr("style","text-anchor:middle")
    .attr("class","legendary")
    .text("phe / sample")
    ;
  if (vis.control.showallpmts) {
    ylegy = (totalheight-margin3.bottom+margin3.top)/2;
    svg.append("text")
      .attr("x", 0)
      .attr("y", 0)
      .attr("transform", "translate(15 " + ylegy + ") rotate(-90)")
      .attr("style","text-anchor:middle")
      .attr("class","legendary")
      .text("phe / sample")
      ;
  }

  //Copies many things to the global variable for later access
  vis.brushgraph.svg = svg;
  vis.brushgraph.x = x;
  vis.brushgraph.x2 = x2;
  vis.brushgraph.x3 = x3;
  vis.brushgraph.y = y;
  vis.brushgraph.y2 = y2;
  vis.brushgraph.y3 = y3;
  vis.brushgraph.xAxis = xAxis;
  vis.brushgraph.xAxis2 = xAxis2;
  vis.brushgraph.yAxis = yAxis;
  vis.brushgraph.yAxis3 = yAxis3;
  vis.brushgraph.xgrid = xgrid;
  vis.brushgraph.ygrid = ygrid;
  vis.brushgraph.x3grid = x3grid;
  vis.brushgraph.y3grid = y3grid;
  vis.brushgraph.focus = focus;
  vis.brushgraph.context = context;
  vis.brushgraph.multipmt = multipmt;
  vis.brushgraph.brush = brush;
  vis.brushgraph.zoombrush = zoombrush;
  vis.brushgraph.pmtbrush = pmtbrush;

  //The final touches (like adding the data) are needed
  //for "redrawbrush," so let's just call it now.
  redrawbrush();

  function brushed() {
    if (brush.empty()) {
      focuszoom(0,0,true,true);
    } else {
      focuszoom(brush.extent(),0,false,true);
    }
  }

  function zoombrushed() {
    if (!zoombrush.empty()) {
      newxdom = [zoombrush.extent()[0][0], zoombrush.extent()[1][0]];
      newydom = [zoombrush.extent()[0][1], zoombrush.extent()[1][1]];
      newy3dom = y3.domain();
      focuszoom(newxdom, newydom, false, false, false,newy3dom,false);
    }
  }

  function pmtbrushed() {
    if (!pmtbrush.empty()) {
      newxdom = [pmtbrush.extent()[0][0], pmtbrush.extent()[1][0]];
      newydom = y.domain();
      newy3dom = [pmtbrush.extent()[0][1], pmtbrush.extent()[1][1]];
      focuszoom(newxdom, newydom, false, false, false, newy3dom, false);
    }
  }
}



function redrawbrush() {
  //Updates the brush graph when a new event is to be visualized

  //Retrieves all those global variables set in drawbrush()
  //so we can use or update them.
  svg = vis.brushgraph.svg;
  x = vis.brushgraph.x;
  y = vis.brushgraph.y;
  x2 = vis.brushgraph.x2;
  y2 = vis.brushgraph.y2;
  x3 = vis.brushgraph.x3;
  y3 = vis.brushgraph.y3;
  xAxis = vis.brushgraph.xAxis;
  xAxis2 = vis.brushgraph.xAxis2;
  yAxis = vis.brushgraph.yAxis;
  yAxis3 = vis.brushgraph.yAxis3;
  xgrid = vis.brushgraph.xgrid;
  ygrid = vis.brushgraph.ygrid;
  x3grid = vis.brushgraph.x3grid;
  y3grid = vis.brushgraph.y3grid;
  var focus = vis.brushgraph.focus;
  context = vis.brushgraph.context;
  multipmt = vis.brushgraph.multipmt;
  brush = vis.brushgraph.brush;
  pmtbrush = vis.brushgraph.pmtbrush;

  //Get original data
  sampletime = vis.currentevent.sumpod.time_samples;
  sampleheight = vis.currentevent.sumpod.data_phe_per_sample;
  data = zip(sampletime, sampleheight);

  //Get data with spacers in it
  data_spacers = zip(vis.currentevent.sumpod.time_samples_spacers, vis.currentevent.sumpod.data_phe_per_sample_spacers);

  //Path instructions ignore datapoints with value -9999 (used to make gaps)
  var sumpath = d3.svg.line()
    .defined(function(d,i) {return Math.abs(d[1]+9999)>=vis.control.epsilon;})
    .x(function(d) { return Math.round(x(d[0])*100)/100; })
    .y(function(d) { return Math.round(y(d[1])*100)/100; })
    .interpolate("linear");
  //path2: command to create d3.svg.line for the path was formerly here
  var sumpath2 = d3.svg.line()
    .defined(function(d,i) {return Math.abs(d[1]+9999)>=vis.control.epsilon;})
    .x(function(d) { return Math.round(x2(d[0])*100)/100; })
    .y(function(d) { return Math.round(y2(d[1])*100)/100; })
    .interpolate("linear");

  //Since there are many PODs, an array of paths and another array of 
  //d3.svg.line objects will be needed
  var path3 = [];
  var sumpath3 = [];
  var y3min, y3max;
  if (vis.control.showallpmts) {
    //delete old multipmt paths
    multipmt.selectAll("#pmtpathholder").selectAll(".multipmtpath").remove();
    //Generate new multipmt paths
    for (var i=0; i<vis.currentevent.pod.length; i++) {
      colorstring = returnpmtcolor(vis.currentevent.pod[i].ch);
      //console.log("in loop", i, vis.currentevent.pod[i].ch, colorstring);
      var apath = multipmt.selectAll("#pmtpathholder").append("path")
	.attr("clip-path", "url(#multipmtclip)")
	.attr("class", "multipmtpath")
	.attr("fill", "none")
	.attr("stroke", colorstring)
	.attr("stroke-weight", 1)
	;
      path3.push(apath);
      var asumpath = d3.svg.line()
	.defined(function(d,i) {return Math.abs(d[1]+9999)>=vis.control.epsilon;})
	.x(function(d) { return Math.round(x3(d[0])*100)/100; })
	.y(function(d) { return Math.round(y3(d[1])*100)/100; })
	.interpolate("linear")
	;
      sumpath3.push(asumpath);
      //Finds min and max of data
      var extent = d3.extent(vis.currentevent.pod[i].data_phe_per_sample);
      if (i==0) {
	y3min = extent[0];
	y3max = extent[1];
      } else {
	y3min = Math.min(y3min, extent[0]);
	y3max = Math.max(y3max, extent[1]);
      }
    }
  }
  vis.brushgraph.path3 = path3;
  vis.brushgraph.sumpath3 = sumpath3;

  //brushed() needs to be able to find sumpath.
  vis.brushgraph.sumpath = sumpath;

  //Set scale domains
  x.domain(d3.extent(sampletime));
  y.domain(d3.extent(sampleheight)).nice();
  x2.domain(x.domain());
  y2.domain(d3.extent(sampleheight));
  if (vis.control.showallpmts) {
    x3.domain(x.domain());
    y3.domain([y3min,y3max]);
  }

  //Generate filtered data with some points removed for speed
  fobject = createfilterdata(x, y);
  datathin = zip(fobject.thinsam, fobject.thinsig);
  vis.data.datathin = datathin;

  //Update all axes and grids
  svg.select(".x.axis")
    .call(xAxis);
  svg.select(".x2.axis")
    .call(xAxis2);
  svg.select(".y.axis")
    .call(yAxis);
  svg.select(".x.grid")
    .call(xgrid);
  svg.select(".y.grid")
    .call(ygrid);
  if (vis.control.showallpmts) {
    svg.select(".y3.axis")
      .call(yAxis3);
    svg.select(".x3.grid")
      .call(x3grid);
    svg.select(".y3.grid")
      .call(y3grid);
  }

  //Updates the path
  path = focus.selectAll("#focuspath")
    .datum(datathin)
    .attr("d", sumpath);
  //path2: Command to bind data was formerly here.
  path2 = context.selectAll("#contextpath")
    .datum(datathin)
    .attr("d", sumpath2);
  if (vis.control.showallpmts) {
    for (i=0; i<vis.currentevent.pod.length; i++) {
      var sam = vis.currentevent.pod[i].time_samples_spacers;
      var sig = vis.currentevent.pod[i].data_phe_per_sample_spacers;
      fobject = createfilterdata(x3, y3, sam, sig);
      datathin = zip(fobject.thinsam, fobject.thinsig);
      path3[i]
	.datum(datathin)
	.attr("d", sumpath3[i]);
    }
  }

  //Assigns color to curves
  colorpath();

  //Clears the brush (and any other brushes that might be later added).
  //Not clear why this works but just "brush.clear()" doesn't.
  d3.selectAll(".brush").call(brush.clear());
  if (vis.control.showallpmts) {
    d3.selectAll(".pmtbrush").call(pmtbrush.clear());
  }

  //Resets list of previous zooms
  vlistentry = {};
  vlistentry.xdomain = x.domain();
  vlistentry.ydomain = y.domain();
  vlistentry.autoxflag = true;
  vlistentry.autoyflag = true;
  vis.control.viewlist = [vlistentry];
  vis.control.viewindex = 0;

  //Disables undo and redo buttons
  document.getElementById("viewundobutton").disabled=true;
  document.getElementById("viewredobutton").disabled=true;
}



function focusnewzoom(xdomain, autoxflag, ydomain, autoyflag, y3domain, autoy3flag, prevzoomflag) {
  //Just calls focuszoom, but with the input arguments in a more logical order
  focuszoom(xdomain, ydomain, autoxflag, autoyflag, prevzoomflag, y3domain, autoy3flag);
}



function focuszoom(xdomain, ydomain, autoxflag, autoyflag, prevzoomflag, y3domain, autoy3flag) {
  //One function to change the region being viewed in the focus plot.
  //x and y are the requested domains, as arrays [min,max]
  //autoxflag and autoyflag say whether to use these, or pick values
  //prevzoomflag says not to overwrite zoom history

  if (typeof(autoxflag)==='undefined') autoxflag = false;
  if (typeof(autoyflag)==='undefined') autoyflag = false;
  if (typeof(prevzoomflag)==='undefined') prevzoomflag = false;
  if (typeof(autoy3flag)==='undefined') autoy3flag = true;

  //Shorter names for needed variables from the big global variable
  x = vis.brushgraph.x;
  x2 = vis.brushgraph.x2;
  y = vis.brushgraph.y;
  x3 = vis.brushgraph.x3;
  y3 = vis.brushgraph.y3;
  brush = vis.brushgraph.brush;
  zoombrush = vis.brushgraph.zoombrush;
  var focus = vis.brushgraph.focus;
  
  //Variables to hold new scales
  newx = d3.scale.linear()
    .range(x.range());
  newy = d3.scale.linear()
    .range(y.range());

  //If requested, ignore xdomain input and use the whole available range
  if (autoxflag) {
    xdomain = x2.domain();
  }
  newx.domain(xdomain);

  //If requested, ignore ydomain input and pick values that make
  //all data in this x-domain visible.
  if (autoyflag) {
    ydomain = minmaxinrange(vis.currentevent.sumpod.time_samples, vis.currentevent.sumpod.data_phe_per_sample, xdomain[0], xdomain[1]);
    //Catch y-domain errors from constant or non-existant data
    if (typeof(ydomain[0])==='undefined') ydomain[0] = 0;
    if (typeof(ydomain[1])==='undefined') ydomain[1] = 1;
    if (ydomain[1]<=ydomain[0]) {
      ydomain[0] = ydomain[0]-.5;
      ydomain[1] = ydomain[0]+.5;
    }
    newy.domain(ydomain).nice();
  } else {
    newy.domain(ydomain);
  }  

  //Generate filtered data with some points removed for speed
  //This is the "new" data that's going to be seen next
  fobject = createfilterdata(newx, newy);
  datathin = zip(fobject.thinsam, fobject.thinsig);

  //Make a second path that will illustrate the departing data
  //during the transition.  This path is a "ghost" -- it will
  //only be seen fleetingly during the transition.
  ghostpath = focus.select("#ghostpath")
    .datum(vis.data.datathin)
    .attr("d", vis.brushgraph.sumpath)
    .style("opacity","1")
    ;
  vis.data.datathin = datathin;

  //Plot the new data, but using the existing scales.
  //No transition here -- that comes below.
  focuspath = focus.select("#focuspath")
    .datum(datathin)
    .attr("d", vis.brushgraph.sumpath)
    .style("opacity","0")
    ;

  //Preserve the existing scales, with corresponding svg.line and axes
  var oldx = d3.scale.linear().domain(x.domain()).range(x.range());
  var oldy = d3.scale.linear().domain(y.domain()).range(y.range());
  vis.brushgraph.oldx = oldx;
  vis.brushgraph.oldy = oldy;
  var oldsumpath = d3.svg.line()
    .defined(function(d,i) {return Math.abs(d[1]+9999)>=vis.control.epsilon;})
    .x(function(d) { return Math.round(oldx(d[0])*100)/100; })
    .y(function(d) { return Math.round(oldy(d[1])*100)/100; })
    .interpolate("linear");
  var oldxAxis = d3.svg.axis().scale(oldx).orient("bottom").ticks(vis.brushgraph.xtickgoal);
  var oldyAxis = d3.svg.axis().scale(oldy).orient("left").ticks(vis.brushgraph.ytickgoal);

  //Update the scales
  x.domain(newx.domain());
  y.domain(newy.domain());

  //Update brushgraph focus plot's graphical elements
  //Start with an instant transition to force updates.
  focus.select("#focuspath")
    .transition()
    .duration(0)
    .attr("d", oldsumpath)
    .each("end",function(){
	    d3.select(this)
	      .transition()
	      .duration(vis.control.transtime)
	      .attr("d", vis.brushgraph.sumpath)
	      .style("opacity","1")
	      ;
	  })
    ;
  focus.select("#ghostpath")
    .transition()
    .duration(0)
    .attr("d", oldsumpath)
    .each("end",function(){
	    d3.select(this)
	      .transition()
	      .duration(vis.control.transtime)
	      .attr("d", vis.brushgraph.sumpath)
	      .style("opacity","0")
	      ;
	  })
    ;

  focus.select(".x.axis")
    .transition()
    .duration(0)
    .call(oldxAxis)
    .each("end",function(){
	    d3.select(this)
	      .transition()
	      .duration(vis.control.transtime)
	      .call(xAxis)
	      ;
	  })
    ;
  focus.select(".y.axis")
    .transition()
    .duration(0)
    .call(oldyAxis)
    .each("end",function(){
	    d3.select(this)
	      .transition()
	      .duration(vis.control.transtime)
	      .call(yAxis)
	      ;
	  })
    ;
  xgrid.scale(oldx);
  focus.select(".x.grid")
    .transition()
    .duration(0)
    .call(xgrid)
    .each("end",function(){
	    xgrid.scale(x);
	    d3.select(this)
	      .transition()
	      .duration(vis.control.transtime)
	      .call(xgrid)
	      ;
	  })
    ;
  ygrid.scale(oldy);
  focus.select(".y.grid")
    .transition()
    .duration(0)
    .call(ygrid)
    .each("end",function(){
	    ygrid.scale(y)
	    d3.select(this)
	      .transition()
	      .duration(vis.control.transtime)
	      .call(ygrid)
	      ;
	  })
    ;

  //Update hitmap
  redrawhitmap(1, x.domain()[0], x.domain()[1]);

  //Update RQ's
  redrawpulses(true);
  redrawrecon(true);
  redrawquantsunambiguous();

  //Turn off zoom brush
  d3.selectAll(".zoombrush").call(zoombrush.clear());
  if (vis.control.showallpmts) {
    d3.selectAll(".pmtbrush").call(pmtbrush.clear());
  }

  //Update the brush in the context plot
  if (autoxflag) {
    d3.selectAll(".brush").call(brush.clear());
  } else {
    d3.selectAll(".brush").call(brush.extent(xdomain));
  }

  //Update multiPMT plot
  if (vis.control.showallpmts) {
    //Save old scales / axes
    var oldx3 = d3.scale.linear().domain(x3.domain()).range(x3.range());
    var oldy3 = d3.scale.linear().domain(y3.domain()).range(y3.range());
    var oldyAxis3 = d3.svg.axis().scale(oldy3).orient("left").ticks(vis.brushgraph.y3tickgoal);

    //Update x and y domains for multipmt
    x3.domain(newx.domain());
    if (autoy3flag) {
      var definedrangefound = false;
      for (var i=0; i<vis.currentevent.pod.length; i++) {
	aydomain = minmaxinrange(vis.currentevent.pod[i].time_samples, vis.currentevent.pod[i].data_phe_per_sample, x3.domain()[0], x3.domain()[1]);
	if (typeof(aydomain[0])==='undefined') continue;
	if (definedrangefound==false) {
	  y3min = aydomain[0];
	  y3max = aydomain[1];
	  definedrangefound = true;
	} else {
	  y3min = Math.min(y3min, aydomain[0]);
	  y3max = Math.max(y3max, aydomain[1]);
	}
      }
      if (definedrangefound==false) {
	y3.domain([0,1]);
      } else if (y3max == y3min) {
	y3.domain([y3min-.5, y3max+.5]);
      } else {
	y3.domain([y3min,y3max]).nice();
      }
    } else {
      y3.domain(y3domain);
    }

    //Unanimated multi-PMT axis/grid transitions
    /*
    multipmt.select(".y3.axis")
      .call(vis.brushgraph.yAxis3);
    multipmt.select(".x3.grid")
      .call(vis.brushgraph.x3grid);
    multipmt.select(".y3.grid")
      .call(vis.brushgraph.y3grid);
    */

    //Animated multi-PMT axis/grid transitions
    //var yAxis3 = vis.brushgraph.yAxis3;
    //var x3grid = vis.brushgraph.x3grid;
    //var y3grid = vis.brushgraph.y3grid;
    multipmt.select(".y3.axis")
      .transition()
      .duration(0)
      .call(oldyAxis3)
      .each("end",function(){
	      d3.select(this)
		.transition()
		.duration(vis.control.transtime)
		.call(yAxis3)
		;
	    })
      ;
    x3grid.scale(oldx3);
    multipmt.select(".x3.grid")
      .transition()
      .duration(0)
      .call(x3grid)
      .each("end",function(){
	      x3grid.scale(x3);
	      d3.select(this)
		.transition()
		.duration(vis.control.transtime)
		.call(x3grid)
		;
	    })
      ;
    y3grid.scale(oldy3);
    multipmt.select(".y3.grid")
      .transition()
      .duration(0)
      .call(y3grid)
      .each("end",function(){
	      y3grid.scale(y3)
		d3.select(this)
		.transition()
		.duration(vis.control.transtime)
		.call(y3grid)
		;
	    })
      ;
    
    for (var i=0; i<vis.currentevent.pod.length; i++) {
      var sam = vis.currentevent.pod[i].time_samples_spacers;
      var sig = vis.currentevent.pod[i].data_phe_per_sample_spacers;
      fobject = createfilterdata(x3, y3, sam, sig);
      datathin = zip(fobject.thinsam, fobject.thinsig);
      vis.brushgraph.path3[i]
	.datum(datathin)
	.style("opacity",0)               //  These lines
	.transition()                     //  make plots
	.duration(0)                      //  disappear
	.delay(vis.control.transtime)     //  during
	.style("opacity",1)               //  transitions.
	.attr("d", vis.brushgraph.sumpath3[i])
	;
    }
  }

  //Update list of zooms
  if (!prevzoomflag) {
    //If this is a new view (not just replotting something from the
    //view history), then write a new entry into view history.

    //Write the entry
    vis.control.viewindex += 1;
    vlistentry = {};
    vlistentry.xdomain = x.domain();
    vlistentry.ydomain = y.domain();
    vlistentry.autoxflag = autoxflag;
    vlistentry.autoyflag = autoyflag;
    if (!vis.control.showallpmts) {
      vlistentry.y3domain = 0;
      vlistentry.autoy3flag = true;
    } else {
      vlistentry.y3domain = y3.domain();
      vlistentry.autoy3flag = autoy3flag;
    }
    vis.control.viewlist[vis.control.viewindex] = vlistentry;

    //Delete all subsequent view history
    vis.control.viewlist=vis.control.viewlist.slice(0,vis.control.viewindex+1);
  }

  //Update zoom history buttons
  if (vis.control.viewindex>0) {
    document.getElementById("viewundobutton").disabled=false;
  } else {
    document.getElementById("viewundobutton").disabled=true;
  }
  if (vis.control.viewindex<vis.control.viewlist.length-1) {
    document.getElementById("viewredobutton").disabled=false;
  } else {
    document.getElementById("viewredobutton").disabled=true;
  }
}



function focuszoomprevious() {
  //Zoom to a previous view
  if (vis.control.viewindex>0) {
    vis.control.viewindex = vis.control.viewindex - 1;
    var oldentry = vis.control.viewlist[vis.control.viewindex];
    focuszoom(oldentry.xdomain, oldentry.ydomain, oldentry.autoxflag, oldentry.autoyflag, true, oldentry.y3domain, oldentry.autoy3flag);
  }
}



function focuszoomnext() {
  //Zoom to a view later in the zoom history
  if (vis.control.viewindex<vis.control.viewlist.length-1) {
    vis.control.viewindex = vis.control.viewindex + 1;
    var oldentry = vis.control.viewlist[vis.control.viewindex];
    focuszoom(oldentry.xdomain, oldentry.ydomain, oldentry.autoxflag, oldentry.autoyflag, true, oldentry.y3domain, oldentry.autoy3flag);
  }
}



function focuspan(xfactor, yfactor) {
  //Pans view in the focus plot

  xmin = vis.brushgraph.x.domain()[0];
  xmax = vis.brushgraph.x.domain()[1];
  dx = xmax-xmin;
  ymin = vis.brushgraph.y.domain()[0];
  ymax = vis.brushgraph.y.domain()[1];
  dy = ymax-ymin;
  y3min = vis.brushgraph.y3.domain()[0];
  y3max = vis.brushgraph.y3.domain()[1];
  dy3 = y3max-y3min;  

  newxmin = xmin + xfactor*dx;
  newxmax = xmax + xfactor*dx;
  newymin = ymin + yfactor*dy;
  newymax = ymax + yfactor*dy;
  newy3min = y3min + yfactor*dy3;
  newy3max = y3max + yfactor*dy3;

  focuszoom([newxmin,newxmax],[newymin,newymax],false,false,false,[newy3min,newy3max],false);
}



function focusbackaway(xfactor, yfactor) {
  //Zooms out the focus plot
  xmin = vis.brushgraph.x.domain()[0];
  xmax = vis.brushgraph.x.domain()[1];
  xmid = (xmin+xmax)/2;
  dx = xmax-xmin;
  ymin = vis.brushgraph.y.domain()[0];
  ymax = vis.brushgraph.y.domain()[1];
  ymid = (ymin+ymax)/2;
  dy = ymax-ymin;
  y3min = vis.brushgraph.y3.domain()[0];
  y3max = vis.brushgraph.y3.domain()[1];
  y3mid = (y3min+y3max)/2;
  dy3 = y3max-y3min;

  newxmin = xmid - .5*xfactor*dx;
  newxmax = xmid + .5*xfactor*dx;
  newymin = ymid - .5*yfactor*dy;
  newymax = ymid + .5*yfactor*dy;
  newy3min = y3mid - .5*yfactor*dy3;
  newy3max = y3mid + .5*yfactor*dy3;

  focuszoom([newxmin,newxmax],[newymin,newymax],false,false, false,[newy3min,newy3max],false);
}



function focuspulse(pulseno) {
  therq = vis.currentevent.rq[vis.rq.rqplacement];
  if (pulseno < therq.num_pulses_found) {
    xmin = therq.pulse_start[pulseno];
    xmax = therq.pulse_end[pulseno];
    focuszoom([xmin,xmax],0,false,true);
  }
}



function highlightpmtplot(chno) {
  //Dims all but a single line in the multi-PMT plot
  //chno = channel number
  if (vis.control.showallpmts) {
    for (var i=0; i<vis.currentevent.pod.length; i++) {
      if (vis.currentevent.pod[i].ch != chno) {
	vis.brushgraph.path3[i]
	  .style("opacity", 0);
      }
    }
  }
}



function lowlightpmtplot(chno) {
  //Restores all lines in the multi-PMT plot to equal visibility
  //chno = channel number
  if (vis.control.showallpmts) {
    for (var i=0; i<vis.currentevent.pod.length; i++) {
      vis.brushgraph.path3[i]
	.style("opacity", 1);
    }
  }
}



function minmaxinrange(samples, signals, samplestart, sampleend) {
  //Returns min and max values of signals found among values for which
  //the corresponding samples value is between samplestart and sampleend.

  var samplefound = false;
  var samplelength = samples.length;
  var minval, maxval;
  for (c=0; c<samplelength; c++) {
    if (samples[c]>=samplestart && samples[c]<=sampleend) {
      if (!samplefound) {
	minval = signals[c];
	maxval = signals[c];
	samplefound = true;
      } else {
	minval = Math.min(minval, signals[c]);
	maxval = Math.max(maxval, signals[c]);
      }
    }
  }
  return [minval,maxval];
}



function colorpath() {
  //Assigns the correct class to the paths in the brush graph

  if(document.getElementById('colorchoice_rainbow').checked) {
    document.getElementById('focuspath').setAttribute("class","pathclass colorrain");
    document.getElementById('ghostpath').setAttribute("class","pathclass colorrain");
    document.getElementById('contextpath').setAttribute("class","pathclass colorrain");
    //$('.contextline').attr('class','contextline colorrain');
  } else {
    document.getElementById('focuspath').setAttribute("class","pathclass colormono");
    document.getElementById('ghostpath').setAttribute("class","pathclass colormono");
    document.getElementById('contextpath').setAttribute("class","pathclass colormono");
    //$('.contextline').attr('class','contextline colormono');
  }
  
}



//"zip" from: http://stackoverflow.com/questions/4856717/javascript-equivalent-of-pythons-zip-function
function zip() {
  var args = [].slice.call(arguments);
  var shortest = args.length==0 ? [] : args.reduce(function(a,b){
    return a.length<b.length ? a : b
  });
  return shortest.map(function(_,i){
    return args.map(function(array){return array[i]})
  });
}



//This function will call zip and remove needless zeros from the end product
//Rendered unnecessary by d3.svg.line().defined()
function clipzip() {
  zipped = zip.apply(this, arguments);
  count=0;
  c=0;
  while (c<zipped.length) {
    if (Math.abs(zipped[c][1])<vis.control.epsilon) {
      zipped.splice(c,1);
      count++;
      c--;
    }
    c++;
  }
  console.log('clipzip removed', count, 'zeros, leaving', zipped.length);
  return zipped;
}



function createcontextlines(xscale, yscale) {
  //Generates data used to draw the context plot with far fewer line elements
  //than if the raw data itself was all plotted.

  //Create one array entry for each pixel
  pixi = xscale.range()[0];
  pixf = xscale.range()[1];
  contextlines = [pixf - pixi + 1];
  for (var c=pixi; c<=pixf; c++) {
    contextlines[c-pixi] = {x:c,defined:0,min:0,max:0};
  }

  //Loop through data, comparing it to corresponding entry
  var dlen = vis.currentevent.sumpod.time_samples.length;
  for (var i=0; i<dlen; i++) {
    //Find nearest pixel -- better be an integer!
    var pixt = Math.round(xscale(vis.currentevent.sumpod.time_samples[i]));
    var index = pixt-pixi;
    var datapix = Math.round(yscale(vis.currentevent.sumpod.data_phe_per_sample[i])*100.)/100.;

    if (contextlines[pixt].defined) {
      contextlines[pixt].min = Math.min(datapix, contextlines[pixt].min);
      contextlines[pixt].max = Math.max(datapix, contextlines[pixt].max);      
    } else {
      contextlines[pixt].min = datapix;
      contextlines[pixt].max = datapix;
      contextlines[pixt].defined = 1;
    }
  }

  //Strip any still-undefined entries from the array
  for (var c=pixf-1; c>0; c--) {
    if (!contextlines[c].defined) {
      contextlines.splice(c,1);
    }
  }
  
  vis.data.contextlines = contextlines;
}



function createfilterdata(xscale, yscale, xdata, ydata) {
  //Generates a smaller dataset, with points that do not substantially
  //affect the on-screen appearance removed
  //The following datapoints are kept:
  // 1. The smallest datapoint whose x-value maps to each pixel
  // 2. The largest datapoint whose x-value maps to each pixel
  // 3. Points indicating gaps between sumpods, if they map to a unique pixel
  // Points far to the left or right of the screen are not kept.

  var fullsam;
  if (typeof(xdata)==='undefined') {
    fullsam = vis.currentevent.sumpod.time_samples_spacers;
  } else {
    fullsam = xdata;
  }
  var fullsig;
  if (typeof(ydata)==='undefined') {
    fullsig = vis.currentevent.sumpod.data_phe_per_sample_spacers;
  } else {
    fullsig = ydata;
  }
  var fulllen = fullsam.length;
  //fullflag will be set true for entries to include in filtered arrays
  //fullpix contains the (rounded) pixel x-coordinate for this point
  fullflag = new Array(fulllen);
  fullpix = new Array(fulllen);
  for (var c=0; c<fulllen; c++) {
    fullflag[c] = false;
    fullpix[c] = Math.round(xscale(fullsam[c]));
  }

  var minsam, minsig;
  var maxsam, maxsig;
  var gapsam;
  var datflag, gapflag;
  var currentpixel = undefined;
  for (var c=0; c<=fulllen; c++) {
    if (fullsam[c]<xscale.domain()[0] - 1) {
      //keep no more than one point to left of screen
      continue;
    }

    if (c>fulllen-1 || fullpix[c]!=currentpixel) {
      //then this is the first datapoint of a new pixel in the x-direction
      //(or it's after all the pixels)
      //First, note extremal values from last pixel
      if (typeof currentpixel != 'undefined') {
	if (datflag) {
	  fullflag[minsam] = true;
	  fullflag[maxsam] = true;
	} else if (gapflag) { //use gap only if no data shares its pixel
	  fullflag[gapsam] = true;
	}
      }

      if (fullsam[c]>xscale.domain()[1] + 1) {
	//keep no more than one point to right of screen
	break;
      }

      //If we're reached the end, break intead of trying to read
      //past end of array.
      if (c>fulllen-1) break;

      //Then, reset values to study this new pixel
      currentpixel = fullpix[c];
      datflag = false;
      gapflag = false;
    }

    if (Math.abs(fullsig[c]+9999)<vis.control.epsilon) {
      //Then we've found a gap
      if (!gapflag) {
	gapsam = c;
	gapflag = true;
      }
    } else {
      //Then we've found a datapoint
      if (!datflag) {
	//Then it's the first
	minsam = c;
	minsig = fullsig[c];
	maxsam = c;
	maxsig = fullsig[c];
	datflag = true;
      } else {
	//We've found at least one datapoint for this pixel before
	if (fullsig[c]<minsig) {
	  //New minimum found
	  minsam = c;
	  minsig = fullsig[c];
	} else if (fullsig[c]>maxsig) {
	  //New maximum found
	  maxsam = c;
	  maxsig = fullsig[c];
	}
      }
    }
  }

  //Builds small arrays of points meeting conditions set above
  thinsam = [];
  thinsig = [];
  for (var c=0; c<fulllen; c++) {
    if (fullflag[c]) {
      thinsam.push(fullsam[c]);
      thinsig.push(fullsig[c]);
    }
  }

  output={};
  output.thinsam = thinsam;
  output.thinsig = thinsig;
  return output;

}



function createspacerdata(originalsamples, originalsignals) {
  //Returns the input data, but with extra elements with a flag value
  //inserted into the gaps between the PODs (this makes it easier to
  //generate the graph in D3).
  //originalsamples = the sample numbers of the data to process
  //originalsignals = the corresponding Y-axis data (phe/sample, mV, etc.)
  var output = {};

  //Copy the input so the originals are not changed
  copysam = $.extend(true, [], originalsamples);
  copysig = $.extend(true, [], originalsignals);

  //Go through data (starting at end), inserting spacers
  for (var di=copysam.length; di>0; di--) {
    if (copysam[parseInt(di)] - copysam[parseInt(di-1)] > 1.5) {
      copysam.splice(di,0,(copysam[parseInt(di)]+copysam[parseInt(di-1)])/2.);
      copysig.splice(di,0,-9999);
    }
  }

  output.samples = copysam;
  output.signals = copysig;
  return output;
}



function createscaleddata(arrin, scalefactor) {
  //Returns a new array that differs from the input
  //by a multiplicative factor.
  if (typeof(scalefactor)==='undefined') scalefactor = 1.;
  arrout = [];
  for (var i=0; i<arrin.length; i++) {
    arrout.push(arrin[i]*scalefactor);
  }
  return arrout;
}



function createtimesamples(podptr) {
  //Uses the POD's "time_start_samples" and "length" properties to define
  //a "time_samples" property listing all time samples for which there's data
  podptr.time_samples = [];
  var numpieces = podptr.time_start_samples.length;
  for (var i=0; i<numpieces; i++) {
    var timestart = podptr.time_start_samples[i];
    var numsamples = podptr.length[i];
    for (var j=0; j<numsamples; j++) {
      podptr.time_samples.push(timestart+j);
    }
  }
  return;
}



function showallpmts() {
  mastershowallpmts(true);
}



function unshowallpmts() {
  mastershowallpmts(false);
}



function mastershowallpmts(showallpmtsflag) {
  vis.control.showallpmts = showallpmtsflag;

  //Save zoom history
  oldviewlist = vis.control.viewlist;
  oldviewindex = vis.control.viewindex;

  //Redraw brushgraph from scratch
  vis.brushgraph.svg.remove();
  drawbrush();
  drawpulses(false);

  //Restore zoom history and set to correct zoom
  vis.control.viewlist = oldviewlist;
  vis.control.viewindex = oldviewindex + 1;
  //Use hack to kill animation during this step
  //Make transition time zero, and turn it back on after a pause
  vis.control.transtime = 0;
  focuszoomprevious();
  setTimeout(function(){
	       if (document.transitionform.transchoice[0].checked) {
		 vis.control.transtime = vis.control.transdefault;
	       }
	     },100);
}



function returnpmtcolor(chno) {
  //Return an aesthetic color for each channel
  var chf = 1; //vis.data.chfirst;
  var chl = 122; //vis.data.chlast;
  var wf = 129;
  var wl = 136;
  var colorstring;
  
  // might be worth taking out these special cases to see if it makes the veto show up still (but keep the malu black?)
  if (chno>=chf && chno<=chl) {
    //Xe PMTs
    if (chno==121) {
      colorstring = quadcolor(0);
    } else if (chno==122) {
      colorstring = quadcolor(1);
    } else {
      colorstring = quadcolor((chno+1.-chf)/(chl+1.-chf));
    }
  } else if (chno>=wf && chno<=wl) {
    frac = (chno-wf)/(wl-wf)
    var rgb = hsvtorgb(180,1,.8-.6*frac);
    var colorstring = 'rgb(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ')';
    //Water PMTs
    /*
    if (chno==129) {
      colorstring = 'rgb(221,160,221)';
    } else if (chno==130) {
      colorstring = 'rgb(218,112,214)';
    } else if (chno==131) {
      colorstring = 'rgb(186,85,211)';
    } else if (chno==132) {
      colorstring = 'rgb(153,50,204)';
    } else if (chno==133) {
      colorstring = 'rgb(148,0,211)';
    } else if (chno==134) {
      colorstring = 'rgb(138,43,226)';
    } else if (chno==135) {
      colorstring = 'rgb(160,32,240)';
    } else if (chno==136) {
      colorstring = 'rgb(0,0,0)';
    }
    */
  } else {
    colorstring = 'rgb(0,0,0)';
  }
  return colorstring;
}

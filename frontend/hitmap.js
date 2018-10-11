//Note: The hitmap code uses 3 different distance units in various places:
//*pixels
//*cm (that is, in the detector, not on the computer screen)
//*distance between centers of adjacent PMTs

function drawhitmap() {

  //Width and height
  var w = 250;
  var h = 584;

  var tox = 120; //top PMTs' offset, x-direction
  var toy = 120; //top PMTs' offset, y-direction
  var box = 120; //bottom PMTs' offset, x-direction
  var boy = 350; //bottom PMTs' offset, y-direction
  var fx = 24; //Convert center-to-center distance to pixels in x-direction
  var fy = 24; //Convert center-to-center distance to pixels in y-direction

  var txscale = d3.scale.linear()
    .range([tox,tox+fx]);
  var bxscale = d3.scale.linear()
    .range([box,box+fx]);
  var tyscale = d3.scale.linear()
    .range([toy,toy-fy]);
  var byscale = d3.scale.linear()
    .range([boy,boy-fy]);

  //Save these for use in plotting position reconstruction RQ's
  vis.hitmap.txscale = txscale;
  vis.hitmap.tyscale = tyscale;
  vis.hitmap.bxscale = bxscale;
  vis.hitmap.byscale = byscale;

  //Offset of axis marks relative to center of PMT arrays
  var axismarklength = 1.25;
  var vertrad1=4*Math.sqrt(3.)/2.;
  var vertrad2=vertrad1+axismarklength;
  var horizrad1=4;
  var horizrad2=horizrad1+axismarklength;

  //Variables for color bar
  vis.hitmap.cx1 = 10;
  vis.hitmap.cx2 = 225;
  vis.hitmap.cy1 = 524;
  vis.hitmap.cy2 = 544;
  var cxtext = 120;
  var cytext = vis.hitmap.cy2+35;

  //Functions return positions (in pixels)
  function returnx(d){
    xctc = d.sr + d.sd*0.5;
    if (d.tb) {
      return txscale(xctc);
    } else {
      return bxscale(xctc);
    }
  }
  function returny(d){
    yctc = d.sd*Math.sqrt(3.)/2.
    if (d.tb) {
      return tyscale(yctc);
    } else {
      return byscale(yctc);
    }
  }

  //Gets positions of all the PMT's
  var pmt_data = returnpmtlocations();  
        
  //Create SVG element
  var svg = d3.select("#hitmapcell")
    .append("svg")
    .attr("width", w)
    .attr("height", h);
  
  //Colored background (for debugging)
  svg.append("rect")
    .attr("width", "100%")
    .attr("height", "100%")
    .attr("class", "backgroundcolor");

  // First make axis lines
  var axislines = [
		   [txscale(0), txscale(0), tyscale(vertrad1), tyscale(vertrad2)],
		   [bxscale(0), bxscale(0), byscale(vertrad1), byscale(vertrad2)],
		   [txscale(horizrad1), txscale(horizrad2), tyscale(0), tyscale(0)],
		   [bxscale(horizrad1), bxscale(horizrad2), byscale(0), byscale(0)],
		   ];
  
  lines = svg.selectAll("line")
    .data(axislines)
    .enter()
    .append("line")
    .attr({
      x1: function(d) {return d[0]},
      x2: function(d) {return d[1]},
      y1: function(d) {return d[2]},
      y2: function(d) {return d[3]},
    });
  lines.attr("stroke","black");
  lines.attr("shape-rendering","crispEdges");

  var node = svg.selectAll(".node")
    .data(pmt_data)
    .attr("class", "node")
    .enter().append("g")
    ;
  
  var circles = node.append("circle")
    .attr({
      cx: function(d) {return returnx(d);},
	  cy: function(d) {return returny(d);},
	  r: fx/2.* .95 //Last term is scale factor for aesthetics
	  })
    //.attr("fill",function(d) {
    //    if (d.status == 1) {return "DodgerBlue"}
    //    else if (d.status == 2) {return "red "}
    //    else if (d.status == 0) {return "white"}
    //})
    //.attr("fill","magenta")
    .attr("stroke","black")
    .attr("onmouseover", function(d,i) {
	    return "javascript: highlightpmtplot(" + (i+1) + ");";
	  })
    .attr("onmouseout", function(d,i) {
	    return "javascript: lowlightpmtplot(" + (i+1) + ");";
	  })
    .append("svg:title")
    .text(function(d,i) { return i+1; })
    ;
  
  node.append("text")
    .text(function(d) { return d.num })
    .attr("x",function(d) {return returnx(d);})
    .attr("y",function(d) {return returny(d)+3;}) //+2 just before ;
    .attr("opacity",.25)
    .style("font-size","11px")
    .style("text-anchor", "middle")
    .style("pointer-events", "none")
    //.append("svg:title")
    //.text(function(d,i) { return i+1; });

  //Adds a group into which position reconstruction RQ objects will be added
  svg.append("g")
    .attr("id","recongroup");

  //Adds color bar
  colorbar(svg, colorwrapper, vis.hitmap.cx1, vis.hitmap.cy1, vis.hitmap.cx2, vis.hitmap.cy2, 0, 0, 1, "h");
  //Remember what color scheme we used for this
  vis.hitmap.colorscheme = returncolorpalettename();

  //Adds label for the color bar
  cbcaption = svg.append("text")
    .attr("x", cxtext)
    .attr("y", cytext)
    .attr("style","font-size:12px;text-anchor:middle")
    .text("phe")
    ;

  vis.hitmap.totaltext = svg.append("text")
    .attr("x", cxtext)
    .attr("y", vis.hitmap.cy1-27)
    .attr("style","font-size:12px;text-anchor:middle")
    ;

  vis.hitmap.totalxetext = svg.append("text")
    .attr("x", cxtext)
    .attr("y", vis.hitmap.cy1-16)
    .attr("style","font-size:12px;text-anchor:middle")
    ;
    
  vis.hitmap.totalvetotext = svg.append("text")
    .attr("x", cxtext)
    .attr("y", vis.hitmap.cy1-5)
    .attr("style","font-size:12px;text-anchor:middle")
    ;
  //Now map the data
  vis.hitmap.svg = svg;
  redrawhitmap();
}



function redrawhitmap(animateflag, firstsample, lastsample){

  //Default is to not use animation
  if(typeof(animateflag)==='undefined') animateflag = 0;

  //Maps data to hitmap SVG, showing it via color
  svg = vis.hitmap.svg;

  //First, sum the signals seen by each PMT in the whole event
  if (typeof(lastsample)==='undefined') {
    sumsig = findhitsums();
    sumxesig = findxesums();
    sumvetosig = findvetosums();
  //  summalusig = findmalusums();
  } else {
    sumsig = findhitsums(firstsample, lastsample);
    sumxesig = findxesums(firstsample, lastsample);
    sumvetosig = findvetosums(firstsample, lastsample);
  //  summalusig = findmalusums(firstsample, lastsample);
  }
  sumsigmin = d3.min(sumsig);
  sumsigmax = d3.max(sumsig);

  //Outputs total integrated signal
  sumsigsum = 0;
  sumsigxesum = 0;
  sumsigvetosum = 0;
  //sumsigmalusum = 0;
  for(var i in sumsig) { sumsigsum += sumsig[i]; } 
  for(var i in sumxesig) { sumsigxesum += sumxesig[i]; } 
  for(var i in sumvetosig) { sumsigvetosum += sumvetosig[i]; } 
  //for(var i in summalusig) { sumsigmalusum += summalusig[i]; }   
  sumsigsumstring = sumsigsum.toPrecision(4);
  sumsigxesumstring = sumsigxesum.toPrecision(4);
  sumsigvetosumstring = sumsigvetosum.toPrecision(4);
  //sumsigmalusumstring = sumsigmalusum.toPrecision(4);
  vis.hitmap.totaltext.text("(total: " + sumsigsumstring + " phe)");
  vis.hitmap.totalxetext.text("(total Xe: " + sumsigxesumstring + " phe)");
  vis.hitmap.totalvetotext.text("(total Veto: " + sumsigvetosumstring + " phe)");


  //Handles all-zeros situation
  if (sumsigmax-sumsigmin<vis.control.epsilon) {
    sumsigmax = sumsigmin + 1;
  }

  //Next, tie it to graphic elements
  //Color the circles representing the PMT's
  if (animateflag) {
    svg.selectAll("circle")
      .data(sumsig)
      .transition()
      .duration(vis.control.transtime)
      .attr("fill",function(d,i){
	      //console.log(d,i,rainbow((d-sumsigmin)/(sumsigmax-sumsigmin)));
	      return colorwrapper((d-sumsigmin)/(sumsigmax-sumsigmin));
	    });
  } else {
    svg.selectAll("circle")
      .data(sumsig)
      .attr("fill",function(d,i){
	      //console.log(d,i,rainbow((d-sumsigmin)/(sumsigmax-sumsigmin)));
	      return colorwrapper((d-sumsigmin)/(sumsigmax-sumsigmin));
	    });
  }

  //Update PMT labels
  svg.selectAll("circle")
    .select("title")
    .text(function(d,i) { return "PMT " + (i+1) + " (" + d.toPrecision(4) + " phe)"; })  

  //Update the colorbar
  var newname = returncolorpalettename();
  if (newname != vis.hitmap.colorscheme) {
    //Then the colorscheme has changed since hitmap was last drawn
    //Delete old colorbar and draw a new one
    vis.hitmap.colorscheme = newname;
    cbelement = document.getElementById("colorbar");
    cbelement.parentNode.removeChild(cbelement);
    colorbar(svg, colorwrapper, vis.hitmap.cx1, vis.hitmap.cy1, vis.hitmap.cx2, vis.hitmap.cy2, 0, 0, 1, "h");
    vis.hitmap.colorscale.domain([sumsigmin,sumsigmax]);
    svg.select(".colorbar").call(vis.hitmap.coloraxis);
  } else if (!animateflag) {
    //Same colors, no axis animation
    vis.hitmap.colorscale.domain([sumsigmin,sumsigmax]);
    svg.select(".colorbar")
      .call(vis.hitmap.coloraxis);
  } else {
    //Same colors, animated axis
    vis.hitmap.colorscale.domain([sumsigmin,sumsigmax]);
    svg.select(".colorbar")
      .transition()
      .duration(vis.control.transtime)
      .call(vis.hitmap.coloraxis);
  }

}

function colorbar(svgtarget, colorfunction, x1, y1, x2, y2, bins, minvalue, maxvalue, align){
  if(typeof(bins)==='undefined') bins = 0;
  if(typeof(minvalue)==='undefined') minvalue = 0;
  if(typeof(maxvalue)==='undefined') maxvalue = 1;
  if(typeof(align)==='undefined') align = "vert";

  //Process input values
  if (align=="vert" || align=="v") align=1;
  if (align=="horiz" || align=="h") align=2;
  if (bins==0) {
    if (align==1) {
      bins=Math.abs(y2-y1);
    } else if (align==2) {
      bins=Math.abs(x2-x1);
    }
  }

  //Some magic values
  suggestednumticks = 4;

  //Create group in svg
  //I really should have just spatially transformed the group to make 
  //the element positions more intuitive...
  var cgroup = svgtarget.append("g")
    .attr("id","colorbar");

  var bx1, bx2, by1, by2; //color box coordinates
  for (cb=0; cb<bins; cb++) {
    if (align==1) {
      bx1 = x1;
      bx2 = x2;
      by1 = Math.max(y1,y2) - (cb+1)/bins*Math.abs(y2-y1);
      by2 = Math.max(y1,y2) - (cb)/bins*Math.abs(y2-y1);
    } else if (align==2) {
      bx1 = Math.min(x1,x2) + (cb)/bins*Math.abs(x2-x1);
      bx2 = Math.min(x1,x2) + (cb+1)/bins*Math.abs(x2-x1);
      by1 = Math.min(y1,y2);
      by2 = Math.max(y1,y2);
    }
    cgroup.append("rect")
      .attr("class","paintbox")
      .attr("x",bx1)
      .attr("y",by1)
      .attr("width",bx2-bx1)
      .attr("height",by2-by1)
      .attr("fill", colorfunction(cb/(bins-1)))
      .attr("style","shape-rendering:crispEdges")
      ;
  }

  //border
  cgroup.append("rect")
    .attr("x",Math.min(x1,x2))
    .attr("y",Math.min(y1,y2))
    .attr("width",Math.abs(x2-x1))
    .attr("height",Math.abs(y2-y1))
    .attr("fill","none")
    .attr("stroke","black")
    .attr("style","shape-rendering:crispEdges")
    ;

  //D3 scale
  var cbscale = d3.scale.linear();
  cbscale.domain([minvalue,maxvalue]);
  if (align==1) {
    cbscale.range([Math.max(y1,y2),Math.min(y1,y2)]);
  } else if (align==2) {
    cbscale.range([Math.min(x1,x2),Math.max(x1,x2)]);
  }

  //D3 axis
  var cbaxis = d3.svg.axis();
  cbaxis.scale(cbscale);
  cbaxis.ticks(suggestednumticks);
  cbaxis.tickFormat(d3.format(".2g")); //previously ",g"
  if (align==1) {
    cbaxis.orient("right");
    cgroup.append("g")
      .attr("class","colorbar")
      .attr("transform","translate(" + Math.max(x1,x2) + ",0)")
      .call(cbaxis);
  } else if (align==2) {
    cbaxis.orient("bottom");
    cgroup.append("g")
      .attr("class","colorbar")
      .attr("transform","translate(0," + Math.max(y1,y2) + ")")
      .call(cbaxis);
  }

  //Next 2 lines should be deleted if reusing this function in another program
  vis.hitmap.colorscale = cbscale;
  vis.hitmap.coloraxis = cbaxis;

  return;
}

function returncolorpalettename(){
  //Based on: http://homepage.ntlworld.com/kayseycarvey/jss3p11.html
  len = document.colorform.colorchoice.length;
  for (i=0; i<len; i++) {
    if (document.colorform.colorchoice[i].checked) {
      chosen=document.colorform.colorchoice[i].value;
    }
  }
  return chosen;
}

function colorwrapper(input){
  if(document.getElementById('colorchoice_rainbow').checked) {
    return rainbow(input);
  } else {
    return mono(input);
  }
}

function mono(input){
  //input in range [0,1]
  var i = Math.round(input*256.);
  return 'rgb(' + i + ',' + i + ',' + i + ')';
}

function rainbow(input){
  var h = 240*(1.-input);
  var rgb = hsvtorgb(h,1,1);
  var colorstring = 'rgb(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ')';
  return colorstring;
}

function quadcolor(input){
  //in in range [0,1]
  //returns one high-contrast band for inputs<.5, another for inputs>.5
  var mix, c1, c2;
  if (input<.5) {
    mix = input*2;
    c1 = [255,0,0]; //red
    c2 = [0,0,255]; //blue
  } else {
    mix = (input-.5)*2;
    c1 = [255,128,0]; //orange
    c2 = [0,128,0]; //dark green
  }
  var rgb = [];
  for (i=0; i<3; i++) {
    rgb[i] = Math.round( (1.-mix)*c1[i]+mix*c2[i] );
  }
  var colorstring = 'rgb(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ')';
  return colorstring;  
}

function hsvtorgb(h,s,v){
  //Converts HSV color to RGB color
  //Closely based on: http://www.cs.rit.edu/~ncs/color/t_convert.html#RGB%20to%20HSV%20&%20HSV%20to%20RGB

  rgb=new Array();
  var f, p, q, t;
  if (s==0) {
    rgb=[v,v,v];
    return rgb;
  } else {
    h/=60;
    i=Math.floor(h);
    f = h - i;			// factorial part of h
    p = v * ( 1 - s );
    q = v * ( 1 - s * f );
    t = v * ( 1 - s * ( 1 - f ) );
    
    switch( i ) {
    case 0:
      rgb=[v,t,p];
      break;
    case 1:
      rgb=[q,v,p];
      break;
    case 2:
      rgb=[p,v,t];
      break;
    case 3:
      rgb=[p,q,v];
      break;
    case 4:
      rgb=[t,p,v];
      break;
    default:		// case 5:
      rgb=[v,p,q];
      break;
    }
  }
  
  for (i=0; i<3; i++) {
    rgb[i] = Math.round(256.*rgb[i]);
  }
  return rgb
}

function findhitsums(firstsample, lastsample){
  //Sums the PODs to find the phe/PMT within a given range of samples
  //Note: firstsample and lastsample do not have to be integers.

  if(typeof(firstsample)==='undefined') firstsample = -9999E99;
  if(typeof(lastsample)==='undefined') lastsample = 9999E99;

  //Create array of zeros
  var sigsum = new Array(vis.data.chlast-vis.data.chfirst+1);
  for (var c=0; c<sigsum.length; c++) {
    sigsum[c]=0.;
  }

  //Fill array with sum of signals
  //Loop through PODS
  for (var p=0; p<vis.currentevent.pod.length; p++) {
     thispod = vis.currentevent.pod[p];
     if (thispod.ch != 136){
        indexno = thispod.ch-vis.data.chfirst;
        //Loop through data samples
        for (var s=0; s<thispod.time_samples.length; s++) {
            sampno = thispod.time_samples[s];
            if (sampno>=firstsample && sampno<=lastsample) {
              sigsum[indexno] +=  thispod.data_mV[s] / thispod.mV_to_phe_per_sample;
            }
        }
    }
  }
  //Return sum of signals
  return sigsum;
}

function findxesums(firstsample, lastsample){
  //Sums the PODs to find the phe/PMT within a given range of samples
  //Note: firstsample and lastsample do not have to be integers.

  if(typeof(firstsample)==='undefined') firstsample = -9999E99;
  if(typeof(lastsample)==='undefined') lastsample = 9999E99;

  //Create array of zeros
  var sigsum = new Array(vis.data.chlast-vis.data.chfirst+1);
  for (var c=0; c<sigsum.length; c++) {
    sigsum[c]=0.;
  }

  //Fill array with sum of signals
  //Loop through PODS
  for (var p=0; p<vis.currentevent.pod.length; p++) {
     thispod = vis.currentevent.pod[p];
     if (thispod.ch <= 122){
        indexno = thispod.ch-vis.data.chfirst;
        //Loop through data samples
        for (var s=0; s<thispod.time_samples.length; s++) {
            sampno = thispod.time_samples[s];
            if (sampno>=firstsample && sampno<=lastsample) {
              sigsum[indexno] +=  thispod.data_mV[s] / thispod.mV_to_phe_per_sample;
            }
        }
    }
  }
  //Return sum of signals
  return sigsum;
}

function findvetosums(firstsample, lastsample){
  //Sums the PODs to find the phe/PMT within a given range of samples
  //Note: firstsample and lastsample do not have to be integers.

  if(typeof(firstsample)==='undefined') firstsample = -9999E99;
  if(typeof(lastsample)==='undefined') lastsample = 9999E99;

  //Create array of zeros
  var sigsum = new Array(vis.data.chlast-vis.data.chfirst+1);
  for (var c=0; c<sigsum.length; c++) {
    sigsum[c]=0.;
  }

  //Fill array with sum of signals
  //Loop through PODS
  for (var p=0; p<vis.currentevent.pod.length; p++) {
     thispod = vis.currentevent.pod[p];
     if (thispod.ch >= 129 && thispod.ch != 136){
        indexno = thispod.ch-vis.data.chfirst;
        //Loop through data samples
        for (var s=0; s<thispod.time_samples.length; s++) {
            sampno = thispod.time_samples[s];
            if (sampno>=firstsample && sampno<=lastsample) {
              sigsum[indexno] +=  thispod.data_mV[s] / thispod.mV_to_phe_per_sample;
            }
        }
    }
  }
  //Return sum of signals
  return sigsum;
}

function findmalusums(firstsample, lastsample){
  //Sums the PODs to find the phe/PMT within a given range of samples
  //Note: firstsample and lastsample do not have to be integers.

  if(typeof(firstsample)==='undefined') firstsample = -9999E99;
  if(typeof(lastsample)==='undefined') lastsample = 9999E99;

  //Create array of zeros
  var sigsum = new Array(vis.data.chlast-vis.data.chfirst+1);
  for (var c=0; c<sigsum.length; c++) {
    sigsum[c]=0.;
  }

  //Fill array with sum of signals
  //Loop through PODS
  for (var p=0; p<vis.currentevent.pod.length; p++) {
     thispod = vis.currentevent.pod[p];
     if (thispod.ch == 136){
        indexno = thispod.ch-vis.data.chfirst;
        //Loop through data samples
        for (var s=0; s<thispod.time_samples.length; s++) {
            sampno = thispod.time_samples[s];
            if (sampno>=firstsample && sampno<=lastsample) {
              sigsum[indexno] +=  thispod.data_mV[s] / thispod.mV_to_phe_per_sample;
            }
        }
    }
  }
  //Return sum of signals
  return sigsum;
}



function returnpmtlocations() {
  //Returns location data for the PMT's
  //num = PMT number
  //sr = steps to the right
  //sd = steps diagonally (i.e., at a 60-degree angle
  //tb = top or bottom PMT array (1 for top, 0 for bottom)
  return [
    {'num':1, 'sr':-4, 'sd':4, 'tb':1},
    {'num':2, 'sr':-4, 'sd':3, 'tb':1},
    {'num':3, 'sr':-4, 'sd':2, 'tb':1},
    {'num':4, 'sr':-4, 'sd':1, 'tb':1},
    {'num':5, 'sr':-3, 'sd':3, 'tb':1},
    {'num':6, 'sr':-3, 'sd':2, 'tb':1},
    {'num':7, 'sr':-3, 'sd':1, 'tb':1},
    {'num':8, 'sr':-2, 'sd':2, 'tb':1},
    {'num':9, 'sr':-2, 'sd':1, 'tb':1},
    {'num':10, 'sr':-1, 'sd':1, 'tb':1},
    {'num':11, 'sr':-4, 'sd':0, 'tb':1},
    {'num':12, 'sr':-3, 'sd':-1, 'tb':1},
    {'num':13, 'sr':-2, 'sd':-2, 'tb':1},
    {'num':14, 'sr':-1, 'sd':-3, 'tb':1},
    {'num':15, 'sr':-3, 'sd':0, 'tb':1},
    {'num':16, 'sr':-2, 'sd':-1, 'tb':1},
    {'num':17, 'sr':-1, 'sd':-2, 'tb':1},
    {'num':18, 'sr':-2, 'sd':0, 'tb':1},
    {'num':19, 'sr':-1, 'sd':-1, 'tb':1},
    {'num':20, 'sr':-1, 'sd':0, 'tb':1},
    {'num':21, 'sr':0, 'sd':-4, 'tb':1},
    {'num':22, 'sr':1, 'sd':-4, 'tb':1},
    {'num':23, 'sr':2, 'sd':-4, 'tb':1},
    {'num':24, 'sr':3, 'sd':-4, 'tb':1},
    {'num':25, 'sr':0, 'sd':-3, 'tb':1},
    {'num':26, 'sr':1, 'sd':-3, 'tb':1},
    {'num':27, 'sr':2, 'sd':-3, 'tb':1},
    {'num':28, 'sr':0, 'sd':-2, 'tb':1},
    {'num':29, 'sr':1, 'sd':-2, 'tb':1},
    {'num':30, 'sr':0, 'sd':-1, 'tb':1},
    {'num':31, 'sr':4, 'sd':-4, 'tb':1},
    {'num':32, 'sr':4, 'sd':-3, 'tb':1},
    {'num':33, 'sr':4, 'sd':-2, 'tb':1},
    {'num':34, 'sr':4, 'sd':-1, 'tb':1},
    {'num':35, 'sr':3, 'sd':-3, 'tb':1},
    {'num':36, 'sr':3, 'sd':-2, 'tb':1},
    {'num':37, 'sr':3, 'sd':-1, 'tb':1},
    {'num':38, 'sr':2, 'sd':-2, 'tb':1},
    {'num':39, 'sr':2, 'sd':-1, 'tb':1},
    {'num':40, 'sr':1, 'sd':-1, 'tb':1},
    {'num':41, 'sr':4, 'sd':0, 'tb':1},
    {'num':42, 'sr':3, 'sd':1, 'tb':1},
    {'num':43, 'sr':2, 'sd':2, 'tb':1},
    {'num':44, 'sr':1, 'sd':3, 'tb':1},
    {'num':45, 'sr':3, 'sd':0, 'tb':1},
    {'num':46, 'sr':2, 'sd':1, 'tb':1},
    {'num':47, 'sr':1, 'sd':2, 'tb':1},
    {'num':48, 'sr':2, 'sd':0, 'tb':1},
    {'num':49, 'sr':1, 'sd':1, 'tb':1},
    {'num':50, 'sr':1, 'sd':0, 'tb':1},
    {'num':51, 'sr':0, 'sd':4, 'tb':1},
    {'num':52, 'sr':-1, 'sd':4, 'tb':1},
    {'num':53, 'sr':-2, 'sd':4, 'tb':1},
    {'num':54, 'sr':-3, 'sd':4, 'tb':1},
    {'num':55, 'sr':0, 'sd':3, 'tb':1},
    {'num':56, 'sr':-1, 'sd':3, 'tb':1},
    {'num':57, 'sr':-2, 'sd':3, 'tb':1},
    {'num':58, 'sr':0, 'sd':2, 'tb':1},
    {'num':59, 'sr':-1, 'sd':2, 'tb':1},
    {'num':60, 'sr':0, 'sd':1, 'tb':1},
    {'num':61, 'sr':-4, 'sd':4, 'tb':0},
    {'num':62, 'sr':-4, 'sd':3, 'tb':0},
    {'num':63, 'sr':-4, 'sd':2, 'tb':0},
    {'num':64, 'sr':-4, 'sd':1, 'tb':0},
    {'num':65, 'sr':-3, 'sd':3, 'tb':0},
    {'num':66, 'sr':-3, 'sd':2, 'tb':0},
    {'num':67, 'sr':-3, 'sd':1, 'tb':0},
    {'num':68, 'sr':-2, 'sd':2, 'tb':0},
    {'num':69, 'sr':-2, 'sd':1, 'tb':0},
    {'num':70, 'sr':-1, 'sd':1, 'tb':0},
    {'num':71, 'sr':-4, 'sd':0, 'tb':0},
    {'num':72, 'sr':-3, 'sd':-1, 'tb':0},
    {'num':73, 'sr':-2, 'sd':-2, 'tb':0},
    {'num':74, 'sr':-1, 'sd':-3, 'tb':0},
    {'num':75, 'sr':-3, 'sd':0, 'tb':0},
    {'num':76, 'sr':-2, 'sd':-1, 'tb':0},
    {'num':77, 'sr':-1, 'sd':-2, 'tb':0},
    {'num':78, 'sr':-2, 'sd':0, 'tb':0},
    {'num':79, 'sr':-1, 'sd':-1, 'tb':0},
    {'num':80, 'sr':-1, 'sd':0, 'tb':0},
    {'num':81, 'sr':0, 'sd':-4, 'tb':0},
    {'num':82, 'sr':1, 'sd':-4, 'tb':0},
    {'num':83, 'sr':2, 'sd':-4, 'tb':0},
    {'num':84, 'sr':3, 'sd':-4, 'tb':0},
    {'num':85, 'sr':0, 'sd':-3, 'tb':0},
    {'num':86, 'sr':1, 'sd':-3, 'tb':0},
    {'num':87, 'sr':2, 'sd':-3, 'tb':0},
    {'num':88, 'sr':0, 'sd':-2, 'tb':0},
    {'num':89, 'sr':1, 'sd':-2, 'tb':0},
    {'num':90, 'sr':0, 'sd':-1, 'tb':0},
    {'num':91, 'sr':4, 'sd':-4, 'tb':0},
    {'num':92, 'sr':4, 'sd':-3, 'tb':0},
    {'num':93, 'sr':4, 'sd':-2, 'tb':0},
    {'num':94, 'sr':4, 'sd':-1, 'tb':0},
    {'num':95, 'sr':3, 'sd':-3, 'tb':0},
    {'num':96, 'sr':3, 'sd':-2, 'tb':0},
    {'num':97, 'sr':3, 'sd':-1, 'tb':0},
    {'num':98, 'sr':2, 'sd':-2, 'tb':0},
    {'num':99, 'sr':2, 'sd':-1, 'tb':0},
    {'num':100, 'sr':1, 'sd':-1, 'tb':0},
    {'num':101, 'sr':4, 'sd':0, 'tb':0},
    {'num':102, 'sr':3, 'sd':1, 'tb':0},
    {'num':103, 'sr':2, 'sd':2, 'tb':0},
    {'num':104, 'sr':1, 'sd':3, 'tb':0},
    {'num':105, 'sr':3, 'sd':0, 'tb':0},
    {'num':106, 'sr':2, 'sd':1, 'tb':0},
    {'num':107, 'sr':1, 'sd':2, 'tb':0},
    {'num':108, 'sr':2, 'sd':0, 'tb':0},
    {'num':109, 'sr':1, 'sd':1, 'tb':0},
    {'num':110, 'sr':1, 'sd':0, 'tb':0},
    {'num':111, 'sr':0, 'sd':4, 'tb':0},
    {'num':112, 'sr':-1, 'sd':4, 'tb':0},
    {'num':113, 'sr':-2, 'sd':4, 'tb':0},
    {'num':114, 'sr':-3, 'sd':4, 'tb':0},
    {'num':115, 'sr':0, 'sd':3, 'tb':0},
    {'num':116, 'sr':-1, 'sd':3, 'tb':0},
    {'num':117, 'sr':-2, 'sd':3, 'tb':0},
    {'num':118, 'sr':0, 'sd':2, 'tb':0},
    {'num':119, 'sr':-1, 'sd':2, 'tb':0},
    {'num':120, 'sr':0, 'sd':1, 'tb':0},
    {'num':121, 'sr':0, 'sd':0, 'tb':1},
    {'num':122, 'sr':0, 'sd':0, 'tb':0},
    {'num':123, 'sr':1, 'sd':-100, 'tb':0},
    {'num':124, 'sr':2, 'sd':-100, 'tb':0},
    {'num':125, 'sr':3, 'sd':-100, 'tb':0},
    {'num':126, 'sr':4, 'sd':-100, 'tb':0},
    {'num':127, 'sr':5, 'sd':-100, 'tb':0},
    {'num':128, 'sr':6, 'sd':-100, 'tb':0},
    {'num':129, 'sr':-6, 'sd':3, 'tb':1},
    {'num':130, 'sr':-3, 'sd':-3, 'tb':1},
    {'num':131, 'sr':-6, 'sd':3, 'tb':0},
    {'num':132, 'sr':-3, 'sd':-3, 'tb':0},
    {'num':133, 'sr':0, 'sd':-6, 'tb':0},
    {'num':134, 'sr':2, 'sd':-6, 'tb':0},
    {'num':135, 'sr':4, 'sd':-6, 'tb':0},
    {'num':136, 'sr':6, 'sd':-6, 'tb':0}
  ];
}

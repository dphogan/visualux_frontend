//Functions related to drawing of reduced quantity (RQ) values

function drawpulses(animateflag) {
  //Shades plot to show pulses as found by pulse finder
  if (typeof(animateflag)==='undefined') animateflag = false;

  if (document.rqform.rq_toggle_pulsefinder.checked) {

    //Shades pulses on focus plot
    x = vis.brushgraph.x;
    y = vis.brushgraph.y;
    focusgroup = vis.brushgraph.focus.select("#pulsegroup");
    focusclip = "url(#focusclip)";

    x2 = vis.brushgraph.x2;
    y2 = vis.brushgraph.y2;
    contextgroup = vis.brushgraph.context.select("#pulsecontextgroup");
    contextclip = "url(#contextclip)";

    if (animateflag) {
      masterdrawpulses(focusgroup, focusclip, x, y, 0, 0, 1);
      masterdrawpulses(contextgroup, contextclip, x2, y2, 0, 0, 1);
      labelpulses(x, y, 0, 0, 1);
    } else {
      masterdrawpulses(focusgroup, focusclip, x, y, 0, 0, 0);
      masterdrawpulses(contextgroup, contextclip, x2, y2, 0, 0, 0);
      labelpulses(x, y, 0, 0, 0);
    }

    //Draws "pulsepanel" -- an SVG panel of buttons to zoom in on pulses
    //First double-check that it hasn't been drawn yet
    if (!vis.rq.pulsevis) {
      vis.rq.pulsevis = true;

      pcwidth = 750;
      pcheight = 80;

      //Create SVG element
      vis.rq.svg = d3.select("#pulsecell")
	.append("svg") //insert can replace append
	.attr("width", pcwidth)
	.attr("height", 0)
	;
      svg = vis.rq.svg;

      //Colored background (for debugging)
      svg.append("rect")
	.attr("width", "100%")
	.attr("height", "100%")
	.attr("class", "backgroundcolor")
	;

      //Adds groups into which data elements will be later appended
      svg.append("g")
	.attr("id","pulsepaneholder");

      //Scroll-down reveal of this SVG
      if (animateflag) {
	svg
	  .transition()
	  .duration(vis.control.transtime)
	  .attr("height",pcheight)
	  ;
      } else {
	svg.attr("height",pcheight);
      }

      //Turn on key shortcuts
      //listener = vis.control.listener;
      //Temporarily moving shortcut key bindings
      //to jshead.js, with the other keyboard shortcuts!

      //Updates color of position reconstruction squares, if needed
      redrawrecon(animateflag);
    }

    updatepulsepanel();

  } //end checkbox check

}



function updatepulsepanel() {
  //Updates information on the pulse panel
  //Each pulse gets a "pulsepane", a group
  //containing a little square with information

  //Offset variables (consider brushgraph's margins when picking values)
  var xoffsetinit = 65;
  var xoffsetdelta = 67;
  var panewidth = 55;
  var paneheight = panewidth;
  var panecornerradx = 5;
  var panecornerrady = panecornerradx;
  var keyhintoffset = 5;

  //Deleting any old groups to avoid overwriting problems
  vis.rq.svg.select("#pulsepaneholder").selectAll("g").remove();
  pulsepanes = vis.rq.svg.select("#pulsepaneholder").selectAll("g")
    .data(returnpulseobject())
    .enter()
    .append("g")
    .attr("transform", function(d,i){ return "translate(" + (xoffsetinit+i*xoffsetdelta) + " 5)"; })
    .attr("class","pulsepane")
    ;

  pulsepanes.append("rect")
    .attr("x",0)
    .attr("y",0)
    .attr("width",panewidth)
    .attr("height",paneheight)
    .attr("fill", function(d){return pulsecolor(d.pulse_classification,1);} )
    .attr("stroke", function(d){return pulsecolor(d.pulse_classification,2);} )
    .attr("opacity", vis.rq.pulseopacity)
    .attr("stroke-width", 3)
    .attr("rx", panecornerradx)
    .attr("ry", panecornerrady)
    .attr("onclick", function(d,i){
	    return "javascript: focuspulse(" + i + ");";
	  })
    .attr("onmouseover", function(d,i){
	    return "javascript: highlightpulsepair(" + i + ");";
	  })
    .attr("onmouseout", function(d,i){
	    return "javascript: lowlightpulsepair(" + i + ");";
	  })
    //Temporary patch to display pulse data on hover...
    //.attr("title", function(d,i){
    //	    return Math.round(d.pulse_area_phe*100.)/100.;
    //	  })
    ;

  pulsepanes.append("text")
    .attr("class","pulselabelclass")
    .attr("x",panewidth/2.)
    .attr("y",paneheight*.65)
    .text(function(d){ return pulsetypename(d.pulse_classification); })
    .attr("style","text-anchor:middle")
    .style("font-size",function(d){
	     switch (d.pulse_classification) {
	     case 3:
	       return "20px";
	     case 5:
	       return "20px";
	     case 9:
	       return "15px";
	     default:
	       return "25px";
	       //Notice: Hardwiring of number apppearing elsewhere
	     }
	   })
    ;

  pulsepanes.append("text")
    .attr("class","pulsekeyhintclass")
    .attr("x",keyhintoffset)
    .attr("y",paneheight-keyhintoffset)
    .text(function(d,i){
	    if (i===9)
	      return 0;
	    else
	      return i+1;
	    end
	  } )
    .style("font-size","10px")
    ;
}



function highlightpulsepair(pulseno) {
  if (vis.rq.pulsevis) {
    //Highlight pulse elements
    highopac = .5;
    document.getElementById('pulsepaneholder').childNodes[pulseno].getElementsByTagName("rect")[0].style.opacity=highopac;
    document.getElementById('pulsegroup').childNodes[pulseno].style.opacity=highopac;
    document.getElementById('pulsecontextgroup').childNodes[pulseno].style.opacity=highopac;
    //Also highlight PMT hit, if it's visible
    if (vis.rq.reconvis) {
      allcolortiles = d3.selectAll(".colortile")
	.data(returnpulseobject(true), function(d){ return d.key; })
	.style("opacity", function(d){ if (d.key==pulseno) { return highopac } else { return vis.rq.pulseopacity } })
	;
    }
  }

  //Shows pulse quantitites if applicable
  redrawquants(pulseno);
}



function lowlightpulsepair(pulseno) {
  if (vis.rq.pulsevis) {
    //Turn off highlighting of elements
    document.getElementById('pulsepaneholder').childNodes[pulseno].getElementsByTagName("rect")[0].style.opacity=vis.rq.pulseopacity;
    document.getElementById('pulsegroup').childNodes[pulseno].style.opacity=vis.rq.pulseopacity;
    document.getElementById('pulsecontextgroup').childNodes[pulseno].style.opacity=vis.rq.pulseopacity;
    //Also lowlight PMT hit
    if (vis.rq.reconvis) {
      allcolortiles = d3.selectAll(".colortile")
	.style("opacity", vis.rq.pulseopacity);
    }
  }

  //Replace current pulse quantities by what's in plot, if unambiguous
  redrawquantsunambiguous();
}



function redrawpulses(animateflag) {
  //Makes changes to plot shades showing pulses as found by pulse finder
  //Note: Don't set animateflag to true unless you've just run focuszoom().
  if (typeof(animateflag)==='undefined') animateflag = false;

  if (document.rqform.rq_toggle_pulsefinder.checked) {

    x = vis.brushgraph.x;
    y = vis.brushgraph.y;
    focusgroup = vis.brushgraph.focus.select("#pulsegroup");
    focusclip = "url(#focusclip)";

    if (animateflag) {
      //This gets called when user changes zoom.
      oldx = vis.brushgraph.oldx;
      oldy = vis.brushgraph.oldy;
      masterdrawpulses(focusgroup, focusclip, x, y, oldx, oldy, 2);
      labelpulses(x, y, oldx, oldy, 2);
    } else {
      //This gets called when new event loaded.
      x2 = vis.brushgraph.x2;
      y2 = vis.brushgraph.y2;
      contextgroup = vis.brushgraph.context.select("#pulsecontextgroup");
      contextclip = "url(#contextclip)";
      masterdrawpulses(focusgroup, focusclip, x, y, 0, 0, 0);
      masterdrawpulses(contextgroup, contextclip, x2, y2, 0, 0, 0);
      labelpulses(x, y, 0, 0, 0);

      updatepulsepanel();
    }

  } //end checkbox check
}



function masterdrawpulses(targetgroup, clippath, x1, y1, x2, y2, animatechoice) {
  //Handles pulse graphics drawing with less code repetition

  //Assorted constants
  ypad = 10; //Extends rects past plot edges

  //Bind data
  pulses = targetgroup.selectAll("rect")
    .data(returnpulseobject());

  //Handle entering and exiting pulse rectangles
  pulses.enter().append("rect");
  pulses.exit().remove();

  //Apply properties to pulse rectangles
  pulses
    .attr("clip-path", clippath)
    .attr("x",function(d){ return x1(d.pulse_start); })
    .attr("width",function(d){ return x1(d.pulse_end) - x1(d.pulse_start); })
    .attr("y",function(){ return y1.range()[1]-ypad; })
    .attr("height",function(){return y1.range()[0]-y1.range()[1]+2*ypad;})
    .attr("fill",function(d){return pulsecolor(d.pulse_classification,1); })
    .attr("stroke",function(d){return pulsecolor(d.pulse_classification,2);})
    .style("opacity",vis.rq.pulseopacity)
    ;

  //Apply requested transition.  This may require overwriting properties
  //set above (to subsequently transition back to those "final values").
  if (animatechoice===1) {
    //Transition opacity
    pulses
      .style("opacity","0")
      .transition()
      .duration(vis.control.transtime)
      .style("opacity",vis.rq.pulseopacity)
      ;
  } else if (animatechoice===2) {
    //Translate x-position
    pulses
      .attr("x",function(d){ return x2(d.pulse_start); })
      .attr("width",function(d){ return x2(d.pulse_end) - x2(d.pulse_start); })
      .transition()
      .duration(0)
      .attr("x",function(d){ return x2(d.pulse_start); })
      .attr("width",function(d){ return x2(d.pulse_end) - x2(d.pulse_start); })
      .each("end",function(){
	      d3.select(this)
		.transition()
		.duration(vis.control.transtime)
		.attr("x",function(d){ return x1(d.pulse_start); })
		.attr("width",function(d){ return x1(d.pulse_end) - x1(d.pulse_start); })
		;
	    })
      ;
  }
}



function labelpulses(x1, y1, x2, y2, animatechoice) {
  //Generates/transitions text labels of pulse identification regions

  //Assorted constants
  xoffset = 2;
  yoffset = 25;

  //Binds data
  pulselabels = vis.brushgraph.focus.select("#pulselabels")
    .selectAll("text")
    .data(returnpulseobject());

  //Handle entering and exiting pulse rectangles
  pulselabels.enter().append("text");
  pulselabels.exit().remove();

  //Assigns "lanes" to move some text elements down so they won't overlap
  if (vis.rq.rqplacement>=0) {
    nevents = vis.currentevent.rq[vis.rq.rqplacement].num_pulses_found;
  } else {
    nevents = 0;
  }
  var xpixelstart=[], xpixelwidth=[];
  for (var c=0; c<nevents; c++) {
    xpixelstart.push(x1(vis.currentevent.rq[vis.rq.rqplacement].pulse_start[c]));
    xpixelwidth.push(pulsenamewidth(vis.currentevent.rq[vis.rq.rqplacement].pulse_classification[c]));
  }
  var laneassignments = assignlanes(nevents, xpixelstart, xpixelwidth);

  //Apply properties to pulse labels
  pulselabels
    .attr("class","pulselabelclass")
    .attr("clip-path", "url(#focusclip)")
    .attr("x",function(d){ return x1(d.pulse_start)+xoffset; })
    .attr("y",function(d,i){ return y1.range()[1]+yoffset*(1+laneassignments[i]); })
    .text(function(d){ return pulsetypename(d.pulse_classification); })
    ;

  //Apply requested transition.  This may require overwriting properties
  //set above (to subsequently transition back to those "final values").
  if (animatechoice===1) {
    //Transition opacity
    pulselabels
      .style("opacity","0")
      .transition()
      .duration(vis.control.transtime)
      .style("opacity",1)
      ;
  } else if (animatechoice===2) {
    //Translate position

    //Assigns "lanes" to move some text elements down so they won't overlap
    //Note: code that is unchanged from run with x1 is not repeated here.
    var oldxpixelstart=[];
    for (var c=0; c<nevents; c++) {
      oldxpixelstart.push(x2(vis.currentevent.rq[vis.rq.rqplacement].pulse_start[c]));
    }
    var oldlaneassignments = assignlanes(nevents, oldxpixelstart, xpixelwidth);

    pulselabels
      .attr("x",function(d){ return x2(d.pulse_start)+xoffset; })
      .attr("y",function(d,i){ return y2.range()[1]+yoffset*(1+oldlaneassignments[i]); })
      .transition()
      .duration(0)
      .attr("x",function(d){ return x2(d.pulse_start)+xoffset; })
      .attr("y",function(d,i){ return y2.range()[1]+yoffset*(1+oldlaneassignments[i]); })
      .each("end",function(d,i){
	      d3.select(this)
		.transition()
		.duration(vis.control.transtime)
		.attr("x",function(d){ return x1(d.pulse_start)+xoffset; })
		.attr("y",function(d){ return y1.range()[1]+yoffset*(1+laneassignments[i]); })
		;
	    })
      ;
  }

}



function undrawpulses(animateflag) {
  //Removes plot shading indicating pulse location
  if (!document.rqform.rq_toggle_pulsefinder.checked) {

    pulsegroup = vis.brushgraph.focus.select("#pulsegroup");
    pulsegroup.selectAll("rect")
      .transition()
      .duration(vis.control.transtime)
      .style("opacity","0")
      .remove();
    pulsegroup2 = vis.brushgraph.context.select("#pulsecontextgroup");
    pulsegroup2.selectAll("rect")
      .transition()
      .duration(vis.control.transtime)
      .style("opacity","0")
      .remove();
    pulsegroupl = vis.brushgraph.focus.select("#pulselabels");
    pulsegroupl.selectAll("text")
      .transition()
      .duration(vis.control.transtime)
      .style("opacity","0")
      .remove();

    //Scroll-up removal of this SVG
    if (vis.rq.pulsevis) {
      if (animateflag) {
	vis.rq.svg
	  .transition()
	  .duration(vis.control.transtime)
	  .attr("height",0)
	  .each("end",function(){
		  vis.rq.svg.remove();
		  //sets "pulsevis" to false only after the svg's removed
		  vis.rq.pulsevis = false;

		  //Turn off key combinations
		  //Not currently working for some reason
		  //Commenting out for now
		  /*
		  listener = vis.control.listener;
		  listener.unregister_combo("1");
		  listener.unregister_combo("2");
		  listener.unregister_combo("3");
		  listener.unregister_combo("4");
		  listener.unregister_combo("5");
		  listener.unregister_combo("6");
		  listener.unregister_combo("7");
		  listener.unregister_combo("8");
		  listener.unregister_combo("9");
		  listener.unregister_combo("0");
		  console.log('unregistered');
		  */

		  //Reopen panel if checkbox checked (which it may
		  //be if it was checked during the transition)
		  if (document.rqform.rq_toggle_pulsefinder.checked) {
		    drawpulses(true);
		  }
		})
	  ;
      } else {
	vis.rq.svg.remove();
      }

      //Remove pulse-specific color from position reconstruction
      redrawrecon(animateflag);
    }
  }
}



function drawrecon(animateflag) {
  //Puts symbols on hitmap showing location of pulses
  if (typeof(animateflag)==='undefined') animateflag = false;
  redrawrecon(animateflag);
}



function redrawrecon(animateflag) {
  if (typeof(animateflag)==='undefined') animateflag = false;

  if (document.rqform.rq_toggle_positionrecon.checked) {

    var ptpcm = 5.8923; //pmt-to-pmt distance, in cm (it's 2.32 inches)
    vis.rq.ptpcm = ptpcm;

    var txscale = vis.hitmap.txscale;
    var tyscale = vis.hitmap.tyscale;
    //var bxscale = vis.hitmap.bxscale;
    //var byscale = vis.hitmap.byscale;

    reconlogos = vis.hitmap.svg.select("#recongroup").selectAll("g")
      .data(returnpulseobject(true), function(d){ return d.key; });
    reconlogosnew = reconlogos.enter().insert("g", "g");

    /*
    reconlogosnew = vis.hitmap.svg.select("#recongroup").selectAll("g")
      .data(returnpulseobject())
      .enter()
      .append("g");
    */

    reconlogosnew
      .attr("class","reconlogo")
      .style("opacity",0)
      .attr("onclick", function(d){
	      return "javascript: focuspulse(" + d.key + ");";
	    })
      .attr("onmouseover", function(d){
	      return "javascript: highlightpulsepair(" + d.key + ");";
	    })
      .attr("onmouseout", function(d){
	      return "javascript: lowlightpulsepair(" + d.key + ");";
	    })
      ;

    var rectwidth = 15;
    reconlogosnew.append("rect")
      .attr("x", -rectwidth/2.)
      .attr("y", -rectwidth/2.)
      .attr("width", rectwidth)
      .attr("height", rectwidth)
      .attr("fill", "white")
      .attr("stroke", "black")
      .attr("stroke-width", 1)
      ;
    colortiles = reconlogosnew.append("rect")
      .attr("class", "colortile")
      .attr("x", -rectwidth/2.)
      .attr("y", -rectwidth/2.)
      .attr("width", rectwidth)
      .attr("height", rectwidth)
      .attr("stroke", "black")
      .attr("stroke-width", 1)
      ;
    reconlogosnew.append("line")
      .attr("x1", -rectwidth/2.)
      .attr("y1", -rectwidth/2.)
      .attr("x2", rectwidth/2.)
      .attr("y2", rectwidth/2.)
      .attr("stroke", "black")
      .attr("stroke-width",1)
      ;
    reconlogosnew.append("line")
      .attr("x1", -rectwidth/2.)
      .attr("y1", rectwidth/2.)
      .attr("x2", rectwidth/2.)
      .attr("y2", -rectwidth/2.)
      .attr("stroke", "black")
      .attr("stroke-width",1)
      ;

    allcolortiles = reconlogos.selectAll(".colortile");
    if (animateflag) {
      localtranstime = vis.control.transtime;
    } else {
      localtranstime = 0;
    }
    if (document.rqform.rq_toggle_pulsefinder.checked) {
      allcolortiles
	.data(returnpulseobject(true), function(d){ return d.key; })
	.transition()
	.duration(localtranstime)
	.style("opacity", vis.rq.pulseopacity)
	.attr("fill",function(d){return pulsecolor(d.pulse_classification,1);})
	;
    } else {
      allcolortiles
	.transition()
	.duration(localtranstime)
	.style("opacity", 1)
	.attr("fill","yellow")
    }

    /*
    //This interferes with transitions, so just picking out pulses
    //by key for mouse-overs.

    //If the pulse is not in the sample range currently being viewed,
    //we'll just give it a dummy location (x=-100cm,y=-100cm, 
    //the same as is used if reconstruction wasn't done).
    //This means the number of reconlogos will always equal the number of
    //pulses, which makes matching them with each other easier.
    function transx(d) {
      if (d.pulse_end>vis.brushgraph.x.domain()[0] && d.pulse_start<vis.brushgraph.x.domain()[1]) {
	return txscale(d.x/ptpcm);
      } else {
	return txscale(-100./ptpcm);
      }
    }
    function transy(d) {
      if (d.pulse_end>vis.brushgraph.x.domain()[0] && d.pulse_start<vis.brushgraph.x.domain()[1]) {
	return tyscale(d.y/ptpcm);
      } else {
	return tyscale(-100./ptpcm);
      }
    }
    */

    reconlogos
      .attr("transform", function(d){ return "translate(" + Math.round(txscale(d.x/ptpcm)) + " " + Math.round(tyscale(d.y/ptpcm)) + ")"; })
      ;

    //Sort the logos so the first ones are on top of the last ones
    reconlogos.sort(function(a,b){ return b.key-a.key });

    if (animateflag) {
      reconlogos
	.transition()
	.duration(vis.control.transtime)
	.style("opacity","1")
	;
      reconlogos
	.exit()
	.transition()
	.duration(vis.control.transtime)
	.style("opacity","0")
	.remove()
	;
    } else {
      reconlogos.style("opacity","1");
      reconlogos.exit().remove();
    }

    vis.rq.reconvis = true;

    //One last check that symbols haven't been turned back off
    //undrawrecon(animateflag);
  }
}



function undrawrecon(animateflag) {
  if (typeof(animateflag)==='undefined') animateflag = false;

  if (!document.rqform.rq_toggle_positionrecon.checked) {

    vis.rq.reconvis = false;
    
    if (animateflag) {
      reconlogos = vis.hitmap.svg.select("#recongroup").selectAll("g")
	.transition()
	.duration(vis.control.transtime)
	.style("opacity","0")
	.remove()
	.each("end",function(){
		//One last check that symbols haven't been turned back on
		drawrecon(animateflag)
		  })
	;
    } else {
      reconlogos = vis.hitmap.svg.select("#recongroup").selectAll("g")
	.remove();
    }

    //One last check that symbols haven't been turned back on
    //drawrecon(animateflag);
  }
}



function drawquants(animateflag) {
  //Makes text box with pulse quantitites
  if (typeof(animateflag)==='undefined') animateflag = false;

  if (document.rqform.rq_toggle_pulsequants.checked) {
    if (!vis.rq.quantvis) {
      vis.rq.quantvis = true;

      qcwidth = 250;
      qcheight = 80;

      //Create SVG element
      vis.rq.quantsvg = d3.select("#quantcell")
	.append("svg")
	.attr("width", qcwidth)
	.attr("height", 0)
	;
      svg = vis.rq.quantsvg;

      //Colored background (for debugging)
      svg.append("rect")
	.attr("width", "100%")
	.attr("height", "100%")
	.attr("class", "backgroundcolor")
	;

      //Boundary square
      var yoffset = 5;
      var xoffsetleft = 5;
      var xoffsetright = 5;
      var rcorner = 5;
      var boxheight = 55;
      boxgroup = svg.append("g")
	.attr("transform", "translate(" + xoffsetleft + " " + yoffset + ")");
      quantframe = boxgroup.append("rect")
	.attr("width", qcwidth - xoffsetleft - xoffsetright)
	.attr("height", boxheight)
	.attr("fill", "none")
	.attr("stroke", "none")
	.attr("stroke-width", 3)
	.attr("rx", rcorner)
	.attr("ry", rcorner)
	.style("opacity", vis.rq.pulseopacity);

      //Scroll-down reveal of this SVG
      if (animateflag) {
	svg
	  .transition()
	  .duration(vis.control.transtime)
	  .attr("height",qcheight)
	  ;
      } else {
	svg.attr("height",qcheight);
      }

      //Adds some (as yet blank) text boxes
      xbound = 5;
      ybounda = 15;
      yboundd = 15;
      vis.rq.quantlines = [];
      for (var i=0; i<3; i++) {
	aline = boxgroup.append("text")
	  .attr("x", xbound)
	  .attr("y", ybounda + i*yboundd)
	  .attr("class", "legendary")
	  ;
	vis.rq.quantlines.push(aline);
      }

      //Save some global variables
      vis.rq.quantframe = quantframe;

      //Fill in quants now (only if exactly 1 quant visible on screen)
      redrawquantsunambiguous();
    }
  }
}



function redrawquants(pulsenum) {
  //Adds text to text box
  if (vis.rq.quantvis) {
    if (pulsenum==-1) {
      //Then remove this text box.
      for (var i=0; i<vis.rq.quantlines.length; i++) {
	vis.rq.quantlines[i].text("");
      }
      vis.rq.quantframe
	.attr("fill", "none")
	.attr("stroke", "none")
	;
    } else if (vis.rq.rqplacement>=0) {
      //Update text
      var currentrq = vis.currentevent.rq[vis.rq.rqplacement];
      pulsenummatlab = pulsenum+1;
      vis.rq.quantlines[0].text("Pulse: " + pulsenummatlab.toString() );
      var pulsearea = Math.round(currentrq.pulse_area_phe[pulsenum]*100.)/100.;
      vis.rq.quantlines[1].text("Pulse Area: " + pulsearea.toString() );
      var asymmetry = Math.round(currentrq.top_bottom_asymmetry[pulsenum]*100.)/100.;
      vis.rq.quantlines[2].text("Top_Bottom_Asymmetry: " + asymmetry.toString() );
      
      //Update box color
      vis.rq.quantframe
	.attr("fill", pulsecolor(currentrq.pulse_classification[pulsenum],1))
	.attr("stroke", pulsecolor(currentrq.pulse_classification[pulsenum],2))
	;
    }
  }
}



function redrawquantsunambiguous() {
  //If only 1 pulse is displayed in the window, give its quant information
  rpo = returnpulseobject(true);
  if (rpo.length==1) {
    //Then exactly 1 pulse is visible
    redrawquants(rpo[0].key);
  } else {
    redrawquants(-1);
  }
}



function undrawquants(animateflag) {
  //Removes text box with pulse information
  if (!document.rqform.rq_toggle_pulsequants.checked) {
    if (vis.rq.quantvis) {
      if (animateflag) {
	vis.rq.quantsvg
	  .transition()
	  .duration(vis.control.transtime)
	  .attr("height",0)
	  .each("end", function(){
		  vis.rq.quantsvg.remove();
		  vis.rq.quantvis = false;
		  if (document.rqform.rq_toggle_pulsequants.checked) {
		    drawquants(true);
		  }
		})
	  ;
      } else {
	vis.rq.quantsvg.remove();
      }
    }
  }
}



function pulsecolor(pulsetype, coloruse) {
  //Returns standard colors to use for different pulse types
  //coloruse = 1 for fill
  //coloruse = 2 for border

  var fc, bc; //holds color name strings
  var errorstring = "pulsecolor_error";
  switch(pulsetype) {
  case 1: //S1
    fc = "lime";
    bc = "green";
    break;
  case 2: //S2
    fc = "blue";
    bc = "navy";
    break;
  case 3: //Single phe (sphe)
    fc = "gold";
    bc = "goldenrod"; //or orange
    break;
  case 4: //Single e- (SE)
    fc = "red";
    bc = "firebrick";
    break;
  case 5: //Other
    fc = "gray";
    bc = "black";
    break;
  case 9: //Multiple pulse
    fc = "mediumpurple";
    bc = "indigo";
  default:
    pc = errorstring;
    bc = errorstring;
  }
  switch(coloruse) {
  case 1:
    return fc;
    break;
  case 2:
    return bc;
    break;
  default:
    return errorstring;
  }
}


function pulsetypename(pulseclass) {
  var pc;
  switch (pulseclass) {
  case 1:
    pc = "S1";
    break;
  case 2:
    pc = "S2";
    break;
  case 3:
    pc = "sphe";
    break;
  case 4:
    pc = "SE";
    break;
  case 5:
    pc = "else";
    break;
  case 9:
    pc = "merge";
    break;
  default:
    pc = "pulsetypename_error";
  }
  return pc;
}



function pulsenamewidth(pulseclass) {
  //About how many pixels will be needed to print this name
  var pc;
  switch (pulseclass) {
  case 1:
    pc = 40;
    break;
  case 2:
    pc = 40;
    break;
  case 3:
    pc = 70;
    break;
  case 4:
    pc = 40;
    break;
  case 5:
    pc = 70;
    break;
  case 9:
    pc = 100;
    break;
  default:
    pc = 0;
  }
  return pc;
}



function returnpulseobject(onscreenonly){
  //Reformats pulse information into something that
  //behaves well with D3's .data() method.
    if (typeof(onscreenonly)==='undefined') onscreenonly = false;

  if (vis.rq.rqplacement>=0) {
    rqlist = vis.currentevent.rq[vis.rq.rqplacement];
    len = rqlist.num_pulses_found;

    pulseobject = [];
    for (var c=0; c<len; c++) {
      pulseentry = {};
      pulseentry.key = c;
      pulseentry.pulse_classification = rqlist.pulse_classification[c];
      pulseentry.pulse_start = rqlist.pulse_start[c];
      pulseentry.pulse_end = rqlist.pulse_end[c];
      pulseentry.pulse_area_phe = rqlist.pulse_area_phe[c];
      pulseentry.x = rqlist.x[c];
      pulseentry.y = rqlist.y[c];
      if (onscreenonly) {
	//Will only include pulses that are visible onscreen
	var xscale = vis.brushgraph.x;
	if (pulseentry.pulse_end>xscale.domain()[0] && pulseentry.pulse_start<xscale.domain()[1]) {
	  pulseobject.push(pulseentry);
	}
      } else {
	pulseobject.push(pulseentry);
      }
    }
    return pulseobject;
  } else {
    return [];
  }
}

function assignlanes(numitems, arrstartposition, arrlength) {
  //Assigns data blocks to lanes such that they will each
  //start in the requested position, will not overlap,
  //and will use a minimal number of total lanes.
  //Code assumes that items are sorted by arrstartposition and that
  //the arrlength's are similar.  No promises of optimization given!
  //(Used to keep pulse labels from overlapping)
  var laneassignments = [];
  var lanequeue = []; //Where last item in each lane ends
  var foundspot; //Whether spot found in an already-occupied lane

  for (var c=0; c<numitems; c++) {
    lanetocheck = 0;
    
    while (lanetocheck < lanequeue.length) {
      if (arrstartposition[c]>lanequeue[lanetocheck]) {
	break;
      }
      lanetocheck++;
    }
    lanequeue[lanetocheck] = arrstartposition[c] + arrlength[c];
    laneassignments.push(lanetocheck);
  }

  return laneassignments;
}

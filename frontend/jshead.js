//JavaScript in head

//One object to hold all global variables
var vis={};

vis.control={}; //Environment settings
vis.control.visible = false; //Whether any event has been graphed yet
vis.control.placement; //Where event on screen falls *in the JSON array*
vis.control.transdefault = 1000; //Default transition duration
vis.control.transtime = vis.control.transdefault; //Duration for transitions
vis.control.epsilon = 1E-8; //Number much smaller than any nonzero datapoint
vis.control.logflag = false; //Whether to output all status messages to console
vis.control.viewlist; //List of previous zoom settings to revert to
vis.control.viewindex; //Where on the viewlist that's being shown
vis.control.loadtime; //When page loaded (used to make unique string)
vis.control.showallpmts = false; //Whether to have extra plot w/individual PMTs
vis.control.latestrequestid;  //Unique ID for most recent request
vis.control.requestpath; //Path to request file
vis.control.backendpath; //Path to backend directory
vis.control.machine = "edison"; //Where to send NEWT commands, edison or pdsf

vis.data={}; //Raw & computed data
vis.data.jsondata; //Stores JSON input
vis.data.numevents; //How many events are in the data
vis.data.chfirst = 1; //# of first PMT
vis.data.chlast = 136; //# of last PMT
vis.data.contextlines; //Coordinates of lines for drawing context plot fast

vis.currentevent; //Points to data for onscreen event

vis.hitmap={}; //Hitmap SVG
vis.hitmap.svg; //Points to SVG graphic
vis.hitmap.colorscale; //Points to colorbar scale
vis.hitmap.coloraxis; //Points to colorbar axis
vis.hitmap.colorscheme; //Name of color option used for last colorbar
vis.hitmap.txscale; vis.hitmap.tyscale; vis.hitmap.bxscale; vis.hitmap.byscale;
//Scales for top- and bottom-PMT hitmaps

vis.brushgraph={}; //Voltage graph SVG (was voltgraph)
//Many things added in brushgraph.js::drawbrush()

vis.rq={}; //RQ's
vis.rq.svg; //The pulse panel with buttons to zoom in on pulses
vis.rq.quantsvg; //Panel of text values
vis.rq.rqplacement = 0; //Which set of RQ's to use
vis.rq.pulseopacity = .2; //Opacity of the pulse-related symbols
vis.rq.pulsevis = false; //Whether pulse finder output visible
vis.rq.reconvis = false; //Whether position reconstruction output visible
vis.rq.quantvis = false; //Whether pulse quantities output visible

vis.preview={}; //Dataset Preview mode
vis.preview.mode = 0; //0 for database-driven Visualux (the usual), and 1 for Dataset Preview mode
vis.preview.path = "/global/project/projectdirs/lux/data/dataset_previews"; //Where preview evts are stored


//Function runs as soon as DOM is ready
$(function(){
    //Assorted startup tasks

    //Special message to users
    //statusmessage('Try these real LUXstamps: 10862670174690788, 10862670141461770, 10862670145152784, 10862670122098534','DarkTurquoise');
    //statusmessage('Site undergoing maintenance and may be temporarily down.','Red');

    //Make form visibility correct if browser remembered radio button settings
    setadvancedformvis();
    //Make multi-PMT setting correct if browser remembered check box settings
    if (document.getElementsByName("rq_toggle_multipmt")[0].checked) vis.control.showallpmts = true;
    //Store time as string (used to generate semi-unique request number)
    vis.control.loadtime = new Date().getTime().toString();
    //Find out which PHP-specified layout mode we're in
    vis.preview.mode = $('#layoutmode').val();

    //Constructs path to the backend from this URL
    var re = new RegExp(".gov/project/lux/(.*)/");
    address = document.URL;
    match = re.exec(address);
    pathpart = match[1];
    vis.control.backendpath = "/global/project/projectdirs/lux/www/" + pathpart + "/backend/";

    //If requested in PHP, start loading of data automatically
    autoluxstamp = $('#autoluxstamp').val();
    autoacquisition = $('#autoacquisition').val();
    if (autoluxstamp.length>0) {
      document.getElementById("eventnumbox").value = autoluxstamp;
      loadandshow(0);
    } else if (autoacquisition.length>0) {
      document.getElementById("previewprefixtext").value = autoacquisition;
      loadandshow(2);
    }

});



function statusmessage(msg, color) {
  //Outputs a short message on the screen to inform the user
  if(typeof(msg)==='undefined') msg = 0;
  if(typeof(color)==='undefined') color = 'Black';

  //Writes a status message in an appropriate place
  if (arguments.length==0) {
    //Clear message
    $('#messagediv').html("")
  } else {
    //Print message
    $('#messagediv').html("<font color='" + color + "'>" + msg + "</font>")
  }

  //Optionally also write message to the console's log
  if (vis.control.logflag) {
    console.log(msg);
  }
}



function loadandshow(formnum) {
  //Gets data and shows graph

  //Collects and formats data from the form
  var requestid = semiunique();
  vis.control.lastrequestid = requestid.slice(0);
  var eventbuilderpolicy, eventbuildernum;
  if (formnum==0 || document.advancedform.requesteb[0].checked==true || formnum==2) {
    //Then use latest
    eventbuilderpolicy = "-1";
    eventbuildernum = "0";
  } else {
    eventbuilderpolicy = "1";
    eventbuildernum = $('#requestebnum').val();
  }
  var pmtgainsnum;
  if (formnum==0 || document.advancedform.requestgains[0].checked==true || formnum==2) {
    pmtgainsnum = "-1";
  } else {
    pmtgainsnum = $('#requestgainsnum').val();
  }
  var requesttype;
  var finalargs;
  if (formnum==0 || (formnum==1 && document.advancedform.requesttype[1].checked==true)) {
    //This is a luxstamp request
    requesttype = "0";
    if (formnum==0) {
      finalargs = cleanstring($('#eventnumbox').val());
    } else {
      finalargs = cleanstring($('#luxstamplist').val());
    }
  } else if (formnum==1 && document.advancedform.requesttype[0].checked==true) {
    //This is a filename_prefix request
    finalargs = $('#prefixtext').val() + ' ';
    if (document.advancedform.acsubset[0].checked==1) {
      //Range of events given
      requesttype = "1";
      finalargs = finalargs + $('#acsubsetstart').val() + ' ' + $('#acsubsetend').val();
    } else {
      //Event numbers given
      requesttype = "2";
      finalargs = finalargs + cleanstring($('#acsubsetevnums').val());
    }
  } else if (formnum==1 && document.advancedform.requesttype[2].checked==true) {
    //Custom file path request
    finalargs = $('#simevtpath').val() + ' ';
    if ($('#simrqpath').val().length>0) {
      finalargs = finalargs + $('#simrqpath').val() + ' ';
    } else {
      finalargs = finalargs + '0' + ' ';
    }
    if (document.advancedform.smsubset[0].checked==1) {
      //Range of events given
      requesttype = "4";
      finalargs = finalargs + $('#smsubsetstart').val() + ' ' + $('#smsubsetend').val();
    } else {
      //Event numbers given
      requesttype = "5";
      finalargs = finalargs + cleanstring($('#smsubsetevnums').val());
    }
  } else if (formnum==1 && document.advancedform.requesttype[3].checked==true) {
    //Dataset preview link
    statusmessage('<a href="./index.php?layout=preview">Click here to go to Dataset Preview.</a>');
    return;
  } else {
    //This is a dataset preview request
    requesttype = "3";
    if (document.previewform.partialpreview[1].checked) {
	eventstart = 1;
	eventend = 50;
    } else if (document.previewform.partialpreview[2].checked) {
	eventstart = 51;
	eventend = 100;
    } else {
	eventstart = 1;
	eventend = 100;
    }
    finalargs = $('#previewprefixtext').val() + ' ' + eventstart.toString() + ' ' + eventend.toString();
  }
  var scriptargs = requestid + ' ' + eventbuilderpolicy + ' ' + eventbuildernum + ' ' + pmtgainsnum + ' ' + requesttype + ' ' + finalargs;

  //Turn off request help box
  requesthelphide();

  //Load data
  loaddata(requestid, scriptargs);
}



function loaddata(requestid, scriptargs) {
  //Makes the NEWT calls to create the JSON file at NERSC
  statusmessage('Processing data...', 'Green');

  //Removes focus from text box so key binding will work
  document.activeElement.blur();

  //Checks that user is logged in before continuing
  $.newt_ajax({
    type: "GET",
    url: "/login/",
    success: function(res){
	if (res.auth) {
	  loaddatapart2(requestid, scriptargs);
	} else {
	  statusmessage('Not logged in.  Please log into your NERSC account in the black bar at the top of the page and then try again.', 'Red');
	}
    },
  });  
}

function loaddatapart2(requestid, scriptargs) {

  //Creates empty request file (in case recursiveretrievedata asks for this
  //file before getevent.py has time to create it).
  requestpath = vis.control.backendpath + "requests/request" + requestid + ".txt";
  $.newt_ajax({
    type: "PUT",
    url: "/file/" + vis.control.machine + "/" + requestpath,
    success: function(){
	//Starts to build JSON files and populate request file
	startbuild(scriptargs);
	//Starts to recursively retrieve JSON files
	recursiveretrieve(requestid, 0, 0);
    },
  });
}



function startbuild(scriptargs) {
  //Sends command for getevent.py to start building/listing the JSON files
  statusmessage('Processing data...','Green');
  var commandstring = vis.control.backendpath + "code/getevent.csh" + " " + scriptargs;
  //var commandstring = "-env CHOS=sl64 /usr/bin/chos " + vis.control.backendpath + "code/getevent.csh" + " " + scriptargs;
  //var commandstring = vis.control.backendpath + "code/runchos.csh" + " " + scriptargs;
  $.newt_ajax({
    type: "POST",
    url: "/command/" + vis.control.machine,
	data: {"executable": commandstring, "chos":"sl64"},
    success: function(res){
	if (res.error.length>0) {
	  statusmessage('Internal error.  See console output for more information.  Please refresh this page before continuing.','Red');
	  console.log('Internal Error Description:');
	  console.log(res);
	} else {
	  console.log('Data processing complete');
	}
    },
  });
}



function recursiveretrieve(requestid, eventnum, linessofar, filessofar) {
  //Recursively retrieves JSON files

  if (linessofar<eventnum+1) {
    //Then we need to see if the request file's been updated
    requestpath = vis.control.backendpath + "requests/request" + requestid + ".txt";
    $.newt_ajax({
      type: "GET",
      url: "/file/" + vis.control.machine + "/" + requestpath + "?view=read",
      success: function(res) {
	  if (res.length) {
	    tempstring = res.replace(/\n$/,"");
	    filessofar = tempstring.split('\n');
	    linessofar = filessofar.length;
	  } else {
	    filessofar = [];
	    linessofar = 0;
	  }
	  if (linessofar>=eventnum+1) {
	    processreqline(requestid, eventnum, linessofar, filessofar);
	  } else {
	    //Wait a bit, then try again.
	    setTimeout(function(){recursiveretrieve(requestid, eventnum, linessofar, filessofar)}, 5*1000)
	  }
      },
    });
  } else {
    processreqline(requestid, eventnum, linessofar, filessofar);
  }

  function processreqline(requestid, eventnum, linessofar, filessofar) {
    //Reads and acts in response to one line from the request file

    if (eventnum==0) {
      statusmessage('Transferring data...','Green');      
    }

    filename = filessofar[eventnum];
    if (filename=='1') {
      if (eventnum==0) {
	//End of file, and no events were found
	if (vis.preview.mode==0) {
	  statusmessage('No events matching your query were found.', 'Red');
	} else {
	  statusmessage('No preview evt file was found for this acquisition.', 'Red');
	}
      } else {
	//End of file, and at least one event was found, so clear message
	statusmessage('');
      }
      console.log('Data transferring complete');

      //Delete the request file, now that it is no longer needed.
      $.newt_ajax({
	type: "DELETE",
	url: "/file/" + vis.control.machine + "/" + requestpath,
      });

    } else {

      //Retrieve this event
      eventpath = vis.control.backendpath + "data/" + filessofar[eventnum];
      $.newt_ajax({
	type: "GET",
        url: "/file/" + vis.control.machine + "/" + eventpath + "?view=read",
        success: function(res) {
	    //Before processing this event, check that user hasn't
	    //started a newer request before the last one completed.
	    if (requestid==vis.control.lastrequestid) {
	      //Process this event
	      processevent(eventnum, res);

	      //Now ask for next event
	      recursiveretrieve(requestid, eventnum+1, linessofar, filessofar);
	    }
	},
      });
    }
  }

  function processevent(eventnum, jtext) {
    //Takes the JSON for a single event, adds it to the ever-growing array,
    //adds pod and podsum data with spacers, and updates graphics.

    //Create the array if this is the first event
    if (eventnum==0) {
      vis.data.jsondata = {};
      vis.data.jsondata.event = [];
    }

    //Parse the JSON string, and append the resulting object to that array
    anevent = JSON.parse(jtext);
    vis.data.jsondata.event.push(anevent);
    vis.data.numevents = vis.data.jsondata.event.length;

    //Create sumpod and POD arrays that include spacer datapoints
    //(This makes it easier to generate the plots)
    //Also creates POD arrays in phe units without spacers
    //Also create the list of all sample times
    var localevent = vis.data.jsondata.event[eventnum];
    createtimesamples(localevent.sumpod);
    var spacedat = createspacerdata(localevent.sumpod.time_samples, localevent.sumpod.data_phe_per_sample);
    localevent.sumpod.time_samples_spacers = spacedat.samples;
    localevent.sumpod.data_phe_per_sample_spacers = spacedat.signals;
    for (var podno=0; podno<localevent.pod.length; podno++) {
      createtimesamples(localevent.pod[podno]);
      localevent.pod[podno].data_phe_per_sample = createscaleddata(localevent.pod[podno].data_mV, 1./localevent.pod[podno].mV_to_phe_per_sample);
      spacedat = createspacerdata(localevent.pod[podno].time_samples, localevent.pod[podno].data_phe_per_sample);
      localevent.pod[podno].time_samples_spacers = spacedat.samples;
      localevent.pod[podno].data_phe_per_sample_spacers = spacedat.signals;
    }

    if (eventnum==0) {
      //Sets the shortcut pointer, and some control values
      vis.control.placement = 0;
      vis.currentevent = vis.data.jsondata.event[vis.control.placement];

      //Draw the graphics
      showdata();
    } else {
      //Just update the total number of events in the control panel
      d3.select("#numrequestsoutput").text(vis.data.numevents);
    }
  }
}



function updatelistener() {
  //Checks that listener will turn off in any textboxes or password boxes
  if (typeof(vis.control.listener) != 'undefined') {
    $('input[type=text], input[type=password], select')
      .bind("focus", function(){vis.control.listener.stop_listening();})
      .bind("blur", function(){vis.control.listener.listen();});
  }
}



function showdata() {
  //Makes the plots
  //Assumes data already loaded into JSON object

  //By default, use last available set of RQs
  vis.rq.rqplacement = vis.currentevent.rq.length - 1;

  if (!vis.control.visible) {
    //key bindings
    var listener = new window.keypress.Listener();
    vis.control.listener = listener;
    //Disable keyboard capturing when in textbox
    $('input[type=text], input[type=password], select')
      .bind("focus", function(){listener.stop_listening();})
      .bind("blur", function(){listener.listen();});

    //Draw everything!
    drawhitmap();
    drawbrush();
    drawpanel();
    drawpulses(false);
    drawrecon(false);
    drawquants(false);
    vis.control.visible=true;

    //Pan
    listener.simple_combo("up", function(){focuspan(0,.2);});
    listener.simple_combo("left", function(){focuspan(-.2,0);});
    listener.simple_combo("right", function(){focuspan(.2,0);});
    listener.simple_combo("down", function(){focuspan(0,-.2);});
    //zoomout
    listener.simple_combo("x", function(){focusbackaway(2,1);});
    listener.simple_combo("y", function(){focusbackaway(1,2);});
    listener.simple_combo("b", function(){focusbackaway(2,2);});
    //view
    listener.simple_combo("a", function(){focuszoom(0,0,true,true);});
    listener.simple_combo("u", function(){focuszoomprevious();});    
    listener.simple_combo("r", function(){focuszoomnext();});
    //switch event
    listener.simple_combo("f", function(){altevent(-1,true);});    
    listener.simple_combo("p", function(){altevent(-1);});
    listener.simple_combo("n", function(){altevent(1);});
    listener.simple_combo("l", function(){altevent(1,true);});
    //RQ's
    if (vis.preview.mode==0) {
      listener.simple_combo("s", function(){checkboxkey("s");});
      listener.simple_combo("t", function(){checkboxkey("t");});
      listener.simple_combo("q", function(){checkboxkey("q");});
    }
    //multiple PMT's
    listener.simple_combo("m", function(){checkboxkey("m");});
    //appearance
    listener.simple_combo("h", function(){helpbuttonclick();});
    //Scales data as if clicking on context brush
    listener.simple_combo("w", function(){if (vis.brushgraph.brush.empty()) { focuszoom(0,0,true,true); } else {focuszoom(vis.brushgraph.brush.extent(),0,false,true);}});

    //Pulse finder
    listener.simple_combo("1", function(){focuspulse(0);});
    listener.simple_combo("2", function(){focuspulse(1);});
    listener.simple_combo("3", function(){focuspulse(2);});
    listener.simple_combo("4", function(){focuspulse(3);});
    listener.simple_combo("5", function(){focuspulse(4);});
    listener.simple_combo("6", function(){focuspulse(5);});
    listener.simple_combo("7", function(){focuspulse(6);});
    listener.simple_combo("8", function(){focuspulse(7);});
    listener.simple_combo("9", function(){focuspulse(8);});
    listener.simple_combo("0", function(){focuspulse(9);});

    //Checks that internal variables match control panel buttons
    //This is unnecessary unless the user changed the setting
    //then refreshed the page on Firefox.
    if (document.transitionform.transchoice[1].checked) {
      vis.control.transtime = 0;
    }

  } else {
    redrawhitmap();
    redrawbrush();
    redrawpanel();
    redrawpulses(false);
    redrawrecon(false);
    redrawquants(-1);
  }
}



function newviewhandler() {
  //Updates screen when event happens that doesn't change the event
  //being viewed (such as changing the color scheme)
  if (vis.control.visible) {
    redrawhitmap(0, x.domain()[0], x.domain()[1]);
    colorpath();
  }
}



function altevent(step, toendflag) {
  //Advances to another event (of those that have been loaded)

  if(typeof(toendflag)==='undefined') toendflag = false;

  currentplace = vis.control.placement;
  numevents = vis.data.numevents;

  if (toendflag) {
    if (step<0) {
      newplace = 0;
    } else {
      newplace = numevents-1;
    }
  } else {
    newplace = currentplace + step;
    if (newplace >= numevents) {
      //newplace = 0;
      newplace = currentplace;
    } else if (newplace < 0) {
      //newplace = numevents - 1;
      newplace = currentplace;
    }
  }

  if (newplace != vis.control.placement) {
    vis.control.placement = newplace;
    vis.currentevent = vis.data.jsondata.event[vis.control.placement];

    showdata();
  }
}



function semiunique() {
  //Returns a string that's *probably* unique
  //by concatenating page loading time and current time.

  return vis.control.loadtime + (new Date().getTime().toString());
}



function cleanstring(instring) {
  //Converts string into space-delimited list of numbers,
  //removing any extraneous symbols
  re = /[^(1-9)0]+$/;
  modstring = instring.replace(re,"");
  re = /^[^(1-9)0]+/;
  modstring = modstring.replace(re,"");
  re = /[^(1-9)0]+/g;
  modstring = modstring.replace(re," ");
  return modstring;
}



function previewlist(arg) {
  //Outputs a list of all acquisitions 
  outputlocation = $('#previewlist');
    if (arg==0) {
      outputlocation.html('');
    } else {
      outputlocation.html('Checking...');
      if (arg==1) {
	commandstring = 'bash -c "ls -r ' + vis.preview.path + ' | head -n 10 | awk '+"'"+'{print substr($0,0,19)}'+"'"+' "';
      } else {
	commandstring = 'bash -c "ls -r ' + vis.preview.path + ' | awk '+"'"+'{print substr($0,0,19)}'+"'"+' "';
      }

      $.newt_ajax({
	type: "POST",
	    url: "/command/" + vis.control.machine,
	    data: {"executable": commandstring, "chos":"sl64"},
	    success: function(res){
	      $('#previewlist').html(res.output);
	    },
      });
    }
}

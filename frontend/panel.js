//Routines for manipulating the control panel on the webpage.
//(Not to be confused with "vis.control," containing variables
//for controlling program flow.)

function drawpanel() {
  //Fill in some values
  redrawpanel();

  //Renders control panel visible
  d3.select("#controlpanel").attr("style", "display:inline;");

  //Turns on a small footnote at the end of the page
  d3.select("#pagefooter").attr("style", "display:inline;");
}



function redrawpanel() {

  //Breaks the filename into two lines at the second underscore
  filename = vis.currentevent.filename;
  filenameedit = filename.replace("_","*");
  underscore2 = filenameedit.indexOf("_");
  line1 = filename.substr(0,underscore2);
  line2 = filename.substr(underscore2);
  //document.getElementById("filenameoutput").innerHTML = line1+"<br>"+line2;

  //Fills in some values on control panel
  d3.select("#placementoutput").text(vis.control.placement+1);
  d3.select("#numrequestsoutput").text(vis.data.numevents);
  d3.select("#luxstampoutput").text(vis.currentevent.luxstamp);
  d3.select("#acquisitionoutput").text(line1);
  d3.select("#eventnumoutput").text(vis.currentevent.eventnum);
  d3.select("#timestampoutput").text( (vis.currentevent.timestamp*1E-8).toFixed(3) + " sec");
  d3.select("#filenameoutput").text(vis.currentevent.filename);


  //Fills in the dropdown list of RQ values
  //First, clear out any previous values
  $('#rqchoice').empty();
  for (var i=0; i<vis.currentevent.rq.length; i++) {
    var opt = document.createElement('option');
    var cpnum = vis.currentevent.rq[i].cpnum;
    opt.innerHTML = 'cp' + cpnum.toString();
    document.getElementById('rqchoice').appendChild(opt);
  }
  document.getElementById('rqchoice').selectedIndex = vis.rq.rqplacement;

  //Fills in some RQ values on control panel
  if (vis.rq.rqplacement>=0) {
    //d3.select("#numpulsesfoundoutput").text(vis.currentevent.rq[vis.rq.rqplacement].num_pulses_found);
    d3.select("#fullevtareapheoutput").text(Math.round(vis.currentevent.rq[vis.rq.rqplacement].full_evt_area_phe));
    //d3.select("#wsumpodareapheoutput").text(Math.round(vis.currentevent.rq[vis.rq.rqplacement].wsumpod_area_phe[0]));
    if (vis.currentevent.rq[vis.rq.rqplacement].wsumpod_area_phe != null){
      fullareawsumpod = 0;
      for (var i = 0; i < 10; i++){
        fullareawsumpod += vis.currentevent.rq[vis.rq.rqplacement].wsumpod_area_phe[i]; }
      d3.select("#wsumpodareapheoutput").text(Math.round(fullareawsumpod));
    } else {
      d3.select("#wsumpodareapheoutput").text("N/A")}
    if (vis.currentevent.rq[vis.rq.rqplacement].wsumpodcoincidence != null){
      d3.select("#wsumpodcoincidence").text(vis.currentevent.rq[vis.rq.rqplacement].wsumpodcoincidence[0]); }
    else{
      d3.select("#wsumpodcoincidence").text("N/A")}
} else {
    d3.select("#fullevtareapheoutput").text('-');
    d3.select("#sumpodevtareapheoutput").text('-');
    d3.select("#wsumpodcoincidence").text('-');
  }

}



function helpbuttonclick() {
  //window.scrollBy(0,999999);
  d3.select("#helppanel").attr("style", "display:inline;");
  document.getElementById("helpbutton").disabled=true;
  //window.location.href="#help";
  //window.scrollBy(0,150);
}



function hidehelp() {
  d3.select("#helppanel").attr("style", "display:none;");
  document.getElementById("helpbutton").disabled=false;
}



function requesthelpshow() {
  $(".requesthelpspan").attr("style", "display:none;");
  //d3.select(".requesthelpspan").attr("style", "display:none;");
  d3.select("#requesthelppanel").attr("style", "display:inline;");
}



function requesthelphide() {
  $(".requesthelpspan").attr("style", "display:inline;");
  //d3.select(".requesthelpspan").attr("style", "display:inline;");
  d3.select("#requesthelppanel").attr("style", "display:none;");
}



function switchtoadvancedform() {
  //Makes the advanced request form visible onscreen
  d3.select("#mainform").attr("style", "display:none;");
  d3.select("#advancedform").attr("style", "display:inline;");
}



function switchtobasicform() {
  //Makes the basic request form visible on screen
  d3.select("#advancedform").attr("style", "display:none;");
  d3.select("#mainform").attr("style", "display:inline;");
}



function setadvancedformvis() {
  //Adjust visibility of portions of the advanced request form
  if (document.advancedform.requesttype[0].checked) {
      d3.select("#reqformacblock").attr("style", "display:inline;");
      d3.select("#reqformlsblock").attr("style", "display:none;");
      d3.select("#reqformsmblock").attr("style", "display:none;");
      d3.select("#reqformdpblock").attr("style", "display:none;");
  }
  if (document.advancedform.requesttype[1].checked) {
      d3.select("#reqformacblock").attr("style", "display:none;");
      d3.select("#reqformlsblock").attr("style", "display:inline;");
      d3.select("#reqformsmblock").attr("style", "display:none;");
      d3.select("#reqformdpblock").attr("style", "display:none;");
  }
  if (document.advancedform.requesttype[2].checked) {
      d3.select("#reqformacblock").attr("style", "display:none;");
      d3.select("#reqformlsblock").attr("style", "display:none;");
      d3.select("#reqformsmblock").attr("style", "display:inline;");
      d3.select("#reqformdpblock").attr("style", "display:none;");
  }
  if (document.advancedform.requesttype[3].checked) {
      d3.select("#reqformacblock").attr("style", "display:none;");
      d3.select("#reqformlsblock").attr("style", "display:none;");
      d3.select("#reqformsmblock").attr("style", "display:none;");
      d3.select("#reqformdpblock").attr("style", "display:inline;");
  }
}



function checkboxkey(keychoice) {
  //Responds appropriately if user checks/unchecks an RQ checkbox
  //by using the corresponding keyboard shortcut.

  //Identify the checkbox in question
  var boxname; //name of the checkbox
  var boxptr; //points to the checkbox
  if (keychoice==="s") {
    boxname = "rq_toggle_pulsefinder";
  } else if (keychoice==="t") {
    boxname = "rq_toggle_positionrecon";
  } else if (keychoice==="q") {
    boxname = "rq_toggle_pulsequants";
  } else if (keychoice==="m") {
    boxname = "rq_toggle_multipmt";
  } else {
    console.log('Invalid checkboxkey() input.');
    return;
  }
  var boxptr = document.getElementsByName(boxname)[0];

  //Check the checkbox if unchecked, and vice versa
  if (!boxptr.checked) {
    //Currently unchecked
    boxptr.checked = true;

    //Run code for when box is checked
    if (keychoice==="s") {
      drawpulses(true);
    } else if (keychoice==="t") {
      drawrecon(true);
    } else if (keychoice==="q") {
      drawquants(true);
    } else if (keychoice==="m") {
      showallpmts();
    }
  } else {
    //Currently checked
    boxptr.checked = false;

    //Run code for when box is unchecked
    if (keychoice==="s") {
      undrawpulses(true);
    } else if (keychoice==="t") {
      undrawrecon(true);
    } else if (keychoice==="q") {
      undrawquants(true);
    } else if (keychoice==="m") {
      unshowallpmts();
    }
  }
}



function rqswitch() {
  //This function runs when user picks different
  //set of RQ's from dropdown menu.

  //First, update variable storing desired RQs
  vis.rq.rqplacement = document.getElementById('rqchoice').selectedIndex;

  //Removes focus from select element so key binding will work
  document.activeElement.blur();

  //Redraw RQ's
  if (vis.rq.pulsevis) redrawpulses(false);
  if (vis.rq.reconvis) redrawrecon(false);
}



function downloadevent() {
  saveAs(new Blob([JSON.stringify(vis.currentevent)], {type: "text/plain;charset=utf-8"}),"event.json");
}



function downloadevents() {
  saveAs(new Blob([JSON.stringify(vis.data.jsondata.event)], {type: "text/plain;charset=utf-8"}),"events.json");
}

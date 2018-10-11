<?php
//Decide which layout format to use, based on URL
$layoutinput = $_GET['layout'];
$layoutint = 0;
$layoutstring = 'database';
if (isset($_GET['layout'])) {
  if ($_GET['layout']=='preview' || $_GET['layout']==1) {
    $layoutint = 1;
    $layoutstring = 'preview';
  }
}
?>

<!-- Switch between the two output cases
<?php
if ($layoutint==0) {
  echo <<<EOD
  the one way
EOD;
} else {
  echo <<<EOD
  the other way
EOD;
}
?>
-->

<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Visualux: LUX Online Visualization</title>
<!--                                          1.4.2               -->
<script type="text/javascript" src="js/jquery-2.1.1.min.js"></script>
<script type="text/javascript" src="js/newnewtupdate.js"></script>
<script type="text/javascript" src="js/d3.min.js"></script>
<script type="text/javascript" src="js/keypress-2.0.1.min.js"></script>
<script type="text/javascript" src="js/FileSaver.min.js"></script>
<script type="text/javascript" src="frontend/jshead.js"></script>
<script type="text/javascript" src="frontend/hitmap.js"></script>
<script type="text/javascript" src="frontend/brushgraph.js"></script>
<script type="text/javascript" src="frontend/panel.js"></script>
<script type="text/javascript" src="frontend/rq.js"></script>
<link href="frontend/style.css" rel="stylesheet" type="text/css">
</head>
<body>

<!-- Create invisible objects that JavaScript can read to know which viewing layout we're in and other settings.  -->
<div style="display:none;">
<input type="text" id="layoutmode" value="<?php echo $layoutint ?>">
<input type="text" id="autoacquisition" value="<?php echo $_GET['dataset'] ?>">
<input type="text" id="autoluxstamp" value="<?php echo $_GET['luxstamp'] ?><?php echo $_GET['luxstamps'] ?>">
</div>

<center>

<?php
if ($layoutint==1) {
  echo '<div style="display:none;">';
}
?>

<!-- Decorative Title -->
<table border=0 cellspacing=0 cellpadding=5>
<tr><td valign="bottom">
<img src="frontend/site_logo.png" height=80 width=127>
</td><td valign="middle">
<h1 class="title">Visualux</h1>
<br>
<h1 class="subtitle">LUX Online<br>Visualization</h1>
<!--</td><td valign="middle">
<img src="frontend/lux_logo.png" height=84 width=121>-->
</td></tr></table>

<!-- Simple Entry Form -->
<p>
<form name="mainform" id="mainform" action="javascript: loadandshow(0)">
<strong>Enter LUXstamp(s):</strong>
<input type="text" id="eventnumbox" size=35 autofocus="autofocus">
<button id="mainplotbutton">Show Me.</button>
<p><a href="javascript: switchtoadvancedform();">[<u>Advanced Request Form</u>]</a>
<span class="requesthelpspan"><span style="display:inline-block; width: 20px;"></span><a href="javascript: requesthelpshow();">[<u>Help</u>]</a></span>
</form>

<!-- Advanced Entry Form -->
<form name="advancedform" id="advancedform" action="javascript: loadandshow(1)" style="display:none;">
<table border=2 cellspacing=0 cellpadding=3 width=500 bgcolor="gainsboro"><tr><td>
<i>Advanced Request Form</i>
</td></tr><tr><td>

<span class="requestformtitle">Select Events</span>
<br><div class="indentedblock">

<input type="radio" name="requesttype" value="filenameprefix" id="requesttype_filenameprefix" onClick="javascript: setadvancedformvis();">Request by Filename_Prefix

<br><div id="reqformacblock" style="display:none;">
<div class="indentedblock requestformsmalltext">
Enter <u>one</u> Filename_Prefix: <input type="text" id="prefixtext" size=20>
<br><div class="requestformexample">e.g., lux10_20130619T0613</div>
<input type="radio" name="acsubset" value="byrange" id="acsubset_byrange" checked>Show events from <input type="text" id="acsubsetstart" size=3 onkeydown="javascript: document.advancedform.acsubset[0].checked=true;"> to <input type="text" id="acsubsetend" size=3 onkeydown="javascript: document.advancedform.acsubset[0].checked=true;"> <span class="requestformexample">e.g., 1 to 25</span>
<br><input type="radio" name="acsubset" value="byevnums" id="acsubset_byevnums">Show these events: <input type="text" id="acsubsetevnums" size=10 onkeydown="javascript: document.advancedform.acsubset[1].checked=true;"> <span class="requestformexample">e.g., 32, 103, 439</span>
</div></div>

<input type="radio" name="requesttype" value="luxstamp" id="requesttype_luxstamp" onClick="javascript: setadvancedformvis();">Request by LUXstamp

<br><div id="reqformlsblock" style="display:none;">
<div class="indentedblock requestformsmalltext">
Enter one or more LUXstamps:
<br><input type="text" id="luxstamplist" size=35>
<br><span class="requestformexample">e.g., 7731858226447102, 7709070174690788</span>
</div></div>

<input type="radio" name="requesttype" value="filenameprefix" id="requesttype_simpath" onClick="javascript: setadvancedformvis();">Request Custom File Path

<br><div id="reqformsmblock" style="display:none;">
<div class="indentedblock requestformsmalltext">
<b>evt</b> file: <input type="text" id="simevtpath" size=24>
<br><div class="requestformexample">e.g., ~/mysims/my_simulation.evt</div>
<b>rq</b> file: <input type="text" id="simrqpath" size=24>
<br><div class="requestformexample">Optional; must be Matlab format (.rq.mat)</div>
<input type="radio" name="smsubset" value="byrange" id="smsubset_byrange" checked>Show events from <input type="text" id="smsubsetstart" size=3 onkeydown="javascript: document.advancedform.smsubset[0].checked=true;"> to <input type="text" id="smsubsetend" size=3 onkeydown="javascript: document.advancedform.smsubset[0].checked=true;"> <span class="requestformexample">e.g., 1 to 25</span>
<br><input type="radio" name="smsubset" value="byevnums" id="smsubset_byevnums">Show these events: <input type="text" id="smsubsetevnums" size=10 onkeydown="javascript: document.advancedform.smsubset[1].checked=true;"> <span class="requestformexample">e.g., 32, 103, 439</span>
<br><div class="requestformexample">For a custom file request, event numbers should be the order <i>within the individual file</i>, starting with 1.  File paths refer to locations on the NERSC global file system.</div>
</div></div>

<input type="radio" name="requesttype" value="filenameprefix" id="requesttype_filenameprefix" onClick="javascript: setadvancedformvis();">Preview Most Recent

<br><div id="reqformdpblock" style="display:none;">
<div class="indentedblock requestformsmalltext">
To see previews of the most recent acquisitions, go to <a href="./index.php?layout=preview">Dataset Preview</a>.
</div></div>

</div>

<span class="requestformtitle">Select Event Builder</span>
<br><div class="indentedblock">
<input type="radio" name="requesteb" value="latest" id="requesteb_latest" checked>Use Largest-Numbered Event Builder <span class="requestformexample">(default)</span>
<br><input type="radio" name="requesteb" value="setvalue" id="requesteb_setvalue">Use Event Builder (eb) #<input type="text" id="requestebnum" size=2 onkeydown="javascript: document.advancedform.requesteb[1].checked=true;"> <span class="requestformexample">e.g., 20</span>
</div>

<span class="requestformtitle">Select PMT Gains</span>
<br><div class="indentedblock">
<input type="radio" name="requestgains" value="local" id="requestgains_local" checked>Use pmt_gains from IQ#9355 <span class="requestformexample">(default)</span>
<br><input type="radio" name="requestgains" value="database" id="requestgains_database">Query LUG for pmt_gains in IQ#<input type="text" id="requestgainsnum" size=5 onkeydown="javascript: document.advancedform.requestgains[1].checked=true;"> <span class="requestformexample">e.g., 8506</span>
</div>

<center>
<p><button><span class="requestformbutton">Show Me.</span></button>
<p><a href="javascript: switchtobasicform();">[<u>Basic Request Form</u>]</a>
<span class="requesthelpspan">&nbsp;<a href="javascript: requesthelpshow();">[<u>Help</u>]</a></span>
</center>
</td></tr></table>
</form>

<!-- Request Form Help -->
<div id="requesthelppanel">
<p>
<center><table width=1000 border=5 cellspacing=0 cellpadding = 5><tr><td>

<b>Getting Started</b>: First log in with your NERSC account in the black bar at the top of the page.  Then you can cut-and-paste a list of LUXstamps into the text box, or click "Advanced Request Form" to look up events by filename_prefix.

<p><b>Try It Out!</b>:  If you don't have a list of events handy but just want to try out the website, here's a sample list of LUXstamps you can use:

<p><font color="darkturquoise">
7731858226447102, 7709070174690788, 7709070141461770, 7709070145152784, 7709070122098534, 7406838170746086, 7778241746875103, 7731858163181980, 7709070143002974
</font>

<p><b>What's Here?</b>:  Everything on the NERSC Mirror, including (as of 3/2016) neary all evts and rqs from early 2013 to the present.

<p><b>Tips</b>: Requests of up to 50 events at a time work well; your computer may be able to handle more.  After your events load, there will be another help button in the lower-right-hand corner of the page -- click it and more help information will be appended to the bottom of the page.

<center><a href="javascript: requesthelphide();">[<u>Close Help Box</u>]</a></center>

</td></tr></table></center>
</div>

<?php
if ($layoutint==1) {
  echo '</div>';
} else {
  echo '<div style="display:none;">';
}
?>

<br><h1 class="subtitle"><div style="font-variant:small-caps;">Visualux</div></h1>
<br><h1 class="title">Dataset Preview</h1>

<form name="previewform" id="previewform" action="javascript: loadandshow(2)">
<br>Acquisition:
<br><input type="text" id="previewprefixtext" size=20>
<br><button>Show Me.</button>

<p><input type="radio" name="partialpreview" value="1to100" id="partialpreview_1to100" checked>all 100 events <input type="radio" name="partialpreview" value="1to50" id="partialpreview_1to50">events 1-50 <input type="radio" name="partialpreview" value="51to100" id="partialpreview_1to100">events 51-100
</form>

<p>Which acquisitions are available?
<br>
<button onClick="javascript: previewlist(1)">List Most Recent</button>
<button onClick="javascript: previewlist(2)">List All</button>
<button onClick="javascript: previewlist(0)">Clear List</button>
<p><pre><a id="previewlist"></a></pre>
<small>To view processed events, <a href="./">click here.</a></small>


<?php
if ($layoutint==0) {
  echo '</div>';
}
?>



<table cellspacing=0 cellpadding=0 width=100% height=30 border=0><tr><td valign="middle" align="center">
<a id="messagediv"></a>
</td></tr></table>

<!-- Table to hold SVG graphics -->
<table id="graphicsframe" border=0 cellspacing=0 cellpadding=0><tr>
<td id="hitmapcell"></td>
<td id="brushcell"></td>
</tr><tr>
<td id="quantcell" valign="top"></td>
<td id="pulsecell" valign="top"></td>
</tr></table>





<!-- Control panel -->
<div id="controlpanel">
<table border=0 cellspacing=0 cellpadding=0 width=1000>
<tr><td align="left" valign="top">

<table class="control" width=260><tr><td class="ctitle">
<center><div>On Display</div></center>
</td></tr>
<tr><td style="border: 1px solid black;">
<center><a id="placementoutput"></a> / <a id="numrequestsoutput"></a></center>
</td></tr><tr><td <?php if ($layoutint==0) {echo 'style="border: 1px solid black;"'; } ?> >
<font size=2>
LUXstamp: <a id="luxstampoutput"></a><br>
Acquisition: <a id="acquisitionoutput"></a>
<br>Event # Within Acquisition: <a id="eventnumoutput"></a>
<br>Time Within Acquisition: <a id="timestampoutput"></a>
</font>
<font size=1>
<br><a id="filenameoutput"></a>
</font>
</td></tr>
<tr><td <?php if ($layoutint==0) {echo 'style="border: 1px solid black;"'; } ?> >
<?php
if ($layoutint==1) {
  echo '<div style="display:none;">';
}
?>
<form name="cpform">
RQ's: <select name="rqchoice" id="rqchoice" onChange="javascript: rqswitch()"></select>
</form>
<?php
if ($layoutint==1) {
  echo '</div>';
}
?>
</td></tr><tr><td <?php if ($layoutint==0) {echo 'style="border: 1px solid black;"'; } ?> >
<?php
if ($layoutint==1) {
  echo '<div style="display:none;">';
}
?>
<!--Pulses Identified: <a id="numpulsesfoundoutput"></a>-->
Full Xe Event Area: <a id="fullevtareapheoutput"></a> phe<br/>
Full Veto Event Area: <a id="wsumpodareapheoutput"></a> phe<br/>
Veto Coincidence: <a id="wsumpodcoincidence"></a>
<?php
if ($layoutint==1) {
  echo '</div>';
}
?>
</td></tr>
</table>

</td><td align="center" valign="top">

<br><br>
<table class="control"><tr><td colspan=3 class="ctitle">
<center><div>Pan</div></center>
</td></tr>
<tr><td></td><td><center><button onClick="javascript: focuspan(0,.2)">^</button></center></td><td></td></tr>
<tr><td><button onClick="javascript: focuspan(-.2,0)">&lt;</button></td><td></td><td><button onClick="javascript: focuspan(.2,0)">&gt;</button></td></tr>
<tr><td></td><td><center><button onClick="javascript: focuspan(0,-.2)">v</button></center></td><td></td></tr>
</table>

</td><td align="center" valign="top">

<table class="control"><tr><td class="ctitle">
<center><div>Switch Event</div></center>
</td></tr><tr><td>
<button id="gostart" onClick="javascript: altevent(-1,true)">&#124;&lt;</button>
<button id="goleft" onClick="javascript: altevent(-1)"> &lt;&lt; </button>
<button id="goright" onClick="javascript: altevent(1)"> &gt;&gt; </button>
<button id="gostart" onClick="javascript: altevent(1,true)">&gt;&#124;</button>
</td></tr></table>

<p>

<table class="control"><tr><td colspan=2 class="ctitle">
<center><div>Zoom Out</div></center>
</td></tr>
<tr><td><button onClick="javascript: focusbackaway(1,2)"><u>Y</u> Zoom</button></td><td></td></tr>
<tr><td align="right"><button onClick="javascript: focusbackaway(2,2)"><u>B</u>oth</button></td><td><button onClick="javascript: focusbackaway(2,1)"><u>X</u> Zoom</button></td></tr>
</table>

</td><td aligh="center" valign="top">

<br><br>
<table class="control"><tr><td class="ctitle">
<center><div>View</div></center>
</td></tr>
<tr><td>
<center><button onClick="javascript: focuszoom(0,0,true,true)">View <u>A</u>ll</button></center>
</td></tr><tr><td>
<center><button id="viewundobutton" onClick="javascript: focuszoomprevious()"><u>U</u>ndo View</button></center>
</td></tr><tr><td>
<center><button id="viewredobutton" onClick="javascript: focuszoomnext()"><u>R</u>edo View</button></center>
</td></tr></table>

</td><td align="right" valign="top">

<?php
if ($layoutint==1) {
  echo '<div style="display:none;">';
}
?>

<table class="control" width=260><tr><td class="ctitle">
<center><div>RQ's</div></center>
</td></tr><tr><td>
<form name="rqform">
<input type="checkbox" name="rq_toggle_pulsefinder" value="show" onClick="javascript: if(this.checked){drawpulses(true);}else if(!this.checked){undrawpulses(true);};">Pul<u>s</u>e Finder / Timing / Class
<br>
<input type="checkbox" name="rq_toggle_positionrecon" value="show" onClick="javascript: if(this.checked){drawrecon(true);}else if(!this.checked){undrawrecon(true);};">Posi<u>t</u>ion Reconstruction
<br>
<input type="checkbox" name="rq_toggle_pulsequants" value="show" onClick="javascript: if(this.checked){drawquants(true);}else if(!this.checked){undrawquants(true);};">Pulse <u>Q</u>uantities
</form>
</td></tr>
</table>

<p>

<?php
if ($layoutint==1) {
  echo '</div>';
}
?>

<table class="control" width=260><tr><td class="ctitle" colspan=2>
<center><div>Interface</div></center>
</td></tr><tr><td colspan=2>
<form name="multipmtform">
<center><input type="checkbox" name="rq_toggle_multipmt" value="show" onClick="javascript: if(this.checked){showallpmts();}else if(!this.checked){unshowallpmts();};">Show All P<u>M</u>T's</center>
</form>
</td></tr><tr><td>
<form name="colorform">
Color Scheme:
<br><input type="radio" name="colorchoice" value="rainbow" id="colorchoice_rainbow" checked onClick="javascript: newviewhandler()">Rainbow
<br>
<input type="radio" name="colorchoice" value="monochrome" id="colorchoice_monochrome" onClick="javascript: newviewhandler()">Monochrome&nbsp;
</form>
</td><td>
<form name="transitionform">
Transitions:
<br><input type="radio" name="transchoice" id="transchoice_on" checked onClick="javascript: vis.control.transtime=vis.control.transdefault">On
<br><input type="radio" name="transchoice" id="transchoice_off" onClick="javascript: vis.control.transtime=0">Off
</form>
</td></tr><tr><td colspan=2>
<center><button id="helpbutton" onClick="javascript: helpbuttonclick();"><u>H</u>elp</button></center>
</td></tr>
</table>

<div id="moremenusless">
<a onClick="javascript: d3.select('#moremenusless').attr('style','display:none;'); d3.select('#moremenusmore').attr('style','display:inline;');"><small><font color="gray"><u>More Options</u></font></small></a>
</div>
<div id="moremenusmore" style="display:none;">
<p>
<table class="control" width=260><tr><td class="ctitle" colspan=3>
<center><div>Export</div></center>
</td></tr><tr><td align="center" colspan=3>
Download SVG graphics
<br><a href="#" onClick="javascript: var e = document.createElement('script'); e.setAttribute('src', 'js/svg-crowbar.js'); e.setAttribute('class', 'svg-crowbar'); document.body.appendChild(e);">[Graphics]</a>
&nbsp;<button onClick="javascript: alert('This will overlay buttons on the screen to download the SVG graphics.  Unfortunately, if you wish to continue viewing data afterwards, you have to refresh the page and start again.');"><small>Note</small></button>

<br><br>Download JSON data
</td></tr><tr><td align="center">
<a href="javascript: downloadevent(); ">[This event]</a>
</td><td align="center">
<a href="javascript: downloadevents();">[All Events]</a>
</td><td align="center">
<button onClick="javascript: alert('These links will export the data in a JSON file format.  Caveats:  The files can be very large (sometimes over 100 MB/event).  They may fail to download at all, slow down the browser, crash the browser, or be too big for standard text editors.  Downloading will not work in all browsers.  File format is subject to change.');"><small>Note</small></button>
</td></tr>
</table>
<a onClick="javascript: d3.select('#moremenusmore').attr('style','display:none;'); d3.select('#moremenusless').attr('style','display:inline;');"><small><font color="gray"><u>Fewer Options</u></font></small></a>
</div>

</td></tr></table><!--end of big control panel table-->
</div>

<!-- Help Screen -->
<div id="helppanel">
<p>
<center><table width=1000 border=5 cellspacing=0 cellpadding = 20><tr><td>

<a id="help"><font size=6><b>Help</b></font></a>

<center><a href="javascript: hidehelp();">[<u>Close Help Box</u>]</a></center>

<h3>Navigation</h3>

<p>Click-and-drag on the plot to zoom in on the area you've selected.  Or, click-and-drag sideways over the "context bar" (the little picture of the whole event just below the plot) to generate a "brush" (shown bordered in red) -- the area you've selected will then be shown on the plot, with the Y-axis adjusted to fit the data.

<p>At any time, you may click the brush (or just press "w") to rescale the Y-axis to fit the data.  At any time, you may click the context bar outside of the brush (or just press "a") to show the whole event from beginning to end.

<p>When "Show All PMT's" is checked, two plots appear: the total signal, below, and the individual PMT signals, above.  Most navigation commands (e.g., panning, zooming out, using the context bar) will act on both plots simultaneously, with one exception: clicking-and-dragging on one plot to adjust its view will not change the Y-range of the other plot.  (This way, when you're moving around one plot, the other plot will mostly "follow along," but you can still adjust their Y-ranges independently if you want.)

<table border=0 cellspacing=0 cellpadding=0 width=100%><tr valign="top"><td width=50%>

<h3>Keyboard Shortcuts, by Use</h3>

<pre>
<u>Switching Events</u>:
f = first event
p = previous event
n = next event
l = last event

<u>Quick View Adjustments</u>:
a = view all
w = scale window to data

<u>Panning</u>:
(use arrow keys)

<u>Zooming Out</u>:
x = x-axis zoom out
y = y-axis zoom out
b = both axes zoom out

<u>View Pulse</u>:
(use number keys)

<u>Undo/Redo View</u>:
u = undo view
r = redo view

<u>Show Reduced Quantities</u>:
s = pulse finder
t = position reconstruction
q = pulse quantities

<u>Multiple-PMT Plot</u>:
m = plots for all PMT's

<u>Help</u>:
h = help
</pre>

</td><td width=50%>

<h3>Keyboard Shortcuts, Alphabetically</h3>
<pre>
a = view all
b = both axes zoom out
c
d
e
f = first event
g
h = help box
i
j
k
l = last event
m = plots for all PMT's
n = next event
o
p = previous event
q = pulse quantities
r = redo view
s = pulse finder
t = position reconstruction
u = undo view
v
w = scale window to data
x = x-axis zoom out
y = y-axis zoom out
z
arrow keys = pan
number keys = show pulse
</pre>

</td></tr></table>

<center><a href="javascript: hidehelp();">[<u>Close Help Box</u>]</a></center>

</td></tr></table></center>
</div>

<div id="pagefooter" style="display:none;"><font color="gray"><small>Visualux by Daniel Hogan,  Carlos Faham, and Douglas Tiedt; UC Berkeley / LBNL / SDSMT</small></font></div>

</center>

</body>
</html>

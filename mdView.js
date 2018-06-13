"use strict" ;
var verbose = true ; // switch to 'true' to enable verbose mode
function mdLog(msg){if(verbose==true){console.log(msg);}}
mdLog('debugging active...') ;
if(verbose==true){var t0 = new Date();}

// script identification (know thyself)
//// place a fingerprint as a temporary benchmark
////// plant a fingerprint on the HTML output stream
var fingerprintPattern = 'wubbaLubbaDubDub' ;
document.writeln('<div id="',fingerprintPattern,'">STILL HERE</div>') ;
////// find the fingerprint
var fingerprint = document.getElementById(fingerprintPattern) ;
////// the fingerprint was written after this <script> tag, so we can identify ourselves as the fingerprint's previousSibling
////// if this script tag doesn't have an ID, then set one
if (!fingerprint.previousSibling.id) {
	fingerprint.previousSibling.id = 'mdView' ;
}
//// identify...
////// ...this script
var thisScript = document.getElementById(fingerprint.previousSibling.id) ;
////// ...the parent node
var parentNode = thisScript.parentElement ;
////// ...this script's working directory
var scriptDir = thisScript.src.split('/').slice(0,-1).join('/')+'/' ;
//// erase the fingerprint
parentNode.removeChild(fingerprint) ;

// identify, retrieve, and append inputs
//// set up variables and define useful functions
var markdown = {} ;
function appendToParent(divID,divBody) {
	var newDiv = document.createElement('div') ;
	newDiv.id = divID ;
	newDiv.innerHTML = marked(divBody) ;
	parentNode.appendChild(newDiv) ;
	mdLog('appending element #'+divID) ;
}
function ajax(inputID,href) {
	mdLog('calling AJAX: #'+inputID+' : '+href) ;
	var xhr = new XMLHttpRequest() ;
	xhr.onreadystatechange = function() {
		if (xhr.readyState === 4) {
			mdLog('AJAX results for #'+inputID+' : '+xhr.responseText) ;
			markdown[inputID] = xhr.responseText ;
			appendToParent(inputID,markdown[inputID]) ;
		}
	}
	xhr.open('GET',href,true) ;
	xhr.responseType = 'text' ;
	xhr.send() ;
}
//// REST
var i ;
var ext = ['.aspx/','.php/'] ;
mdLog('-----REST-----') ;
for ( i in ext ) {
	var inputRestPos = document.location.pathname.indexOf(ext[i]) ;
	mdLog('inputRestPos ('+ext[i]+') = '+inputRestPos) ;
	if (inputRestPos > 0) {
	
//// !!!!! 20180613: external queries are failing because they're referring to the wrong directory. I need to create a baseURL variable and prepend it to the external references
		var baseURL = document.location.pathname ;
////
		var inputRestSrc = document.location.pathname.substr(inputRestPos+ext[i].length) ;
		if ( inputRestSrc.length > 0 ) {
			mdLog('inputRestSrc = '+inputRestSrc) ;
			ajax('mdView-REST',inputRestSrc) ;
		}
	}
}
//// anchor
mdLog('-----anchor-----') ;
if ( document.location.hash ) {
	var inputHashSrc = document.location.hash.substr(1) ;
	mdLog('inputHashSrc = '+inputHashSrc) ;
	ajax('mdView-hash',inputHashSrc) ;
}
//// HTTP GET query string
mdLog('-----query-----') ;
if ( document.location.search ) {
	var queryList = document.location.search.substr(1).split('&') ;
	for ( i in queryList ) {
		var argument = queryList[i].split('=',2) ;
		if (argument[0]=='p') {
			mdLog('GET query: '+argument[0]+' = '+argument[1]) ;
			ajax('mdView-query-'+argument[1],argument[1]) ;
		}
	}
}
//// inline markdown
mdLog('-----inline-----') ;
if ( thisScript.innerHTML.length > 0 ) {
	markdown['mdView-inline'] = thisScript.innerHTML ;
	appendToParent('mdView-inline',markdown['mdView-inline'	]) ;
}

// add marked.js and start loading it
var markedScript = document.createElement('script') ;
markedScript.src = scriptDir+'marked.min.js' ;
parentNode.appendChild(markedScript) ;

// once marked.js has loaded, parse the markdown
document.onload = function() {

		// alternative approach: use .map() :
			//function convertMD(mdBit) {
				//mdLog('mdBit = ',mdBit) ;
				//return '<div id="'+mdBit[0]+'">'+marked(mdBit[1])+'</div>\n' ;
			//}
			//var blarg = markdown.map(convertMD) ;
			//parentNode.insertAdjacentHTML('beforeend',blarg.join('\n')) ;
			//console.info(JSON.stringify(blarg)) ;

	// update the window title
	//// grab the contents of the first H1 tag in our sandbox
	var mdTitle = parentNode.getElementsByTagName('h1')[0].textContent ;
	//// append that string to the current window title
	document.title = document.title+' - '+mdTitle ;
	mdLog('new document.title = '+mdTitle) ;

	mdLog(JSON.stringify(markdown)) ;
	
	// see how long this took to render
	if(verbose==true){
		var t1 = new Date();
		var deltaT = t1 - t0 ;
		parentNode.insertAdjacentHTML('beforeend','<div>'+deltaT.toString()+'ms</div>\n') ;
	}
}

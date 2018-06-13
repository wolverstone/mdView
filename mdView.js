"use strict" ;
var debug = true ;
function log(msg){if(debug==true){console.log(msg);}}
log('debugging active...') ;
var t0 = new Date() ;

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

//TESTING
/*
var newFrame = document.createElement('iframe') ;
newFrame.src = 'plain.txt' ;
newFrame.id = 'plaintxt' ;
parentNode.appendChild(newFrame) ;
var x = document.getElementById('plaintxt') ;
var y = (x.contentWindow || x.contentDocument) ;
console.log(x.src) ;
    if (y.document)y = y.document;
    y.body.style.backgroundColor = "red";
*/

// identify and retrieve inputs
var markdown = {} ;
function ajax(inputID,href) {
	//console.log(href) ;
	var xhr = new XMLHttpRequest() ;
	xhr.onreadystatechange = function() {
		if (xhr.readyState === 4) {
			console.log('AJAX: '+inputID+' : '+href) ;
			//markdown.push([href,xhr.responseText]) ;
			markdown[inputID] = xhr.responseText ;
		}
	}
	xhr.open('GET',href,true) ;
	xhr.responseType = 'text' ;
	xhr.send() ;
}
//// REST
var i ;
var ext = ['.aspx/','.php/'] ;
console.log('-----REST-----') ;
for ( i in ext ) {
	var inputRestPos = document.location.pathname.indexOf(ext[i]) ;
	console.log(ext[i]+' inputRestPos = '+inputRestPos) ;
	if (inputRestPos > 0) {
	
//// !!!!! 20180613: external queries are failing because they're referring to the wrong directory. I need to create a baseURL variable and prepend it to the external references
		var baseURL = document.location.pathname ;
////
		var inputRestSrc = document.location.pathname.substr(inputRestPos+ext[i].length) ;
		if ( inputRestSrc.length > 0 ) {
			console.log('inputRestSrc = ',inputRestSrc) ;
			ajax('REST-'+inputRestSrc,inputRestSrc) ;
		}
	}
}
//// anchor
console.log('-----anchor-----') ;
if ( document.location.hash ) {
	var inputHashSrc = document.location.hash.substr(1) ;
	console.log('inputHashSrc = '+inputHashSrc) ;
	markdown['hash-inputHashSrc'] = '' ;
	ajax('hash-'+inputHashSrc,inputHashSrc) ;
}
//// HTTP GET query string
console.log('-----query-----') ;
if ( document.location.search ) {
	var queryList = document.location.search.substr(1).split('&') ;
	for ( i in queryList ) {
		var argument = queryList[i].split('=',2) ;
		if (argument[0]=='p') {
			console.log(argument[0],argument[1]) ;
			ajax('get-'+argument[1],argument[1]) ;
		}
	}
}
//// inline markdown
console.log('-----inline-----') ;
if ( thisScript.innerHTML.length > 0 ) {
	markdown['__inline__'] = thisScript.innerHTML ;
}

// add marked.js and start loading it (move to start of script?)
var markedScript = document.createElement('script') ;
markedScript.src = scriptDir+'marked.min.js' ;
parentNode.appendChild(markedScript) ;

	console.info(JSON.stringify(markdown)) ;


// once marked.js has loaded, parse the markdown
markedScript.onload = function() {

	function appendElements(divID,divBody) {
		var newDiv = document.createElement('div') ;
		newDiv.id = divID ;
		newDiv.innerHTML = marked(divBody) ;
		parentNode.appendChild(newDiv) ;
	}
	for (i in markdown) {
		appendElements(i,markdown[i]) ;
	}

	//function convertMD(mdBit) {
		//console.log('mdBit = ',mdBit) ;
//		return '<div id="'+mdBit[0]+'">'+marked(mdBit[1])+'</div>\n' ;
	//}
//	var blarg = markdown.map(convertMD) ;
//	parentNode.insertAdjacentHTML('beforeend',blarg.join('\n')) ;
//	console.info(JSON.stringify(blarg)) ;

	console.info(JSON.stringify(markdown)) ;

	var t1 = new Date() ;
	var deltaT = t1 - t0 ;
	parentNode.insertAdjacentHTML('beforeend','<div>'+deltaT.toString()+'ms</div>\n') ;	
}
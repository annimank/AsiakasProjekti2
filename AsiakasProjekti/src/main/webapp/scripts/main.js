//Lomake: muuttaa kaikki kentät automaattisesti JSON-stringiksi
function serialize_form(form){
	return JSON.stringify(
	    Array.from(new FormData(form).entries())
	        .reduce((m, [ key, value ]) => Object.assign(m, { [key]: value }), {})
	        );	
} 

//funktio arvon lukemiseen urlista avaimen perusteella
function requestURLParam(sParam){
    let sPageURL = window.location.search.substring(1);
    let sURLVariables = sPageURL.split("&");
    for (let i = 0; i < sURLVariables.length; i++){
        let sParameterName = sURLVariables[i].split("=");
        if(sParameterName[0] == sParam){
            return sParameterName[1];
        }
    }
}


function haeAsiakkaat() {
	let url="myynti";
	//let url = "myynti?asiakkaat?hakusana=" + document.getElementById("hakusana").value;
	let requestOptions = {
        method: "GET",
        headers: { "Content-Type": "application/x-www-form-urlencoded" }       
    };    
    fetch(url, requestOptions)
    .then(response => response.json())
   	.then(response => printItems(response)) 
   	.catch(errorText => console.error("Fetch failed: " + errorText));
}


function printItems(respObjList){
	let htmlStr="";
	for(let item of respObjList){
    	htmlStr+="<tr asiakas_id='rivi_"+item.asiakas_id+"'>";
    	htmlStr+="<td>"+item.etunimi+"</td>";
    	htmlStr+="<td>"+item.sukunimi+"</td>";
    	htmlStr+="<td>"+item.puhelin+"</td>";
    	htmlStr+="<td>"+item.sposti+"</td>";
    	htmlStr+="<td><a href='muutaasiakas.jsp?asiakas_id="+item.asiakas_id+"'>Muuta</a>&nbsp;"
    	htmlStr+="<span class='poista' onclick=varmistaPoisto("+item.asiakas_id+",'"+encodeURI(item.etunimi + " " + item.sukunimi)+"')>Poista</span></td>"; //encodeURI() muutetaan erikoismerkit, välilyönnit jne. UTF-8 merkeiksi.	
    	//htmlStr+="<span class='poista' onclick=varmistaPoisto("+item.asiakas_id+",'"+encodeURI(item.etunimi)+"')>Poista</span></td>";
    	//encodeURI() muutetaan erikoismerkit, välilyönnit jne. UTF-8 merkeiksi.
    	htmlStr+="</tr>";    	
	}	
	document.getElementById("tbody").innerHTML = htmlStr;	
}

//haeAsiakkaat();

	function haeTieto() {
	    var input, filter, found, table, tr, td, i, j;
	    input = document.getElementById("hakusana");
	    filter = input.value.toUpperCase();
	    table = document.getElementById("listaus");
	    tr = table.getElementsByTagName("tr");
	    for (i = 0; i < tr.length; i++) {
	        td = tr[i].getElementsByTagName("td");
	        for (j = 0; j < td.length; j++) {
	            if (td[j].innerHTML.toUpperCase().indexOf(filter) > -1) {
	                found = true;
	            }
	        }
	        if (found) {
	            tr[i].style.display = "";
	            found = false;
	        } else {
	            tr[i].style.display = "none";
	        }
	    }
	}
	
	function tutkiJaLisaa() {
		if (tutkiTiedot() == true) {
			lisaaTiedot();
		}	
	}
	
	function tutkiJaPaivita() {
		if (tutkiTiedot() == true) {
			paivitaTiedot();
		}	
	}
	
	function tutkiTiedot() {
		let ilmo="";
		//let d = new Date(); //Ei tarvita tässä, liittyy autoon
		if (document.getElementById("etunimi").value.length<1) {
			ilmo="Etunimi ei kelpaa!";
			document.getElementById("etunimi").focus();
		} else if (document.getElementById("sukunimi").value.length<2) {
			ilmo="Sukunimi ei kelpaa!";
			document.getElementById("sukunimi").focus();
		} else if (document.getElementById("puhelin").value.length<5) {
			ilmo="Puhelinumero ei kelpaa!";
			document.getElementById("puhelin").focus();
		} else if (document.getElementById("sposti").value.length<3) {
			ilmo="Sähköpostiosoite ei kelpaa!";
			document.getElementById("sposti").focus();
		}
		if (ilmo!="") {
			document.getElementById("ilmo").innerHTML=ilmo;
			setTimeout(function(){document.getElementById("ilmo").innerHTML=";"}, 3000);
			return false;
		} else {
			document.getElementById("etunimi").value=siivoa(document.getElementById("etunimi").value);
			document.getElementById("sukunimi").value=siivoa(document.getElementById("sukunimi").value);
			document.getElementById("puhelin").value=siivoa(document.getElementById("puhelin").value);
			document.getElementById("sposti").value=siivoa(document.getElementById("sposti").value);	
			return true;
		}
	}
	
	//Funktio XSS-hyökkäysten estämiseksi (Cross-site scripting)
	function siivoa(teksti){
		teksti=teksti.replace(/</g, "");//&lt;
		teksti=teksti.replace(/>/g, "");//&gt;	
		teksti=teksti.replace(/'/g, "''");//&apos;	
		return teksti;
	}
	
	function lisaaTiedot(){
		let formData = serialize_form(document.lomake); //Haetaan tiedot lomakkeelta ja muutetaan JSON-stringiksi
		console.log(formData);
		//let url = "myynti";  
		let url="myynti";
		//let url = "myynti?asiakkaat";
    	let requestOptions = {
       		method: "POST", //Lisätään asiakas
       		headers: { "Content-Type": "application/json; charset=UTF-8"},  
    		body: formData
   	 	};    
    	fetch(url, requestOptions)
    	.then(response => response.json())//Muutetaan vastausteksti JSON-objektiksi
   		.then(responseObj => {	
   			//console.log(responseObj);
   			if(responseObj.response==0){
   				document.getElementById("ilmo").innerHTML = "Asiakkaan lisäys epäonnistui.";	
       		}else if(responseObj.response==1){ 
        		document.getElementById("ilmo").innerHTML = "Asiakkaan lisäys onnistui.";
				document.lomake.reset(); //Tyhjennetään asiakkaan lisäämisen lomake		        	
			}
			setTimeout(function(){ document.getElementById("ilmo").innerHTML=""; }, 3000);
   		})
   		.catch(errorText => console.error("Fetch failed: " + errorText));
	}
	
	function varmistaPoisto(asiakas_id, etunimi){
		//confirm metodi tekee boxin, jossa kysyy kysymksen
		if(confirm("Poista asiakas " + decodeURI(etunimi) +"?")){ //decodeURI() muutetaan enkoodatut merkit takaisin normaaliksi kirjoitukseksi
			poistaAsiakas(asiakas_id, etunimi);
		}
	}
	
	function poistaAsiakas(asiakas_id, etunimi) {
		let url="myynti?asiakas_id=" + asiakas_id;
		//let url = "myynti?asiakkaat?asiakas_id=" + asiakas_id;    
    	let requestOptions = {
        	method: "DELETE",             
    	};    
    	fetch(url, requestOptions)
    	.then(response => response.json())//Muutetaan vastausteksti JSON-objektiksi
   		.then(responseObj => {	
   		//console.log(responseObj);
   			if(responseObj.response==0){
				alert("Asiakkaan poisto epäonnistui.");	        	
        	}else if(responseObj.response==1){ 
				document.getElementById("rivi_"+ asiakas_id).style.backgroundColor="red";
				alert("Asiakkaan " + decodeURI(etunimi) +" poisto onnistui."); //decodeURI() muutetaan enkoodatut merkit takaisin normaaliksi kirjoitukseksi
				haeAsiakkaat();        	
			}
   		})
   		.catch(errorText => console.error("Fetch failed: " + errorText));
	}
	
	function haeAsiakas() {		
    	let url = "myynti?asiakas_id=" + requestURLParam("asiakas_id");
    	//let url = "myynti?asiakkaat?asiakas_id=" + requestURLParam("asiakas_id"); //requestURLParam() on funktio, jolla voidaan hakea urlista arvo avaimen perusteella. Löytyy main.js -tiedostosta 	
		console.log(url);
    	let requestOptions = {
        	method: "GET",
        	headers: { "Content-Type": "application/x-www-form-urlencoded" }       
   	};    
    	fetch(url, requestOptions)
    	.then(response => response.json())//Muutetaan vastausteksti JSON-objektiksi
   		.then(response => {
   		//console.log(response);
   		document.getElementById("asiakas_id").value=response.asiakas_id;
   		document.getElementById("etunimi").value=response.etunimi;
   		document.getElementById("sukunimi").value=response.sukunimi;
   		document.getElementById("puhelin").value=response.puhelin;
   		document.getElementById("sposti").value=response.sposti;
   	}) 
   	.catch(errorText => console.error("Fetch failed: " + errorText));
}

function paivitaTiedot(){	
	let formData = serialize_form(lomake); //Haetaan tiedot lomakkeelta ja muutetaan JSON-stringiksi
	//console.log(formData);	
	let url = "myynti";    
    let requestOptions = {
        method: "PUT", //Muutetaan asiakas
        headers: { "Content-Type": "application/json; charset=UTF-8" },  
    	body: formData
    };    
    fetch(url, requestOptions)
    .then(response => response.json())//Muutetaan vastausteksti JSON-objektiksi
   	.then(responseObj => {	
   		//console.log(responseObj);
   		if(responseObj.response==0){
   			document.getElementById("ilmo").innerHTML = "Asiakkaan muutos epäonnistui.";	
        }else if(responseObj.response==1){ 
        	document.getElementById("ilmo").innerHTML = "Asiakkaan muutos onnistui.";
			document.lomake.reset();		        	
		}
   	})
   	.catch(errorText => console.error("Fetch failed: " + errorText));
}

function tutkiKey(event, target){	
	console.log(event.keyCode);
	if(event.keyCode==13){//13=Enter
		if(target=="listaa"){
			haeAutot();
		}else if(target=="lisaa"){
			tutkiJaLisaa();
		}else if(target=="paivita"){
			tutkiJaPaivita();
		}
	}else if(event.keyCode==113){//F2
		document.location="listaaasiakkaat.jsp";
	}		
}

function asetaFocus(target) {
	document.getElementById(target).focus();
}


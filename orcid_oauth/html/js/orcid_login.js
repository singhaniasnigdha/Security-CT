var clientId = "APP-I0WH9JVGII4DTR7I"; 
var orcidAuthUrl = "https://sandbox.orcid.org/oauth/authorize";
var return_page = "http%3A%2F%2Fec2-54-227-188-82.compute-1.amazonaws.com%2Forcid_auth.html" 
var url = orcidAuthUrl + "?response_type=token&redirect_uri=" 
            + return_page + "&client_id=" 
            + clientId + "&scope=openid&nonce=whatever";

var orcidCert = {
    "kty":"RSA",
    "e":"AQAB",
    "use":"sig",
    "kid":"sandbox-orcid-org-3hpgosl3b6lapenh1ewsgdob3fawepoj",
    "n":"pl-jp-kTAGf6BZUrWIYUJTvqqMVd4iAnoLS6vve-KNV0q8TxKvMre7oi9IulDcqTuJ1alHrZAIVlgrgFn88MKirZuTqHG6LCtEsr7qGD9XyVcz64oXrb9vx4FO9tLNQxvdnIWCIwyPAYWtPMHMSSD5oEVUtVL_5IaxfCJvU-FchdHiwfxvXMWmA-i3mcEEe9zggag2vUPPIqUwbPVUFNj2hE7UsZbasuIToEMFRZqSB6juc9zv6PEUueQ5hAJCEylTkzMwyBMibrt04TmtZk2w9DfKJR91555s2ZMstX4G_su1_FqQ6p9vgcuLQ6tCtrW77tta-Rw7McF_tyPmvnhQ"
};
var issuer = "https:\/\/sandbox.orcid.org";
var pubKey = KEYUTIL.getKey(orcidCert);

var authWindow;

function logout() {
    $(".after-authenticated").hide();
    $("#no-login").show();
    $("#auth-button").show();

    sessionStorage.clear();
}

function getORCID(){
    authWindow = window.open(url, 'authWindow');
}

function onOrcidAuth(token){
    console.log(token);

    sessionStorage.setItem("name", token.given_name);
    sessionStorage.setItem("family_name", token.family_name);
    sessionStorage.setItem("sub", token.sub);
    sessionStorage.setItem("exp", token.exp);

    login();

    if (authWindow){
        authWindow.close();
    }
}

function login() {
    $("#no-login").hide();

    $("#orcid-id").html(sessionStorage.getItem("sub"));
    $("#given-name").html(sessionStorage.getItem("name"));
    $("#auth-button").hide();

    $(".after-authenticated").show();
}
  
function onOrcidAuthFail(){
    console.log("failed :(");
    if (authWindow){
        authWindow.close();  	
    }
}

function getFragmentParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\#&]" + name + "=([^&#]*)"),
        results = regex.exec(window.location.hash);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

function checkSig(idToken) {
  return KJUR.jws.JWS.verifyJWT(idToken, pubKey, {
    alg: ['RS256'], iss: [issuer], aud:clientId, gracePeriod: 15*60 //15 mins skew allowed
  });
}

function parseToken(token) {
    var payload = KJUR.jws.JWS.parse(token).payloadPP;
    return JSON.parse(payload);
}

$(document).ready(function() {
    if (sessionStorage.getItem("exp") > Date.now()/1000) {
	login();
    }
});

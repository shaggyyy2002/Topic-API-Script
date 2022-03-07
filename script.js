import fetch from "node-fetch";
import {Headers} from 'node-fetch';
import fs from 'fs';
///Please enter your Symbl App Id and App Secret below .
var appId="";
var appSecret="";
var accessToken=""
/// Get file path from console . 
var filename = process.argv[2];
async function getTopics(conversationId){
	var myHeaders = new Headers();
	myHeaders.append("x-api-key", accessToken);
	var requestOptions = {
		method: 'GET',
		headers: myHeaders,
		redirect: 'follow'
	};
	fetch("https://api.symbl.ai/v1/conversations/"+"5050120488878080"+"/topics?sentiment=true", requestOptions)
	.then(response => response.text())
	.then((result) => {
		result=JSON.parse(result)
		let Topics= result.topics;
		let counter
		Topics.forEach((topic)=>{
			console.log("Topic Name : " + topic.text+", Topic Confidence : " + topic.score + ", Topic Sentiment : " + topic.sentiment.suggested  )
		})
	})
	.catch(error => console.log('error', error));
}
async function processFile() {
	var myHeaders = new Headers();
	myHeaders.append("Content-Type", "application/json");
	var raw = JSON.stringify({"type":"application","appId":appId,"appSecret":appSecret});
	var requestOptions = {
		method: 'POST',
		headers: myHeaders,
		body: raw,
		redirect: 'follow'
	};
	fetch("https://api-labs.symbl.ai/oauth2/token:generate", requestOptions)
	.then((response) => {
		return response.json()
	})
	.then((result) => {
		var myHeaders1 = new Headers();
		console.log(result.accessToken);
		accessToken=result.accessToken
		myHeaders1.append("x-api-key", result.accessToken);
		myHeaders1.append("Content-Type", "audio/wav");
	///Read the files 		
	var file=fs.createReadStream(filename)
	var requestOptions1 = {
		method: 'POST',
		headers: myHeaders1,
		body:file,
		redirect: 'follow'
	};
	fetch("https://api.symbl.ai/v1/process/audio", requestOptions1)
	.then((response) => {
		return response.json();
	})
	.then((result1) => {
		console.log(JSON.stringify(result1) + "   " + filename)
				////Keep checking for completition status after 10 seconds
				var requestLoop = setInterval(function(){
					var myHeaders2 = new Headers();
					console.log(result.jobId);
					myHeaders2.append("x-api-key", accessToken);
					myHeaders2.append("Content-Type", "application/json");
					var requestOptions2 = {
						method: 'GET',
						headers: myHeaders2,
						redirect: 'follow'
					};
					fetch("https://api-labs.symbl.ai/v1/job/"+result1.jobId, requestOptions2)
					.then((response) => {
						return response.json()}
						)
					.then((result) => {
						console.log("Current job status "+ result.status + " " + result1.conversationId)
						if(result.status=="completed")
						{
							console.log("processing completed for " +filename +result1.conversationId);
							getTopics(result1.conversationId);
							clearInterval(requestLoop)
						}
					})
					.catch(error => console.log('error', error));
				}, 10000);
			})
	.catch(error => console.log('error', error));
	// Read files end 
})
	.catch(error => console.log('error', error));

}
processFile();

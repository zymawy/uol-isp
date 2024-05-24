let audioContext, audioElement, source, meydaAnalyzer, mic, micStream;
let isPlaying = false;
let shapeType = 'rectangle';
let bgColor = 'black';
let shapeColor = 'white';
let speechRec;
let volume = 0.5;
let continuous = true;
let interimResults = false;

function setup() {
	createCanvas(800, 600);
	audioElement = createAudio('assets/sounds/Ex2_sounds/Kalte_Ohren_(_Remix_).mp3'); // Your audio file
	audioElement.hide();
}

function initAudioContext() {
	if (!audioContext) {
		audioContext = getAudioContext();
		source = audioContext.createMediaElementSource(audioElement.elt);
		source.connect(audioContext.destination);
		meydaAnalyzer = Meyda.createMeydaAnalyzer({
			audioContext: audioContext,
			source: source,
			bufferSize: 512,
			featureExtractors: ['rms', 'spectralCentroid', 'spectralFlatness', 'spectralRolloff', 'energy'],
			callback: features => {
				background(bgColor);
				noStroke();
				fill(shapeColor);

				let rms = map(features.rms, 0, 1, 0, height);
				drawShape(50, height - rms, 100, rms);

				let centroid = map(features.spectralCentroid, 0, 22050, 0, height);
				drawShape(200, height - centroid, 100, centroid);

				let flatness = map(features.spectralFlatness, 0, 1, 0, height);
				drawShape(350, height - flatness, 100, flatness);

				let rolloff = map(features.spectralRolloff, 0, 22050, 0, height);
				drawShape(500, height - rolloff, 100, rolloff);

				let energy = map(features.energy, 0, 1, 0, height);
				drawShape(650, height - energy, 100, energy);
			}
		});
		audioElement.volume(volume);

		// Voice recognition setup
		speechRec = new p5.SpeechRec('en-US', gotSpeech);
		speechRec.onResult = gotSpeech;
		speechRec.onError = handleSpeechError;
		speechRec.onEnd = handleSpeechEnd;
		speechRec.start(continuous, interimResults);
	}
}

function handleSpeechError() {
	// Handle errors
	console.log('Speech recognition error');
}

function handleSpeechEnd() {
	// Restart speech recognition
	if (speechRec && speechRec.continuous) {
		speechRec.start(continuous, interimResults);
	}
}

function draw() {
	if (isPlaying) {
		meydaAnalyzer.start();
	} else if (meydaAnalyzer) {
		meydaAnalyzer.stop();
	}
}

function playAudio() {
	if (!isPlaying) {
		userStartAudio();
		audioElement.play();
		isPlaying = true;
	}
}

function stopAudio() {
	if (isPlaying) {
		audioElement.stop();
		if (mic) {
			mic.stop();
		}
		isPlaying = false;
	}
}

function startMic() {
	if (!isPlaying) {
		userStartAudio();
		mic = new p5.AudioIn();
		mic.start(() => {
			micStream = audioContext.createMediaStreamSource(mic.stream);
			meydaAnalyzer.setSource(micStream);
			isPlaying = true;
		});
	}
}

function setVolume(val) {
	if (audioElement) {
		audioElement.volume(val);
	}
}

function gotSpeech() {
	if (speechRec.resultValue) {
		let command = speechRec.resultString.toLowerCase();
		if (command.includes('black')) {
			bgColor = 'black';
		} else if (command.includes('white')) {
			bgColor = 'white';
		} else if (command.includes('red')) {
			bgColor = 'red';
		} else if (command.includes('blue')) {
			bgColor = 'blue';
		} else if (command.includes('green')) {
			bgColor = 'green';
		} else if (command.includes('square')) {
			shapeType = 'square';
		} else if (command.includes('triangle')) {
			shapeType = 'triangle';
		} else if (command.includes('circle')) {
			shapeType = 'circle';
		} else if (command.includes('pentagon')) {
			shapeType = 'pentagon';
		} else if (command.includes('yellow')) {
			shapeColor = 'yellow';
		} else if (command.includes('pink')) {
			shapeColor = 'pink';
		} else if (command.includes('cyan')) {
			shapeColor = 'cyan';
		} else if (command.includes('magenta')) {
			shapeColor = 'magenta';
		}
	}
}

function drawShape(x, y, w, h) {
	switch (shapeType) {
		case 'square':
			rect(x, y, w, w);
			break;
		case 'triangle':
			triangle(x, y, x + w / 2, y - h, x + w, y);
			break;
		case 'circle':
			ellipse(x + w / 2, y - h / 2, w, h);
			break;
		case 'pentagon':
			beginShape();
			for (let i = 0; i < 5; i++) {
				let angle = TWO_PI / 5 * i;
				let sx = x + cos(angle) * w / 2;
				let sy = y - sin(angle) * h / 2;
				vertex(sx, sy);
			}
			endShape(CLOSE);
			break;
		default:
			rect(x, y, w, h);
	}
}

function saveScreenshot() {
	saveCanvas('audio_visualization', 'png');
}

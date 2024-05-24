// Global variables for GUI elements
var playButton, pauseButton, stopButton, loopButton, recordButton, skipButton, skipToStartButton, skipToEndButton,
	masterVolumeSlider, fftIn, fftOut, audioFile, reverseButton,
	spectrumOutPlaceholder, spectrumInPlaceholder,
	reverb, lowPass, compressor, kneeSlider,
	recorder, recordedAudio, isRecording = false, mic,
	isReversed = false, reverbOutputGain,
	mainContainer, spectrumInCanvas, spectrumOutCanvas,
	dryGain, wetGain, masterGain, reverbDuration = 2, reverbDecay = 4;
let maxX;

window.reverbDecayRateSlider = null;
window.lowPassFilterCutoffSlider= null;
window.lowPassFilterResonanceSlider = null;
window.waveshaperOutputLevelSlider = null;
window.waveshaperDryWetSlider = null;
window.reverbDurationSlider = null;
window.outputLevelSlider = null;
window.dryWetSlider = null;
window.thresholdSlider = null;
window.ratioSlider = null;
window.releaseSlider = null;
window.attackSlider = null;
window.distortionAmountSlider = null;
window.reverbDryWetSlider = null;
window.reverbOutputLevelSlider = null;
window.oversampleSlider = null;

function preload() {
	audioFile = loadSound('assets/sounds/sound-track.wav', setupAudioChain);

	mainContainer = createDiv('').id("mainContainer").style('width', '100%');
}

function draw() {
	background(255);


	if ( isMouseOverCanvas() ) {
		let freqs = map(mouseX, 0, width, 20, 10000);
		// let freq = map(12 * ln2(mouseX + 1), 0, maxX, 20, 10000);

		lowPass.freq(freqs);
		// filter.res( resolution );
		// console.log(resolution);
		audioFile.amp(0.5, 0.2);
	} else {
		audioFile.amp(0, 0.2);
	}

	// Optional: Call draw functions if any specific drawing logic is required
	// If using createGraphics, you might need to explicitly call the draw method for your spectrum canvases here
	drawMasterAndSpectrumLabels()
}

function setup() {
	createCanvas(windowWidth, windowHeight);
	mainContainer.position(0, 0); // Make sure this container is visible and positioned
	spectrumInCanvas = createGraphics(200, 100);
	spectrumOutCanvas = createGraphics(200, 100);

	setupTransportControls();
	setupRecording();
	setupControlSections();

	// Prepare the divs and place the canvases
	// textSize(12);
	// fill(0);
}

function setupRecording() {
	// recorder = new p5.SoundRecorder();
	// audioFile = new p5.SoundFile();
	// mic = new p5.AudioIn();
	// mic.start();

	setupAudioChain();  // Set up effects chain and ensure it's connected to the master

	// Ensure recorder is set to the final effect in the audio chain
	// recorder.setInput(mic);
	// recorder.setInput(compressor);
}

function setupControlSections() {
	let startX = 20, startY = 60;
	let sectionWidth = windowWidth / 3 - 40; // Divide the window width into three columns
	setupLowPassFilterControls(startX, startY, sectionWidth);
	setupDynamicCompressorControls(startX + sectionWidth + 20, startY, sectionWidth);
	setupMasterAndSpectrumControls(startX + 2 * (sectionWidth + 20), startY, sectionWidth);
	setupReverbControls(startX, startY + 300, sectionWidth);
	setupWaveshaperDistortionControls(startX + sectionWidth + 20, startY + 300, sectionWidth);
	// setupMasterAndSpectrumControls(20, 100, 200);
}
function setupLowPassFilterControls(x, y, width) {
	// Main container for all low pass filter controls
	let container = createDiv('').position(x, y).style('border', '1px solid black')
		.style('padding', '10px').style('width', `${width}px`)
		.style('display', 'flex').style('flex-direction', 'column')
		.style('align-items', 'center');
	container.id('lowPassFilterContainer');
	container.parent(mainContainer);

	// Header
	let header = createP('Low Pass Filter').parent(container);
	header.class('filter-header').style('margin-bottom', '20px');

	// First row for Cutoff Frequency and Resonance
	let firstRow = createDiv('').parent(container).style('display', 'flex').style('width', '100%').style('justify-content', 'space-between');
	setupControl(firstRow, 'Cutoff Frequency', 20, 22050, 440, 1, value => lowPass.freq(value), 'lowPassFilterCutoffSlider');
	setupControl(firstRow, 'Resonance', 0, 5, 1, 0.1, value => lowPass.res(value), 'lowPassFilterResonanceSlider');

	// Second row for Dry/Wet and Output/Level
	let secondRow = createDiv('').parent(container).style('display', 'flex').style('width', '100%').style('justify-content', 'space-between');
	setupControl(secondRow, 'Dry/Wet', 0, 1, 0.5, 0.01,
		value => {
			dryGain.amp(1 - value);  // Inverse for dry signal
			wetGain.amp(value);      // Directly proportional for wet signal
		});
	setupControl(secondRow, 'Output/Level', 0, 1, 0.8, 0.01,
		value => {
			masterGain.amp(value);  // Control the overall output level
		});
}

function setupControl(parentDiv, label, min, max, defaultValue, step, callback, variable) {
	let controlContainer = createDiv('').parent(parentDiv).style('width', '48%').style('padding', '5px');
	createP(label).parent(controlContainer).class('slider-label');
	if (![undefined, null, ''].includes(variable) && (typeof window[variable] !== 'undefined' || typeof window[variable] !== null)) {
		console.log(variable);

		window[variable] = createSlider(min, max, defaultValue, step).parent(controlContainer).class('slider');
		window[variable].input(() => callback(window[variable].value()));
	} else {
		let slider= createSlider(min, max, defaultValue, step).parent(controlContainer).class('slider');
		slider.input(() => callback(slider.value()));
	}
}



function setupReverbControls(x, y, width) {

	let container = createDiv('').position(x, y)
		.position(x, y).style('border', '1px solid black')
		.style('padding', '10px').style('width', `${width}px`)
		.style('display', 'flex').style('flex-direction', 'column')
		.style('align-items', 'center');

	let header = createP('Reverb').parent(container);
	header.class('filter-header').style('margin-bottom', '20px');
	container.parent(mainContainer);


	let firstRow = createDiv('').parent(container).style('display', 'flex').style('width', '100%').style('justify-content', 'space-between');
	setupControl(firstRow, 'Reverb Duration', 0, 10, 2, 0.1, (value) => {
		reverb.set(value, reverbDecay, isReversed);  // Assuming reverbDecay is stored and updated somewhere
	}, 'reverbDurationSlider');

	setupControl(firstRow, 'Decay Rate', 0, 10, 4, 0.1, (value) => {
		reverbDecay = value;  // Update decay rate globally or manage state
		reverb.set(reverbDuration, value, isReversed);  // Update reverb with new decay
	}, 'reverbDecayRateSlider');


	let secondRow = createDiv('').parent(container).style('display', 'flex').style('width', '100%').style('justify-content', 'space-between');
	let controlContainer = createDiv('').parent(secondRow).style('width', '48%').style('padding', '5px');
	let reverseButton = createButton('Reverse').parent(controlContainer).class('slider');


	reverseButton.parent(container);

	reverseButton.mousePressed(() => {
			isReversed = !isReversed;
		console.log(isReversed)
	});


	let thirdRow = createDiv('').parent(container).style('display', 'flex').style('width', '100%').style('justify-content', 'space-between');
	setupControl(thirdRow, 'Dry/Wet', 0, 1, 0.5, 0.01, (value) => {
		dryGain.amp(1 - value);  // Reduce dry signal as wet signal increases
		wetGain.amp(value);      // Increase wet signal as value increases
	});
	setupControl(thirdRow, 'Output/Level', 0, 1, 0.8, 0.01, (value) => {
		reverbOutputGain.amp(value);  // Adjust the gain of the reverb's output node
	});
}

function setupDynamicCompressorControls(x, y, width) {
	let container = createDiv('').position(x, y)
		.position(x, y).style('border', '1px solid black')
		.style('padding', '10px').style('width', `${width}px`)
		.style('display', 'flex').style('flex-direction', 'column')
		.style('align-items', 'center');

	let header = createP('Dynamic Compressor').parent(container);
	header.class('filter-header').style('margin-bottom', '20px');
	container.parent(mainContainer);


	let firstRow = createDiv('').parent(container).style('display', 'flex').style('width', '100%').style('justify-content', 'space-between');
	setupControl(firstRow, 'Attack', 0, 1, 0.003, 0.001,
		((value) => compressor.attack(value)));
	setupControl(firstRow, 'Knee', 0, 40, 30, 1,
		((value) => compressor.knee(value)));

	setupControl(firstRow, 'Release', 0.01, 1, 0.25, 0.01,
		((value) => compressor.release(value)));


	let secondRow = createDiv('').parent(container).style('display', 'flex').style('width', '100%').style('justify-content', 'space-between');
	setupControl(secondRow, 'Ratio', 1, 20, 4, 0.1,
		((value) => compressor.ratio(value)));
	setupControl(secondRow, 'Threshold', -100, 0, -24, 1,
		((value) => compressor.threshold(value)));

	let thirdRow = createDiv('').parent(container).style('display', 'flex').style('width', '100%').style('justify-content', 'space-between');
	setupControl(thirdRow, 'Dry/Wet', 0, 1, 0.5, 0.01,
		value => {
			dryGain.amp(1 - value);
			wetGain.amp(value);
		});
	setupControl(thirdRow, 'Output/Level', 0, 1, 0.8, 0.01,
		value => masterGain.amp(value));
}

function setupWaveshaperDistortionControls(x, y, width) {
	let container = createDiv('').position(x, y)
		.position(x, y).style('border', '1px solid black')
		.style('padding', '10px').style('width', `${width}px`)
		.style('display', 'flex').style('flex-direction', 'column')
		.style('align-items', 'center');

	let header = createP('Waveshaper Distortion').parent(container);
	header.class('filter-header').style('margin-bottom', '20px');
	container.parent(mainContainer);



	let firstRow = createDiv('').parent(container).style('display', 'flex').style('width', '100%').style('justify-content', 'space-between');
	setupControl(firstRow, 'Distortion Amount', 0, 1, 0.5, 0.01,
		((value) => compressor.attack(value)));
	setupControl(firstRow, 'Oversample', 0, 40, 30, 1,
		((value) => compressor.knee(value)));

	let thirdRow = createDiv('').parent(container).style('display', 'flex').style('width', '100%').style('justify-content', 'space-between');
	setupControl(thirdRow, 'Dry/Wet', 0, 1, 0.5, 0.01, value => console.log("Dry/Wet: " + value));
	setupControl(thirdRow, 'Output/Level', 0, 1, 0.8, 0.01, value => console.log("Output/Level: " + value));
}

function setupMasterAndSpectrumControls(x, y, width) {
	let container = createDiv('').position(x, y).style('border', '1px solid black').style('padding', '10px').style('width', `${width}px`);
	createP('Master Volume').parent(container);
	masterVolumeSlider = createSlider(0, 1, 0.8, 0.01).parent(container);  // Slider ranging from 0 to 1, starting at 0.8

	masterVolumeSlider.input(() => {
		masterGain.amp(masterVolumeSlider.value());  // Update master gain based on slider value
	});
}

function drawMasterAndSpectrumLabels() {
	let startX = windowWidth / 2 + (windowWidth / 2 - 280) / 2;
	let startY = 100 + 30 + 10;
	let spectrumInY = 200;
	let spectrumOutY = 440;
	let spectrumWidth = 440;
	let spectrumHeight = 200;
	// let spectrumCanvas = createGraphics(width, 100); // Assuming 'width' and 'height' are defined
	// displaySpectrum(spectrumCanvas, 'in', width, 100);
	// image(spectrumCanvas, 0, height - 110); // Display the canvas as an image at the desired position
	// Draw Spectrum In
	let spectrumCanvas = createGraphics(200, 100);
	spectrumCanvas.colorMode(HSB, 360, 100, 100); // Use HSB color mode
	displaySpectrum(0, 0, spectrumCanvas.width, spectrumCanvas.height, 'in', spectrumCanvas);

	// Display the graphics as an image
	image(spectrumCanvas, 20, 20); // Position it on the main canvas
	// displaySpectrum(startX, spectrumInY, spectrumWidth, spectrumHeight, 'in');
	// text('Spectrum In', startX, spectrumInY - 20);

	// Draw Spectrum Out
	// text('Spectrum Out', startX, spectrumOutY - 20);

	displaySpectrum(startX, spectrumOutY, spectrumWidth, spectrumHeight, 'out');

	// let startX = windowWidth / 2 + (windowWidth / 2 - 350) / 2; // Adjust based on your layout
	// let startY = 140;  // Start drawing from 140 pixels down from the top
	// let spectrumInY = 250;  // Position for "Spectrum In"
	// let spectrumOutY = 400; // Position for "Spectrum Out"
	// let spectrumWidth = 200; // Width of the spectrum display
	// let spectrumHeight = 100; // Height of the spectrum display
	//
	// stroke(0);
	// strokeWeight(2);
	//
	// // Draw the border for "Spectrum In"
	// rect(startX, spectrumInY, spectrumWidth, spectrumHeight);
	// text('Spectrum In', startX, spectrumInY - 20);
	// displaySpectrum(startX, spectrumInY, spectrumWidth, spectrumHeight, 'in');
	//
	// // Draw the border for "Spectrum Out"
	// rect(startX, spectrumOutY, spectrumWidth, spectrumHeight);
	// text('Spectrum Out', startX, spectrumOutY - 20);
	// displaySpectrum(startX, spectrumOutY, spectrumWidth, spectrumHeight, 'out');
}

// function displaySpectrum(x, y, width, height, type) {
// 	let spectrum = (type === 'in') ? fftIn.analyze() : fftOut.analyze();
//
// 	// Draw the border first
// 	noFill();  // Ensure the border is not filled
// 	stroke(0);  // Black color for the border
// 	strokeWeight(2);  // Adjust as needed for thicker/thinner borders
// 	rect(x, y, width, height);
//
// 	// Draw the spectrum
// 	noStroke();
// 	fill(0);  // Black color for the spectrum bars
// 	for (let i = 0; i < spectrum.length; i++) {
// 		let barX = map(i, 0, spectrum.length, x, x + width);
// 		let barWidth = width / spectrum.length;
// 		let barHeight = map(spectrum[i], 0, 255, 0, height);
// 		rect(barX, y + height - barHeight, barWidth, barHeight);
// 	}
// }
//
// function displaySpectrum(x, y, width, height, type) {
// 	let spectrum = (type === 'in') ? fftIn.analyze() : fftOut.analyze();
//
// 	// Draw the border first
// 	noFill();  // Ensure the border is not filled
// 	stroke(0);  // Black color for the border
// 	strokeWeight(2);  // Adjust as needed for thicker/thinner borders
// 	rect(x, y, width, height);
//
// 	// Draw the spectrum using beginShape for a more detailed curve
// 	beginShape();
// 	vertex(x, y + height);
// 	for (let i = 0, maxi = spectrum.length; i < maxi; i++) {
// 		let ln2 = Math.log(2); // Logarithmic base to adjust spacing
// 		let mappedX = map(12 * ln2 * (Math.log(i + 1)), 0, 12 * ln2 * (Math.log(maxi)), x, x + width);
// 		let mappedHeight = map(spectrum[i], 0, 255, 0, height);
// 		vertex(mappedX, y + height - mappedHeight);
// 	}
// 	vertex(x + width, y + height);
// 	endShape(CLOSE);
// }


function displaySpectrum(x, y, width, height, type, graphics) {
	let spectrum = (type === 'in') ? fftIn.analyze() : fftOut.analyze();

	graphics.noFill();  // Ensure the border is not filled
	graphics.stroke(0);  // Black color for the border
	graphics.strokeWeight(2);  // Adjust as needed for thicker/thinner borders
	graphics.rect(0, 0, width, height);

	// No border for the bars
	graphics.noStroke();

	// Iterate over the spectrum array
	for (let i = 0; i < spectrum.length; i++) {
		let barX = map(i, 0, spectrum.length, 0, width);
		let barWidth = width / spectrum.length;
		let barHeight = map(spectrum[i], 0, 255, 0, height);

		// Map the amplitude to a color
		let hueValue = map(spectrum[i], 0, 255, 0, 360); // Hue between 0 and 360
		graphics.fill(hueValue, 100, 100); // HSB color mode

		// Draw each bar
		graphics.rect(barX, height - barHeight, barWidth, barHeight);
	}
}


// function drawSpectrum(canvas, type, width, height) {
// 	canvas.draw = function() {
// 		let spectrum = type === 'in' ? fftIn.analyze() : fftOut.analyze();
// 		canvas.background(221); // Light grey background
// 		canvas.noStroke();
// 		canvas.fill(0); // Black color for the spectrum bars
// 		for (let i = 0; i < spectrum.length; i++) {
// 			let barX = canvas.map(i, 0, spectrum.length, 0, width);
// 			let barWidth = width / spectrum.length;
// 			let barHeight = canvas.map(spectrum[i], 0, 255, 0, height);
// 			canvas.rect(barX, height - barHeight, barWidth, barHeight);
// 		}
// 	};
// 	canvas.draw();
// }




//
// function setupMasterAndSpectrumControls(x, y, width) {
// 	let container = createDiv('').position(x, y).style('border', '1px solid black').style('padding', '10px').style('width', `${width}px`);
// 	// createP('Master and Spectrum Controls').parent(container);
// 	createP('Master Volume').parent(container);
// 	container.parent(mainContainer);
// 	masterVolumeSlider = createSlider(0, 1, 0.8, 0.01).parent(container);
//
// 	masterVolumeSlider.input(() => {
// 		reverbOutputGain.amp(masterVolumeSlider.value());
// 	});
//
// 	spectrumInPlaceholder = createDiv('').parent(container).style('height', '100px').style('margin-top', '20px').style('background', '#ddd');
// 	createP('Spectrum In').parent(spectrumInPlaceholder);
//
//
// 	spectrumOutPlaceholder = createDiv('').parent(container).style('height', '100px').style('margin-top', '20px').style('background', '#ddd');
// 	createP('Spectrum Out').parent(spectrumOutPlaceholder);
// }
//
//
// function displaySpectrum(x, y, width, height, type) {
// 	let spectrum;
// 	if (type === 'in') {
// 		spectrum = fftIn.analyze();  // Analyze the input audio
// 	} else if (type === 'out') {
// 		spectrum = fftOut.analyze();  // Analyze the processed audio
// 	} else {
// 		return;  // If type is not recognized, do nothing
// 	}
//
// 	// Draw the border first
// 	noFill();  // Ensure the border is not filled
// 	stroke(0);  // Black color for the border
// 	strokeWeight(2);  // Adjust as needed for thicker/thinner borders
// 	rect(x, y, width, height);
//
//
// 	noStroke();
// 	fill(0);  // Black color for the spectrum
// 	for (let i = 0; i < spectrum.length; i++) {
// 		// Calculate each bar's position and height based on the spectrum data
// 		let barX = map(i, 0, spectrum.length, x, x + width);
// 		let barWidth = width / spectrum.length;
// 		let barHeight = map(spectrum[i], 0, 255, 0, height);
//
// 		// Draw each bar
// 		rect(barX, y + height - barHeight, barWidth, barHeight);
// 	}
// }

function windowResized() {
	resizeCanvas(windowWidth, windowHeight);
	// Update layout or reposition divs if necessary
}
function setupTransportControls() {
	let controlsDiv = createDiv('')
		.position((windowWidth - width) / 2, 10)  // Positioning the div horizontally centered, 10 pixels below the top of the window
		.style('text-align', 'center')  // Center aligns all child elements
		// .style('border', '1px solid black')
		.style('padding', '10px')
		.style('padding-bottom', '110px')
		.style('width', '100%')  // Makes the div take full width to center content properly
		// .style('box-sizing', 'border-box')  // Ensures padding does not add to the width
		.style('margin-bottom', '210px');  // Adds margin below the entire control set

	controlsDiv.id('setupTransportControls')

	let buttonBaseClass = 'control-button';

	let buttonStyles = {
		play: { color: '#4CAF50', hover: '#66BB6A' },
		pause: { color: '#f44336', hover: '#e5726a' },
		stop: { color: '#FFC107', hover: '#fcd35b' },
		skipStart: { color: '#16A085', hover: '#5dd0b9' },
		skipEnd: { color: '#F457AF', hover: '#f395ca' },
		loop: { color: '#3F51B5', hover: '#6b7de0' },
		record: { color: '#9C27B0', hover: '#d272e3' },
		skip: { color: '#3498DB', hover: '#97e9f5' }
	};

	playButton = createButton('Play').parent(controlsDiv).class(buttonBaseClass).style('background-color', buttonStyles.play.color).mousePressed(playAudio);
	pauseButton = createButton('Pause').parent(controlsDiv).class(buttonBaseClass).style('background-color', buttonStyles.pause.color).mousePressed(pauseAudio);
	stopButton = createButton('Stop').parent(controlsDiv).class(buttonBaseClass).style('background-color', buttonStyles.stop.color).mousePressed(stopAudio);
	skipToStartButton = createButton('Skip to Start').parent(controlsDiv).class(buttonBaseClass).style('background-color', buttonStyles.skipStart.color).mousePressed(skipToStart);
	skipToEndButton = createButton('Skip to End').parent(controlsDiv).class(buttonBaseClass).style('background-color', buttonStyles.skipEnd.color).mousePressed(skipToEnd);
	loopButton = createButton('Loop').parent(controlsDiv).class(buttonBaseClass).style('background-color', buttonStyles.loop.color).mousePressed(loopAudio);
	recordButton = createButton('Record').parent(controlsDiv).class(buttonBaseClass).style('background-color', buttonStyles.record.color).mousePressed(recordAudio);
	skipButton = createButton('Skip').parent(controlsDiv).class(buttonBaseClass).style('background-color', buttonStyles.skip.color).mousePressed(skipAudio);

	// Hover styling and active styling
	let allButtons = [playButton, pauseButton, stopButton, skipToStartButton, skipToEndButton, loopButton, recordButton, skipButton];
	allButtons.forEach((button, index)=> {
		let key = Object.keys(buttonStyles)[index];
		console.log(key, index)
		button.style('margin-bottom', '10px');  // Adds margin below each button
		button.mouseOver(() => button.style('background-color', buttonStyles[key].hover));
		button.mouseOut(() => button.style('background-color', buttonStyles[key].color));
	});
}

function setupAudioChain() {
	let samples = 1 << 12;
	maxX = 12 * ln2(samples);

	fftIn = new p5.FFT(0.8, samples);
	fftOut = new p5.FFT(0.8, samples);
	reverb = new p5.Reverb();
	lowPass = new p5.LowPass();
	compressor = new p5.Compressor();
	reverbOutputGain = new p5.Gain(); // Gain node specifically for reverb output control
	dryGain = new p5.Gain();
	wetGain = new p5.Gain();
	masterGain = new p5.Gain();

	dryGain.amp(1); // Full volume to dry signal initially
	wetGain.amp(0); // No wet signal initially
	masterGain.amp(0.8); // Master volume set to 80%

	// Connect audio source to dry and wet paths
	if (audioFile) {
		audioFile.disconnect();  // Ensure audioFile is not connected directly to master output
		audioFile.connect(dryGain);  // Connect the original audio to the dry mix
		audioFile.connect(lowPass);  // First effect in wet path
	}

	// Chain audio effects
	lowPass.connect(reverb);  // Connect low-pass filter output to reverb
	reverb.connect(compressor);  // Connect reverb output to compressor
	compressor.connect(wetGain);  // Connect compressor output to wet gain

	// Optional: Use reverbOutputGain if you need specific control over the reverb output level before mixing
	reverbOutputGain.connect(wetGain);  // Ensure reverb output gain is properly connected if used

	// Mix dry and wet signals into masterGain
	dryGain.connect(masterGain);
	wetGain.connect(masterGain);

	masterGain.connect();  // Connect masterGain to the master output

	// Set up FFT analysis
	fftIn.setInput(audioFile);  // Analyze original audio
	fftOut.setInput(masterGain);  // Analyze final output for visualization
}


//
// function setupAudioChain() {
// 	fftIn = new p5.FFT();
// 	fftOut = new p5.FFT();
// 	reverb = new p5.Reverb();
// 	lowPass = new p5.LowPass();
// 	compressor = new p5.Compressor();
// 	reverbOutputGain = new p5.Gain(); // Create the gain node
// 	dryGain = new p5.Gain();
// 	wetGain = new p5.Gain();
// 	masterGain = new p5.Gain();
//
// 	dryGain.amp(1); // Full volume to dry signal initially
// 	wetGain.amp(0); // No wet signal initially
// 	masterGain.amp(0.8); // Master volume set to 80%
//
// 	// Set up the audio chain
// 	if (audioFile) {
// 		audioFile.disconnect();  // Disconnect from master output
// 		audioFile.connect(dryGain);  // Connect the original audio to the dry mix
// 		audioFile.connect(lowPass);
// 		audioFile.connect(wetGain);  // Connect audio to lowPass and then to the wet mix
//
// 	}
//
//
// 	// Chain audio effects
// 	lowPass.connect(reverb);
// 	reverb.connect(compressor);
// 	compressor.connect();  // Connect to master output
// 	reverbOutputGain.connect(); // Connect to master output
//
//
// 	// Mix dry and wet signals into masterGain
// 	dryGain.connect(masterGain);
// 	wetGain.connect(masterGain);
//
// 	masterGain.connect();  // Finally, connect masterGain to the master output
//
// 	// Set up FFT analysis
// 	if (audioFile) fftIn.setInput(audioFile);  // Analyze original audio
// 	fftOut.setInput(compressor);  // Analyze processed audio
// 	// fftOut.setInput(reverbOutputGain); // Analyze processed audio
// }


function playAudio() {
	if (audioFile.isLoaded()) {
		audioFile.play();
	}
}
function pauseAudio() {
	audioFile.pause();
}

function stopAudio() {
	audioFile.stop();
}

function recordAudio() {

	// Check if we're already recording
	if (!isRecording) {
		userStartAudio();
		// Start recording
		recorder.record(audioFile);
		console.log('Recording started', audioFile);
		isRecording = true;
	} else {
		// Stop recording and save the audio file only if data exists
		recorder.stop();
		console.log('Recording stopped', audioFile);
		// // Verify that data is recorded before saving
		// if (audioFile.frames() > 0) {
		// 	saveSound(audioFile, 'processed_audio.wav');
		setTimeout(function() {
			audioFile.save("output.wav");
		}, 2000);
		// 	console.log('Recording stopped and saved');
		// } else {
		// 	console.log('No audio data recorded.');
		// }

		isRecording = false;
	}
}

function skipToEnd() {
	if (audioFile.isLoaded()) {
		audioFile.jump(audioFile.duration() - 1); // Jump to the last second
	} else {
		console.log('Audio file not loaded');
	}
}

function skipToStart() {
	if (audioFile.isLoaded()) {
		audioFile.jump(0); // Jump to the start of the audio file
	} else {
		console.log('Audio file not loaded');
	}
}


function skipAudio() {
	if (audioFile.isLoaded()) {
		let duration = audioFile.duration();
		// Prompt the user for a time value within the file's duration
		let timeToJump = prompt(`Enter time to skip to (0 to ${duration} seconds):`);
		timeToJump = parseFloat(timeToJump);

		// Check if the entered time is within a valid range
		if (!isNaN(timeToJump) && timeToJump >= 0 && timeToJump < duration) {
			audioFile.jump(timeToJump); // Jump to the specified time
		} else {
			console.log('Invalid time value entered.');
		}
	} else {
		console.log('Audio file not loaded');
	}
}


function loopAudio() {
	// Set loop to true or false based on current state
	// audioFile.loop(!audioFile.isLooping());
	if (audioFile.isLooping()) {
		audioFile.setLoop(false);
	} else {
		audioFile.setLoop(true);
	}
}



function ln2(x) {
	return log(x) / log(2);
}



function isMouseOverCanvas() {
	let mx = mouseX;
	let my = mouseY;

	return 0 <= mx && mx <= width && 0 <= my && my <= height;
}

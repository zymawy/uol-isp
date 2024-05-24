// Global variables for GUI elements
let playButton, pauseButton, stopButton, loopButton, recordButton, skipButton, skipToStartButton, skipToEndButton,
	masterVolumeSlider , fftIn, fftOut, audioFile, lowPassFilterCutoffSlider, lowPassFilterResonanceSlider,
	waveshaperOutputLevelSlider, waveshaperDryWetSlider,
	oversampleSlider, distortionAmountSlider, reverbOutputLevelSlider, reverbDryWetSlider,
	reverseButton, reverbDurationSlider,
	attackSlider, releaseSlider, ratioSlider, thresholdSlider, dryWetSlider, outputLevelSlider,
	spectrumOutPlaceholder, spectrumInPlaceholder,
	reverb, lowPass, compressor, kneeSlider,
	recorder, recordedAudio, isRecording = false, mic,
	isReversed = false, reverbOutputGain;

function preload() {
	// Assuming the file is in the same directory and named 'audiofile.wav'
}
function soundLoadError() {
	console.error('The sound file failed to load.');
}



function setupAudioChain() {
	fftIn = new p5.FFT();
	fftOut = new p5.FFT();
	reverb = new p5.Reverb();
	lowPass = new p5.LowPass();
	compressor = new p5.Compressor();
	reverbOutputGain = new p5.Gain(); // Create the gain node


	// Set up the audio chain
	if (audioFile) {
		audioFile.disconnect();  // Disconnect from master output
		audioFile.connect(lowPass);  // Connect to low-pass filter
	}

	// Chain audio effects
	lowPass.connect(reverb);
	reverb.connect(compressor);
	compressor.connect();  // Connect to master output
	reverbOutputGain.connect(); // Connect to master output


	// Set up FFT analysis
	if (audioFile) fftIn.setInput(audioFile);  // Analyze original audio
	fftOut.setInput(compressor);  // Analyze processed audio
	// fftOut.setInput(reverbOutputGain); // Analyze processed audio

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

function record() {

	var soundRecorder = new p5.SoundRecorder();
	var soundFile = new p5.SoundFile();
	soundRecorder.record(soundFile);
	setTimeout(function() {
		console.log("Recording Complete");
		soundRecorder.stop();
		save(soundFile, "output.wav");
	}, 1000);
}
// Function callbacks
function playAudio() {
	if (audioFile.isLoaded()) {
		audioFile.play();
	}
}

function setup() {
	createCanvas(windowWidth, windowHeight); // This will create a full-width and full-height canvas
	// audioFile = loadSound('assets/sounds/dreams.wav', setupAudioChain, soundLoadError);

	audioFile = loadSound('assets/sounds/mixkit-game-show-suspense-waiting-667.wav');
	// audioFile = loadSound('assets/sounds/dreams.wav');
	setupTransportControls()
	setupRecording()
}

function draw() {
	background(255);

	// Redraw all GUI text
	drawFilterLabels();
	drawCompressorLabels();
	drawReverbLabels();
	drawWaveshaperLabels();
	drawMasterAndSpectrumLabels();
}

function pauseAudio() {
	audioFile.pause();
}

function stopAudio() {
	audioFile.stop();
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



function setupTransportControls() {

	let buttonStyles = `
    font-family: 'Arial', sans-serif;
    font-size: 14px;
    color: white;
    border: none;
    border-radius: 5px;
    margin: 20px 5px 5px 5px;
    padding: 10px 20px;
    box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.2);
    outline: none;`;

	let hoverStyles = 'cursor: pointer; transition: background-color 0.3s, box-shadow 0.3s;';

	let buttonWidth = 80;
	let buttonHeight = 30;
	let buttonSpacing = 15;
	let totalButtonsWidth = (buttonWidth + buttonSpacing) * 5;
	let startX = (windowWidth - totalButtonsWidth) / 2;


	playButton = createButton('Play');
	playButton.position(startX, 10);
	playButton.size(buttonWidth, buttonHeight);
	playButton.mousePressed(playAudio);
	playButton.mouseOver(() =>  {
		playButton.style('background-color', '#66BB6A')
		playButton.style('box-shadow', '0px 4px 8px rgba(0, 0, 0, 0.3)')
	});
	playButton.mouseOut(() => {
		playButton.style('background-color', '#4CAF50')
		playButton.style('box-shadow', '0px 2px 5px rgba(0, 0, 0, 0.2)'); // Original shadow when not hovered
	});
	playButton.style(hoverStyles + buttonStyles + 'background-color: #4CAF50;');


	startX += buttonWidth + buttonSpacing;

	pauseButton = createButton('Pause');
	pauseButton.position(startX, 10);
	pauseButton.size(buttonWidth, buttonHeight);
	pauseButton.mousePressed(pauseAudio);
	pauseButton.mouseOver(() => {
		pauseButton.style('background-color', '#e5726a')
		pauseButton.style('box-shadow', '0px 4px 8px rgba(0, 0, 0, 0.3)')
	});
	pauseButton.mouseOut(() => {
		pauseButton.style('background-color', '#f44336')
		pauseButton.style('box-shadow', '0px 4px 8px rgba(0, 0, 0, 0.2)')
	});
	pauseButton.style(hoverStyles + buttonStyles + 'background-color: #f44336;');


	startX += buttonWidth + buttonSpacing;
	stopButton = createButton('Stop');
	stopButton.position(startX, 10);
	stopButton.size(buttonWidth, buttonHeight);
	stopButton.mousePressed(stopAudio);
	stopButton.mouseOver(() => {
		stopButton.style('background-color', '#fcd35b')
		stopButton.style('box-shadow', '0px 4px 8px rgba(0, 0, 0, 0.3)')
	});
	stopButton.mouseOut(() => {
		stopButton.style('background-color', '#FFC107')
		stopButton.style('box-shadow', '0px 4px 8px rgba(0, 0, 0, 0.2)')
	});
	stopButton.style(hoverStyles + buttonStyles + 'background-color: #FFC107;');


	startX += buttonWidth + buttonSpacing;
	skipToStartButton = createButton('Skip to start');
	skipToStartButton.position(startX, 10);
	skipToStartButton.size(buttonWidth, buttonHeight);
	skipToStartButton.mousePressed(skipToStart);
	skipToStartButton.mouseOver(() => {
		skipToStartButton.style('background-color', '#5dd0b9')
		skipToStartButton.style('box-shadow', '0px 4px 8px rgba(0, 0, 0, 0.3)')
	});
	skipToStartButton.mouseOut(() => {
		skipToStartButton.style('background-color', '#16A085')
		skipToStartButton.style('box-shadow', '0px 4px 8px rgba(0, 0, 0, 0.2)')
	});
	skipToStartButton.style(hoverStyles + buttonStyles + 'background-color: #16A085;font-size: 8px;');


	startX += buttonWidth + buttonSpacing;
	skipToEndButton = createButton('Skip to end');
	skipToEndButton.position(startX, 10);
	skipToEndButton.size(buttonWidth, buttonHeight);
	skipToEndButton.mousePressed(skipToEnd);
	skipToEndButton.mouseOver(() => {
		skipToEndButton.style('background-color', '#f395ca')
		skipToEndButton.style('box-shadow', '0px 4px 8px rgba(0, 0, 0, 0.3)')
	});
	skipToEndButton.mouseOut(() => {
		skipToEndButton.style('background-color', '#F457AF')
		skipToEndButton.style('box-shadow', '0px 4px 8px rgba(0, 0, 0, 0.2)')
	});
	skipToEndButton.style(hoverStyles + buttonStyles + 'background-color: #F457AF; font-size: 8px;');



	startX += buttonWidth + buttonSpacing;
	loopButton = createButton('Loop');
	loopButton.position(startX, 10);
	loopButton.size(buttonWidth, buttonHeight);
	loopButton.mousePressed(loopAudio);
	loopButton.mouseOver(() => {
		loopButton.style('background-color', '#6b7de0')
		loopButton.style('box-shadow', '0px 4px 8px rgba(0, 0, 0, 0.3)')
	});
	loopButton.mouseOut(() => {
		loopButton.style('background-color', '#3F51B5')
		loopButton.style('box-shadow', '0px 4px 8px rgba(0, 0, 0, 0.2)')
	});
	loopButton.style(hoverStyles + buttonStyles + 'background-color: #DAA520;');


	startX += buttonWidth + buttonSpacing;
	recordButton = createButton('Record');
	recordButton.position(startX, 10);
	recordButton.size(buttonWidth, buttonHeight);
	recordButton.mousePressed(recordAudio);
	recordButton.mouseOver(() => {
		recordButton.style('background-color', '#d272e3')
		recordButton.style('box-shadow', '0px 4px 8px rgba(0, 0, 0, 0.3)')
	});
	recordButton.mouseOut(() => {
		recordButton.style('background-color', '#9C27B0')
		recordButton.style('box-shadow', '0px 4px 8px rgba(0, 0, 0, 0.2)')
	});
	recordButton.style(hoverStyles + buttonStyles + 'background-color: #00FFFF;');


	startX += buttonWidth + buttonSpacing;
	skipButton = createButton('Skip');
	skipButton.position(startX, 10);
	skipButton.size(buttonWidth, buttonHeight);
	skipButton.mousePressed(skipAudio);
	skipButton.mouseOver(() => {
		skipButton.style('background-color', '#97e9f5')
		skipButton.style('box-shadow', '0px 4px 8px rgba(0, 0, 0, 0.3)')
	});
	skipButton.mouseOut(() => {
		skipButton.style('background-color', '#08c3dc')
		skipButton.style('box-shadow', '0px 4px 8px rgba(0, 0, 0, 0.2)')
	});
	skipButton.style(hoverStyles + buttonStyles + 'background-color: #3498DB;');



	let transportControlBottomY = 100;
	startX = 350;
	let midScreenX = windowWidth / 2;
	let thirdSectionStartX = midScreenX + 100 + (midScreenX - startX) / 2;
	let dynamicCompressorStartX = midScreenX - (midScreenX - startX) / 2;
	let reverbStartY = transportControlBottomY + buttonHeight + 260; // example calculation, needs adjustment
	let waveshaperStartY = transportControlBottomY + buttonHeight + 260; // similarly calculated
	let sliderWidth = 150;
	let spacingY = 40;
	let masterStartX = 50;
	let masterStartY = 100;

	// text('Low-pass filters', startX, transportControlBottomY);
	setupLowPassFilterControls(startX, transportControlBottomY + buttonHeight + 10);
	// text('Dynamic compressor', dynamicCompressorStartX, transportControlBottomY + 10);
	setupDynamicCompressorControls(dynamicCompressorStartX, transportControlBottomY + buttonHeight + 10);
	// text('Master Level', thirdSectionStartX, transportControlBottomY);
	setupMasterAndSpectrumControls(thirdSectionStartX, transportControlBottomY + buttonHeight + 10);
	// text('Reverb', startX, transportControlBottomY); // Label for section
	setupReverbControls(startX, reverbStartY);
	// text('Waveshaper Distortion', dynamicCompressorStartX, waveshaperStartY - 30); // Label for section
	setupWaveshaperDistortionControls(dynamicCompressorStartX, waveshaperStartY);

	// setupMasterAndSpectrumControls(masterStartX, masterStartY);

}



function setupLowPassFilterControls(startX, startY) {
	let sliderWidth = 150;
	let spacingY = 40;  // Vertical spacing between controls

	// Create the cutoff frequency slider and label
	// text('Cutoff Frequency', startX, startY - 20);
	lowPassFilterCutoffSlider = createSlider(20, 22050, 440, 1);
	lowPassFilterCutoffSlider.position(startX, startY);
	lowPassFilterCutoffSlider.size(sliderWidth);
	lowPassFilterCutoffSlider.input(() => {
		let cutoffFreq = lowPassFilterCutoffSlider.value();
		lowPass.freq(cutoffFreq);
	});

	// Create the resonance slider and label
	startY += spacingY;
	// text('Resonance', startX, startY - 20);
	lowPassFilterResonanceSlider = createSlider(0, 5, 1, 0.1);
	lowPassFilterResonanceSlider.position(startX, startY);
	lowPassFilterResonanceSlider.size(sliderWidth);
	lowPassFilterResonanceSlider.input(() => {
		let resonance = lowPassFilterResonanceSlider.value();
		console.log({resonance})
		lowPass.res(resonance);
	});
}

function setupReverbControls(startX, startY) {
	let sliderWidth = 150;
	let spacingX = 160; // Horizontal spacing between sliders

	// First Row: Reverb Duration, Decay
	// Reverb Duration Slider
	// text('Reverb Duration', startX, startY - 20);
	reverbDurationSlider = createSlider(0, 10, 2, 0.1);
	reverbDurationSlider.position(startX, startY);
	reverbDurationSlider.size(sliderWidth);
	reverbDurationSlider.input(() => {
		reverb.set(reverbDurationSlider.value(), reverbDryWetSlider.value());
	});

	// Decay Slider
	let decayX = startX + spacingX;
	// text('Decay', decayX, startY - 20);
	let decaySlider = createSlider(0, 10, 4, 0.1);
	decaySlider.position(decayX, startY);
	decaySlider.size(sliderWidth);

	// Second Row: Reverse Button
	startY += 70; // Move to next row
	reverseButton = createButton('Reverse');
	reverseButton.position(startX, startY);
	reverseButton.size(sliderWidth, 30);
	reverseButton.mousePressed(function() {
		if (audioFile && audioFile.isLoaded()) {
			// Toggle the reverse state
			isReversed = !isReversed;
			// Set the audio file to the desired reversed state
			audioFile.reverse(isReversed);
			console.log('Reversed state:', isReversed ? 'Yes' : 'No');
		} else {
			console.log('Audio file is not loaded.');
		}
	});

	// Third Row: Dry/Wet, Output Level
	startY += 70; // Move to last row
	// text('Dry/Wet', startX, startY - 20);
	reverbDryWetSlider = createSlider(0, 1, 0.5, 0.01);
	reverbDryWetSlider.position(startX, startY);
	reverbDryWetSlider.size(sliderWidth);
	reverbDryWetSlider.input(() => {
		reverb.set(reverbDurationSlider.value(), reverbDryWetSlider.value());
	});

	let outputLevelX = startX + spacingX;
	// text('Output Level', outputLevelX, startY - 20);
	reverbOutputLevelSlider = createSlider(0, 1, 0.8, 0.01);
	reverbOutputLevelSlider.position(outputLevelX, startY);
	reverbOutputLevelSlider.size(sliderWidth);
	reverbOutputLevelSlider.input(() => {
		// Retrieve the current value from the slider and update the gain
		let gainValue = reverbOutputLevelSlider.value();
		console.log({gainValue})
		reverbOutputGain.amp(gainValue);
	});
}

function setupWaveshaperDistortionControls(startX, startY) {
	let sliderWidth = 150;
	let spacingX = 160; // Horizontal spacing between sliders

	// First Row: Distortion Amount, Oversample
	// text('Distortion Amount', startX, startY - 20);
	distortionAmountSlider = createSlider(0, 1, 0.5, 0.01);
	distortionAmountSlider.position(startX, startY);
	distortionAmountSlider.size(sliderWidth);

	let oversampleX = startX + spacingX;
	// text('Oversample', oversampleX, startY - 20);
	oversampleSlider = createSlider(1, 4, 2, 1);
	oversampleSlider.position(oversampleX, startY);
	oversampleSlider.size(sliderWidth);

	// Second Row: Dry/Wet, Output Level
	startY += 70; // Move to next row
	// text('Dry/Wet', startX, startY - 20);
	waveshaperDryWetSlider = createSlider(0, 1, 0.5, 0.01);
	waveshaperDryWetSlider.position(startX, startY);
	waveshaperDryWetSlider.size(sliderWidth);

	let outputLevelX = startX + spacingX;
	// text('Output Level', outputLevelX, startY - 20);
	waveshaperOutputLevelSlider = createSlider(0, 1, 0.8, 0.01);
	waveshaperOutputLevelSlider.position(outputLevelX, startY);
	waveshaperOutputLevelSlider.size(sliderWidth);
}



function setupDynamicCompressorControls(startX, startY) {
	let sliderWidth = 150;
	let spacingX = 160; // Horizontal spacing between sliders
	let rowSpacingY = 70; // Vertical spacing between rows

	// Draw the border first
	// noFill();  // Ensure the border is not filled
	// stroke(0);  // Black color for the border
	// strokeWeight(2);  // Adjust as needed for thicker/thinner borders
	// rect(startX, startY, width, height);
	// First Row: Attack, Knee, Release
	// Attack Slider
	// text('Attack', startX, startY - 20);
	attackSlider = createSlider(0, 1, 0.003, 0.001);
	attackSlider.position(startX, startY);
	attackSlider.size(sliderWidth);
	attackSlider.input(() => {
		compressor.attack(attackSlider.value());
	});

	// Knee Slider
	let kneeX = startX + spacingX; // Positioning next slider to the right
	// text('Knee', kneeX, startY - 20);
	kneeSlider = createSlider(0, 40, 30, 1);
	kneeSlider.position(kneeX, startY);
	kneeSlider.size(sliderWidth);
	kneeSlider.input(() => {
		compressor.knee(kneeSlider.value());
	});

	// Release Slider
	let releaseX = kneeX + spacingX; // Positioning next slider to the right
	// text('Release', releaseX, startY - 20);
	releaseSlider = createSlider(0.01, 1, 0.25, 0.01);
	releaseSlider.position(releaseX, startY);
	releaseSlider.size(sliderWidth);
	releaseSlider.input(() => {
		compressor.release(releaseSlider.value());
	});


	// Second Row: Ratio, Threshold
	startY += rowSpacingY; // Move down to the next row
	// Ratio Slider
	// text('Ratio', startX, startY - 20);
	ratioSlider = createSlider(1, 20, 4, 0.1);
	ratioSlider.position(startX, startY);
	ratioSlider.size(sliderWidth);
	ratioSlider.input(() => {
		compressor.ratio(ratioSlider.value());
	});

	// Threshold Slider
	let thresholdX = startX + spacingX; // Only one slider in the second row, keep the second column
	// text('Threshold', thresholdX, startY - 20);
	thresholdSlider = createSlider(-100, 0, -24, 1);
	thresholdSlider.position(thresholdX, startY);
	thresholdSlider.size(sliderWidth);
	thresholdSlider.input(() => {
		compressor.threshold(thresholdSlider.value());
	});

	// Last Row: Dry/Wet, Output Level
	startY += rowSpacingY; // Move down to the last row
	// Dry/Wet Slider
	// text('Dry/Wet', startX, startY - 20);
	dryWetSlider = createSlider(0, 1, 0.5, 0.01);
	dryWetSlider.position(startX, startY);
	dryWetSlider.size(sliderWidth);

	// Output Level Slider
	let outputLevelX = startX + spacingX; // Align with the second column
	// text('Output Level', outputLevelX, startY - 20);
	outputLevelSlider = createSlider(0, 1, 0.8, 0.01);
	outputLevelSlider.position(outputLevelX, startY);
	outputLevelSlider.size(sliderWidth);
}


function setupMasterAndSpectrumControls(startX, startY) {
	let sliderWidth = 150;
	let spacingY = 40;

	// Master Volume Slider and label
	// text('Master Volume', startX, startY - 20);
	masterVolumeSlider = createSlider(0, 1, 0.8, 0.01);
	masterVolumeSlider.position(startX, startY);
	masterVolumeSlider.size(sliderWidth);
	masterVolumeSlider.input(() => {
		console.log(masterVolumeSlider.value());
		reverbOutputGain.amp((masterVolumeSlider.value()/100), 0, 0);
		// gain.amp((masterVolSlider.getValue()/100), 0, 0); (edited)/

	});

	// Additional master control sliders can be added here
	// For example, a master gain or a balance control

	// Moving startY downwards for the spectrum sections
	startY += spacingY * 2; // Increase spacing before starting spectrum visualizations

	// Placeholder for Spectrum In visualization
	// text('Spectrum In', startX, startY - 20);
	spectrumInPlaceholder = createDiv(''); // Create a placeholder for the actual visualization
	spectrumInPlaceholder.position(startX, startY);
	spectrumInPlaceholder.size(sliderWidth, 100); // Example size, adjust as necessary

	// Moving startY downwards for the next spectrum section
	startY += 100 + 20; // Adjust space for spectrum display

	// Placeholder for Spectrum Out visualization
	// text('Spectrum Out', startX, startY - 20);
	spectrumOutPlaceholder = createDiv(''); // Similarly, create a placeholder
	spectrumOutPlaceholder.position(startX, startY);
	spectrumOutPlaceholder.size(sliderWidth, 100); // Example size, adjust as necessary
}




function drawFilterLabels() {
	let startX = 350;  // Start X for low-pass filter controls
	let startY = 100 + 30 + 10;  // Adjust based on your layout
	textSize(12);
	fill(0); // Black text
	text('Cutoff Frequency', startX, startY - 20);
	text('Resonance', startX, startY + 40 - 20);
}

function drawCompressorLabels() {
	let startX = windowWidth / 2  - 270;  // Middle of the screen, adjust as needed
	let startY = 100 + 30 + 10;  // Adjust based on your layout
	textSize(12);
	fill(0); // Black text
	text('Attack', startX, startY - 20);
	text('Knee', startX + 160, startY - 20);  // Assuming slider is spaced by 160 pixels
	text('Release', startX + 320, startY - 20);  // Adjust spacing as necessary
	// Add other labels for each row
	text('Ratio', startX, startY + 70 - 20);
	text('Threshold', startX + 160, startY + 70 - 20);
	text('Dry/Wet', startX, startY + 140 - 20);
	text('Output Level', startX + 160, startY + 140 - 20);
}

function drawReverbLabels() {
	let startX = 350;  // Adjust if necessary
	let startY = 100 + 30 + 260;  // Starting position based on your layout
	textSize(12);
	fill(0); // Black text
	text('Reverb Duration', startX, startY - 20);
	text('Decay', startX + 160, startY - 20);
	text('Dry/Wet', startX, startY + 140 - 20);
	text('Output Level', startX + 160, startY + 140 - 20);
}

function drawWaveshaperLabels() {
	let startX = windowWidth / 2 - 270;  // Middle of the screen, adjust as needed
	let startY = 100 + 30 + 260;  // Starting position based on your layout
	textSize(12);
	fill(0); // Black text
	text('Distortion Amount', startX, startY - 20);
	text('Oversample', startX + 160, startY - 20);
	text('Dry/Wet', startX, startY + 70 - 20);
	text('Output Level', startX + 160, startY + 70 - 20);
}

function drawMasterAndSpectrumLabels() {
	let startX = windowWidth / 2 + (windowWidth / 2 - 350) / 2; // Adjust based on your layout
	let startY = 100 + 30 + 10;  // Adjust based on your layout
	let spectrumInY = 250;  // Example starting Y for Spectrum In
	let spectrumOutY = 400; // Example starting Y for Spectrum Out
	let spectrumWidth = 200; // Width of the spectrum display
	let spectrumHeight = 100; // Height of the spectrum display

	// Draw the border first
	noFill();  // Ensure the border is not filled
	stroke(0);  // Black color for the border
	strokeWeight(2);  // Adjust as needed for thicker/thinner borders
	rect(startX, startY, spectrumWidth, spectrumHeight);


	noStroke();
	textSize(12);
	fill(0); // Black text
	text('Master Volume', startX, startY - 20);

	textSize(12);
	fill(0); // Set text color to black
	text('Spectrum In', startX, spectrumInY - 20);
	// displaySpectrum(startX, spectrumInY, 'in');
	displaySpectrum(startX, spectrumInY, spectrumWidth, spectrumHeight, 'in');
	text('Spectrum Out', startX, spectrumOutY - 20);
	// displaySpectrum(startX, spectrumOutY, 'out');
	displaySpectrum(startX, spectrumInY + 150, spectrumWidth, spectrumHeight, 'out');

}

function displaySpectrum(x, y, width, height, type) {
	let spectrum;
	if (type === 'in') {
		spectrum = fftIn.analyze();  // Analyze the input audio
	} else if (type === 'out') {
		spectrum = fftOut.analyze();  // Analyze the processed audio
	} else {
		return;  // If type is not recognized, do nothing
	}

	// Draw the border first
	noFill();  // Ensure the border is not filled
	stroke(0);  // Black color for the border
	strokeWeight(2);  // Adjust as needed for thicker/thinner borders
	rect(x, y, width, height);


	noStroke();
	fill(0);  // Black color for the spectrum
	for (let i = 0; i < spectrum.length; i++) {
		// Calculate each bar's position and height based on the spectrum data
		let barX = map(i, 0, spectrum.length, x, x + width);
		let barWidth = width / spectrum.length;
		let barHeight = map(spectrum[i], 0, 255, 0, height);

		// Draw each bar
		rect(barX, y + height - barHeight, barWidth, barHeight);
	}
}


// function displaySpectrum(x, y, type) {
// 	let spectrum;
// 	if (type === 'in') {
// 		spectrum = fftIn.analyze();  // Analyze the input audio
// 	} else if (type === 'out') {
// 		spectrum = fftOut.analyze();  // Analyze the processed audio
// 	} else {
// 		return;  // If type is not recognized, do nothing
// 	}
//
// 	noStroke();
// 	fill(0);  // Black color for the spectrum
// 	for (let i = 0; i < spectrum.length; i++) {
// 		let posX = map(i, 0, spectrum.length, x, x + width / 2); // Map the drawing to half the width
// 		let h = -height / 4 + map(spectrum[i], 0, 255, height / 4, 0); // Adjust height to 1/4 of canvas height
// 		rect(posX, y, width / spectrum.length, h);
// 	}
// }



function windowResized() {
	resizeCanvas(windowWidth, windowHeight); // This will resize the canvas when the window is resized

	// You may also want to update the positions of your GUI elements here
	// setupTransportControls(); // Call setup functions again to reposition the controls
}
